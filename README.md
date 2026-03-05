# 🌱 Digital Garden — AI-Augmented Second Brain

An intelligent knowledge management platform that connects your notes across subjects using AI-powered linking. Built with a modern microservices-ready architecture.

## 🚀 Live Demo

**[garden-ten-silk.vercel.app](https://garden-ten-silk.vercel.app)**

## 🏗️ Project Structure

```
backend/      → Java/Spring Boot API (Note management, Knowledge Graph, AI linking)
webapp/       → React + Vite frontend (deployed to Vercel)
frontend/     → Shared frontend dependencies
docs/         → Architecture & Roadmap documentation
```

## ⚡ Tech Stack

- **Frontend**: React 18, Vite, Framer Motion, React Force Graph, Tailwind
- **Backend**: Java 21, Spring Boot 3.x, Spring Data JPA/Neo4j
- **Databases**: PostgreSQL (notes/users) + Neo4j (knowledge graph)
- **AI**: LLM-powered cross-subject linking engine
- **Deployment**: Vercel (frontend), GitHub CI/CD

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

## 🛠️ Local Development

```bash
# Frontend
cd webapp
npm install
npm run dev
```

## 📄 License

MIT
