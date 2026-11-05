# QuizCraft — Peer-Created Practice Quiz Bank with Weak Topics Analysis

> A full-stack MERN application that empowers learners to collaboratively build, moderate, and practice exam questions, with intelligent weakness detection that flags repeatedly missed topics for targeted revision.

---

## 📌 Project Overview
Students preparing for computer science and engineering examinations often struggle with scattered, unorganized question sets with no systematic way to diagnose knowledge gaps. **QuizCraft** solves this problem by offering:
1. **A Moderated Peer Question Bank**: Students submit questions across topics and difficulty tiers, which are vetted by moderators with feedback notes before public publication.
2. **Flexible Quiz Generation**: Instant quiz auto-generation by sampling approved questions across specific topics and difficulties, or manual question curation.
3. **Timed Assessments with Immediate Grading**: Server-side grading ensuring test integrity, with explanations provided only upon completion.
4. **Differentiating Feature — Algorithmic "Weak Topics" Analysis**: Continuous monitoring of answer patterns to identify topics where a student repeatedly answers questions incorrectly, with one-click targeted practice generation.

---

## 🚀 Key Features

### 1. Peer-Created & Moderated Question Bank
- **Student Submissions**: Dynamic multiple-choice form supporting 2 to 6 options, difficulty levels (`easy`, `medium`, `hard`), and optional explanations.
- **Moderator Workflow**: Dedicated moderation queue allowing moderators to approve, reject with notes, or inline-edit submitted questions before publication.
- **Filtering & Search**: Instant search by text, topic categorization, and difficulty filtering with color-coded badges.

### 2. Flexible Quiz System & Server-Side Grading
- **Dual Creation Modes**:
  - **Auto-Generate**: Random sampling via MongoDB aggregation pipelines (`$sample`) filtered by topic(s) and difficulty.
  - **Hand-Pick**: Select individual approved questions from the library.
- **Cheating Prevention**: Quiz retrieval endpoints strip `correctIndex` and `explanation` before delivery to the client.
- **Real-Time Interface**: Live countdown/elapsed timer, question jumper navigator, progress bar, and immediate result breakdown with explanations.

### 3. Differentiating Feature: "Weak Topics" Analysis
- **Algorithmic Detection**: Analyzes a learner's historical attempt answer snapshots to identify topics needing reinforcement.
- **Criteria**:
  - $\text{incorrectCount} \ge 3$, **OR**
  - $\text{totalAnswered} \ge 4 \text{ AND } \text{accuracy} < 60\%$
- **Visual Analytics**: Interactive Recharts bar chart displaying accuracy rates per topic, flagging weak topics in red.
- **"Questions You Keep Missing"**: Surfaces the top 5 questions the student has repeatedly answered incorrectly.
- **One-Click Targeted Practice**: Generates an adaptive quiz targeting only the student's weak topics with a single click.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v7, Axios, Recharts, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express.js (REST API, modular routers) |
| **Database** | MongoDB, Mongoose ODM (Indexes, Aggregation pipelines) |
| **Security & Validation** | JSON Web Tokens (JWT), Bcrypt.js, Zod schema validation, Helmet, CORS, Express-Rate-Limit |
| **Dev & Deployment** | Concurrently, Dotenv, Render Single Web Service deployment |

---

## 📊 How the Weak-Topic Algorithm Works

The weakness detection engine operates in `server/routes/analytics.js` using MongoDB aggregation over the `Attempt` collection:

```javascript
// Threshold definitions (constants at top of file)
const WEAK_INCORRECT_MIN_THRESHOLD = 3;
const WEAK_TOTAL_MIN_THRESHOLD = 4;
const WEAK_ACCURACY_MAX_THRESHOLD = 60; // in percent (< 60%)
```

### Classification Logic:
1. Every submitted answer snapshots the normalized `topic` onto `attempt.answers`.
2. An aggregation pipeline groups the learner's answers by topic, calculating `totalAnswered`, `correctCount`, `incorrectCount`, and `accuracy = Math.round((correctCount / totalAnswered) * 100)`.
3. A topic is flagged as `isWeak = true` if:
   $$\text{incorrectCount} \ge 3 \quad\lor\quad (\text{totalAnswered} \ge 4 \;\land\; \text{accuracy} < 60\%)$$
4. Evaluated topics are sorted with weak topics first, followed by lowest accuracy, ensuring the most urgent learning gaps appear at the top.

---

## 🗄️ Data Models Summary

```
+---------------------------------------------------------------------------------+
|                                    User                                         |
+---------------------------------------------------------------------------------+
| _id, name, email (unique, lowercase), passwordHash, role ('student'|'moderator') |
| timestamps (createdAt, updatedAt)                                              |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
|                                  Question                                       |
+---------------------------------------------------------------------------------+
| _id, text, options (2-6 strings), correctIndex, topic (lowercase), topicDisplay |
| difficulty ('easy'|'medium'|'hard'), explanation, createdBy (User ref)          |
| status ('pending'|'approved'|'rejected'), moderationNote, moderatedBy, at       |
| Indexes: { topic: 1, difficulty: 1, status: 1 }, { status: 1, createdAt: -1 }    |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
|                                    Quiz                                         |
+---------------------------------------------------------------------------------+
| _id, title, description, createdBy (User ref), questions [Question refs]        |
| filters { topic, difficulty, count }, isPublic (bool)                           |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
|                                   Attempt                                       |
+---------------------------------------------------------------------------------+
| _id, user (User ref), quiz (Quiz ref), score, total, percentage, durationSec    |
| answers: [{ question, selectedIndex, isCorrect, topic, topicDisplay }]          |
| Indexes: { user: 1, createdAt: -1 }                                             |
+---------------------------------------------------------------------------------+
```

