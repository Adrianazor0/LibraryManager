# ETAPA 1: Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ETAPA 2: Producción (La que realmente se sube a Cloud Run)
FROM node:20-alpine
WORKDIR /app

# Copiamos solo lo necesario para ejecutar
COPY package*.json ./
RUN npm install --only=production

# Traemos los archivos compilados de la etapa anterior
COPY --from=builder /app/dist ./dist

# Configuración de puerto para Cloud Run
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/app.js"]