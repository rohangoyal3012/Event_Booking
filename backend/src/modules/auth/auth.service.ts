import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { config } from "../../config";
import { AppError } from "../../utils/AppError";
import { authRepository } from "./auth.repository";
import { RegisterDto, LoginDto, GoogleAuthDto } from "./auth.validator";
import { TokenPair, AuthUser } from "../../types";
import { emailQueue } from "../../config/bullmq";

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export const authService = {
  async register(
    dto: RegisterDto,
    ip?: string,
    userAgent?: string,
  ): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const [existingEmail, existingUsername] = await Promise.all([
      authRepository.findUserByEmail(dto.email),
      authRepository.findUserByUsername(dto.username),
    ]);

    if (existingEmail) throw AppError.conflict("Email already registered");
    if (existingUsername) throw AppError.conflict("Username already taken");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await authRepository.createUser({
      username: dto.username,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
    });

    // Send welcome email asynchronously
    await emailQueue.add("welcome", { type: "welcome", userId: user.id });

    const tokens = await authService._generateTokenPair(
      user.id,
      user.email,
      user.username,
      user.role,
      user.isVerified,
      ip,
      userAgent,
    );

    return {
      user: authService._toAuthUser(user),
      tokens,
    };
  },

  async login(
    dto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized("Invalid email or password");
    }
    if (!user.isActive) {
      throw AppError.forbidden("Account has been suspended");
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const tokens = await authService._generateTokenPair(
      user.id,
      user.email,
      user.username,
      user.role,
      user.isVerified,
      ip,
      userAgent,
    );

    return { user: authService._toAuthUser(user), tokens };
  },

  async refreshTokens(
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    let payload: {
      sub: string;
      email: string;
      username: string;
      role: string;
      isVerified: boolean;
    };
    try {
      payload = jwt.verify(
        refreshToken,
        config.REFRESH_TOKEN_SECRET,
      ) as typeof payload;
    } catch {
      throw AppError.unauthorized(
        "Invalid or expired refresh token",
        "TOKEN_EXPIRED",
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const stored = await authRepository.findRefreshToken(tokenHash);
    if (!stored || stored.expiresAt < new Date()) {
      throw AppError.unauthorized(
        "Refresh token is invalid or expired",
        "TOKEN_EXPIRED",
      );
    }

    // Rotate: revoke old, issue new
    await authRepository.revokeRefreshToken(tokenHash);

    const user = await authRepository.findUserById(payload.sub);
    if (!user || !user.isActive)
      throw AppError.unauthorized("User not found or inactive");

    return authService._generateTokenPair(
      user.id,
      user.email,
      user.username,
      user.role,
      user.isVerified,
      ip,
      userAgent,
    );
  },

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    await authRepository.revokeRefreshToken(tokenHash);
  },

  async logoutAll(userId: string): Promise<void> {
    await authRepository.revokeAllUserTokens(userId);
  },

  async googleAuth(
    dto: GoogleAuthDto,
    ip?: string,
    userAgent?: string,
  ): Promise<{ user: AuthUser; tokens: TokenPair; isNew: boolean }> {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: config.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw AppError.unauthorized("Invalid Google credential");
    }

    if (!payload?.email)
      throw AppError.badRequest("Google account has no email");

    let user = await authRepository.findUserByOAuth("google", payload.sub!);
    let isNew = false;

    if (!user) {
      user = await authRepository.findUserByEmail(payload.email);
      if (user) {
        user = await authRepository.updateUser(user.id, {
          oauthProvider: "google",
          oauthId: payload.sub,
          isVerified: true,
          avatarUrl: user.avatarUrl ?? payload.picture,
        });
      } else {
        const baseUsername = slugifyUsername(payload.email.split("@")[0]);
        const username = await uniqueUsername(baseUsername);
        user = await authRepository.createUser({
          username,
          email: payload.email,
          oauthProvider: "google",
          oauthId: payload.sub,
          avatarUrl: payload.picture,
          isVerified: true,
        });
        isNew = true;
      }
    }

    const tokens = await authService._generateTokenPair(
      user.id,
      user.email,
      user.username,
      user.role,
      user.isVerified,
      ip,
      userAgent,
    );

    return { user: authService._toAuthUser(user), tokens, isNew };
  },

  async _generateTokenPair(
    userId: string,
    email: string,
    username: string,
    role: string,
    isVerified: boolean,
    ip?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const payload = { sub: userId, email, username, role, isVerified };

    const accessToken = jwt.sign(payload, config.ACCESS_TOKEN_SECRET, {
      expiresIn: config.ACCESS_TOKEN_EXPIRY as any,
    });

    const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
      expiresIn: config.REFRESH_TOKEN_EXPIRY as any,
    });

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await authRepository.createRefreshToken({
      userId,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress: ip,
    });

    return { accessToken, refreshToken };
  },

  _toAuthUser(user: {
    id: string;
    email: string;
    username: string;
    role: string;
    isVerified: boolean;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as AuthUser["role"],
      isVerified: user.isVerified,
    };
  },
};

function slugifyUsername(text: string): string {
  return text.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30) || "user";
}

async function uniqueUsername(base: string): Promise<string> {
  let username = base;
  let existing = await authRepository.findUserByUsername(username);
  let attempt = 0;
  while (existing) {
    username = `${base}${Math.floor(Math.random() * 9000) + 1000}`;
    existing = await authRepository.findUserByUsername(username);
    if (++attempt > 10)
      throw AppError.internal("Could not generate unique username");
  }
  return username;
}