---

## 📡 REST API Reference

All endpoints return JSON with consistent error responses: `{ message: string, errors?: array }`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student (role always defaults to `student`) |
| `POST` | `/api/auth/login` | Public | Authenticate user, returns JWT and user payload |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |

### Questions & Moderation (`/api/questions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/questions` | Private | Submit question (student = pending; moderator = auto-approved) |
| `GET` | `/api/questions` | Public/Auth | List approved questions with topic, difficulty, search filters |
| `GET` | `/api/questions/mine` | Private | Current user's submissions with status and moderator notes |
| `GET` | `/api/questions/pending` | Moderator | Pending questions awaiting moderation queue |
| `PATCH`| `/api/questions/:id/moderate` | Moderator | Approve or reject a question with an optional note |
| `PUT` | `/api/questions/:id` | Owner / Mod | Edit question (owner while pending, or moderator) |
| `DELETE`| `/api/questions/:id` | Owner / Mod | Delete question (owner while pending, or moderator) |

### Topics (`/api/topics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/topics` | Public | Distinct approved topics with counts per difficulty |

### Quizzes (`/api/quizzes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/quizzes` | Private | Create quiz via auto-generation or manual question selection |
| `GET` | `/api/quizzes` | Public/Auth | List public quizzes plus user's custom quizzes |
| `GET` | `/api/quizzes/:id` | Public/Auth | Fetch quiz for test-taking (**sanitized: no correctIndex or explanation**) |
| `DELETE`| `/api/quizzes/:id` | Owner / Mod | Delete a quiz |

### Attempts & Grading (`/api/quizzes/:id/attempts` & `/api/attempts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/quizzes/:id/attempts` | Private | Submit answers; server grades attempt, records score & returns feedback |
| `GET` | `/api/attempts/mine` | Private | Paginated list of user's past attempts, newest first |
| `GET` | `/api/attempts/:id` | Private | Detailed attempt review with explanations and answer comparisons |

### Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/weak-topics` | Private | Aggregated accuracy per topic, weak flags, and top 5 missed questions |
| `GET` | `/api/analytics/summary` | Private | Overall attempts, avg score, best score, chronological score series |

---

## 🔑 Seed Credentials

Run `npm run seed` to populate the database with users, 30 approved questions across 5 core computer science topics, pending items, and realistic attempts:

| Role | Email | Password | Pre-seeded State |
| :--- | :--- | :--- | :--- |
| **Student** | `student1@quizcraft.com` | `Student@123` | Has 4 completed attempts; **DBMS** and **Networks** are flagged as Weak Topics |
| **Student** | `student2@quizcraft.com` | `Student@123` | Fresh student profile |
| **Moderator** | `moderator@quizcraft.com` | `Moderator@123` | Full moderation access to review pending questions |

---

## 💻 Local Setup Steps

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas connection URI

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd "Quiz Craft"

# Install all dependencies (root, server, and client)
npm run install-all
```

### 2. Environment Configuration
Create a `.env` file in the project root (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/quizcraft
JWT_SECRET=quizcraft_super_secret_jwt_key_2026_dev_seed
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```
*(Note: If local MongoDB is not running, QuizCraft automatically boots an embedded in-memory MongoDB instance for seamless zero-setup demoing).*

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Servers
```bash
npm run dev
```
- Client runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:5000`

### 5. Production Build & Run
```bash
npm run build
npm start
```
The unified server will serve the static React frontend and the `/api` endpoints on `http://localhost:5000`.

---

## ☁️ Render Deployment Steps

QuizCraft is built as a unified monorepo so that it deploys as **ONE Render Web Service**:

1. **Create a MongoDB Atlas Database**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
   - Under **Database Access**, create a database user and password.
   - Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
   - Click **Connect** -> **Drivers** and copy your connection string:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/quizcraft?retryWrites=true&w=majority`

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Web Service**.
   - Connect your GitHub repository.
   - Configure the Web Service settings:
     - **Name**: `quizcraft`
     - **Region**: Select closest to your users (e.g., Oregon or Frankfurt)
     - **Branch**: `main`
     - **Root Directory**: Leave blank (root of repository)
     - **Environment**: `Node`
     - **Build Command**: `npm run install-all && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: `Free`

3. **Set Environment Variables in Render**:
   Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET`: `<a-long-random-secret-key>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_ORIGIN`: `*`

4. **Click "Deploy Web Service"**:
   Render will install dependencies, build the Vite React client into `/client/dist`, launch the Express server, and serve the application at your Render URL (e.g., `https://quizcraft.onrender.com`).

---

## 📝 Assumptions & Design Notes
1. **Zero-Setup Embedded Database Fallback**: If local MongoDB is unavailable during local development or smoke-testing, the server automatically starts an in-memory MongoDB instance and auto-seeds the database, ensuring instantaneous offline demos.
2. **Registration Safety**: Public registration is strictly locked to the `student` role. Moderator accounts cannot be registered via public endpoints and are provisioned only via administrative seed or database scripts.
3. **Question Integrity**: To prevent client-side inspection during exams, `correctIndex` and `explanation` are deliberately stripped by the server during quiz taking and are delivered only in the graded attempt result.
4. **Weakness Metric**: The threshold $\text{incorrectCount} \ge 3 \lor (\text{totalAnswered} \ge 4 \land \text{accuracy} < 60\%)$ was selected to balance prompt detection of problem areas with sufficient sample confidence.
