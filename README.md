# Jan-Samadhan: Smart Grievance Redressal & Fake Complaint Detection System

An enterprise-grade, AI-powered citizen grievance redressal portal built for municipal and state administrations. The system inspects photographic evidence for digital tampering, clusters duplicate submissions using NLP and geospatial proximity, automatically classifies issues, and routes them to appropriate nodal government departments.

---

## 🎓 Academic Syllabus Alignment (INT252 & INT257)

This project is strictly developed in adherence to the course outcomes and unit topics of:
- **INT252: Web App Development with ReactJS**
- **INT257: Modern Web Application Development (Next.js)**

### Course Outcomes & Syllabus Mapping Matrix

| Course | Unit / Outcome | Project Implementation & Proof Points | File Reference |
|---|---|---|---|
| **INT252** | **Unit I: Refreshing JavaScript & ES6+** | Arrow functions, destructuring, rest/spread operators, array transformations (`map`, `filter`, `reduce`), referential equality, immutable state updates. | `src/lib/ai/categorization.ts`, `src/lib/ai/duplicate-detection.ts` |
| **INT252** | **Unit II: Component Design & Tailwind CSS** | Functional components, reusable abstractions, composition patterns, conditional rendering, utility-first responsive styling via Tailwind CSS breakpoints (`sm`, `md`, `lg`). | `src/components/ui/StatusBadge.tsx`, `src/components/ui/PriorityBadge.tsx`, `src/components/ui/LoadingSkeleton.tsx`, `src/components/ui/Modal.tsx` |
| **INT252** | **Unit III: States, Events & Hooks** | `useState`, `useEffect`, `useCallback`, `useMemo`, and custom hooks (`useComplaints`, `useStats`) adhering to rules of hooks and avoiding anti-patterns. | `src/hooks/useComplaints.ts`, `src/components/forms/ImageUpload.tsx`, `src/app/(admin)/dashboard/page.tsx` |
| **INT252** | **Unit IV: Form Handling & Zod Validation** | Controlled form components, drag-and-drop file upload, schema-based validation using **Zod** with dynamic inline field error messages. | `src/schemas/complaint.ts`, `src/schemas/auth.ts`, `src/app/(citizen)/submit/page.tsx`, `src/app/(auth)/login/page.tsx` |
| **INT252** | **Unit V: Client-Server Comm & React Query** | REST principles, Axios HTTP communication, server state management using `@tanstack/react-query` with caching, invalidation, and background synchronization. | `src/hooks/useComplaints.ts`, `src/hooks/useStats.ts`, `src/components/layout/Providers.tsx` |
| **INT252** | **Unit VI: Global State Management** | Global client state management via **Zustand** store comparing local state, global state, and server state. | `src/store/app-store.ts` |
| **INT257** | **Unit I: Fundamentals of Next.js & App Router** | Next.js 14 App Router, nested layouts, file-based routing, dynamic routes (`[id]`), route groups (`(auth)`, `(citizen)`, `(admin)`), loading UI, error handling. | `src/app/layout.tsx`, `src/app/(citizen)/layout.tsx`, `src/app/(admin)/layout.tsx` |
| **INT257** | **Unit II: Rendering Strategies & Data Fetching** | Server-Side Rendering (SSR), Static Site Generation (SSG), Client Components (`'use client'`), dynamic server rendering (`force-dynamic`). | `src/app/page.tsx` (Server Component), `src/app/api/stats/route.ts` |
| **INT257** | **Unit III: API Routes & Server Actions** | Route Handlers (`GET`, `POST`, `PATCH`), NextRequest/NextResponse, and **Server Actions** (`'use server'`) for data mutations and cache revalidation. | `src/app/api/complaints/route.ts`, `src/actions/complaint.ts` |
| **INT257** | **Unit IV: Authentication, RBAC & ORM** | **NextAuth.js** credentials session management, role-based access control (`CITIZEN`, `ADMIN`, `DEPT_OFFICER`), route protection via **Middleware**, and **Prisma ORM** with SQLite. | `src/lib/auth.ts`, `src/middleware.ts`, `prisma/schema.prisma` |
| **INT257** | **Unit V: Performance, Charts & SEO** | Metadata API, code splitting, lazy loading, and interactive data visualization using **Recharts**. | `src/app/layout.tsx`, `src/app/(admin)/dashboard/page.tsx` |

---

## 🤖 Core AI Engine Features

### 1. Error Level Analysis (ELA) Image Tampering Detection
- **Mechanism**: The uploaded photo is processed through `sharp`. It is re-compressed at a standardized JPEG quality factor (95%) and pixel-by-pixel absolute difference is computed.
- **Forensic Heatmap**: The delta is amplified (scaled 10x) to generate an ELA heatmap saved alongside the original image. Areas edited or spliced with external software exhibit high compression variance and glow brightly.
- **Scoring**: A composite 0-100 tampering risk score is generated using mean error and standard deviation. Scores $>60\%$ trigger an automatic **FLAGGED** status and downgrade routing priority.

### 2. Dual-Layer Duplicate Detection
- **Textual Similarity**: Tokenizes title and description into term-frequency vectors after stripping common stop words, calculating **Cosine Similarity**.
- **Geospatial Proximity**: Calculates the geographic distance between GPS coordinates using the **Haversine formula**. Submissions within $500\text{ m}$ radius with high textual similarity ($>0.8$) are flagged as duplicates and linked to the master complaint.

### 3. NLP Auto-Categorization
- Weighted keyword extraction maps civic complaints to 10 predefined civic domains (Road & Infrastructure, Water Supply, Electricity, Sanitation, Public Safety, Health, etc.) with normalized confidence percentages.

