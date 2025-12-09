# Health Companion Admin Panel

A comprehensive, B2C + B2B healthcare management platform built with **Next.js 14**, featuring:

- **Super Admin Panel** for user, medical data, subscription, and company management.
- **Company Portal** for business customers to manage their own employees.
- **Public Medical Profile** for emergency/clinical access through QR code.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model Overview](#data-model-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Screens](#key-screens)
- [Backend Integration Guide](#backend-integration-guide)
- [API Contracts](#api-contracts)
- [Security Considerations](#security-considerations)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This project is an admin and B2B dashboard for the **Health Companion** mobile app. It allows:

- Admins to manage patients, medical data, subscriptions.
- Companies (e.g., McDonald’s) to manage health accounts for their employees.
- Doctors/first responders to view a patient’s **public, read-only medical profile** via QR code.

All UI is backed by mock data (`lib/mock-data.ts`) and can be connected to real APIs easily.

---

## Features

### Super Admin Panel

#### `/dashboard`

- Dashboard stats:
  - Users, active users
  - Symptom chats
  - Medicines & reminders
  - Emergency SOS events
- Users list with search
- Click-through detail view

#### User-Centric Pages

- **Profile & Activity**
- **Symptom Chats**
- **Medicines**
- **Medical Wallet**
- **Medical History**
- **Emergency Logs**

---

### B2C & B2B Subscriptions

`/dashboard/subscriptions`

- Monthly revenue, trial users, churn rate
- B2C subscribers & B2B companies tables
- Plan catalog:
  - B2C: Free, Basic, Premium
  - B2B: Starter → Unlimited

---

### Company Management

#### `/dashboard/companies`

- Company list + filters
- “Add Company” dialog:
  - Billing contact
  - Subscription plan
  - Admin username/password

#### `/dashboard/companies/[companyId]`

- Company info
- Billing contact
- Subscription & capacity usage
- Recent users
- Portal access: `/company/[companyId]`

#### `/dashboard/companies/[companyId]/users`

- Manage employees:
  - Add/Edit/Delete users
  - Reset password
  - Activate/Deactivate

---

### Company Portal

#### `/company/login`

- Username + password
- Uses `mockCompanies.adminCredentials.username`

#### `/company/[companyId]`

- Stats, capacity bar
- Recent users
- Quick actions

---

### Public Medical Profile

#### `/medical-profile/[userId]`

- No auth required
- For emergency responders
- Highlights:
  - Identity
  - Emergency contacts
  - Allergies & conditions
  - Medications
  - Insurance, doctors, pharmacies
  - Medical history Q&A
- **Download PDF** using `jsPDF`

---

## Tech Stack

| Category      | Technology    |
| ------------- | ------------- |
| Framework     | Next.js 14    |
| Language      | TypeScript    |
| Styling       | Tailwind CSS  |
| UI Components | shadcn/ui     |
| Animations    | Framer Motion |
| PDF           | jsPDF         |
| Icons         | Lucide React  |

---

## Project Structure

```bash
app/
├── page.tsx
├── dashboard/
│   ├── page.tsx
│   ├── subscriptions/
│   ├── companies/
│   └── [userId]/
├── company/
│   ├── login/
│   └── [companyId]/
└── medical-profile/
components/
lib/
```

---

## Data Model Overview

All typings & mock data live in `lib/mock-data.ts`.

### Key Interfaces

- `User`
- `PersonalInfo`
- `Chat`, `ChatMessage`
- `Medicine`
- `EmergencyContact`, `Insurance`, `Doctor`, `Pharmacy`
- `MedicalHistoryItem`
- `EmergencySOSLog`
- `SubscriptionPlan`
- `Company`, `CompanyUser`

### Helpers

- `getDashboardStats()`
- `getSubscriptionStats()`
- `getCompanyUsers(companyId)`
- `getCompanyById(companyId)`
- `getPersonalInfoWithDefaults(userId)`

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Visit:

- Admin Panel: `http://localhost:3000`
- Company Login: `http://localhost:3000/company/login`
- Public Profile Example: `http://localhost:3000/medical-profile/usr_001`

---

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_APP_NAME="Health Companion Admin"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

NEXT_PUBLIC_API_URL="http://localhost:8000/api"

NEXT_PUBLIC_ENABLE_PDF_DOWNLOAD="true"
NEXT_PUBLIC_ENABLE_B2B_FEATURES="true"
```

---

## Key Screens

1. `/` – Super admin login
2. `/dashboard` – Overview
3. `/dashboard/[userId]` – User profile
4. `/dashboard/subscriptions` – B2C/B2B plans
5. `/dashboard/companies` – Company list
6. `/dashboard/companies/[companyId]` – Company details
7. `/dashboard/companies/[companyId]/users` – Admin user management
8. `/company/login` – Company login
9. `/company/[companyId]` – Company dashboard
10. `/company/[companyId]/users` – Company user management
11. `/medical-profile/[userId]` – Public profile + PDF

---

## Backend Integration Guide

Replace `mock-data` usage with API calls.

### Recommended API Structure

| Method | Endpoint              | Purpose        |
| ------ | --------------------- | -------------- |
| POST   | `/auth/admin/login`   | Admin login    |
| POST   | `/auth/company/login` | Company login  |
| GET    | `/users`              | List users     |
| GET    | `/users/:userId`      | User detail    |
| GET    | `/companies`          | List companies |
| POST   | `/companies`          | Create company |
| GET    | `/stats/dashboard`    | App stats      |
| GET    | `/public/profile/:id` | Public profile |

### Example Public Profile Response

```json
{
  "user": { "id": "usr_001", "name": "John Smith" },
  "personalInfo": { "bloodType": "O+" },
  "medicines": [],
  "emergencyContacts": []
}
```

---

## Security Considerations

### Admin Panel

- JWT + HttpOnly cookies
- Role-based access

### Company Portal

- Scoped auth per `companyId`

### Public Profile

- No auth, but:
  - Use UUID/non-guessable IDs
  - Rate limit
  - Allow user to enable/disable link

### Data Privacy

- Never expose password hashes
- Return minimum required health data

---

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

---

## Deployment

### Vercel (Recommended)

- Push to GitHub
- Import into Vercel
- Setup env variables
- Deploy

### Docker

```bash
docker build -t health-companion-admin .
docker run -p 3000:3000   -e NEXT_PUBLIC_APP_URL="https://your-domain.com"   health-companion-admin
```

---

## Contributing

1. Fork repo
2. Create feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Commit & push:

   ```bash
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

4. Open PR

---

## License

This project is licensed under the **MIT License**.
