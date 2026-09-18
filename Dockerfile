# 1. Base Node.js Image
FROM node:20-alpine AS build

# 2. Set Working Directory
WORKDIR /app

# 3. Install Root & Frontend Dependencies
COPY package*.json ./
RUN npm install

# 4. Copy All Source Code & Build Frontend
COPY . .
RUN npm run build

# 5. Install Server Dependencies
WORKDIR /app/server
RUN npm install

# 6. Hugging Face Spaces Default Port
EXPOSE 7860
ENV PORT=7860

# 7. Start Server
CMD ["node", "index.js"]
