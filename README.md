# ConceptCore Academy - Home Tutoring Platform

A full-stack web application for ConceptCore Academy, a professional home tutoring service where students can book one-on-one meetings with educators.

## 🚀 Features

### Frontend (Next.js + React)
- **High-Converting Landing Page** - Professional design showcasing tutoring services
- **Smooth Animations** - Framer Motion animations throughout the site
- **Interactive Booking System** - Real-time slot availability with 3-step booking flow
- **Responsive Design** - Optimized for desktop and mobile devices
- **Educator Dashboard** - View and manage all bookings with filtering

### Backend (Node.js + Express)
- **RESTful API** - Clean, well-structured API endpoints
- **Supabase Database** - PostgreSQL database with real-time capabilities
- **Conflict Prevention** - Database constraints ensure no double bookings
- **Input Validation** - Joi validation for all API inputs
- **Security** - Helmet, CORS, and rate limiting middleware

### Key Features
- ✅ Real-time slot availability display
- ✅ Conflict prevention logic (no double bookings)
- ✅ Student data collection (name, email, phone, subject, notes)
- ✅ Clean booking confirmation flow
- ✅ Educator dashboard for managing bookings
- ✅ Status tracking (confirmed, cancelled, completed)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Database**: Supabase Cloud

## 📁 Project Structure

```
conceptcoreacadmey/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── layout.tsx  # Root layout
│   │   │   ├── page.tsx    # Home page
│   │   │   └── globals.css  # Global styles
│   │   ├── components/      # React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Booking.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── EducatorDashboard.tsx
│   │   └── lib/             # Utilities and API
│   │       ├── supabase.ts  # Supabase client
│   │       └── api.ts       # API functions
│   ├── public/              # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local.example   # Environment variables template
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── server.js        # Express server entry point
│   │   ├── config/
│   │   │   └── supabase.js  # Supabase configuration
│   │   ├── middleware/
│   │   │   └── validation.js # Input validation
│   │   └── routes/
│   │       ├── bookings.js  # Booking endpoints
│   │       └── availability.js # Availability endpoints
│   ├── supabase-schema.sql  # Database schema
│   ├── package.json
│   ├── .env.example         # Environment variables template
│   ├── .gitignore
│   └── railway.toml         # Railway deployment config
│
└── README.md                # This file
```

## 🗄️ Database Schema

### Tables

#### `availability_slots`
Stores time slots that students can book
- `id` (UUID) - Primary key
- `slot_date` (DATE) - Date of the slot
- `start_time` (TIME) - Start time
- `end_time` (TIME) - End time
- `is_booked` (BOOLEAN) - Booking status
- `booking_id` (UUID) - Foreign key to bookings
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

#### `bookings`
Stores student booking information
- `id` (UUID) - Primary key
- `student_name` (VARCHAR) - Student's full name
- `student_email` (VARCHAR) - Student's email
- `student_phone` (VARCHAR) - Student's phone (optional)
- `subject` (VARCHAR) - Subject/topic
- `notes` (TEXT) - Additional notes (optional)
- `slot_id` (UUID) - Foreign key to availability_slots
- `status` (VARCHAR) - Booking status (confirmed/cancelled/completed)
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/vaibhavdobhall/conceptcoreacadmey.git
cd conceptcoreacadmey
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Run the SQL schema from `backend/supabase-schema.sql` in the Supabase SQL Editor
4. Note down your:
   - Project URL
   - Anon/Public Key
   - Service Role Key

### 3. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
```

Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:3001`

### 4. Set Up Frontend

```bash
cd frontend

# Install dependencies (already done)
npm install

# Create environment file
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🚀 Deployment

### Deploy Backend to Railway

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app) and create a new project
3. Connect your GitHub repository
4. Select the `backend` folder as the root directory
5. Add environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV=production`
   - `PORT=3001`
6. Deploy!

Your backend will be available at `https://your-app.up.railway.app`

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [Vercel.com](https://vercel.com) and import your repository
3. Select the `frontend` folder as the root directory
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (your Railway backend URL)
5. Deploy!

Your frontend will be available at `https://your-app.vercel.app`

## 📊 API Endpoints

### Availability Endpoints

#### `GET /api/availability/slots`
Fetch all available time slots
- Query params: `startDate`, `endDate` (optional)
- Returns: Array of available time slots

#### `GET /api/availability/slots/:id`
Get a specific time slot
- Returns: Single time slot object

#### `GET /api/availability/slots/:id/check`
Check if a specific slot is available
- Returns: `{ available: boolean, isBooked: boolean, isPast: boolean }`

#### `GET /api/availability/dates`
Get all dates with available slots
- Returns: Array of date strings

### Booking Endpoints

#### `POST /api/bookings`
Create a new booking
- Body: `{ studentName, studentEmail, studentPhone, subject, notes, slotId }`
- Returns: Created booking object

#### `GET /api/bookings`
Get all bookings (educator view)
- Returns: Array of all bookings with slot details

#### `GET /api/bookings/:id`
Get a specific booking
- Returns: Single booking object

#### `PATCH /api/bookings/:id/cancel`
Cancel a booking
- Returns: Success message

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configured for specific origins
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Validation** - Joi schema validation
- **SQL Injection Prevention** - Parameterized queries via Supabase
- **RLS Policies** - Row Level Security in Supabase

## 🎨 Third-Party Integrations (Optional)

### Recommended Integrations

1. **Email Notifications** (Nodemailer)
   - Send booking confirmations to students
   - Send booking reminders before sessions
   - Configure SMTP in backend `.env`

2. **Payment Processing** (Stripe)
   - Accept payments for tutoring sessions
   - Add Stripe integration to booking flow
   - Store payment status in database

3. **Calendar Sync** (Google Calendar API)
   - Auto-add bookings to educator's calendar
   - Send calendar invites to students
   - Sync availability with Google Calendar

4. **SMS Reminders** (Twilio)
   - Send SMS reminders before sessions
   - Notify students of booking confirmations
   - Alert educator of new bookings

5. **Analytics** (Google Analytics / Mixpanel)
   - Track booking conversions
   - Monitor user behavior
   - Analyze peak booking times

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run lint
```

## 📝 Environment Variables

### Backend (.env)
```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Server
PORT=3001
NODE_ENV=development

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**ConceptCore Academy**
- Website: [conceptcoreacademy.com](https://conceptcoreacademy.com)
- Email: contact@conceptcoreacademy.com

## 🙏 Acknowledgments

- Next.js team for the amazing React framework
- Supabase for the backend infrastructure
- Framer Motion for smooth animations
- Lucide for beautiful icons

## 📞 Support

For support, email contact@conceptcoreacademy.com or open an issue in the GitHub repository.

---

Built with ❤️ for ConceptCore Academy