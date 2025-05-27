**codedeck: LeetCode Flashcards App – Detailed Implementation Plan**

---

## 1. Overview

A personal Next.js web app that manages LeetCode problems as flashcards. Each card stores:

* **Name**
* **Description**
* **Trick Summary** (editable, up to 50 words, client-side enforced)
* **Notes**
* **Solved** toggle
* **Attempts** (each new attempt automatically commits code to a connected private Git repo)

Main page lists all problems sorted by `solved` (unsolved first) and then by oldest `lastAttempt` date.

---

## 2. Tech Stack

* **Front-end**: Next.js, React, Tailwind CSS, Framer Motion
* **State & Data-fetching**: SWR
* **Back-end**: Next.js API Routes (Node.js)
* **Database**: SQLite via Prisma ORM
* **Git integration**: Node.js Git client (e.g. simple-git) using a PAT
* **Containerization**: Docker + docker-compose

---

## 3. Data Model (Prisma)

```prisma
model Problem {
  id           Int       @id @default(autoincrement())
  name         String
  description  String
  trickSummary String?   
  notes        String?
  solved       Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  attempts     Attempt[]
}

model Attempt {
  id          Int       @id @default(autoincrement())
  problemId   Int
  problem     Problem   @relation(fields:[problemId], references:[id])
  timestamp   DateTime  @default(now())
  commitHash  String    
  note        String?   
}
```

---

## 4. API Endpoints

| Method | Endpoint                     | Description                                               |
| ------ | ---------------------------- | --------------------------------------------------------- |
| GET    | `/api/problems`              | List all problems (with attempts)                         |
| POST   | `/api/problems`              | Create a new problem                                      |
| GET    | `/api/problems/:id`          | Get single problem                                        |
| PUT    | `/api/problems/:id`          | Update problem fields (`trickSummary`, `notes`, `solved`) |
| DELETE | `/api/problems/:id`          | Delete a problem                                          |
| GET    | `/api/problems/:id/attempts` | List attempts for problem                                 |
| POST   | `/api/problems/:id/attempts` | Add attempt + auto-commit to Git repo                     |

---

## 5. Component Map

* **`<ProblemListPage>`**: fetches & displays `<ProblemCard>`s
* **`<ProblemCard>`**: shows name, solved badge, last attempt date; click → detail
* **`<ProblemDetailPage>`**: editable `trickSummary` (50-word cap), notes, solved toggle, list of `<AttemptItem>`, “Add Attempt” button
* **`<ProblemFormModal>`**: create new problem
* **`<AttemptModal>`**: enter commit note → triggers backend commit
* **Toasts**: success/error notifications

---

## 6. Architecture & Project Structure

```
/my-leetcode-flashcards
├─ pages/
│  ├─ index.tsx            # ProblemListPage
│  ├─ problems/[id].tsx    # ProblemDetailPage
│  └─ api/
│     ├─ problems.ts       # GET/POST all problems
│     ├─ problems/[id].ts  # GET/PUT/DELETE single
│     └─ attempts.ts       # GET/POST attempts
├─ components/
│  ├─ ProblemCard.tsx
│  ├─ ProblemFormModal.tsx
│  ├─ AttemptModal.tsx
│  └─ AttemptItem.tsx
├─ lib/
│  ├─ prisma.ts            # Prisma client
│  └─ git.ts               # simple-git wrapper for commits
├─ prisma/schema.prisma
├─ tailwind.config.js
├─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

---

## 7. Step-by-Step Roadmap & Tickets

Below are granular tickets. Each should be created in the issue tracker and assigned in order.

### Ticket 1: Project Initialization

* **Task**: Initialize git repo; set up Next.js with TypeScript
* **Acceptance**: `npx create-next-app --ts` completed; repo ready

### Ticket 2: Tailwind & UI Boilerplate

* **Task**: Install/configure Tailwind CSS; set global styles
* **Acceptance**: Tailwind works; basic layout component exists

### Ticket 3: Prisma Setup & SQLite

* **Task**: Add Prisma, define schema; run `prisma migrate dev` to create SQLite DB
* **Acceptance**: `schema.prisma` models in place; `prisma migrate` runs successfully

### Ticket 4: Git Integration Module

* **Task**: Implement `lib/git.ts` using `simple-git`; configure to use `GITHUB_PAT` and `GIT_REPO_PATH` env vars
* **Acceptance**: A function `createCommit(message: string): Promise<string>` returns commit hash

### Ticket 5: API Route — GET /api/problems

* **Task**: Implement listing all problems with nested attempts via Prisma
* **Acceptance**: HTTP 200 returns JSON array of problems + attempts

### Ticket 6: API Route — POST /api/problems

* **Task**: Create problem with `name` & `description`
* **Acceptance**: Returns created problem object

### Ticket 7: API Route — GET/PUT/DELETE /api/problems/\:id

* **Task**: Fetch, update (`trickSummary`, `notes`, `solved`), delete problem
* **Acceptance**: Each method works per spec; partial updates allowed

### Ticket 8: API Route — GET/POST /api/problems/\:id/attempts

* **Task**: List attempts; on POST, call `createCommit`, store `commitHash` + `note`
* **Acceptance**: New attempt triggers Git commit and returns attempt record

### Ticket 9: Data-Fetching Hooks

* **Task**: Build React Query hooks (`useProblems`, `useProblem`, etc.)
* **Acceptance**: Hooks correctly fetch/mutate data and update cache

### Ticket 10: Problem List & Card UI

* **Task**: `<ProblemListPage>` + `<ProblemCard>`; sort unsolved first, then by oldest `updatedAt`
* **Acceptance**: Unsolved cards at top; clicking navigates to detail page

### Ticket 11: Create New Problem Modal

* **Task**: `<ProblemFormModal>` with inputs for `name` & `description`
* **Acceptance**: Modal opens/closes; submits and refreshes list

### Ticket 12: Problem Detail Page

* **Task**: Build `/problems/[id]` page; display all fields; inline-editable `trickSummary` & `notes` with client-side 50-word limit
* **Acceptance**: Edits save on blur or “Save” button; word cap enforced

### Ticket 13: Solved Toggle

* **Task**: Add a toggle/button to mark problem as solved/unsolved
* **Acceptance**: Updates server and re-sorts list

### Ticket 14: Attempt Modal & List

* **Task**: `<AttemptModal>` prompts for commit note; triggers backend; `<AttemptItem>` lists timestamp + hyperlink to commit
* **Acceptance**: New attempts appear immediately; commit URL/link correct

### Ticket 15: Notifications & UX Polish

* **Task**: Add toast notifications for success/error; add Framer Motion to animate cards
* **Acceptance**: Notifications display; animations smooth

### Ticket 16: Dockerization

* **Task**: Write `Dockerfile` and `docker-compose.yml` to run Next.js + SQLite; mount local code & DB
* **Acceptance**: `docker-compose up` runs app locally; data persists

### Ticket 17: Testing & Validation

* **Task**: Perform manual end-to-end tests; fix bugs
* **Acceptance**: All user flows (CRUD, commits, sorting) function without errors

### Ticket 18: Documentation

* **Task**: Write README with setup, Docker instructions, env vars (`GITHUB_PAT`, `GIT_REPO_PATH`)
* **Acceptance**: Developer can clone, set env, `docker-compose up`, and run

---

With this breakdown, your developer can pick each ticket, implement against the acceptance criteria, and deliver a ready-to-use local app.
