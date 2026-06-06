# CampusWire

CampusWire is a private social networking platform for colleges, schools, universities, and closed communities. It gives members a familiar social experience inside a controlled network: profiles, posts, follows, realtime chat, notifications, and admin moderation.

The product is designed to feel like a focused blend of Facebook Groups, LinkedIn, Discord, Slack, Notion, Instagram, and modern SaaS dashboards, adapted for educational institutions and private communities.

## What This Web App Provides

CampusWire supports two main roles:

- **Participants** use the app to create profiles, discover members, follow people, post updates, comment, like, chat, and receive notifications.
- **Administrators** use the app to monitor platform activity, manage users, moderate content, and send broadcast announcements.

The application is intentionally closed-network. It is not a public social media site; it is meant for a bounded group such as a college department, school, class community, club, institution, or private organization.

## Core Experiences

### Authentication

- Register with name, email, and password.
- Login with email and password.
- Google OAuth login redirects through the backend.
- Forgot-password flow sends a 6-digit OTP by email.
- OTP verification returns a short-lived reset token.
- Reset password with validation.
- JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>`.
- Protected routes redirect unauthenticated users to `/login`.
- Admin routes reject non-admin users.

### Home Feed

- Facebook-style central feed.
- Create post card with text and optional image upload.
- Admins can publish posts as broadcasts.
- Feed includes:
  - Current user's posts
  - Followed users' posts
  - Admin broadcast posts
- Post cards show author, role badge, timestamp, content, image, likes, comments, share action, and delete action where authorized.
- Comments are inline inside the post card.
- Empty and loading states are included.

### Profiles

- Profile page includes cover area, avatar, name, bio, role badge, follower count, following count, and post count.
- Own profile has an edit profile action.
- Other users have follow/unfollow and message actions.
- Profile editing supports name, bio, avatar upload, and cover upload.
- User posts are shown below the profile header.

### Explore

- Search users by name or email.
- Suggested users appear when no search term is entered.
- User cards include avatar, name, supporting text, and follow button.
- Search is debounced to avoid unnecessary API calls.

### Messaging

- Slack/Discord-inspired messaging screen.
- Conversation sidebar shows members, last message preview, unread count, and online status.
- Chat window shows message bubbles, timestamps, realtime received messages, and typing indicators.
- Socket.io is used for realtime delivery.
- Messages are persisted to MongoDB.
- Mobile layout collapses into a full-screen conversation/chat experience.

### Notifications

- Notification center lists likes, comments, follows, and broadcasts.
- Navbar shows an unread notification badge.
- Notifications are marked as read when the notification page loads.
- Broadcast notifications are visually distinct from social notifications.

### Admin Panel

- Dashboard with total users, posts, messages, new users today, and recent users.
- User management table with search, role filter, active/inactive status, activate/deactivate action, and delete action.
- Post moderation table with author, content preview, media state, date, broadcast badge, and delete action.
- Broadcast center for composing announcements and viewing announcement history.

## Design System

The frontend uses a custom Tailwind-based design system inspired by shadcn/ui conventions.

### Visual Direction

- Premium, clean, professional UI.
- Mobile-first responsive behavior.
- Light mode and dark mode support.
- Subtle glassmorphism surfaces.
- Soft shadows and low-noise borders.
- Accessible color contrast.
- Lucide icons for navigation and actions.

### Brand Tokens

```txt
Primary:   #4F46E5
Secondary: #6366F1
Success:   #22C55E
Warning:   #F59E0B
Error:     #EF4444
Font:      Inter
Spacing:   8px grid
Cards:     8px radius
Panels:    12px radius
```

### Local UI Components

Reusable UI components live under `client/src/components/ui/`:

- `Button`
- `Card`
- `Input`
- `Textarea`
- `Select`
- `Avatar`
- `Badge`
- `Modal`
- `Skeleton`

### Brand Assets

Production logo assets live under `client/public/assets/brand/`:

- `campuswire-mark.svg` - app icon, favicon, compact navbar mark
- `campuswire-logo.svg` - horizontal logo and wordmark
- `campuswire-logo-concept.png` - generated concept board used as visual reference

The active React logo component is `client/src/components/brand/Logo.jsx`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vite, React 18, React Router |
| Styling | Tailwind CSS |
| UI | Local shadcn-style components, Lucide React |
| State | React Context for auth and sockets |
| Forms | React Hook Form |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Realtime | Socket.io |
| Auth | JWT, bcryptjs, Passport Google OAuth |
| Media | Cloudinary, multer-storage-cloudinary |
| Email | Nodemailer |

## Architecture

```txt
Browser
  |
  | Vite React SPA
  | Authorization: Bearer <JWT>
  v
Express API server
  |
  | Mongoose
  v
MongoDB Atlas or local MongoDB

Socket.io client
  |
  | JWT socket handshake
  v
