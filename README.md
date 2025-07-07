# 📚 E-Library Management System

A modern digital library platform with React/Next.js frontend and Django backend, featuring book/video management, user roles, and borrowing system.

![Screenshot 2025-06-26 054612](https://github.com/user-attachments/assets/eacaace9-646f-40f5-a9f6-9c3a68ed847b)

Admin Dashboard:
![Screenshot 2025-06-26 063227](https://github.com/user-attachments/assets/5720b635-bd95-4804-96e8-55eab22a1fa6)

### Test User Logs
- **Password** - testdummy123
- **Email** - testuser@library.com

## 🚀 Features

### User Features
- **Guest Access**: Browse books/Download some books without login
- **User Accounts**: Registration & authentication
- **Book Management**: Borrow/return physical books
- **E-Books**: Read online or download (when permitted)
- **Video Library**: Educational video content
- **Personal Dashboard**: Track borrowed items

### Admin Features
- **Content Management**: Add/edit books, categories & videos
- **User Management**: View registered users, and Guest and User Inquiries
- **Borrowing Oversight**: Manage active loans, Return books
- **Reporting**: Generate library statistics
- **Category System**: Organize content

## 🛠️ Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- React Hook Forms

**Backend**:
- Django 4.2
- Django REST Framework
- SimpleJWT Authentication
- SQLite (Development)
- PostgreSQL (Production-ready)

## 🏗️ Project Structure
E-Lib/
├── backend/ # Django backend
│ ├── authentication/ # User auth
│ ├── library/ # Core app
│ ├── manage.py
│ └── requirements.txt
├── frontend/ # Next.js frontend
│ ├── app/ # App router
│ ├── components/ # UI components
│ ├── lib/ # Utilities/types
│ └── public/ # Static assets
└── README.md



## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (for production)

### Installation
1. **Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
2. **Frontend Setup**:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
