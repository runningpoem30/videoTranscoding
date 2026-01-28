# Use Alpine-based Node image (smaller, more reliable mirrors)
FROM node:22-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Set up the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the compiled code
COPY dist/ ./dist/

# Run the worker
CMD ["node", "dist/handler/worker.js"]