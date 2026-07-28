FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production 2>/dev/null || true
COPY . .
RUN npm run build 2>/dev/null || mkdir -p dist && cp index.html dist/

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:80/health || exit 1
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