Socket.io server on Express HTTP server
```

The frontend and backend are deployed separately:

- Frontend: static Vite app on Vercel.
- Backend: long-running Node/Express service on Render or another server host.
- Database: MongoDB Atlas.
- Media: Cloudinary.

Vercel is suitable for the frontend. The backend should not be deployed as Vercel Functions because this project needs Socket.io/WebSocket-style persistent connections. Vercel documents that Vercel Functions do not support acting as a WebSocket server, while Render web services can accept inbound WebSocket connections.

## Project Structure

```txt
client/
  index.html
  vite.config.js
  tailwind.config.js
  src/
    App.jsx
    main.jsx
    components/
      layout/
      messages/
      posts/
      profile/
      routing/
      ui/
      users/
    context/
      AuthContext.jsx
      SocketContext.jsx
    lib/
      utils.js
    pages/
      auth/
      admin/
      Feed.jsx
      Profile.jsx
      Explore.jsx
      Messages.jsx
      Notifications.jsx
    services/
      api.js
    styles/
      globals.css

server/
  index.js
  config/
  controllers/
  middleware/
  models/
  routes/
  sockets/
  utils/
```

## Environment Variables

### Backend: `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/socialnetwork
JWT_SECRET=replace_with_a_long_random_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLIENT_URL=http://localhost:3000
EMAIL_USER=
EMAIL_PASS=
```

### Frontend: `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
```

Do not commit real `.env` files. `.env.example` files are safe to commit if you add placeholder values.

## Local Development

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Run backend:

```bash
cd server
npm run dev
```

Run frontend:

```bash
cd client
npm run dev
```

Open:

```txt
http://127.0.0.1:3000
```

## API Summary

### Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register participant |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/me` | Current authenticated user |
| POST | `/api/auth/forgot-password` | Send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/reset-password` | Reset password |

### Users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/users/:id` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/:id/follow` | Follow or unfollow |
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/suggestions` | Suggested users |

### Posts

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/feed` | Feed |
| GET | `/api/posts/:id` | Single post |
| GET | `/api/posts/user/:userId` | User posts |
| PUT | `/api/posts/:id/like` | Like or unlike |
| POST | `/api/posts/:id/comment` | Add comment |
| DELETE | `/api/posts/:id/comment/:commentId` | Delete comment |
| DELETE | `/api/posts/:id` | Delete post |

### Messaging

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/messages/conversations` | Conversation list |
| GET | `/api/messages/:userId` | Chat history |
| POST | `/api/messages/:userId` | Send fallback HTTP message |

### Notifications

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/read` | Mark all as read |

### Admin

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | User table |
| PUT | `/api/admin/users/:id/status` | Toggle active status |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/posts` | Post moderation table |
| DELETE | `/api/admin/posts/:id` | Delete any post |
| POST | `/api/admin/broadcast` | Send broadcast |

## Socket.io Events

| Event | Direction | Purpose |
| --- | --- | --- |
| `user:online` | Client to server | Register online user |
| `users:online` | Server to clients | Broadcast online user IDs |
| `message:send` | Client to server | Send realtime message |
| `message:receive` | Server to receiver | Deliver realtime message |
| `message:sent` | Server to sender | Confirm sent message |
| `message:error` | Server to sender | Report send failure |
| `typing:start` | Client/server | Typing indicator start |
| `typing:stop` | Client/server | Typing indicator stop |

Socket identity is derived from the JWT provided in the Socket.io handshake.

## Deployment Overview

Recommended free-friendly setup:

- Frontend: Vercel Vite deployment.
- Backend: Render Web Service because it can host a long-running Express and Socket.io server.
- Database: MongoDB Atlas free `M0` cluster.
- Media: Cloudinary free plan.

Important deployment variables:

```txt
Frontend Vercel:
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id

Backend Render:
PORT=10000 or leave Render-managed
MONGO_URI=your_atlas_uri
JWT_SECRET=long_random_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLIENT_URL=https://your-frontend.vercel.app
EMAIL_USER=...
EMAIL_PASS=...
```

See `TEMP_DEPLOYMENT_IMPLEMENTATION.md` for a step-by-step temporary deployment checklist.

## Verification

Frontend build:

```bash
cd client
npm run build
```

Backend syntax check on Windows PowerShell:

```powershell
rg --files server -g "*.js" -g "!**/node_modules/**" | ForEach-Object { node --check $_ }
```

Health check after backend starts:

```txt
GET /api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## Production Readiness Checklist

- MongoDB Atlas cluster created and reachable.
- Cloudinary credentials configured.
- Google OAuth redirect URI points to backend callback.
- Gmail app password or production email provider configured.
- Backend `CLIENT_URL` exactly matches Vercel frontend URL.
- Frontend `VITE_API_URL` exactly matches backend public URL.
- Admin account created or promoted in MongoDB.
- All protected routes tested after deployment.
- Socket.io chat tested between two accounts.
- Image upload tested from profile and feed.
- Broadcast notifications tested from admin account.

## Deployment References

- Vercel Vite deployment docs: https://vercel.com/docs/frameworks/vite
- Vercel environment variables: https://vercel.com/docs/projects/environment-variables
- Vercel WebSocket limitation: https://vercel.com/docs/limits/overview
- Render free services: https://render.com/free
- Render WebSocket support: https://render.com/docs/websocket
- MongoDB Atlas free cluster: https://www.mongodb.com/quickstart/free-atlas-cluster
- Cloudinary free plan: https://cloudinary.com/documentation/developer_onboarding_faq_free_plan
