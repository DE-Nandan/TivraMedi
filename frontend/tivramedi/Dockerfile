FROM node:18-alpine AS builder
WORKDIR /app

# Add environment variables support
ARG VUE_APP_API_BASE
ARG VUE_APP_EVENTS_ENDPOINT
ENV VUE_APP_API_BASE=$VUE_APP_API_BASE
ENV VUE_APP_EVENTS_ENDPOINT=$VUE_APP_EVENTS_ENDPOINT

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]