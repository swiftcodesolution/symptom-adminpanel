# Health Companion Admin Panel

A comprehensive, B2C + B2B healthcare management platform built with Next.js 14.  
Includes:

- A **Super Admin Panel** to manage users, medical data, subscriptions, and companies.
- A **Company Portal** where business customers manage their own employees.
- A **Public Medical Profile** for emergency/clinical use via QR code.

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

This project is an admin and B2B dashboard for the Health Companion mobile app. It allows:

- Admins to manage patients, medical data, and subscriptions.
- Companies (e.g., McDonald’s) to manage health accounts for their employees.
- Doctors/first responders to view a patient’s critical medical data via a **public, read-only profile** accessed through a QR code.

The UI is built around mock data in `lib/mock-data.ts` but is structured so a backend developer can plug in real APIs with minimal effort.

---

## Features

### Super Admin Panel (`/dashboard`)

- **Dashboard Overview**

  - Total users, active users
  - Symptom chats, ongoing chats
  - Medicines and active reminders
  - Emergency SOS events in last 7 days
  - Users list with search + click-through into detailed views

- **User-Centric Views** (`/dashboard/[userId]`)

  - Profile & contact info
  - Health data summary cards
  - Recent activity (chats, last active)

- **Symptom Chats** (`/dashboard/[userId]/chats`)

  - Per-user conversation list
  - Expandable message threads (user vs assistant)
  - Search + status filters (ongoing/completed/archived)

- **Medicine Cabinet** (`/dashboard/[userId]/medicines`)

  - Current medications
  - Dosage / frequency / times / notes
  - Reminder-enabled indicator

- **Medical Wallet** (`/dashboard/[userId]/medical-wallet`)

  - Emergency contacts (primary vs secondary)
  - Insurance policies
  - Doctors
  - Pharmacies (preferred vs regular)
  - Tabbed layout (Contacts / Insurance / Doctors / Pharmacies)

- **Medical History** (`/dashboard/[userId]/medical-history`)

  - Onboarding Q&A grouped by category (Conditions, Allergies, Lifestyle, etc.)
  - Category chips with dynamic icons/colors
  - Search across questions/answers
  - Per-user breakdown

- **Emergency SOS Logs** (`/dashboard/[userId]/emergency`)
  - History of SOS events (911 vs emergency contact)
  - Status: triggered / resolved / cancelled
  - Type & location (if present)
  - Filters by status and type

### B2C & B2B Subscriptions

- **Subscriptions Overview** (`/dashboard/subscriptions`)
  - Monthly revenue, trial users, churn rate
  - B2C subscriber table with plan & payment info
  - B2B companies table with plan, user count, contract dates
  - Plan catalog for both B2C (Free, Basic, Premium) and B2B (Starter, Professional, Enterprise, Unlimited)

### B2B Company Management

- **Companies List** (`/dashboard/companies`)

  - Search + status filters
  - Company cards with:
    - Plan name & user capacity
    - Users used / max
    - Contract end date
  - “Add Company” dialog:
    - Company info
    - Billing contact
    - Subscription plan
    - Admin username/password (for Company Portal login)

- **Company Detail** (`/dashboard/companies/[companyId]`)

  - Company info (contact, address, industry)
  - Billing contact card
  - Subscription details (plan, price, contract dates)
  - User capacity bar
  - Recent users
  - **Admin Portal Access:**
    - Portal URL `/company/[companyId]`
    - Admin username
    - Reset admin password dialog
    - Open portal in new tab

- **Company Users (Admin View)** (`/dashboard/companies/[companyId]/users`)
  - List of all employees of that company
  - Filters: search, role (admin/manager/employee), status (active/inactive/pending)
  - Stats: counts per role/status
  - “Add User” dialog to create employee accounts with username/password
  - Actions:
    - Edit user
    - Reset password
    - Activate / deactivate
    - Delete (with confirmation)

### Company Portal (B2B Client-Facing)

- **Company Login** (`/company/login`)

  - Username / password
  - Valid company admin usernames come from `mockCompanies.adminCredentials.username`

- **Company Dashboard** (`/company/[companyId]`)

  - Company-level stats (total users, active users, pending invites, inactive)
  - Capacity bar (based on plan maxUsers)
  - Quick actions: manage users, add user, view reports, settings
  - Recent users

- **Company User Management** (`/company/[companyId]/users`)
  - Same concept as admin view but scoped to the single company
  - Allows only creation and management of that company's employees
  - “Add User” dialog, filters, reset password, etc.

### Public Medical Profile (Emergency)

- **Public Profile** (`/medical-profile/[userId]`)
  - No authentication required
  - For doctors/emergency responders
  - Sections:
    - Patient identity (name, DOB, blood type, height/weight)
    - **Emergency Contacts** (primary highlighted + tap-to-call)
    - Allergies & conditions (highlighted, color-coded)
    - Medications (name, dosage, frequency, times, notes)
    - Insurance
    - Doctors
    - Pharmacies
    - Medical History Q&A
  - **Download PDF**:
    - Generates a clean, A4 PDF with:
      - Header, sections, and color-coded boxes
      - Emergency contacts, allergies, conditions, medications, providers
      - Footer with URL and last update date
    - Implemented with `jspdf` client-side

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **PDF:** jsPDF
- **Icons:** Lucide React

---

## Project Structure

```bash
app/
├── page.tsx                      # Super Admin login
├── layout.tsx                    # Root layout
├── dashboard/                    # Super Admin Panel
│   ├── layout.tsx                # Dashboard layout (Sidebar + main)
│   ├── page.tsx                  # Dashboard overview (stats + users list)
│   ├── subscriptions/
│   │   └── page.tsx              # B2C/B2B subscriptions overview
│   ├── companies/
│   │   ├── page.tsx              # Companies list
│   │   └── [companyId]/
│   │       ├── page.tsx          # Company detail (admin-side)
│   │       └── users/
│   │           └── page.tsx      # Company users (admin-side)
│   └── [userId]/
│       ├── page.tsx              # User overview
│       ├── chats/
│       │   └── page.tsx
│       ├── medicines/
│       │   └── page.tsx
│       ├── medical-wallet/
│       │   └── page.tsx
│       ├── medical-history/
│       │   └── page.tsx
│       └── emergency/
│           └── page.tsx
├── company/                      # Company Portal
│   ├── login/
│   │   └── page.tsx              # Company login
│   └── [companyId]/
│       ├── page.tsx              # Company dashboard
│       └── users/
│           └── page.tsx          # Company-manage users
└── medical-profile/
    └── [userId]/
        └── page.tsx              # Public medical profile (PDF)
components/
├── layout/
│   ├── DashboardLayout.tsx       # Wraps all /dashboard routes
│   ├── Sidebar.tsx               # Context-aware sidebar (admin + user view)
│   └── ThemeToggle.tsx
└── ui/                           # shadcn components (button, card, table, etc.)
lib/
├── mock-data.ts                  # All mock data & interfaces
└── utils.ts                      # Helpers: cn, date formatting, relative time
```
