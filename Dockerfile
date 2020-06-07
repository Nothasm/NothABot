FROM node:alpine
WORKDIR /app
ADD . .
RUN npm i
RUN npm run build
EXPOSE 8080