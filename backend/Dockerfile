FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application code
COPY . .

# Expose the port the app will listen on
EXPOSE 3000

# Run the application
CMD ["node", "app.js"]
