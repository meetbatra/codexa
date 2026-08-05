# Codexa 🚀

Codexa is a full-stack, AI-powered online coding judge and Learning Management System (LMS) platform. It provides a code execution workspace, automated test case evaluation across multiple programming languages, AI-assisted feedback generation, and an integrated student-teacher Doubt Resolution ecosystem featuring real-time filters and smooth GPU-accelerated UI transitions.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
  - [Directory Structure](#directory-structure)
  - [Data Flow & Execution Pipeline](#data-flow--execution-pipeline)
  - [Database Schema (Prisma)](#database-schema-prisma)
- [Modular Code Execution Architecture](#modular-code-execution-architecture)
  - [Language Support & Judge0 Mapping](#language-support--judge0-mapping)
  - [Template & Wrapper Architecture](#template--wrapper-architecture)
  - [Output Normalization](#output-normalization)
- [Doubt Resolution & AI Feedback Workflow](#doubt-resolution--ai-feedback-workflow)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Database Migration & Initialization](#4-database-migration--initialization)
  - [5. Run Development Servers](#5-run-development-servers)
- [Environment Variables](#environment-variables)
  - [Backend (`backend/.env`)](#backend-backendenv)
  - [Frontend (`frontend/.env.local`)](#frontend-frontendenvlocal)
- [Available Scripts](#available-scripts)
- [Deployment Guide](#deployment-guide)
  - [Backend Deployment (Render / Railway / VPS)](#backend-deployment-render--railway--vps)
  - [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
  - [Database Hosting (Supabase / Neon)](#database-hosting-supabase--neon)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [License](#license)

---

## Key Features

- ⚡ **Multi-Language Code Execution Workspace**: Interactive CodeMirror 6 code editor supporting Python, JavaScript, C++, and Java with custom syntax highlighting and language-specific starter boilerplate.
- 🎯 **Test Case Evaluation**: Remote compilation and execution powered by Judge0 CE API, running user submissions against stored test cases.
- 🧠 **AI-Powered Code Feedback**: Integrated OpenAI / Gemini AI model via Vercel AI SDK to analyze failed test cases and generate step-by-step debugging hints.
- 💬 **Student Doubt Board**: Interactive forum where students post question-specific doubts, view answers, filter by status (`All`, `Answered`, `Unanswered`, `My Doubts`), and search titles/descriptions in real-time.
- ✨ **GPU-Accelerated Accordion Animations**: Smooth 700ms `grid-template-rows` CSS animations for expanding and collapsing doubt card details and answers without layout thrashing.
- 👨‍🏫 **Teacher Doubt Review Portal**: Specialized instructor dashboard (`/review`) to review student doubts, view auto-generated AI draft answers, edit microcopy, and approve or reject submissions.
- 🔐 **Role-Based Access Control (RBAC)**: Secure authentication system with JWT and bcrypt password hashing differentiating `STUDENT` and `TEACHER` permissions.
- 🏗️ **Modular Code Wrapper Engine**: Decoupled backend execution wrappers and frontend code templates ensuring problem input/output serialization works seamlessly across all database problems.

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: React 19 & TypeScript 5
- **Styling**: Tailwind CSS 4 & Custom CSS Design System
- **Code Editor**: CodeMirror 6 (`@codemirror/state`, `@codemirror/view`, language extensions for Python, JS, C++, Java)
- **Animations**: Framer Motion 12 & Native CSS Grid Transitions
- **Icons**: Lucide React
- **Markdown & Math**: React Markdown, Remark GFM, KaTeX (`rehype-katex`, `remark-math`)
- **Data Visualization**: Recharts 3

### Backend
- **Runtime**: Node.js v20+ with Express 5
- **Language**: TypeScript 5
- **Database & ORM**: PostgreSQL with Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`)
- **Execution Harness**: Judge0 CE API (via RapidAPI Axios client)
- **AI SDK**: Vercel AI SDK (`ai`, `@ai-sdk/openai`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing
- **Validation**: Zod schema validation

---

## System Architecture

### Directory Structure

```
codexa/
├── package.json                   # Monorepo root workspace config
├── README.md                      # Platform documentation
├── backend/                       # Express + Prisma REST API service
│   ├── package.json               # Backend dependencies & scripts
│   ├── tsconfig.json              # TypeScript compiler options
│   ├── nodemon.json               # Development auto-restart configuration
│   ├── prisma.config.ts           # Prisma client config
│   ├── prisma/
│   │   └── schema.prisma          # PostgreSQL database schema & enums
│   └── src/
│       ├── index.ts               # Express server entry point & middleware setup
│       ├── controllers/           # API route handler controllers
│       │   ├── approval.controller.ts # Teacher doubt review & approval endpoints
│       │   ├── auth.controller.ts     # User registration, login, and profile
│       │   ├── doubt.controller.ts    # Student doubt creation & browsing
│       │   ├── problem.controller.ts  # Problem catalog & detailed fetching
│       │   └── submission.controller.ts# Code execution & AI feedback generation
│       ├── routes/                # Express router definitions
│       │   ├── approval.routes.ts
│       │   ├── auth.routes.ts
│       │   ├── doubt.routes.ts
│       │   ├── problem.routes.ts
│       │   └── submission.routes.ts
│       ├── middleware/            # Express middlewares
│       │   └── auth.middleware.ts # JWT verification & role authorization
│       └── lib/                   # Utility libraries & services
│           ├── judge0.ts          # Judge0 API client & test case runner
│           └── prisma.ts          # Prisma Client instance manager
│       └── scripts/               # Database seed scripts
│           └── seedLanguageConfigs.ts # Generates and seeds DB with starter/wrapper code
└── frontend/                      # Next.js 16 Web Application
    ├── package.json               # Frontend dependencies & scripts
    ├── next.config.ts             # Next.js configuration
    ├── postcss.config.mjs         # PostCSS configuration for Tailwind CSS 4
    ├── components.json            # Shadcn UI component configuration
    ├── app/                       # Next.js App Router pages & layouts
    │   ├── layout.tsx             # Root layout & theme providers
    │   ├── page.tsx               # Landing page with feature showcase
    │   ├── login/                 # User authentication - login page
    │   ├── register/              # User authentication - registration page
    │   ├── problems/              # Problem catalog list page
    │   │   └── [id]/              # Interactive problem workspace (Editor, Output, AI)
    │   ├── doubts/                # Public student doubt board & search
    │   └── review/                # Teacher doubt moderation & review workspace
    ├── components/                # Reusable UI components
    │   ├── Navbar.tsx             # Global navigation bar with role status
    │   ├── CodeEditor.tsx         # CodeMirror 6 multi-language editor wrapper
    │   └── MarkdownContent.tsx    # GFM & KaTeX markdown renderer with word wrapping
    ├── context/                   # React context providers
    │   └── AuthContext.tsx        # Authentication & user state management
    └── lib/                       # Frontend utilities & configuration
        ├── api.ts                 # Axios API client configured with auth headers
        ├── api.ts                 # Axios API client configured with auth headers
        └── auth.ts                # Token & localStorage management utilities
```

---

### Data Flow & Execution Pipeline

```
[Student Browser]
       │
       │  1. Submits Code (Python/JS/C++/Java)
       ▼
[Next.js Workspace (/problems/[id])]
       │
       │  2. POST /api/submissions/run  (JWT Auth Header)
       ▼
[Express Backend Controller]
       │
       │  3. Fetches ProblemLanguageConfig from Database
       │     Injects problem-specific stdin parser & execution wrapper
       ▼
[Judge0 CE Engine (RapidAPI)]
       │
       │  4. Compiles & Executes inside isolated Sandbox
       ▼
[Express Output Normalizer (judge0.ts)]
       │
       │  5. Normalizes stdout JSON & compares against test cases
       │  6. Triggers OpenAI / Gemini via Vercel AI SDK if failed
       ▼
[PostgreSQL Database (Prisma)]
       │
       │  7. Stores Submission record + Test Results + AI Feedback
       ▼
[Next.js Workspace UI]
       │
       └─ Displays Pass/Fail status, execution time, stdout, and AI Debugging Hints
```

---

### Database Schema (Prisma)

The database schema is defined in `backend/prisma/schema.prisma` and consists of 5 core entities and 3 enums:

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  TEACHER
}

enum SubmissionStatus {
  PENDING
  ACCEPTED
  WRONG_ANSWER
  TIME_LIMIT_EXCEEDED
  RUNTIME_ERROR
  COMPILATION_ERROR
}

enum AnswerState {
  DRAFT
  PENDING
  APPROVED
  REJECTED
}

model User {
  id          String        @id @default(uuid())
  name        String
  email       String        @unique
  password    String
  role        Role          @default(STUDENT)
  createdAt   DateTime      @default(now())
  submissions Submission[]
  doubts      Doubt[]
  reviews     DoubtAnswer[] @relation("ReviewedBy")
}

model Problem {
  id              String                  @id @default(uuid())
  title           String
  description     String
  difficulty      String                  @default("Medium")
  testCases       Json
  createdAt       DateTime                @default(now())
  submissions     Submission[]
  languageConfigs ProblemLanguageConfig[]
}

model ProblemLanguageConfig {
  id          String   @id @default(uuid())
  problemId   String
  language    String
  starterCode String
  wrapperCode String
  problem     Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)

  @@unique([problemId, language])
}

model Submission {
  id          String           @id @default(uuid())
  userId      String
  problemId   String
  code        String
  language    String
  status      SubmissionStatus @default(PENDING)
  testResults Json?
  aiFeedback  String?
  createdAt   DateTime         @default(now())
  user        User             @relation(fields: [userId], references: [id])
  problem     Problem          @relation(fields: [problemId], references: [id])
}

model Doubt {
  id        String        @id @default(uuid())
  userId    String
  title     String
  body      String
  createdAt DateTime      @default(now())
  user      User          @relation(fields: [userId], references: [id])
  answers   DoubtAnswer[]
}

model DoubtAnswer {
  id              String      @id @default(uuid())
  doubtId         String
  aiFeedbackDraft String
  teacherEdit     String?
  state           AnswerState @default(DRAFT)
  reviewedById    String?
  createdAt       DateTime    @default(now())
  doubt           Doubt       @relation(fields: [doubtId], references: [id])
  reviewedBy      User?       @relation("ReviewedBy", fields: [reviewedById], references: [id])
}
```

---

## Modular Code Execution Architecture

### Language Support & Judge0 Mapping

Codexa translates high-level user code into executable submissions using standard language identifiers on Judge0:

| Language | Judge0 Language ID | Execution Command / Environment |
| :--- | :--- | :--- |
| **Python** | `71` | Python 3.8.1 |
| **JavaScript** | `63` | Node.js 12.14.0 |
| **C++** | `54` | GCC 9.2.0 |
| **Java** | `62` | OpenJDK 13.0.1 |

---

### Database-Driven Template & Wrapper Architecture

To make the platform extensible for any new problem without modifying core judge logic, the starter codes and execution wrappers are entirely database-driven.

1. **Starter Code (`starterCode`)**: Provides clean function signatures matching conventions for each language (e.g. `def solve(nums, target):` or `function solve(strs)`) with specific problem instructions. This is queried from the `ProblemLanguageConfig` table and rendered on the frontend.
2. **Execution Wrappers (`wrapperCode`)**: Automate reading raw test case `stdin`, parsing input arguments into native data types, executing the target user solution, and serializing the return result to `stdout` in JSON format. This wrapper wraps the user code at runtime before sending to Judge0.

#### Example Pipeline for Group Anagrams (Python)
- User Code:
  ```python
  def solve(strs):
      from collections import defaultdict
      anagrams = defaultdict(list)
      for s in strs:
          key = "".join(sorted(s))
          anagrams[key].append(s)
      return list(anagrams.values())
  ```
- Generated Wrapper (Injected automatically at execution):
  ```python
  import sys
  import json
  from collections import defaultdict

  # User code inserted here
  # ...

  if __name__ == "__main__":
      input_data = sys.stdin.read().strip()
      if input_data:
          parsed_input = json.loads(input_data)
          result = solve(parsed_input)
          print(json.dumps(result))
  ```

---

### Output Normalization

For problems where the expected output order is non-deterministic (such as *Group Anagrams* or *3Sum*), Codexa normalizes string representations prior to comparison using `normalizeOutput` in `backend/src/lib/judge0.ts`:

```typescript
function normalizeOutput(str: string): string {
  const trimmed = str.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
      const sortedInner = parsed.map((arr: any) =>
        Array.isArray(arr) ? [...arr].sort((a, b) => String(a).localeCompare(String(b))) : arr
      );
      sortedInner.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      return JSON.stringify(sortedInner);
    }
    return JSON.stringify(parsed);
  } catch (e) {
    return trimmed;
  }
}
```

---

## Doubt Resolution & AI Feedback Workflow

Codexa connects student inquiries directly with AI-assisted instructor moderation:

```
[Student] Ask Doubt Modal
   │
   ▼
POST /api/doubts
   │
   ├──> 1. Saves Doubt record in Database
   │
   └──> 2. Triggers Vercel AI SDK (OpenAI) background task
        Generates AI Draft Response (aiFeedbackDraft)
        Saves DoubtAnswer with state = DRAFT
   │
   ▼
[Teacher] Moderation Dashboard (/review)
   │
   ├──> Views Pending Doubts & AI Draft
   │
   ├──> Edits AI Response (optional)
   │
   └──> Clicks "Approve" (state = APPROVED) or "Reject" (state = REJECTED)
   │
   ▼
[Public Board] Doubts Page (/doubts)
   │
   └──> Approved answers are rendered live to students with smooth GPU CSS transitions
```

---

## Prerequisites

Ensure you have the following software installed locally:

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **PostgreSQL**: `v15.0` or higher (Local installation, Docker container, or hosted on Supabase/Neon)
- **Git**: Latest version

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/meetbatra/codexa.git
cd codexa
```

---

### 2. Backend Setup

Navigate to the `backend` folder and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` configuration file inside `backend/`:

```bash
cp .env.example .env
```

Ensure `.env` contains valid credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codexa?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/codexa?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production"
PORT=8080
JUDGE0_API_KEY="your_rapidapi_judge0_key"
JUDGE0_API_HOST="judge0-ce.p.rapidapi.com"
OPENAI_API_KEY="sk-proj-your_openai_api_key"
FRONTEND_URL="http://localhost:3000"
```

---

### 3. Frontend Setup

Navigate to the `frontend` folder and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env.local` configuration file inside `frontend/`:

```bash
cp .env.example .env.local
```

Ensure `.env.local` points to the running backend server:

```env
NEXT_PUBLIC_API_URL="http://localhost:8080"
```

---

### 4. Database Migration & Initialization

From the `backend/` directory, apply the Prisma database schema and generate the Prisma Client:

```bash
cd ../backend

# Generate Prisma Client types
npx prisma generate

# Synchronize database schema with PostgreSQL instance
npx prisma db push
```

*(Optional)* Seed the database with default problems and language execution configurations:

```bash
npx ts-node --project tsconfig.json src/scripts/seedLanguageConfigs.ts
```

---

### 5. Run Development Servers

You can start both frontend and backend concurrently or in separate terminals.

#### Option A: Running in Separate Terminals

- **Terminal 1 (Backend Server)**:
  ```bash
  cd backend
  npm run dev
  ```
  *Server runs at `http://localhost:8080`*

- **Terminal 2 (Frontend Web App)**:
  ```bash
  cd frontend
  npm run dev
  ```
  *Application opens at `http://localhost:3000`*

#### Option B: Workspace Execution from Monorepo Root

```bash
# Run backend from root
npm run dev --workspace=backend

# Run frontend from root
npm run dev --workspace=frontend
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable Name | Required | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string with pooling | `postgresql://postgres:password@localhost:5432/codexa` |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection string for Prisma migrations | `postgresql://postgres:password@localhost:5432/codexa` |
| `JWT_SECRET` | Yes | Secret key used for signing JWT authentication tokens | `e837f49a21b3691c2d0f...` |
| `PORT` | No | HTTP Port for the Express server (Defaults to 8080) | `8080` |
| `JUDGE0_API_KEY` | Yes | RapidAPI Key for accessing the Judge0 CE service | `21a08459f1msh87...` |
| `JUDGE0_API_HOST` | No | Host header for Judge0 RapidAPI (Defaults to judge0-ce.p.rapidapi.com) | `judge0-ce.p.rapidapi.com` |
| `OPENAI_API_KEY` | Yes | OpenAI API Key for Vercel AI SDK feedback generation | `sk-proj-91823...` |
| `FRONTEND_URL` | No | Allowed CORS origin for Next.js app | `http://localhost:3000` |

---

### Frontend (`frontend/.env.local`)

| Variable Name | Required | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | Public base URL of the Codexa backend Express server | `http://localhost:8080` |

---

## Available Scripts

### Root Directory (`/`)

| Script | Command | Description |
| :--- | :--- | :--- |
| Workspaces | `npm run dev --workspace=backend` | Launches backend development environment |
| Workspaces | `npm run dev --workspace=frontend` | Launches Next.js frontend development server |

---

### Backend (`/backend`)

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `nodemon` | Runs Express server with live reload via `ts-node` |
| `npm run build` | `tsc` | Compiles TypeScript source files into `dist/` |
| `npm run start` | `node dist/index.js` | Launches production compiled Node.js backend |
| `npx prisma db push` | `prisma db push` | Pushes schema changes directly to the database |
| `npx prisma studio` | `prisma studio` | Opens web GUI to browse and edit database records |

---

### Frontend (`/frontend`)

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Launches Next.js dev server at `http://localhost:3000` |
| `npm run build` | `next build` | Compiles production-optimized frontend bundle |
| `npm run start` | `next start` | Starts Node.js production server for Next.js app |
| `npm run lint` | `eslint` | Runs ESLint code quality and formatting checks |

---

## Deployment Guide

### Backend Deployment (Render / Railway / VPS)

1. Set Environment Variables in deployment portal (`DATABASE_URL`, `JWT_SECRET`, `JUDGE0_API_KEY`, `OPENAI_API_KEY`, `PORT=8080`, `FRONTEND_URL=https://your-frontend.vercel.app`).
2. Build Command:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
3. Start Command:
   ```bash
   npm run start
   ```

---

### Frontend Deployment (Vercel)

1. Connect `frontend/` directory to a new Vercel Project.
2. Configure Environment Variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
   ```
3. Framework Preset: Select **Next.js**.
4. Deploy project.

---

### Database Hosting (Supabase / Neon)

1. Create a PostgreSQL project on Supabase or Neon.
2. Obtain the Transaction Pooler Connection String (`DATABASE_URL`) and Direct Connection String (`DIRECT_URL`).
3. Update `backend/.env` with these connection strings and execute:
   ```bash
   npx prisma db push
   ```

---

## Troubleshooting & FAQ

### 1. Judge0 Submission Times Out
- **Symptom**: `Error: Judge0 submission timed out after 15 seconds`.
- **Solution**: Check your RapidAPI subscription status and `JUDGE0_API_KEY` validity. RapidAPI free tier rate-limits rapid sequential requests.

### 2. Doubts Page Teaser Text Overflows
- **Symptom**: Long unbroken code strings or text overflow doubt cards horizontally.
- **Solution**: Verify that `MarkdownContent.tsx` incorporates `break-words` and `[overflow-wrap:anywhere]` rules.

### 3. Accordion Height Transition Jitter
- **Symptom**: Doubt card collapse or expand jumps abruptly.
- **Solution**: Ensure your browser supports CSS `grid-template-rows` transitions. Codexa uses native CSS grid fractions (`0fr` ➔ `1fr`) over `700ms ease-in-out` to guarantee 60 FPS transitions without DOM recalculation overhead.

### 4. Prisma Client Out of Sync
- **Symptom**: `Type error: Property 'doubts' does not exist on type 'PrismaClient'`.
- **Solution**: Run `npx prisma generate` in `backend/` whenever `schema.prisma` is modified.

---

## License

This project is open source and available under the [ISC License](LICENSE).
