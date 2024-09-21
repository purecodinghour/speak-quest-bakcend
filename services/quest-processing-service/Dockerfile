# Use the official Node.js image from Docker Hub
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install
RUN npm install ioredis

# Copy the rest of the application code
COPY . .

# Expose the port the service runs on
EXPOSE 3002

# Start the service
CMD ["npm", "start"]
