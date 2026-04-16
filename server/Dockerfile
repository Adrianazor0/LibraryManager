FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV PORT=8080
EXPOSE 8080
# Use dist/app.js since that's our main file in package.json
CMD ["node", "dist/app.js"]