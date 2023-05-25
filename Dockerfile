FROM node:20

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x entrypoint.sh
EXPOSE 3020
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
