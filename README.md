# Communico Backend

A scalable Node.js backend service built with TypeScript, powering the Communico communication platform with real-time messaging capabilities, AI integration, and robust API services.

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
- **CI/CD:** Azure DevOps/GitHub Actions

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
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/communico
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
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