# Lab 4 – Secure Connect and Communication Platform

A secure Node.js backend with signup/login, JWT authentication, protected routes, role-based access control, a Notes CRUD API, real-time chat with Socket.IO, and event-driven logging using EventEmitter. No auth boilerplate or starter kits are used.

## Tech Stack
Node.js · Express.js · jsonwebtoken · bcrypt · dotenv · Socket.IO · EventEmitter · file-based JSON database (`data/*.json`)

## Project Structure
```
secure-connect/
├── server.js              # App entry: Express + HTTP server + Socket.IO
├── .env.example           # Environment variables template
├── config/db.js           # Simple JSON-file database (users, notes)
├── middleware/auth.js     # verifyToken (JWT) + authorizeRoles (RBAC)
├── routes/auth.js         # signup, login, me
├── routes/notes.js        # Notes CRUD (protected, owner-only)
├── routes/admin.js        # Admin-only routes (RBAC demo)
├── events/appEvents.js    # EventEmitter listeners
├── socket/chat.js         # Real-time chat (JWT-secured sockets, rooms)
└── public/index.html      # Browser chat client for testing
```

## Setup & Run
```bash
npm install
cp .env.example .env        # then set JWT_SECRET to a long random string
npm start                   # [server] listening on http://localhost:5000
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | – | Register `{ username, email, password }` (password hashed with bcrypt) |
| POST | `/api/auth/login` | – | Login `{ email, password }` → returns JWT |
| GET | `/api/auth/me` | JWT | Current user profile |
| GET | `/api/notes` | JWT | List my notes |
| GET | `/api/notes/:id` | JWT | Get one note (owner or admin) |
| POST | `/api/notes` | JWT | Create note `{ title, content }` |
| PUT | `/api/notes/:id` | JWT | Update note |
| DELETE | `/api/notes/:id` | JWT | Delete note |
| GET | `/api/admin/users` | JWT + admin | List all users |
| GET | `/api/admin/notes` | JWT + admin | List all notes |

Send the token as `Authorization: Bearer <token>` or as a cookie `token=<token>`.

**Responses**
- No token → `403 {"message":"No token provided"}`
- Invalid/expired token → `401`
- Non-admin on admin route → `403 {"message":"Access denied: insufficient role"}`
- Another user's note → `403 {"message":"You can only access your own notes"}`

**RBAC:** emails listed in `ADMIN_EMAILS` (in `.env`) get the `admin` role at signup; everyone else is `user`.

## Real-Time Chat (Socket.IO)
Open `http://localhost:5000` in two browser tabs, log in with two accounts, and chat in the same room.

Socket events:
- Client connects with `io(url, { auth: { token } })` — connections without a valid JWT are rejected
- `joinRoom` (room name) → server logs `<socketId> joined room general`
- `chatMessage` `{ room, text }` → broadcast to the room, logged as `[general] victor: Hello`
- `typing`, `notification` (join/leave messages)

## Event-Driven Features
`events/appEvents.js` uses Node's `EventEmitter`. Routes emit `user:registered`, `user:login`, `note:created`, `note:updated`, `note:deleted`, `chat:message`, and listeners log them to the server console.

## Sample Server Console
```
[server] listening on http://localhost:5000
[event] New user registered: victor (victor@example.com)
[event] User logged in: victor
[event] Note created: "My First Note" by eea258693a7c7277702689b2
User connected: MB4lJaIsCMO3w1xHAAAB
MB4lJaIsCMO3w1xHAAAB joined room general
[general] victor: Hey team, backend is ready
```

## Security Notes
- Passwords are stored only as bcrypt hashes and are never returned by the API
- JWT secret and settings live in `.env` (git-ignored)
- Login gives the same error for wrong email or wrong password, so attackers can't tell which accounts exist
- Notes are scoped to their owner; only admins can see everyone's data
