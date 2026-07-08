# ArchGen — AI Architecture Generator

ArchGen is an AI-powered tool that generates complete software project architectures in seconds. Give it your project idea, and it generates the recommended tech stack, the reasoning behind the architecture, a suggested folder structure, API routes, and potential future features — all exportable as a PDF and shareable via link.

---

## ✨ Features

- 🧠 **AI-Generated Tech Stack** — Get a recommended stack tailored to your project idea
- 📐 **Architecture Reasoning** — Understand *why* a particular architecture fits your use case
- 📁 **Folder Structure** — Auto-generated, ready-to-use project folder layout
- 🔌 **API Route Suggestions** — REST route scaffolding based on your project's needs
- 🚀 **Future Feature Recommendations** — AI-suggested features to plan your roadmap
- 📄 **PDF Export** — Export any generated architecture as a clean, shareable PDF
- 🔗 **Share Links** — Share a project via link with two access modes:
  - **Anyone with the link** — public view access
  - **Restricted** — access limited to invited/authorized users
- 💬 **Chat History** — Revisit and search past generated architectures

---

## 🏗️ Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) — React framework (App Router)
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) — Accessible, composable UI components

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) — REST API server
- AI/LLM integration for architecture generation
- Database for storing projects, users, and share links
- PDF generation engine for exports

---

## 🔌 API Routes

| Method | Route                          | Description                          |
|--------|---------------------------------|---------------------------------------|
| POST   | `/api/projects`                | Generate a new architecture           |
| GET    | `/api/projects`                | List all user projects                |
| GET    | `/api/projects/:id`            | Get a single project's architecture   |
| DELETE | `/api/projects/:id`            | Delete a project                      |
| POST   | `/api/projects/:id/export`     | Export project as PDF                 |
| POST   | `/api/projects/:id/share`      | Create a share link (anyone/restricted) |
| GET    | `/api/share/:shareId`          | Access a shared project               |
| PATCH  | `/api/share/:shareId`          | Update share settings/permissions     |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A database instance (e.g., PostgreSQL/MongoDB)
- API key for your chosen AI provider

### 1. Clone the repo
```bash
git clone https://github.com/your-username/archgen.git
cd archgen
```

### 2. Setup the backend
```bash
cd backend
npm install
touch .env
# Fill in your DB connection, AI API key, and JWT secret
npm run dev
```

### 3. Setup the frontend
```bash
cd frontend
npm install
touch .env
# Fill in your env variables
npm run dev
```

### 4. Open the app
Visit `http://localhost:3000` in your browser.

---

## 🔐 Environment Variables

**Backend (`backend/.env`)**
```env
OPENROUTER_API_KEY=your_provider_key
MONGO_URI=your_database_url
```

**Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
NEXT_PUBLIC_BACKEND_URI=your_backend_url
CLERK_SECRET_KEY=your_clerks_seceret_key
```

---

## 🗺️ Roadmap / Future Features

- [ ] Team collaboration on projects
- [ ] Version history for generated architectures
- [ ] Multiple AI model support (choose your preferred LLM)
- [ ] Export to Markdown
- [ ] Comments on shared projects
- [ ] Public template gallery

