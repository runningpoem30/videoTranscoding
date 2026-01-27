# Step 1: Use Node.js as the base
FROM node:22-slim

# Step 2: Install FFmpeg (this is why we use a container!)
RUN apt-get update && apt-get install -y ffmpeg

# Step 3: Set up the working directory
WORKDIR /app

# Step 4: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 5: Copy your compiled TS code (from the /dist folder)
COPY dist/ ./dist/

# Step 6: The "Magic Line" - This runs automatically on boot
CMD ["node", "dist/worker.js"]