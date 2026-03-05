# System Architecture: The AI-Augmented Second Brain

## 1. System Overview
The platform represents a modern 'Digital Garden' optimized for knowledge synthesis. It uses a microservices-ready approach to decouple standard relational data (Users/Note Content) from the complex networked mappings (Knowledge Graph), enriched dynamically via an AI service layer.

### High-Level Components
- **API Gateway (Optional / Scalability Target)**: Resolves requests, manages rate limits, and coordinates cross-origin requests.
- **Authentication & Core Service**: Secures endpoints using Spring Security and JWT.
- **Note Management Service**: Handles Markdown note CRUD operations. 
- **Knowledge Graph Service**: Manages the small-world network, calculating shortest paths and node clusters.
- **AI Augmentation Microservice/Layer**: Acts as an intermediary interacting with an LLM (e.g., OpenAI or local Ollama) for text extraction, tagging, and contextual embeddings.

## 2. Technology Stack
- **Frontend**: React.js, React-Force-Graph / Cytoscape.js, React Markdown.
- **Backend**: Java 21, Spring Boot 3.x, Spring Data JPA, Spring Data Neo4j, Spring Security.
- **Databases**:
  - *PostgreSQL*: Stores Users, standard Note text, creation dates, auth tables.
  - *Neo4j*: Stores Notes as Nodes and AI-generated Smart Connections as Edges.
- **DevOps**: GitHub Actions (CI/CD Pipeline), Dockerized environments for backend services.

## 3. Database Schema

### PostgreSQL Schema
- **users** (`id`, `username`, `email`, `password_hash`, `role`)
- **notes** (`id`, `user_id`, `title`, `content_markdown`, `created_at`, `updated_at`)

### Neo4j Graph Model
- **Nodes**: 
  - `(:Note {note_id, title, user_id})`
  - `(:Tag {name})`
- **Edges**:
  - `(:Note)-[:SMART_CONNECTION {ai_generated: boolean, confidence: float, reason: string}]->(:Note)`
  - `(:Note)-[:TAGGED_WITH]->(:Tag)`
