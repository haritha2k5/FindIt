FROM node:20-alpine

WORKDIR /app

# Copy package files from the backend directory to the container
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the backend code
COPY backend/ .

# Create necessary folders
RUN mkdir -p logs uploads

EXPOSE 5000

# Railway will use this to start the app
CMD ["node", "server.js"]
