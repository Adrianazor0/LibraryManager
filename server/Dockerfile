# Use a Node.js image to build the app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use a clean image to run the app (smaller size)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
# Copy only the compiled files from the builder stage
COPY --from=builder /app/dist ./dist
# Cloud Run injects the PORT environment variable automatically
EXPOSE 8080
CMD ["node", "dist/app.js"]