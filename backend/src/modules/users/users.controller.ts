import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { usersService } from "./users.service";
import { AppError } from "../../utils/AppError";

export const usersController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id === "me" ? req.user!.id : req.params.id;
    const user = await usersService.getProfile(userId);
    res.json({ success: true, data: { user } });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, message: "Profile updated", data: { user } });
  }),

  updateAvatar: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest("No file uploaded");
    const avatarUrl = await usersService.updateAvatar(
      req.user!.id,
      req.file.buffer,
      req.file.mimetype,
    );
    res.json({ success: true, data: { avatarUrl } });
  }),

  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    const result = await usersService.getAllUsers(
      req.query as Record<string, string>,
    );
    res.json({ success: true, ...result });
  }),

  deactivateUser: asyncHandler(async (req: Request, res: Response) => {
    await usersService.deactivateUser(req.params.id);
    res.json({ success: true, message: "User deactivated" });
  }),

  getWishlist: asyncHandler(async (req: Request, res: Response) => {
    const wishlist = await usersService.getUserWishlist(req.user!.id);
    res.json({ success: true, data: { wishlist } });
  }),

  toggleWishlist: asyncHandler(async (req: Request, res: Response) => {
    const result = await usersService.toggleWishlist(
      req.user!.id,
      req.params.eventId,
    );
    res.json({
      success: true,
      message: result.added ? "Added to wishlist" : "Removed from wishlist",
      data: result,
    });
  }),
};
