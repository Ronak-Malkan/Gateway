# Define the build stage
FROM node:16-alpine as build-stage

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Define the production stage
FROM nginx:stable-alpine as production-stage

# Copy built assets from the build stage to Nginx's serve directory
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Set the default command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

