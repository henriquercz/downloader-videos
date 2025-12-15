# Estágio de Build
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio de Produção (Nginx)
FROM nginx:alpine

# Copiar build do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx se necessário (opcional, usando default por enquanto)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
