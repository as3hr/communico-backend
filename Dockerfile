FROM node

WORKDIR /app

RUN npm install -g pm2

COPY *.json .

COPY . .

RUN npm install

EXPOSE 5000

CMD ["pm2-runtime", "npm", "--", "run", "dev"]