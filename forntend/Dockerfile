# ──────────────────────────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# ──────────────────────────────────────────────────────────────
# Stage 2: Serve via nginx
# ──────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runtime

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA-friendly nginx config (all routes → index.html)
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  gzip on;\n\
  gzip_types text/css application/javascript application/json image/svg+xml;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location ~* \\.(js|css|png|jpg|svg|ico|woff2)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
