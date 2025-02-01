# Step 1: Build the React application
FROM node:13.12.0-alpine as build-stage

# Set the working directory in the Docker image
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Step 2: Set up Nginx to serve the app
FROM nginx:stable-alpine as production-stage

# Copy the built files from the build stage to the Nginx serve directory
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx and keep it running
CMD ["nginx", "-g", "daemon off;"]
