# Communico Backend

A scalable Node.js backend service built with TypeScript, powering the Communico communication platform with real-time messaging capabilities, AI integration, and robust API services.

## 💻 Frontend

Check Out the frontend of Communico [here](https://github.com/as3hr/communico-frontend)

## ScreenShots
![1](https://github.com/user-attachments/assets/ac2eacbf-0fca-4054-ba00-cb7bf55ec6bf)
![2](https://github.com/user-attachments/assets/e450ba92-a0bb-485a-9290-7c1e55f7b37e)
![3](https://github.com/user-attachments/assets/10293a79-8f79-4108-9f33-b75e809d4f6e)
![4](https://github.com/user-attachments/assets/55f32a8c-c230-4213-abc8-0532ffc00869)
![5](https://github.com/user-attachments/assets/052ac6ac-8eb9-44fa-9843-57594fabe2a5)

## 🚀 Features

- Real-time messaging system
- Group chat management
- AI chatbot integration
- User authentication and authorization
- PostgreSQL database integration
- Scalable architecture with Docker
- Nginx reverse proxy and load balancing
- Automated CI/CD pipeline

## 🛠️ Technologies

- **Runtime:** Node.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Real-time:** Socket.IO
- **Container:** Docker & Docker Compose
- **Proxy:** Nginx
- **Cloud:** Azure VM deployment
- **CI/CD:** GitHub Actions

## 📋 Prerequisites

- Node.js 
- PostgreSQL 
- Docker & Docker Compose
- TypeScript

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/as3hr/communico-backend.git
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Set up PostgreSQL:
```bash
docker-compose up -d postgres
```

5. Run migrations:
```bash
npx prisma generate dev --name <name-of-migration>
npx prisma migrate dev --name <name-of-migration>
```

6. Seed the database:
```bash
npm run seeder
```

7. Start the development server:
```bash
npm run dev
```

## 🐳 Docker Deployment

1. Run and build the services:
```bash
docker-compose up --build -d
```

## 🏗️ Project Structure

```
src
│   ├── config/
│   ├── controllers/
│   ├── helpers/
│   ├── middlewares/
│   ├── routes/
│   └── socket/
```


## 🔒 Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@postgres_db:5432/postgres_db?schema=public
JWT_SECRET=STRONG_SECRET
GEMINI_API_KEY=API_KEY
APP_PASSWORD=ADMIN_PASSWORD
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DOMAIN=http://localhost:5000/
```

## 🔄 CI/CD Pipeline

1. Code push triggers pipeline
2. Builds Docker image
3. Pushes to container registry
4. Deploys to Azure VM
5. Runs health checks


## 📄 License

This project is licensed under the [MIT License](LICENSE)

## 👥 Authors

- Muhammad Ashar - Software Engineer - [Github](https://github.com/as3hr)
