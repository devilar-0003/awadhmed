# AwadhMed v3.0 — Full Stack Healthcare Platform

Lucknow's premier healthcare platform, now powered by **Node.js + Express + MongoDB**.

## Tech Stack
- **Frontend:** HTML, CSS, Vanilla JS (existing premium design preserved)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Uploads:** Multer (images stored in `/uploads`)

## Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB running locally OR a MongoDB Atlas URI

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set your `MONGODB_URI`:
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/awadhmed

# MongoDB Atlas (recommended for production)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/awadhmed
```

### 4. Start the server
```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

### 5. Open in browser
| URL | Page |
|-----|------|
| http://localhost:3000 | Main site |
| http://localhost:3000/Schemes.html | Government Schemes (dynamic) |
| http://localhost:3000/admin.html | Admin Panel |
| http://localhost:3000/auth.html | Login / Register |
| http://localhost:3000/dashboard.html | User Dashboard |
| http://localhost:3000/api/health | Health check |

**Default Admin:** `admin@awadhmed.com` / `Admin@2024`

> The database is seeded automatically on first start — admin account, doctors, medicines, schemes, and blog posts are all created.

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |
| PUT | `/api/auth/change-password` | JWT | Change password |
| POST | `/api/auth/otp/send` | — | Send mobile OTP |
| POST | `/api/auth/otp/verify` | — | Verify mobile OTP |

### Schemes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/schemes` | — | List all active schemes |
| GET | `/api/schemes/:id` | — | Get single scheme |
| POST | `/api/schemes` | Admin | Create scheme (multipart/form-data) |
| PUT | `/api/schemes/:id` | Admin | Update scheme |
| DELETE | `/api/schemes/:id` | Admin | Delete scheme |

### Contact
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | — | Submit contact message |
| GET | `/api/contact` | Admin | List all messages |
| PUT | `/api/contact/:id/status` | Admin | Update status |
| DELETE | `/api/contact/:id` | Admin | Delete message |

### Doctors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/doctors` | — | List doctors (filter by specialty/search) |
| GET | `/api/doctors/:id` | — | Get doctor by ID |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings/initiate` | Patient | Create booking + get UPI details |
| POST | `/api/bookings/:id/confirm` | Patient | Confirm with UPI ref |
| GET | `/api/bookings/my` | Patient | My bookings |
| PUT | `/api/bookings/:id/status` | Doctor/Admin | Update status |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders/medicines` | — | List medicines |
| POST | `/api/orders/initiate` | Patient | Create order + get UPI details |
| POST | `/api/orders/:id/confirm` | Patient | Confirm with UPI ref |
| GET | `/api/orders/my` | Patient | My orders |

### Admin (all require Admin JWT)
| Endpoint | Description |
|----------|-------------|
| GET `/api/admin/stats` | Dashboard stats |
| GET/PUT/DELETE `/api/admin/users/:id` | Manage users |
| GET/POST/PUT/DELETE `/api/admin/doctors/:id` | Manage doctors |
| GET/POST/PUT/DELETE `/api/admin/medicines/:id` | Manage medicines |
| GET/POST/PUT/DELETE `/api/admin/schemes/:id` | Manage schemes |
| GET/PUT/DELETE `/api/admin/contacts/:id` | Manage contact messages |
| GET/PUT `/api/admin/bookings/:id` | Manage bookings |
| GET/PUT `/api/admin/orders/:id` | Manage orders |
| GET `/api/admin/blog` | List blog posts |
| GET/POST/DELETE `/api/admin/notices` | Manage notices |

---

## Project Structure

```
awadhmed/
├── server.js              # Entry point
├── .env                   # Your environment config (never commit)
├── .env.example           # Template
├── package.json
├── uploads/               # Multer image uploads (gitignore this)
├── models/
│   ├── User.js
│   ├── Scheme.js          # NEW
│   ├── Contact.js         # NEW
│   ├── Doctor.js
│   ├── Booking.js
│   ├── Medicine.js
│   ├── Order.js
│   ├── Blog.js
│   └── Notice.js
├── db/
│   ├── database.js        # MongoDB connect
│   └── seed.js            # Auto-seed on first run
├── middleware/
│   ├── auth.js            # JWT middleware
│   └── upload.js          # Multer middleware
├── routes/
│   ├── auth.js
│   ├── schemes.js         # NEW — full CRUD
│   ├── contact.js         # NEW — save messages
│   ├── doctors.js
│   ├── bookings.js
│   ├── orders.js
│   ├── blog.js
│   └── admin.js
├── utils/
│   └── mailer.js          # Nodemailer (graceful if no SMTP)
└── public/
    ├── index.html         # Main site (API bridge fixed, contact form added)
    ├── Schemes.html       # Dynamic — fetches from /api/schemes
    ├── admin.html
    ├── auth.html
    └── dashboard.html
```

## Security Features
- JWT token authentication on all protected routes
- bcrypt password hashing (cost factor 10)
- Role-based access control (patient / doctor / admin)
- Input validation on all POST endpoints
- Multer file type + size restrictions (images only, 5MB max)
- CORS enabled
- No sensitive data returned in API responses (password/otpHash stripped)
