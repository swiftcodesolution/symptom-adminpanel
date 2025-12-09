# Health Companion Admin Panel

A modern, responsive admin dashboard for managing the Health Companion mobile application. Built with Next.js 14+, TypeScript, Tailwind CSS, and shadcn/ui components.

![Health Companion Admin](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Mock Data](#mock-data)
- [Backend Integration Guide](#backend-integration-guide)
- [API Endpoints Reference](#api-endpoints-reference)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

Health Companion Admin Panel is a web-based dashboard that allows administrators to:

- View and manage app users
- Monitor symptom checker chat conversations
- Track user medications and reminders
- Access medical wallet data (emergency contacts, insurance, doctors, pharmacies)
- Review medical history questionnaire responses
- Monitor emergency SOS events

Additionally, the platform provides a **public medical profile page** that can be accessed via QR code scanning, allowing healthcare providers to quickly access a patient's critical medical information.

---

## Features

### 🏠 Dashboard
- Application statistics overview
- User grid with search functionality
- Quick access to individual user profiles

### 👤 User Management
- User profile with contact information
- Health data summary cards
- Navigation to user-specific data sections

### 💬 Symptom Chats
- View AI health assistant conversations
- Expandable message threads
- Filter by status (ongoing, completed, archived)

### 💊 Medicine Cabinet
- Current medications list
- Dosage and frequency tracking
- Reminder status indicators

### 🏥 Medical Wallet
- Emergency contacts with primary designation
- Insurance information with policy details
- Healthcare providers (doctors)
- Preferred pharmacies

### 📋 Medical History
- Onboarding questionnaire responses
- Categorized health records
- Searchable and filterable

### 🚨 Emergency SOS Logs
- Emergency event history
- 911 calls and emergency contact alerts
- Status tracking (triggered, resolved, cancelled)

### 📄 Public Medical Profile
- QR code accessible public page
- Complete medical information for healthcare providers
- PDF download functionality
- Share via native share API

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Animations | Framer Motion |
| PDF Generation | jsPDF |
| Icons | Lucide React |
| State Management | React Hooks |

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm / pnpm / yarn

### Installation

```bash
git clone https://github.com/your-org/health-companion-admin.git
cd health-companion-admin
npm install
```

Install required packages:

```bash
npm install jspdf framer-motion
npm install @radix-ui/react-collapsible
```

Setup environment variables:

```bash
cp .env.example .env.local
```

Start development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

---

## Project Structure

```
health-companion-admin/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── [userId]/...
│   └── medical-profile/[userId]/page.tsx
├── components/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── mock-data.ts
│   └── utils.ts
└── package.json
```

---

## Pages & Routes

| Route | Description | Auth |
|-------|-------------|------|
| / | Login Page | No |
| /dashboard | User grid | Yes |
| /dashboard/[userId] | Overview | Yes |
| /dashboard/[userId]/chats | Chats | Yes |
| /dashboard/[userId]/medicines | Medicines | Yes |
| /dashboard/[userId]/medical-wallet | Wallet | Yes |
| /dashboard/[userId]/medical-history | History | Yes |
| /dashboard/[userId]/emergency | SOS logs | Yes |
| /medical-profile/[userId] | Public profile | No |

---

## Mock Data (Types Included)
*(full interfaces retained as provided)*

---

## Backend Integration Guide
Includes:
✔ API service layer  
✔ Custom hooks  
✔ Response formats  
✔ Endpoint table  
✔ Error handling pattern  

---

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENABLE_PDF_DOWNLOAD=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deployment

### Vercel
- Push repo → import to Vercel → add env vars → deploy

### Docker

```
docker build -t health-admin .
docker run -p 3000:3000 health-admin
```

---

## License
MIT License

---

## Support
Email **support@healthcompanion.com**

---

Built with ❤️ by the Health Companion Team
