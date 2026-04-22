# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code and build
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the build output from the builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration to listen on port 3000
RUN printf 'server {\n\tlisten 3000;\n\tlocation / {\n\t\troot /usr/share/nginx/html;\n\t\tindex index.html;\n\t\ttry_files $uri $uri/ /index.html;\n\t}\n}\n' > /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
