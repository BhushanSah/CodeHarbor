# CodeHarbor

CodeHarbor is a GitHub-inspired full-stack developer platform for creating repositories, tracking issues, adding comments, viewing contribution activity, and connecting local projects through a custom CLI workflow.

**Live Website:** https://bscodeharbor.netlify.app/

---

## Overview

CodeHarbor was built to understand how developer platforms like GitHub work behind the scenes. It includes a web application, backend API, database, file storage system, and command-line interface.

The project supports repository creation, issue tracking, comments, contribution activity, and a CLI-based local workflow for initializing, staging, committing, pushing, pulling, and reverting files.

---

## Features

- User authentication
- Repository creation and management
- Repository detail pages
- Issue creation, editing, closing, reopening, and deletion
- Comment system for individual issues
- Profile page with contribution activity heatmap
- Dashboard with repository overview
- Documentation page for CLI usage
- Custom CodeHarbor CLI workflow
- AWS S3-based file storage for pushed commits
- Deployed frontend and backend

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Native MongoDB Driver
- JWT
- bcryptjs
- Socket.IO
- AWS SDK
- Yargs CLI

### Deployment

- Frontend: Netlify
- Backend: Railway
- Database: MongoDB Atlas
- File Storage: AWS S3

---

## Project Structure

```text
CodeHarbor/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── cli.js
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── _redirects
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── api.js
│   │   ├── Routes.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## How It Works

```text
React frontend
↓
Express backend
↓
MongoDB Atlas + AWS S3
```

The frontend sends requests to the backend for users, repositories, issues, comments, and profile activity.

MongoDB stores application data such as users, repositories, issues, comments, and activity-related data.

AWS S3 stores repository files pushed through the CodeHarbor CLI workflow.

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/BhushanSah/CodeHarbor.git
cd CodeHarbor
```

---

## Backend Setup

Go to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
AWS_REGION=us-east-2
S3_BUCKET=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

Run the backend:

```bash
npm start
```

The backend should run on:

```text
http://localhost:3000
```

For deployment platforms like Railway, the app uses:

```js
process.env.PORT || 3000
```

---

## Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Run the frontend:

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

---

## API Base URL

The frontend uses `frontend/src/api.js` to decide which backend URL to call.

```js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default API_BASE_URL;
```

For local development:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production:

```env
VITE_API_BASE_URL=https://adventurous-passion-production-6861.up.railway.app
```

---

## CLI Usage

CodeHarbor includes a custom CLI for local repository actions.

From the `backend` folder:

```bash
npm link
```

Then move to any local project folder and run:

```bash
codeharbor init
codeharbor add <file>
codeharbor commit -m "your commit message"
```

To connect a local project to an online CodeHarbor repository:

```bash
codeharbor remote add origin <repository-id>
```

To push committed files:

```bash
codeharbor push
```

To pull files:

```bash
codeharbor pull
```

To revert to a specific commit:

```bash
codeharbor revert <commit-id>
```

---

## CLI Workflow

```text
Local project folder
↓
codeharbor init
↓
.CodeHarbor folder is created
↓
codeharbor add <file>
↓
file goes into staging
↓
codeharbor commit -m "message"
↓
commit snapshot is saved locally
↓
codeharbor remote add origin <repoId>
↓
local project is linked to online repository
↓
codeharbor push
↓
files are uploaded to AWS S3
```

---

## Backend Environment Variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET_KEY` | Secret key for JWT authentication |
| `AWS_REGION` | AWS region for S3 |
| `S3_BUCKET` | S3 bucket name |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `FRONTEND_URL` | Deployed frontend URL for CORS |
| `PORT` | Provided automatically by Railway or other hosting platforms |

---

## Frontend Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL used by the React frontend |

---

## Deployment

The deployed version uses:

```text
Frontend → Netlify
Backend → Railway
Database → MongoDB Atlas
Storage → AWS S3
```

### Frontend Deployment

Netlify settings:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Frontend environment variable:

```env
VITE_API_BASE_URL=https://adventurous-passion-production-6861.up.railway.app
```

The frontend also includes a Netlify redirect file:

```text
frontend/public/_redirects
```

Content:

```text
/* /index.html 200
```

This allows React routes like `/profile`, `/docs`, and `/repo/:id` to work after page refresh.

### Backend Deployment

Railway backend uses the `backend` folder.

The backend start script is:

```json
"scripts": {
  "start": "node index.js start"
}
```

Railway environment variables include:

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET_KEY=your_jwt_secret
AWS_REGION=us-east-2
S3_BUCKET=your_s3_bucket
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
FRONTEND_URL=https://bscodeharbor.netlify.app
```

The backend listens using:

```js
const port = process.env.PORT || 3000;

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on ${port}`);
});
```

---

## Production URLs

Frontend:

```text
https://bscodeharbor.netlify.app/
```

Backend:

```text
https://adventurous-passion-production-6861.up.railway.app
```

---

## Current Limitations

- The CLI currently works through a source-based setup using `npm link`.
- Public CLI distribution through npm is not added yet.
- AWS SDK v2 is currently used and can be migrated to AWS SDK v3 later.
- More authentication checks can be added for repository ownership and comment permissions.
- Activity tracking can be improved by tying issue/comment activity directly to authenticated user IDs.
- The project is still being improved toward a more production-ready developer platform.

---

## Future Improvements

- Publish the CLI as an npm package
- Add stronger repository permissions
- Add branch support
- Add commit history UI
- Add file diff views
- Improve S3 file browsing
- Add user profile customization
- Add better activity tracking by author
- Add tests for backend routes
- Improve mobile responsiveness
- Migrate AWS SDK v2 to AWS SDK v3
- Add better error handling for deployment and API failures

---

## Security Notes

Do not commit `.env` files or secret keys to GitHub.

Make sure `.gitignore` includes:

```gitignore
.env
node_modules
```

Deployment secrets should be stored in the hosting platform environment variables, not in the codebase.

---

