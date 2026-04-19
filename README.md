# 🔍 Lost & Found — Cloud-Based Web Application

A full-stack cloud-native Lost and Found system built with React, Node.js, PostgreSQL, and AWS.

## Tech Stack
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express.js + Sequelize ORM
- **Database**: PostgreSQL (AWS RDS in production)
- **Storage**: AWS S3 (image uploads)
- **Hosting**: AWS EC2
- **DevOps**: Docker + GitHub Actions CI/CD
- **Auth**: JWT + bcrypt

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL running locally
- Git

### 1. Clone and setup
```bash
git clone <your-repo-url>
cd lost-and-found
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
npm run dev
```

### 3. Frontend setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Open app
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## Create Admin User
Register normally, then run this SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Docker (Production)
```bash
cp backend/.env.example backend/.env
# Fill in your values in backend/.env
docker-compose up -d --build
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/items | No | List approved items |
| POST | /api/items | Yes | Create item |
| GET | /api/items/:id | No | Get item detail |
| PATCH | /api/items/:id/approve | Admin | Approve item |
| DELETE | /api/items/:id | Owner/Admin | Delete item |
| GET | /api/items/admin/pending | Admin | Pending items |
| POST | /api/claims/:itemId | Yes | Submit claim |
| GET | /api/claims/my | Yes | My claims |
| GET | /api/claims | Admin | All claims |
| PATCH | /api/claims/:id | Admin | Update claim status |

## AWS Deployment
See Step 8 in the project guide for full EC2, RDS, and S3 setup instructions.
