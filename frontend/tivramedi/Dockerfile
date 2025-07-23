# Use Node.js official image as base
FROM node:18-alpine as build-stage

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the Vue.js app for production
RUN npm run build

# Production stage - use nginx to serve the built app
FROM nginx:stable-alpine as production-stage

# Copy built app from build-stage to nginx html folder
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
