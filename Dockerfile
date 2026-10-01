# syntax=docker/dockerfile:1

# --- Etapa 1: compilar Angular ---
# El build de Angular no depende de la arquitectura: se ejecuta en la nativa del runner (sin emulacion)
FROM --platform=$BUILDPLATFORM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

# --- Etapa 2: servir con nginx (y redirigir /api al backend) ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
