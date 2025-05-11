# Usa una imagen oficial de Node
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

# Compila el proyecto
RUN npm run build

# Expone el puerto (ajústalo si tu app usa otro)
EXPOSE 3000

# Comando por defecto
CMD ["node", "dist/main"]
