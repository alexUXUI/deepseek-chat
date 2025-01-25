# Use the official Node.js 18 LTS image as the base
FROM node:23-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 8000

# Define environment variables
ENV PORT=8000

# Start the server
CMD ["npm", "start"]
