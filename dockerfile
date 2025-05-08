# Stage 1: Build Angular App
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Optional: Replace 'noteapp' with your actual Angular project name if different
RUN npm run build -- --configuration production

# Stage 2: Serve with NGINX
FROM nginx:1.23-alpine

# Use custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf  

# Copy built Angular files from dist
COPY --from=build /app/dist/noteapp/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