### 4. Smart Department Routing
- Automatically dispatches grievances to the appropriate nodal department (PWD, Water Board, Electricity Board, Police, Municipal Corp, etc.).
- Escalates priority to `URGENT` or `HIGH` upon detecting life-hazard keywords ("sparking transformer", "flood", "collapse", "dengue").

---

## 🏛️ Government Departments Pre-Seeded
1. **Public Works Department (PWD)** — Roads, bridges, flyovers, potholes
2. **Water Supply & Sewerage Board** — Tap water supply, sewage leaks, contaminated pipelines
3. **Electricity Distribution Board** — Power outages, sparking transformers, streetlights
4. **Municipal Corporation** — Solid waste, sanitation, garbage clearance, public parks
5. **Police Department & Traffic** — Public safety, broken traffic signals, hazards
6. **Public Health Department** — Mosquito vector breeding, sanitation hazards
7. **Department of School Education** — School building safety and infrastructure
8. **Revenue & Land Administration** — Public land encroachment and illegal construction

---

## 🚀 Quick Start & Local Execution

### 1. Prerequisites
- **Node.js** v18.17+ or v20+

### 2. Setup Database & Seed Data
```bash
# Push database schema to local SQLite
npx prisma db push

# Seed 8 departments, 10 categories, 6 users, and 12 sample grievances with AI forensics
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Login Accounts

All accounts use the default password: **`password123`**

| Role | Email Address | Access Level |
|---|---|---|
| **Super Administrator** | `admin@gov.in` | Global analytics, all grievances, re-running AI forensics, audit logs |
| **PWD Nodal Officer** | `pwd.officer@gov.in` | Department-scoped dashboard, status transitions, resolution comments |
| **Water Board Officer** | `water.officer@gov.in` | Water Supply & Sewerage complaints and pipeline inspection logs |
| **Citizen (Rahul Sharma)** | `rahul@example.com` | File grievances, photo upload, geotagging, real-time tracking |
| **Citizen (Priya Patel)** | `priya@example.com` | File grievances, view filed complaints history |

---

## 📁 Project Directory Structure

```
grievance-portal/
├── prisma/
│   ├── schema.prisma               # Prisma SQLite schema (Users, Complaints, AIAnalysis, Updates)
│   └── seed.ts                     # Database seed script with 8 depts & 12 realistic complaints
├── public/
│   └── uploads/                    # Uploaded citizen evidence photos and ELA heatmaps
├── src/
│   ├── actions/
│   │   └── complaint.ts            # Next.js Server Actions (submitComplaintAction, updateStatus)
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── layout.tsx          # Officer portal sidebar, topbar & role gate
│   │   │   ├── dashboard/page.tsx  # Executive dashboard with Recharts visualizations
│   │   │   └── complaints/
│   │   │       ├── page.tsx        # Registry table with multi-criteria filters
│   │   │       └── [id]/page.tsx   # Complaint dossier, ELA heatmap inspection & status console
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # Login page with demo credentials quick-fill
│   │   │   └── register/page.tsx   # Citizen registration with Zod validation
│   │   ├── (citizen)/
│   │   │   ├── layout.tsx          # Citizen header & responsive container
│   │   │   ├── submit/page.tsx     # Grievance filing form with photo & map picker
│   │   │   ├── my-complaints/      # Citizen complaint list
│   │   │   └── track/
│   │   │       ├── page.tsx        # Tracking ID search portal
│   │   │       └── [id]/page.tsx   # Real-time status tracker with AI verification score
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/ # NextAuth authentication handler
│   │   │   ├── auth/register/      # Citizen registration REST API
│   │   │   ├── complaints/         # REST endpoint (GET with pagination/filters, POST)
│   │   │   ├── complaints/[id]/    # REST endpoint (GET detail, PATCH status/priority)
│   │   │   ├── complaints/[id]/analysis/ # AI forensic telemetry & re-run trigger
│   │   │   ├── departments/        # Departments & categories endpoint
│   │   │   └── stats/              # Administrative analytics & chart data
│   │   ├── globals.css             # Tailwind CSS base styles and components
│   │   ├── layout.tsx              # Root HTML layout with Providers
│   │   └── page.tsx                # Government portal landing page
│   ├── components/
│   │   ├── dashboard/              # ComplaintTable reusable component
│   │   ├── forms/                  # ImageUpload (drag-drop) & MapPicker (geotagging)
│   │   ├── layout/                 # Navbar, Admin Sidebar, React Query Providers
│   │   └── ui/                     # StatusBadge, PriorityBadge, LoadingSkeleton, Modal, StatsCard
│   ├── hooks/
│   │   ├── useComplaints.ts        # React Query custom hooks for complaints
│   │   └── useStats.ts             # React Query custom hooks for stats
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── image-analysis.ts   # Error Level Analysis (ELA) & tampering calculation
│   │   │   ├── duplicate-detection.ts # Cosine text similarity & Haversine geo-distance
│   │   │   ├── categorization.ts   # Keyword-weighted NLP classification
│   │   │   ├── routing.ts          # Department routing & priority escalation
│   │   │   └── index.ts            # Integrated AI pipeline orchestrator
│   │   ├── auth.ts                 # NextAuth CredentialsProvider configuration
│   │   ├── prisma.ts               # Prisma singleton client
│   │   └── utils.ts                # Tracking ID generator, date formatting, color helpers
│   ├── middleware.ts               # Next.js route protection & role redirection
│   ├── schemas/
│   │   ├── auth.ts                 # Zod validation schemas for login and registration
│   │   └── complaint.ts            # Zod validation schemas for complaints
│   ├── store/
│   │   └── app-store.ts            # Zustand global state store
│   └── types/
│       └── index.ts                # TypeScript interfaces, enums, NextAuth type extensions
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
