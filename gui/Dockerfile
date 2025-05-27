# SimpleVault GUI用 Dockerfile

# Node.js + npm
FROM node:22-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
