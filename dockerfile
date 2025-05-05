FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci                             

COPY . .

RUN npm run build -- --configuration=production


FROM nginx:1.23-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf  

COPY --from=build /app/dist/noteapp/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

