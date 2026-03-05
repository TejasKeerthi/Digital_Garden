# Project Roadmap: The AI-Augmented Second Brain

## Phase 1: Foundation & Seeding (Month 1-3)
**Objective**: Build a robust, scalable system for saving and editing Markdown notes.
- Establish Spring Boot backend and PostgreSQL database.
- Implement User Authentication (Spring Security + JWT) to ensure distinct gardens per user.
- Build the React Frontend including a fully functional Markdown editor.
- Create REST controllers for Note CRUD workflows.

## Phase 2: Graph Infrastructure (Month 4-6)
**Objective**: Transition from hierarchical storage to a networked/graph representation.
- Integrate Neo4j using Spring Data Neo4j.
- Synchronize Note saves in Postgres to trigger Node creation in Neo4j.
- Implement the 'Knowledge Graph' frontend view (using D3.js or Force Graph) to render nodes.
- Allow users to manually link notes using bidirectional Markdown syntax (e.g. `[[Memory Management]]`).

## Phase 3: AI Augmentation & Smart Linking (Month 7-9)
**Objective**: Introduce the 'Intelligent' layer to bridge fragmented concepts across subjects.
- Configure backend HTTP clients or Spring AI to interact with LLMs.
- Develop the core logic: take newly saved Note content -> call LLM -> parse semantic link suggestions.
- Automatically draw `SMART_CONNECTION` edges in Neo4j based on LLM responses.
- Display "Suggested Connections" to users dynamically underneath their active notes.

## Phase 4: DevOps, Final Polish & Deployment (Month 10-12)
**Objective**: Ensure the application is production-ready for the B.Tech submission.
- Containerize both Spring Boot backend and React apps via Docker.
- Setup GitHub Actions CI/CD to run build verifications on PRs.
- Polish frontend UI: aesthetic dark-theme 'graph' styling, glassmorphism UI overlay.
- Complete thesis/presentation slides incorporating codebase functionality.
