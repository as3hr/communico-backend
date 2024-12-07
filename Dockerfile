FROM node

WORKDIR /app

COPY *.json .

COPY prisma ./prisma

COPY . .

RUN npm install

EXPOSE 5000

CMD ["npm", "run", "dev"]
