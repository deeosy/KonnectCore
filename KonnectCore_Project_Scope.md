# KONNECTCORE

## Project Scope & Implementation Status

**Prepared by:** Tech Team  
**Project:** KonnectCore Agricultural Cooperative Management Platform  
**Document type:** Project Scope & Implementation Status  
**Version:** 1.0  
**Date:** 07 November 2026  
**Classification:** Internal — Tech Team, Project Leads and Stakeholders

> This document records the implemented scope of the KonnectCore platform as at the date above. It is based on a read-only audit of the repository and the reference documents in `project-scope/`. It lists what has been built across the user interface, frontend codebase, backend codebase and database, what remains to be integrated, and what is intentionally outside the current MVP. No application code was changed during the audit.

---

## Document Control

| Item | Detail |
|---|---|
| Project | KonnectCore |
| Document | Project Scope & Implementation Status |
| Prepared by | Tech Team |
| Version | 1.0 |
| Date | 07 November 2026 |
| Status | Current — for review and acceptance |
| Primary audience | Project leads, technical team, cooperative administrators, implementation partners |
| Reference baseline | `project-scope/KonnectCore_Validation_MVP_Modules.pdf` |
| Broader roadmap reference | `project-scope/KonnectCore_Features for web.pdf` |
| Product vision reference | `project-scope/KonnectCore_Founders_Overview.pdf` |
| Commercial terms | Development-value estimate in Appendix C; contractual terms handled separately |
| Commercial estimate | Appendix C — GH₵42,000 planning value (range GH₵36,000–48,000) |

---

## 1. Executive Summary

KonnectCore is a multi-tenant web platform for farmer-based organisations, cooperatives, associations and other organised agricultural groups. It brings member registration, farms and crops, produce collection, payments and dues, expenses, loans, field visits, reporting and administration into one system.

The platform has been assessed against the seven modules in the **KonnectCore Validation MVP** and against the wider **Proposed Features – Web Platform** roadmap. The MVP is substantially delivered end-to-end: the database, API, authentication, tenant isolation, and the majority of user workflows are implemented and connected.

### Scope at a Glance

| Measure | Assessment |
|---|---|
| Overall MVP completion | **92.5%** (indicative range 91–94%) |
| Remaining MVP work | **~7.5%** |
| Frontend / UI completion | **~93%** of MVP user-facing scope |
| Backend / API completion | **~99%** of MVP endpoint and business-rule scope |
| Database completion | **100%** of MVP entities and relationships |
| Validation MVP modules fully complete | **4 of 7** (Groups & Structure, Farms & Crops, Collections, Payments & Expenses) |
| Validation MVP modules with targeted gaps | **3 of 7** (Organisation & Members, Field Officer Access, Dashboard & Reports) |
| API route groups | **15** |
| Backend controllers | **17** |
| Mongoose models | **14** (12 tenant-scoped, plus Organisation and the shared Crop catalogue) |
| Frontend pages | **20** (19 routed, 1 unused placeholder) |
| Indicative total development value | **GH₵42,000** (range GH₵36,000–48,000) |
| Value of completed scope (92.5%) | **GH₵38,850** |
| Value of remaining scope (7.5%) | **GH₵3,150** |

### Commercial Position

The cost estimate is based on approximately **93 person-days** at a blended rate of **GH₵450/day**. It covers the work delivered to date plus the seven remaining MVP items. The estimate excludes hosting, domain registration, MongoDB Atlas subscription, Hubtel fees, SMS/email charges, hardware, data migration and ongoing maintenance. A detailed section-by-section breakdown is provided in **Appendix C**.

**Calculation:** 93.3 person-days × GH₵450/day ≈ **GH₵42,000**; completed value = 92.5% × GH₵42,000 = **GH₵38,850**; remaining value = 7.5% × GH₵42,000 = **GH₵3,150**.

### Headline Position

- The **database is complete for the MVP**: all required entities, relationships and tenant isolation are in place.
- The **backend is functionally complete for the MVP**: every required business capability has an API, with one remaining report date-filter defect.
- The **frontend covers every major module**; the remaining work is targeted integration and workflow completeness rather than missing modules.
- The largest remaining item is a **workspace/organisation creation and onboarding UI**.
- The estimated development value is **GH₵42,000**, of which **GH₵38,850** is complete and **GH₵3,150** remains (92.5% / 7.5%).
- The broader roadmap features — offline sync, Bluetooth scales, SMS/email, farmer self-service, financial statements, traceability reporting, partner access and external integrations — are **outside the current MVP** and are recorded separately in Section 10.

---

## 2. Project Overview

### 2.1 What KonnectCore Is

KonnectCore is an operating platform for agricultural organisations. It is designed to replace paper registers, spreadsheets, WhatsApp threads and disconnected records with a single system for:

- Member and farmer registration and profiles
- Farms, crops and production records
- Groups, branches, communities and field officers
- Produce collection, grading and batch aggregation
- Payments, dues, contributions, savings and produce payouts
- Operating expenses
- Loans, repayments and harvest deductions
- Field visits, tasks and officer performance
- Dashboards, operational reports and exports
- Audit trails and organisation-level configuration

### 2.2 Problem Addressed

Many farmer-based organisations manage members, activity and transactions through paperwork, spreadsheets or disconnected messaging. This makes it difficult to maintain accurate member histories, reconcile payments, track produce, monitor field activity, and produce reliable reports for management, partners or funders.

KonnectCore provides a shared operational record, role-based access and a consistent reporting layer for the whole organisation.

### 2.3 Target Users

| Role | Primary purpose |
|---|---|
| **Administrator** | Full system access: organisation settings, staff users, audit logs, members, groups, farms, collections, payments, expenses, loans, reports |
| **Manager** | Operational management: members, groups, farms, collections, payments, expenses, loans, reports |
| **Field Officer** | Field operations: assigned members, quick registration, collections, visits, tasks, limited member and loan access |

### 2.4 Operating Model

- The platform is **multi-tenant**: each cooperative or farmer organisation is a separate tenant.
- Every tenant's data is isolated by `organisationId` at the database query layer, not only in the UI.
- Users belong to one organisation in the current implementation.
- Staff accounts are created by an administrator; there is no public self-service workspace signup in the current build.
- The default deployment is a React single-page application served separately from an Express API, with MongoDB as the system of record.

### 2.5 Scope Boundary

This document covers the **Validation MVP** and the parts of the broader feature roadmap that have been implemented. It does not claim completion of the full long-term product vision. Features outside the MVP are listed in Section 10.

---

## 3. Scope Basis and Audit Method

### 3.1 Reference Documents

| Document | Role in this assessment |
|---|---|
| `KonnectCore_Validation_MVP_Modules.pdf` | Primary acceptance criteria for MVP modules 2.1–2.7 |
| `KonnectCore_Features for web.pdf` | Broader product roadmap; used to distinguish future scope from MVP scope |
| `KonnectCore_Founders_Overview.pdf` | Product vision, target users and intended operating model |

### 3.2 Audit Method

Each feature was traced through the full path:

**User interface → client route → API request → route definition → controller → Mongoose model → database response → UI rendering**

The assessment distinguishes between:

- **Built and integrated** — visible in the UI and connected end-to-end.
- **Backend only** — API/data capability exists but is not exposed in the UI.
- **Partial** — a workflow exists but one or more required fields, filters or states are missing.
- **Not built** — no implementation in the current MVP.

No application code, configuration or database records were changed during the audit.

### 3.3 Status Legend

| Status | Meaning |
|---|---|
| ✅ Implemented | Built and integrated end-to-end |
| 🟡 Partial | Core capability exists but a required element is missing |
| ❌ Not implemented | Not present in the current MVP |
| ⚪ Future scope | Deliberately outside the current MVP; planned for a later phase |

---

## 4. Platform and Technology

> **Indicative cost:** **GH₵2,250** for platform foundation, architecture and project setup (5.4% of the estimated development value).

### 4.1 Solution Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     React 19 Single-Page App                │
│        Vite 8 · Tailwind CSS 4 · React Router 7             │
│        Axios · Framer Motion · Recharts · Lucide            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST
                               │ JWT Bearer authentication
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express 4 REST API (Node.js)               │
│   Routes → Middleware → Controllers → Services → Models     │
│   JWT auth · role guards · tenant context · audit trail     │
└───────────────┬──────────────────────────────┬──────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│        MongoDB Atlas         │   │   External / local       │
│   Mongoose 8 · 14 models     │   │   Hubtel Mobile Money    │
│   Tenant-scoped collections  │   │   Local upload storage   │
│   Audit log · indexes        │   │   CSV / XLSX exports     │
└──────────────────────────────┘   └──────────────────────────┘
```

### 4.2 Technology Stack

| Layer | Technology | Version / notes |
|---|---|---|
| Frontend framework | React | 19.2 |
| Build tool | Vite | 8.2 |
| Styling | Tailwind CSS | 4.3 (Vite plugin) |
| Routing | React Router DOM | 7.18 |
| HTTP client | Axios | 1.20 |
| UI animation | Framer Motion | 13.2 |
| Smooth scrolling | Lenis | 1.3 (public landing page) |
| Charts | Recharts | 3.10 |
| Icons | Lucide React, React Icons | Current |
| Notifications | React Hot Toast | 2.6 |
| Dates | Day.js | 1.11 |
| Backend runtime | Node.js + Express | Express 4.21 |
| Database / ODM | MongoDB + Mongoose | Mongoose 8.12 |
| Authentication | JSON Web Tokens + bcryptjs | JWT, bcrypt |
| Validation | express-validator | 7.2 |
| File uploads | Multer | 2.0, local disk storage, 10 MB limit |
| Spreadsheet processing | xlsx | 0.18 |
| CSV generation | json2csv | 5.0 |
| Logging | Morgan | Development request logging |
| Payments | Hubtel Mobile Money | Live and simulated test modes |
| Database hosting | MongoDB Atlas | Connection via `MONGODB_URI` |

### 4.3 Authentication, Roles and Tenant Isolation

| Control | Implementation |
|---|---|
| Authentication | Email/password login issuing a JWT; token sent as `Authorization: Bearer <token>` |
| Password storage | bcrypt hash with salt; passwords never stored in plain text |
| Session restore | `GET /api/auth/me` reloads the current user |
| Token expiry | Configurable via `JWT_EXPIRES_IN`; default 7 days |
| Role model | `admin`, `manager`, `fieldOfficer` |
| Route protection | Client-side `ProtectedRoute` guards plus server-side `protect` and `authorize` middleware |
| Deactivation | Inactive users cannot authenticate; user is reloaded from the database on each request |
| Tenant context | `AsyncLocalStorage` carries the acting user's `organisationId` |
| Tenant enforcement | Mongoose `tenantScope` plugin injects `organisationId` into queries, aggregations and new documents |
| Tenant scope coverage | 12 tenant-scoped models; Organisation is own-org restricted; Crop is a shared reference catalogue |
| Audit trail | `AuditLog` model plus `audit()` middleware on mutating routes and authentication events |

### 4.4 Integrations and Export Capabilities

| Capability | Status | Notes |
|---|---|---|
| Hubtel Mobile Money | ✅ Implemented | Live mode with merchant credentials; test/demo mode returns simulated transactions flagged `simulated: true` |
| Hubtel callback | ✅ Implemented | Public webhook at `POST /api/payments/hubtel/callback` |
| CSV export | ✅ Implemented | Six report types and audit log |
| Excel (XLSX) export | ✅ Implemented | Six report types, member export and import template |
| PDF export | ❌ Not implemented | Not required by the MVP; a future enhancement |
| Local file uploads | ✅ Implemented | Member photos, member documents, collection photos, visit photos |
| SMS / email notifications | ❌ Not implemented | Future scope |
| Bank / accounting / marketplace integrations | ❌ Not implemented | Future scope |
| Offline sync | ❌ Not implemented | Future scope |

### 4.5 Environments and Configuration

| Setting | Location / note |
|---|---|
| Frontend development port | `5173` |
| Backend development port | `5000` (configurable via `PORT`) |
| Development API proxy | Vite proxies `/api` and `/uploads` to `http://localhost:5000` |
| Production API base | `VITE_API_URL`, defaulting to `/api` |
| Database connection | `MONGODB_URI` in `server/.env` |
| Authentication secret | `JWT_SECRET` |
| Token lifetime | `JWT_EXPIRES_IN` |
| Production client origin | `CLIENT_URL` (used by CORS when `NODE_ENV=production`) |
| Hubtel live mode | `HUBTEL_CLIENT_ID`, `HUBTEL_CLIENT_SECRET`, `HUBTEL_MERCHANT_ACCOUNT` |
| Seed / demo data | `npm run seed` |

---

## 5. Frontend and UI Scope

> **Indicative cost:** **GH₵14,400** (UI/UX design GH₵3,600 + frontend development GH₵10,800), 34.3% of the estimated development value. Frontend is ~93% complete by scope; the remaining frontend items are costed in Appendix C. Cost allocation is effort-based and is not a direct multiplication of the scope percentage.

### 5.1 Frontend Overview

The frontend is a React 19 single-page application built with Vite and Tailwind CSS 4. It provides a public marketing site, authenticated staff application, role-based navigation, responsive layouts, reusable UI components, charts, export actions and full CRUD workflows for the operational modules.

### 5.2 Routes and Screens

| Screen / Module | Route | Access | What is built |
|---|---|---|---|
| Landing page | `/` | Public | Marketing page with hero, impact, opportunity, features, how-it-works, platform, testimonials, call-to-action and footer sections; animated with Framer Motion and Lenis |
| Login | `/login` | Public | Email/password login, session handling, error feedback |
| Dashboard | `/dashboard` | All roles | Live statistic cards, recent activity feed, dashboard chart suite, quick actions |
| Field Dashboard | `/field` | All roles | Officer-focused view: assigned members, tasks, visits, performance, quick registration, record visit |
| Members | `/members` | All roles | Search, status/crop/location filters, pagination, import, export, add member |
| Register / Edit Member | `/members/new`, `/members/:id/edit` | Authenticated | Full member form: personal details, contact, location, GPS, farm size, main crops, group, assigned officer, status, photo |
| Member Profile | `/members/:id` | Authenticated | Six tabs: Overview, Farm & Crops, Collections, Payments, Loans, Documents; history timeline; record collection; settle produce; add/edit farm; add/edit crop |
| Groups & Organisation | `/groups` | Admin, Manager | Collapsible hierarchy tree, create/edit/delete nodes, assign/remove members, group detail, leader assignment |
| Farms & Crops | `/farms` | Admin, Manager | Farm list with filters and detail drawer; crop catalogue CRUD |
| Collections | `/collections` | Authenticated | Collections and Batches tabs; create/edit/delete collections; create/update/delete batches; assign collections; filters; totals |
| Payments & Dues | `/payments` | Admin, Manager | All Payments and Outstanding Dues tabs; record payment; gateway status check; delete |
| Expenses | `/expenses` | Admin, Manager | Category and date filters; totals; add/edit drawer; delete |
| Loans | `/loans` | Admin, Manager | Loan list, statistics, filters, loan request, approve, disburse, overdue indicators |
| Loan Detail | `/loans/:id` | All roles | Loan summary, repayment schedule, repayment recording, auto-deduct from harvest, overdue banners |
| Field Visits | `/visits` | All roles | Visit log, monthly and unique-member statistics, officer filter, visit recording |
| Reports | `/reports` | Admin, Manager | Six report tabs, contextual filters, date ranges, live preview, CSV and XLSX export |
| Users | `/users` | Admin | Staff list and create-user form |
| Audit Logs | `/audit` | Admin | Filterable, paginated, immutable audit trail with CSV export |
| Settings | `/settings` | Admin | Organisation profile and system configuration: currency, default crop prices, quality grades, seasons, deduction rules (some settings are stored but not yet applied everywhere — see §5.6) |
| Coming Soon | Not routed | — | Unused placeholder file; not part of the active application |

### 5.3 Frontend Codebase Inventory

```text
client/
├── src/
│   ├── pages/                 20 page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FieldDashboard.jsx
│   │   ├── Members.jsx
│   │   ├── MemberNew.jsx
│   │   ├── MemberDetail.jsx
│   │   ├── GroupsPage.jsx
│   │   ├── FarmsPage.jsx
│   │   ├── CollectionsPage.jsx
│   │   ├── PaymentsPage.jsx
│   │   ├── ExpensesPage.jsx
│   │   ├── LoansPage.jsx
│   │   ├── LoanDetailPage.jsx
│   │   ├── VisitsPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── AuditLogsPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── ComingSoon.jsx     (unused)
│   ├── components/
│   │   ├── ui/                16-component reusable UI kit
│   │   ├── members/           QuickRegisterModal
│   │   ├── collections/       CollectionModal
│   │   ├── payments/          PaymentModal
│   │   ├── loans/             LoanRequestModal, RepaymentModal
│   │   ├── visits/            VisitModal, TaskModal
│   │   ├── dashboard/         DashboardCharts
│   │   ├── ProtectedRoute.jsx
│   │   └── FullScreenLoader.jsx
│   ├── context/               AuthContext
│   ├── config/                Role-based navigation configuration
│   ├── layouts/               AppLayout (sidebar, topbar, responsive shell)
│   ├── services/              Axios API client with JWT interceptors
│   └── utils/                 Validation, formatting, shared constants
```

### 5.4 Reusable UI Components

| Category | Components |
|---|---|
| Layout and structure | `AppLayout`, `PageHeader`, `Card`, `Drawer`, `Modal` |
| Data display | `DataTable`, `StatCard`, `Badge`, `Avatar`, `EmptyState`, `LoadingSkeleton` |
| Forms and input | `Input`, `Select`, `SearchBar`, `FormField`, `Button` |
| Feedback | `ToastProvider` (React Hot Toast) |
| Feature panels | `CollectionModal`, `PaymentModal`, `LoanRequestModal`, `RepaymentModal`, `VisitModal`, `TaskModal`, `QuickRegisterModal` |
| Analytics | `DashboardCharts` (Recharts) |

### 5.5 Frontend Capabilities Built

- **Role-based experience** — navigation, routes and actions are filtered by role.
- **Authentication** — login, session restore, logout, automatic 401 handling.
- **Responsive layout** — collapsible mobile sidebar and responsive tables/forms.
- **Search and filtering** — debounced search, server-side pagination, status/crop/location/date/category filters.
- **Full CRUD workflows** — members, groups, crops, collections, batches, payments, expenses, loans, visits, tasks, users.
- **Member profile** — six operational tabs, document upload/download, farm and crop management, produce settlement, history timeline.
- **Bulk operations** — member import from CSV/XLSX, template download, member export.
- **File handling** — member photo, member documents, collection photos, visit photos.
- **Dashboards and charts** — live statistics, recent activity, collection trend (7/30/90 days), payment breakdown, member growth.
- **Report builder** — six report types with filters, preview and CSV/XLSX download.
- **System administration** — organisation profile, operational settings, staff users, audit log viewer.
- **UX quality** — skeleton loading states, toast notifications, inline form validation, empty states, confirmation dialogs, responsive modals and drawers.
- **Public site** — animated marketing landing page with smooth scrolling.

### 5.6 Frontend Gaps and Partial Integrations

The following items are the remaining user-facing gaps. They are ordered by their weight in the MVP completion assessment.

| # | Gap | Current state | Backend readiness | Impact |
|---|---|---|---|---|
| 1 | **Organisation / workspace creation UI** | Settings edits the existing organisation only. There is no create-workspace screen, onboarding flow or organisation switcher. | `POST /api/organisations` exists and is admin-only. | A new cooperative cannot be created through the UI; it requires direct API use or seeding. |
| 2 | **Member group filter** | Members page supports search, status, crop and location filters, but not group. The table has no Group column. | `GET /api/members` supports `groupId`. | Managers cannot filter members by group from the member list. |
| 3 | **Collection report member filter** | The Collection/Harvest report exposes crop, group and date filters, but no member selector. | `GET /api/reports/collections` supports `memberId`. | Member-level harvest reporting requires manual export filtering or API use. |
| 4 | **Field officer assigned-member search** | Field Dashboard lists assigned members, but there is no search box. The main Members page is not scoped to the officer's assignment. | `GET /api/visits/me/members` exists. | Officers with large caseloads cannot quickly find an assigned member. |
| 5 | **Full member timeline** | Member Overview shows only the first 8 timeline events. There is no "View all" page or expansion. | `GET /api/members/:id/history` returns the complete merged history. | Older member activity is not visible without opening individual tabs. |
| 6 | **Import validation error detail** | Bulk import shows a success or failure toast. Partial row-level errors are not presented in a review table. | Import API returns inserted/error counts and row errors. | Users cannot easily correct partially failed imports. |
| 7 | **Reports export API path** | `ReportsPage.jsx` hardcodes `/api/reports/...` for blob downloads rather than using `VITE_API_URL`. | API itself is correct. | Breaks if the frontend is hosted on a different origin from the API without a reverse proxy. |
| 8 | **PDF export** | CSV and XLSX only. | Not required by the MVP. | Optional enhancement for formal report distribution. |
| 9 | **User edit / deactivate UI** | Users page lists staff and creates accounts. Edit, role change, deactivate and delete are not exposed in the UI. | `GET/PUT/DELETE /api/users/:id` exist. | Staff administration is incomplete in the interface. |
| 10 | **Unused placeholder** | `ComingSoon.jsx` exists but is not routed. | — | No functional impact; can be removed or repurposed. |
| 11 | **Member restore UI** | Soft-deleted members are excluded from lists, but there is no restore action in the interface. | `POST /api/members/:id/restore` exists. | An administrator must call the API directly to restore a member. |
| 12 | **System-setting application** | Settings persist currency, default crop prices, quality grades, seasons and deduction rules. Default crop prices and quality grades are applied. Currency display is still fixed to GHS, season inputs are free text, and auto-deduct uses a fixed 30% rather than the configured rule. | Settings API and storage exist. | Configuration is editable but only partially applied across workflows. |
| 13 | **Unused dashboard endpoint** | `GET /api/dashboard/member-distribution` is not rendered anywhere in the client. | Endpoint exists. | No user impact; it is available for a future distribution chart. |

> Items 1–6 form the weighted MVP gap. Items 7–13 are ancillary integration or housekeeping items and are not included in the 7.5% MVP remainder.

---

## 6. Backend and API Scope

> **Indicative cost:** **GH₵12,600** for the backend API, business logic and authorization layer (30.0% of the estimated development value). The backend is ~99% complete; the remaining backend item is the expense report date filter.

### 6.1 Backend Overview

The backend is an Express 4 REST API backed by MongoDB through Mongoose 8. It implements authentication, role-based authorization, tenant isolation, business logic, file uploads, reporting, exports, audit logging, loan overdue processing and mobile-money integration.

### 6.2 Backend Codebase Inventory

```text
server/
├── src/
│   ├── index.js                 Application entry, middleware, route mounts, scheduler
│   ├── controllers/             17 business-logic controllers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── organisation.controller.js
│   │   ├── member.controller.js
│   │   ├── import.controller.js
│   │   ├── history.controller.js
│   │   ├── group.controller.js
│   │   ├── farm.controller.js
│   │   ├── crop.controller.js
│   │   ├── collection.controller.js
│   │   ├── payment.controller.js
│   │   ├── expense.controller.js
│   │   ├── loan.controller.js
│   │   ├── visit.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── report.controller.js
│   │   └── audit.controller.js
│   ├── routes/                 15 route modules
│   ├── models/                 14 Mongoose models
│   │   └── plugins/            tenantScope plugin
│   ├── middleware/             auth, authorize, validation, upload, error handling
│   ├── services/               Hubtel mobile money, overdue loan processing
│   ├── utils/                  tenant context, audit helper, database, export
│   ├── migrate/                Tenant backfill migration
│   └── seed.js                 Admin, organisation and demo data seeding
```

### 6.3 API Endpoint Inventory

All routes below are prefixed with `/api`. Unless stated otherwise, authentication is required.

#### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user account |
| POST | `/auth/login` | Authenticate and issue a JWT |
| GET | `/auth/me` | Return the current user |

#### Staff Users

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/users` | List staff users |
| POST | `/users` | Create a staff user |
| GET | `/users/:id` | User detail |
| PUT | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |

#### Organisations and Settings

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/organisations` | List organisations |
| POST | `/organisations` | Create an organisation |
| GET | `/organisations/:id` | Organisation detail |
| PUT | `/organisations/:id` | Update an organisation |
| DELETE | `/organisations/:id` | Delete an organisation |
| GET | `/organisations/settings` | Read organisation settings |
| PUT | `/organisations/settings` | Update currency, default crop prices, quality grades, seasons and deduction rules |

#### Members

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/members` | List/search/filter/paginate members |
| POST | `/members` | Create a member, optionally with a photo |
| GET | `/members/:id` | Member detail |
| PUT | `/members/:id` | Update a member |
| DELETE | `/members/:id` | Soft-delete a member |
| POST | `/members/:id/restore` | Restore a soft-deleted member |
| GET | `/members/:id/history` | Merged member activity timeline |
| GET | `/members/import/template` | Download the bulk-import Excel template |
| POST | `/members/import` | Bulk import members from CSV/XLSX |
| GET | `/members/export` | Export members |
| POST | `/members/:id/documents` | Attach a member document |
| DELETE | `/members/:id/documents/:docId` | Remove a member document |

#### Groups and Hierarchy

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/groups` | List groups |
| POST | `/groups` | Create a group |
| GET | `/groups/tree` | Nested organisation hierarchy |
| GET | `/groups/unassigned-members` | Members not assigned to a group |
| GET | `/groups/:id` | Group detail |
| PUT | `/groups/:id` | Update a group |
| DELETE | `/groups/:id` | Delete a group |
| GET | `/groups/:groupId/members` | Members in a group |
| POST | `/groups/:groupId/members` | Assign members to a group |
| DELETE | `/groups/:groupId/members` | Remove members from a group |

#### Farms and Crops

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/farms` | List farm profiles |
| GET | `/farms/member/:memberId` | Farms for one member |
| POST | `/farms/member/:memberId` | Create a farm profile |
| GET | `/farms/:id` | Farm detail |
| PUT | `/farms/:id` | Update a farm |
| DELETE | `/farms/:id` | Delete a farm |
| POST | `/farms/member/:memberId/crops` | Add a crop planting |
| PUT | `/farms/member/:memberId/crops/:cropId` | Update a crop planting |
| DELETE | `/farms/member/:memberId/crops/:cropId` | Remove a crop planting |
| GET | `/crops` | List crop catalogue |
| POST | `/crops` | Create a crop |
| PUT | `/crops/:id` | Update a crop |
| DELETE | `/crops/:id` | Delete a crop |

#### Collections and Batches

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/collections` | List/filter collections |
| POST | `/collections` | Record a collection |
| GET | `/collections/:id` | Collection detail |
| PUT | `/collections/:id` | Update a collection |
| DELETE | `/collections/:id` | Delete a collection |
| GET | `/collections/batches` | List batches |
| GET | `/collections/batches/:id` | Batch detail |
| PATCH / PUT | `/collections/batches/:id` | Update a batch |
| DELETE | `/collections/batches/:id` | Delete a batch |
| POST | `/collections/batch/add` | Attach a collection to a batch |

#### Payments and Dues

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/payments` | List/filter payments |
| POST | `/payments` | Record a cash or mobile-money payment |
| GET | `/payments/:id` | Payment detail |
| PUT | `/payments/:id` | Update a payment |
| DELETE | `/payments/:id` | Delete a payment |
| GET | `/payments/outstanding` | Members with outstanding dues |
| POST | `/payments/produce` | Create a produce-based payment |
| GET | `/payments/:id/status` | Query Hubtel gateway status |
| POST | `/payments/hubtel/callback` | Public Hubtel transaction callback |

#### Expenses

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/expenses` | List/filter expenses |
| POST | `/expenses` | Record an expense |
| PUT | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |

#### Loans

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/loans` | List/filter loans |
| POST | `/loans` | Request a loan |
| GET | `/loans/:id` | Loan detail |
| PUT | `/loans/:id/approve` | Approve a pending loan |
| PUT | `/loans/:id/disburse` | Disburse an approved loan |
| POST | `/loans/:id/repayment` | Record a repayment |
| POST | `/loans/auto-deduct` | Auto-deduct repayment from harvest proceeds |
| GET | `/loans/overdue` | Run/return overdue loan check |

#### Field Visits and Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/visits` | List visits |
| POST | `/visits` | Record a visit with up to five photos |
| GET | `/visits/me/members` | Members assigned to the current officer |
| GET | `/visits/me/tasks` | Tasks assigned to the current officer |
| GET | `/visits/officer/:officerId` | Visits by a specific officer |
| GET | `/visits/performance` | Officer performance metrics |
| POST | `/visits/tasks` | Create a task |
| PUT | `/visits/tasks/:taskId` | Update task status |

#### Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/dashboard/stats` | Headline statistics |
| GET | `/dashboard/activity` | Recent activity feed |
| GET | `/dashboard/collection-trend` | Collection value/volume trend |
| GET | `/dashboard/payment-breakdown` | Payment method/type breakdown |
| GET | `/dashboard/member-distribution` | Member distribution by group/location |
| GET | `/dashboard/member-growth` | Member growth series |

#### Reports

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/reports/members` | Member report |
| GET | `/reports/collections` | Collection / harvest report |
| GET | `/reports/payments` | Payment / dues report |
| GET | `/reports/groups` | Group summary |
| GET | `/reports/loans` | Loan report |
| GET | `/reports/expenses` | Expense report |

Reports support JSON preview plus `format=csv` and `format=xlsx` exports.

#### Audit Logs and Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/audit-logs` | Filterable, paginated audit trail; CSV export |
| GET | `/health` | API health check |

### 6.4 Business Logic and Background Services

| Capability | Implementation |
|---|---|
| Collection value calculation | `quantity × pricePerUnit`, recalculated server-side on create/update |
| Default crop price | Falls back to `Organisation.settings.defaultCropPrices` when no price is supplied |
| Payment status | Derived from `amount` versus `amountPaid`: pending, part-paid, paid, cancelled |
| Receipt numbers | Generated server-side for payments |
| Produce settlement | Sums a member's un-settled collections and creates a produce payment |
| Loan lifecycle | Request → approve → disburse → repayment; balance and due date calculated |
| Interest | Flat or pro-rated reducing-balance style calculation |
| Credit score | Calculated from the member's loan/payment history at request time |
| Harvest deduction | Loan repayment can be auto-deducted from harvest value (capped at 30% per harvest) |
| Overdue loans | Endpoint check plus a scheduled sweep 1 minute after startup and every 6 hours |
| Member deletion | Soft delete via `deletedAt`; excluded from lists, counts, reports and exports; admin restore available |
| Audit logging | Create/update/delete/approve/disburse/repay/assign/import/login events recorded |
| Tenant stamping | `organisationId` automatically applied to new documents and query filters |

### 6.5 Security and Access Control

| Control | Present |
|---|---|
| JWT authentication | ✅ |
| bcrypt password hashing | ✅ |
| Role-based route guards | ✅ |
| Server-side tenant isolation | ✅ |
| Input validation with express-validator | ✅ |
| File type whitelist and 10 MB upload limit | ✅ |
| Audit trail on mutations | ✅ |
| Production CORS restriction via `CLIENT_URL` | ✅ |
| Central error handler | ✅ |
| Helmet security headers | ❌ Not configured |
| API rate limiting | ❌ Not configured |
| Password reset / email verification | ❌ Not implemented |
| Multi-factor authentication | ❌ Not implemented |
| Refresh-token rotation | ❌ Not implemented (JWT access token only) |

### 6.6 Backend Gaps and Limitations

| Item | Detail | MVP impact |
|---|---|---|
| **Expense report date filter** | `expenseReport` queries all expenses and ignores `from`/`to`, although the Reports UI sends a date range. Other reports apply date filters correctly. | This is the only weighted backend MVP gap. |
| Report export path | Client hardcodes `/api/reports` for blob download instead of using the configured API base. | Deployment configuration issue, not an API defect. |
| PDF export | No PDF generation. | Optional; CSV/XLSX satisfy the MVP. |
| Automated tests in repository | No test files or test script are present in the committed repository. Verification described in project notes appears to have been performed through external/manual regression runs. | Quality-assurance gap; should be addressed before scale-up. |
| API specification | No committed OpenAPI/Swagger contract. | Integration/documentation gap. |
| File storage | Uploads use local disk under `server/uploads`; no object-storage abstraction. | Production scalability/durability consideration. |
| Password lifecycle | No reset, invitation or forced-change flow; new users receive a default password. | Production hardening item. |
| Rate limiting / headers | No Helmet or rate limiter. | Production hardening item. |
| System-setting application | Currency, seasons and deduction rules are persisted but not fully applied: currency formatting is fixed to GHS, season entry is free text, and auto-deduct uses a fixed 30% rather than the configured rule. Default crop prices and quality grades are applied. | Functional integration gap; not included in the weighted MVP remainder. |
| Unused API surface | `GET /api/dashboard/member-distribution` is not rendered; `POST /api/members/:id/restore` has no UI; `GET /api/visits/officer/:officerId` is superseded by the generic visit filter. | Low-impact integration gap. |

### 6.7 Third-Party Services Not Integrated

- SMS gateway / bulk SMS
- Email delivery and templates
- USSD gateway
- Bank reconciliation or accounting systems
- Agricultural marketplace integrations
- Bluetooth/USB scale devices
- National ID or external identity verification
- Cloud object storage for uploads
- Push notifications

---

## 7. Database Scope

> **Indicative cost:** **GH₵4,050** for database design, model relationships, tenant isolation, migrations and seed data (9.6% of the estimated development value). The MVP database schema is fully delivered.

### 7.1 Database Overview

| Item | Detail |
|---|---|
| Database | MongoDB (MongoDB Atlas in the current setup) |
| ODM | Mongoose 8 |
| Models | 14 |
| Tenant isolation | 12 models scoped by `organisationId`; Organisation is own-org restricted; Crop is shared reference data |
| Audit model | Immutable `AuditLog` collection |
| Migration | `npm run migrate:tenant` backfills missing tenant IDs and creates per-tenant indexes |
| Seeding | `npm run seed` creates the default administrator, sample organisation and demo data |

### 7.2 Data Models

| Model | Purpose | Key fields | Relationships |
|---|---|---|---|
| **Organisation** | Top-level tenant and configuration boundary | `name`, `code`, `logo`, `location`, `region`, `district`, contact fields, `settings` (currency, default crop prices, quality grades, seasons, deduction rules) | Parent of all tenant data; referenced by `organisationId` across models |
| **User** | Staff account and authentication identity | `name`, `email`, `password` (hashed), `phone`, `role`, `assignedArea`, `organisationId`, `photo`, `isActive` | Belongs to Organisation; referenced by groups, visits, tasks, audit logs, collections |
| **Member** | Cooperative/farmer member profile | `firstName`, `lastName`, `phone`, `membershipNumber`, `idType`, `idNumber`, `photo`, `location`, `region`, `district`, `gpsLat`, `gpsLng`, `farmSize`, `mainCrops`, `groupId`, `assignedOfficerId`, `status`, `deletedAt`, embedded `documents` | Belongs to Organisation; belongs to Group; assigned to User (officer); has farms, collections, payments, loans, visits |
| **Group** | Self-referencing organisation hierarchy | `name`, `description`, `type` (organisation/region/district/group/community), `parentId`, `leaderId`, `location`, `organisationId` | Self-references through `parentId`; leader is a User; members reference `groupId` |
| **FarmProfile** | Farm-level record for a member | `memberId`, `farmSize`, `location`, `gpsLat`, `gpsLng`, `currentSeason`, embedded `crops[]`, `notes` | Belongs to Member; embedded crops track crop name, variety, area, planting date, season, expected harvest, status, expected/actual yield |
| **Crop** | Shared crop reference catalogue | `name`, `category`, `unit`, `isActive`, `sortOrder`, `createdBy` | Shared reference data; used by farm crops and collections |
| **Collection** | Produce delivery/harvest record | `memberId`, `crop`, `quantity`, `unit`, `grade`, `pricePerUnit`, `totalValue`, `date`, `location`, `photo`, `notes`, `capturedBy`, `batchId`, `organisationId` | Belongs to Member; captured by User; optionally belongs to Batch; feeds produce payments and reports |
| **Batch** | Grouped shipment/dispatch unit | `batchNumber`, `collectionPoint`, `buyer`, `status` (open/closed/shipped/delivered), `totalWeight`, `certification`, `createdBy`, `organisationId` | Contains collections through `Collection.batchId` |
| **Payment** | Member financial transaction | `memberId`, `type` (produce_payment/dues/contribution/savings/expense), `amount`, `amountPaid`, `method`, `status`, `gateway`, `gatewayReference`, `gatewayStatus`, `simulated`, `receiptNumber`, `referenceNumber`, `paymentDate`, `description`, `relatedCollections`, `organisationId` | Belongs to Member; relates to Collections; may be created by Hubtel |
| **Expense** | Cooperative operating cost | `category`, `amount`, `description`, `date`, `receipt`, `createdBy`, `organisationId` | Recorded by User; included in expense reports and dashboards |
| **Loan** | Member loan and repayment record | `memberId`, `amount`, `type`, `interestRate`, `interestType`, `durationMonths`, `amountRepaid`, `balance`, `status`, `dueDate`, `creditScore`, embedded `repayments[]`, `organisationId` | Belongs to Member; repayments can reference Collection or Payment |
| **FieldVisit** | Officer visit log | `officerId`, `memberId`, `date`, `notes`, `purpose`, `gpsLat`, `gpsLng`, `photos[]`, `organisationId` | Officer is a User; visit relates to a Member |
| **Task** | Assigned staff work item | `assignedTo`, `memberId`, `title`, `description`, `dueDate`, `status`, `priority`, `organisationId` | Assigned to User; optionally relates to Member |
| **AuditLog** | Immutable audit trail | `user`, `organisationId`, `action`, `resource`, `resourceId`, `details`, `ip`, `userAgent`, `success`, timestamps | Written by User actions across the system |

### 7.3 Key Relationships

```text
Organisation
├── Users
├── Members ──────────────── Group (organisation → region → district → group → community)
│   ├── FarmProfiles ─────── embedded Crops
│   ├── Collections ──────── Batch
│   ├── Payments ─────────── related Collections
│   ├── Loans ────────────── repayments → Collection / Payment
│   └── FieldVisits
├── Groups ───────────────── leader: User
├── Expenses
├── Tasks ────────────────── assignedTo: User
├── Batches
└── AuditLogs
```

### 7.4 Multi-Tenancy and Data Isolation

The platform uses a **shared database, isolated tenant rows** model:

- The acting user's `organisationId` is placed in an `AsyncLocalStorage` context by the authentication middleware.
- The `tenantScope` Mongoose plugin automatically:
  - Adds `{ organisationId }` to read, update and delete query filters.
  - Prepends an organisation match to aggregation pipelines.
  - Stamps `organisationId` on newly created documents.
  - Prevents a client-supplied `organisationId` from overriding the tenant.
- Requests without tenant context (login, seed, direct database scripts, background jobs) are deliberately unaffected.
- Cross-tenant organisation reads resolve to `404` rather than leaking metadata.
- The `Crop` catalogue is intentionally shared reference data.

### 7.5 Indexes, Integrity and Lifecycle

| Area | Implementation |
|---|---|
| Unique email | `User.email` unique |
| Unique organisation code | `Organisation.code` unique and sparse |
| Unique crop name | `Crop.name` unique |
| Unique batch number | `Batch.batchNumber` unique |
| Audit query index | `AuditLog` index on `organisationId` + `createdAt` |
| Tenant query support | Migration creates an `organisationId` index per tenant-scoped collection |
| Member lifecycle | Soft delete via `deletedAt`; status set to inactive; admin restore endpoint |
| Payment integrity | Paid/part-paid status derived server-side from amount versus amount paid |
| Collection integrity | `totalValue` recalculated server-side on create and update |
| Loan integrity | Balance and repayment state maintained server-side |
| Seed environment | Default admin, sample organisation and demo data can be created with `npm run seed` |

### 7.6 Database Gaps and Future Entities

The MVP schema is complete. The following entities or capabilities are **not present** and would be required by the broader roadmap:

- Farmer self-service accounts and portal identities (members are not currently Users)
- Notification/message log for SMS, email and USSD
- Input inventory and input distribution transactions
- Disease/pest observation records
- Chain-of-custody and certification evidence beyond the single `Batch.certification` field
- Partner/NGO access, donor reporting and API-key management
- Dedicated collection-point master data
- Scale/device integration records
- Multi-organisation user membership (a user currently belongs to one organisation)
- Financial statement snapshots (income statement, balance sheet, profit and loss, cash flow)
- Marketplace, bank reconciliation and accounting integration records

---

## 8. Integration Matrix: Built vs Pending

> **Commercial view:** This matrix maps the delivered and pending work. The integration layer (Hubtel, import/export, uploads and audit) is valued at **GH₵3,600**. QA, deployment and documentation are valued at **GH₵5,100** and are reported under Section 11. See Appendix C for the consolidated breakdown.

| Module | UI | API | Database | Integrated end-to-end? | Notes |
|---|---|---|---|---|---|
| Authentication and roles | ✅ | ✅ | ✅ | ✅ | Login, session restore, role guards, 401 handling |
| Organisation settings | 🟡 | ✅ | ✅ | 🟡 | Existing organisation can be edited; no creation/onboarding UI |
| System settings application | 🟡 | ✅ | ✅ | 🟡 | Settings editable; currency, seasons and deduction rules not fully applied |
| Staff user management | 🟡 | ✅ | ✅ | 🟡 | Create/list in UI; edit/deactivate/delete not exposed |
| Member registration and profiles | ✅ | ✅ | ✅ | ✅ | CRUD, search, filters, documents, history |
| Member group filter | ❌ | ✅ | ✅ | ❌ | Backend filter available; UI selector missing |
| Member restore | ❌ | ✅ | ✅ | ❌ | Restore endpoint exists; no UI action |
| Bulk member import | 🟡 | ✅ | ✅ | 🟡 | Works; row-level error review not surfaced |
| Groups and hierarchy | ✅ | ✅ | ✅ | ✅ | Tree, CRUD, assign/remove members, leaders |
| Farm profiles and crops | ✅ | ✅ | ✅ | ✅ | Farm details, GPS, planting date, actual yield, crop catalogue |
| Collections | ✅ | ✅ | ✅ | ✅ | Date picker, photos, pricing, totals |
| Batches | ✅ | ✅ | ✅ | ✅ | Create/update/delete, assign collections |
| Payments and dues | ✅ | ✅ | ✅ | ✅ | Record payment, outstanding dues, produce settlement |
| Expenses | ✅ | ✅ | ✅ | ✅ | CRUD and category/date filters |
| Loans | ✅ | ✅ | ✅ | ✅ | Request, approve, disburse, repay, auto-deduct, detail |
| Field visits | ✅ | ✅ | ✅ | ✅ | Visit recording with GPS and photos |
| Tasks and officer performance | ✅ | ✅ | ✅ | ✅ | Task creation/status; performance board |
| Field assigned-member search | ❌ | ✅ | ✅ | ❌ | Assigned list exists; search missing |
| Dashboard | ✅ | ✅ | ✅ | ✅ | Live cards, activity, charts |
| Reports | 🟡 | ✅ | ✅ | 🟡 | Six reports and exports; collection member filter missing; expense date range ignored |
| Audit trail | ✅ | ✅ | ✅ | ✅ | Filters, pagination, CSV |
| Hubtel mobile money | ✅ | ✅ | ✅ | ✅ | Live and simulated modes; callback implemented |
| CSV/XLSX exports | ✅ | ✅ | ✅ | ✅ | Reports, members, audit |
| PDF export | ❌ | ❌ | — | ❌ | Future enhancement |
| SMS/email/USSD | ❌ | ❌ | ❌ | ❌ | Future scope |
| Offline sync / Bluetooth scales | ❌ | ❌ | ❌ | ❌ | Future scope |
| Farmer portal | ❌ | ❌ | ❌ | ❌ | Future scope |
| NGO/partner access | ❌ | ❌ | ❌ | ❌ | Future scope |

---

## 9. Completion Assessment

### 9.1 Overall MVP Position

| Measure | Value |
|---|---|
| MVP completion | **92.5%** |
| Indicative range | **91–94%** |
| Remaining | **7.5%** |
| Basis | Weighted assessment of the seven Validation MVP modules, traced end-to-end through UI, API and database |

The range reflects the fact that some remaining items are small UI additions with fully prepared backend support, while the organisation onboarding flow is a larger cross-cutting capability.

### 9.2 Module-by-Module Assessment

| MVP module | Completion | Status | Remaining gap |
|---|---:|---|---|
| **2.1 Organisation & Member Management** | ~85% | 🟡 Partial | Organisation/workspace creation UI; member group filter |
| **2.2 Groups & Organisation Structure** | 100% | ✅ Complete | — |
| **2.3 Farm & Crop Profiles** | 100% | ✅ Complete | — |
| **2.4 Produce / Collection Records** | 100% | ✅ Complete | — |
| **2.5 Payments, Dues & Contributions** | 100% | ✅ Complete | — |
| **2.6 Field Officer Web Access** | ~97% | 🟡 Partial | Assigned-member search |
| **2.7 Dashboard & Basic Reports** | ~97% | 🟡 Partial | Collection report member filter; expense report date range |

> Module percentages are relative to each module's requirements. The overall 92.5% figure is weighted across the MVP and is not a simple average of the rows above.

### 9.3 Remaining MVP Work and Weighting

| # | Remaining item | Layer | Weight |
|---|---|---|---:|
| 1 | Organisation / workspace creation UI | Frontend + onboarding flow | 3.0% |
| 2 | Member group filter | Frontend | 1.1% |
| 3 | Collection report member filter | Frontend | 1.0% |
| 4 | Field officer assigned-member search | Frontend | 1.0% |
| 5 | Full member timeline ("view all") | Frontend | 0.5% |
| 6 | Expense report date range | Backend | 0.6% |
| 7 | Import validation error detail | Frontend | 0.3% |
|  | **Total remaining** |  | **7.5%** |

### 9.4 Commercial Position

| Measure | Value |
|---|---:|
| Total planning value | **GH₵42,000** |
| Completed value (92.5%) | **GH₵38,850** |
| Remaining value (7.5%) | **GH₵3,150** |

The value of completed work is calculated as **92.5% of the agreed development value**. The remaining value is allocated across the seven items above using their respective weights; the item-level cost breakdown is in **Appendix C**.

### 9.5 What Remains in Practical Terms

The remaining 7.5% is not missing architecture. It is a focused final-integration pass:

- One onboarding screen and its supporting flow.
- Three filter/search controls backed by APIs that already exist.
- One timeline expansion.
- One report date-filter correction.
- One import error-review presentation.

After these items, the Validation MVP can be considered feature-complete for pilot deployment. The broader roadmap in Section 10 remains a separate product phase.

---

## 10. Not Included in the Current MVP (Future Scope)

> **Budget note:** The future-scope items in this section are **not included** in the GH₵42,000 MVP estimate. They would be scoped and quoted separately if selected for a later phase.

The following capabilities appear in the broader **Proposed Features – Web Platform** roadmap and the Founder's Overview. They are **not part of the current Validation MVP** and should be treated as future scope. Their absence does not affect the MVP completion figure.

### 10.1 Field and Produce Operations

| Capability | Status |
|---|---|
| Offline-first collection recording with automatic sync | ⚪ Future |
| Bluetooth/USB digital scale integration | ⚪ Future |
| Collection point master data and delivery notes | ⚪ Future |
| Input inventory (fertilizer, seeds, pesticides) | ⚪ Future |
| Crop disease and pest monitoring | ⚪ Future |
| GPS map visualisation of farms and collection points | ⚪ Future |
| Multi-vendor mobile money support beyond Hubtel | ⚪ Future |

### 10.2 Communication and Farmer Access

| Capability | Status |
|---|---|
| SMS gateway, bulk SMS and message templates | ⚪ Future |
| Email notifications and receipts | ⚪ Future |
| USSD access for farmers | ⚪ Future |
| Farmer self-service portal | ⚪ Future |
| Farmer loan requests and self-service profile updates | ⚪ Future |
| Password reset and email verification | ⚪ Future / hardening |

### 10.3 Finance and Reporting

| Capability | Status |
|---|---|
| Income statement, balance sheet, profit and loss, cash flow | ⚪ Future |
| Batch payment runs (weekly/monthly payouts) | ⚪ Future |
| PDF report export | ⚪ Future |
| Donor-specific and custom report builder | ⚪ Future |
| Bank reconciliation and accounting-system integration | ⚪ Future |
| Marketplace integration | ⚪ Future |

### 10.4 Traceability and Partnerships

| Capability | Status |
|---|---|
| Full chain-of-custody records | ⚪ Future |
| Certification management and evidence | ⚪ Future |
| Traceability reports and audit-ready compliance packs | ⚪ Future |
| EUDR / Fairtrade / Organic reporting support | ⚪ Future |
| Multi-organisation partner/NGO view | ⚪ Future |
| Partner API keys and external data access | ⚪ Future |
| Impact tracking and donor reports | ⚪ Future |

### 10.5 Platform and Engineering

| Capability | Status |
|---|---|
| Self-service workspace signup and organisation switching | ⚪ Future |
| Native mobile application | ⚪ Future |
| Cloud object storage for uploads | ⚪ Future / hardening |
| Automated test suite committed to the repository | ⚪ Future / hardening |
| OpenAPI/Swagger documentation | ⚪ Future / hardening |
| Helmet, rate limiting, MFA, refresh tokens | ⚪ Future / hardening |
| Automated backup and retention policy | ⚪ Future / operations |

---

## 11. Deployment and Operational Readiness

> **Indicative cost:** **GH₵5,100** for QA, deployment, documentation and handover (12.1% of the estimated development value).

### 11.1 Current Run Process

```bash
# Install frontend and backend dependencies
npm run install:all

# Configure server environment
# Create server/.env from server/.env.example and set:
#   PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV
#   CLIENT_URL (production)
#   HUBTEL_CLIENT_ID, HUBTEL_CLIENT_SECRET, HUBTEL_MERCHANT_ACCOUNT (live payments)

# Seed the database (admin, sample organisation, demo data)
npm run seed

# Start both development servers
npm run dev

# Build the production frontend
npm run build

# Start the backend in production
npm start --prefix server
```

Default development URLs:

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000/api` |
| Health check | `http://localhost:5000/api/health` |

Default seeded administrator:

| Field | Value |
|---|---|
| Email | `admin@konnectcore.com` |
| Password | `admin123` |

> The default credentials are for local/demo use only and must be changed before any real deployment.

### 11.2 Production Readiness Checklist

| Area | Current state | Required action before production |
|---|---|---|
| Environment secrets | `.env` supported; example file present | Use a managed secret store; rotate JWT and database credentials |
| Default admin password | Seeded demo password | Force change or create a real admin |
| CORS | Production origin restricted through `CLIENT_URL` | Confirm exact deployed frontend origin |
| File uploads | Local disk under `server/uploads` | Use persistent volume or object storage; define backup/retention |
| Report export URL | Client hardcodes `/api/reports` | Use `VITE_API_URL` or serve frontend/API behind one origin |
| Hubtel | Live and simulated modes | Supply merchant credentials; verify callback URL and signature handling |
| Database indexes | Core unique indexes and tenant indexes | Profile production queries and add compound indexes as needed |
| Audit retention | AuditLog collection grows indefinitely | Define retention/archival policy |
| Security headers | Not configured | Add Helmet or equivalent |
| Rate limiting | Not configured | Add API and authentication rate limits |
| Error monitoring | Not configured | Add structured logging/APM |
| Backups | Not defined in repository | Configure MongoDB Atlas backups and restore testing |
| Automated tests | Not present in repository | Add committed API and UI regression suites |
| API documentation | Not present | Publish OpenAPI contract for integrators |

### 11.3 Known Deployment Caveats

1. **Reports export path** — `ReportsPage.jsx` uses a hardcoded `/api/reports/...` path for blob downloads. This works behind the Vite proxy or a same-origin reverse proxy but will fail if the frontend and API are served from different origins without configuration.
2. **Upload paths** — Uploaded files are stored as relative `/uploads/...` paths and served by the Express static middleware. A production deployment needs persistent storage and a matching public URL strategy.
3. **Hubtel simulation** — Without Hubtel credentials, mobile-money payments are simulated and flagged as such. They must not be presented as real settlements in production.
4. **Overdue scheduler** — The overdue loan sweep runs in the API process. If the API is scaled to multiple instances, the schedule should be moved to a single worker or protected with a distributed lock.
5. **No PDF export** — CSV and XLSX are the supported report formats in the current build.

---

## 12. Recommended Next Steps

### Phase A — Close the MVP Gap (Priority)

The remaining MVP work represents **GH₵3,150** of development value (7.5% of the total). The recommended sequence is:

1. Build the **organisation/workspace creation and onboarding UI**, using the existing organisation CRUD API.
2. Add the **group filter** to the Members page and expose the group column.
3. Add the **member filter** to the Collection/Harvest report.
4. Add **search to the field officer assigned-member list** and ensure the officer view is scoped to assignments.
5. Add a **"View all" member timeline** or expandable history.
6. Correct the **expense report date range** handling on the backend.
7. Surface **row-level import validation errors** in a review table after upload.

> **Commercial note:** Phase A is covered by the **GH₵3,150** remaining MVP value. Phase B production hardening and Phase D roadmap items are outside the GH₵42,000 MVP estimate and would be quoted separately. Phase C pilot support is included only to the extent described in the QA and delivery allocation in Appendix C.

### Phase B — Production Hardening

1. Replace the hardcoded report export path with the configured API base.
2. Add Helmet, rate limiting, structured logging and error monitoring.
3. Move uploads to durable object storage.
4. Add password reset, email verification and an admin password-change flow.
5. Commit automated API and UI regression tests to the repository.
6. Publish an OpenAPI contract.
7. Define backup, audit-retention and incident-response procedures.

### Phase C — Pilot and Acceptance

1. Run a pilot with a real cooperative using seeded or migrated data.
2. Validate role behaviour with administrator, manager and field officer accounts.
3. Confirm Hubtel live-mode settlement and callback handling with the merchant account.
4. Complete user acceptance testing against the Validation MVP.
5. Capture feedback and prioritise the Phase 2 roadmap.

### Phase D — Post-MVP Roadmap

Select the next product phase from Section 10 based on pilot feedback. The most natural next candidates are:

- Farmer access and SMS/notification workflows
- Financial statements and PDF reporting
- Traceability and certification reporting
- Partner/NGO access and donor reporting
- Offline-first field operations

---

## 13. Assumptions and Exclusions

### 13.1 Assumptions

- MongoDB Atlas (or a compatible MongoDB deployment) is available and reachable from the API.
- The platform is deployed as a browser-based application; the target field device is an Android browser.
- A Hubtel merchant account is available if live mobile-money collection is required.
- Each cooperative operates as a separate organisation/tenant.
- Administrators and staff users are created by the project team or an existing administrator until self-service onboarding is delivered.
- English is the current interface language; the default currency is GHS and is configurable per organisation.
- The current MVP assumes connectivity; offline-first operation is future scope.
- Uploaded files are stored on the API server's local disk in the current deployment.
- Existing data migration from spreadsheets or legacy systems is not included unless separately agreed.
- The cost estimate in Appendix C is an effort-based planning figure, not a fixed-price quotation. Final pricing is subject to confirmed scope, agreed rate and commercial terms.

### 13.2 Exclusions

This scope does not include:

- Hosting, domain registration, TLS certificates or infrastructure procurement
- MongoDB Atlas subscription, storage or backup costs
- Hubtel transaction fees or merchant onboarding
- SMS, email, USSD or other third-party messaging costs
- Native iOS/Android applications
- Offline synchronization
- Bluetooth/USB scale hardware or drivers
- Financial statement generation
- External accounting, banking or marketplace integrations
- Custom donor, government or partner reporting
- Large-scale data migration from legacy systems
- Ongoing maintenance, support or service-level agreements
- Training beyond an agreed handover session
- Commercial pricing, payment terms or contractual terms

These items may be quoted separately.

---

## 14. Acceptance and Sign-Off

| Role | Name | Signature | Date |
|---|---|---|---|
| Tech Team Lead |  |  |  |
| Project / Product Lead |  |  |  |
| Cooperative Representative |  |  |  |

**Acceptance statement:** The parties confirm that this document accurately records the implemented scope, the remaining MVP items and the future scope as at the document date. Acceptance of this document does not constitute acceptance of the future-scope items in Section 10.

---

## Appendix A — Key Reference Files

| Area | Key paths |
|---|---|
| Scope references | `project-scope/KonnectCore_Validation_MVP_Modules.pdf`, `project-scope/KonnectCore_Features for web.pdf`, `project-scope/KonnectCore_Founders_Overview.pdf` |
| Frontend entry and routing | `client/src/main.jsx`, `client/src/App.jsx` |
| Frontend pages | `client/src/pages/` |
| Reusable UI components | `client/src/components/ui/` |
| Feature modals | `client/src/components/{members,collections,payments,loans,visits}/` |
| Dashboard charts | `client/src/components/dashboard/DashboardCharts.jsx` |
| Navigation and roles | `client/src/config/navigation.js` |
| API client | `client/src/services/api.js` |
| Auth context and guards | `client/src/context/AuthContext.jsx`, `client/src/components/ProtectedRoute.jsx` |
| Backend entry and route mounts | `server/src/index.js` |
| API routes | `server/src/routes/` |
| Business logic | `server/src/controllers/` |
| Data models | `server/src/models/` |
| Tenant isolation | `server/src/utils/tenant.js`, `server/src/models/plugins/tenantScope.js`, `server/src/middleware/auth.middleware.js` |
| Audit trail | `server/src/models/AuditLog.js`, `server/src/utils/audit.js` |
| Mobile money | `server/src/services/hubtel.service.js`, `server/src/controllers/payment.controller.js` |
| Overdue loans | `server/src/services/overdue.service.js` |
| Reports and exports | `server/src/controllers/report.controller.js`, `server/src/utils/export.js` |
| Seed and migration | `server/src/seed.js`, `server/src/migrate/backfill-tenant.js` |
| Environment template | `server/.env.example` |

---

## Appendix B — Status Summary

| Scope area | Built | Partial / not integrated | Overall |
|---|---|---|---|
| **User interface** | Public site, login, dashboard, field dashboard, members, member profile, groups, farms, collections, payments, expenses, loans, visits, reports, users, audit, settings | Organisation creation, group filter, member report filter, assigned-member search, full timeline, import error detail | ~93% |
| **Frontend codebase** | 20 pages, 16-component UI kit, 7 feature modals, charts, auth context, API client, routing, responsive layout | Dead `ComingSoon.jsx`; hardcoded report export path; member restore action not exposed; some system settings not fully applied | ~98% structural completeness |
| **Backend codebase** | 15 route groups, 17 controllers, auth, roles, tenant isolation, audit, reports, exports, Hubtel, scheduler | Expense report date filter; production hardening; no committed test suite/OpenAPI; a few endpoints not yet consumed by the UI | ~99% of MVP scope |
| **Database** | 14 models, relationships, tenant scoping, soft delete, audit indexes, seed and migration | Future entities for roadmap features | 100% of MVP schema |

---

## Appendix C — Cost Estimate and Budget Breakdown

### C.1 Basis of Estimate

| Item | Assumption |
|---|---|
| Estimated effort | **~93 person-days** |
| Blended development rate | **GH₵450/day** |
| Estimated development value | **GH₵42,000** (rounded from GH₵41,850) |
| Indicative range | **GH₵36,000–48,000**, depending on final rate and scope confirmation |
| Completed share | **92.5%** |
| Remaining share | **7.5%** |
| Cost basis | Effort-based scoping estimate; not a formal quotation |
| Currency | Ghana cedi (GH₵) |

The estimate covers the work delivered to date plus the seven remaining MVP items. It is a development-value estimate, not a client invoice. A client-facing quotation may add project management, contingency, margin, applicable taxes and support arrangements.

**Rate sensitivity:** at GH₵400/day the total is approximately **GH₵37,300**; at GH₵500/day it is approximately **GH₵46,700**. The planning figure uses a blended GH₵450/day rate.

### C.2 Section Allocation

| Section | Effort (days) | Allocated value (GH₵) | Share of total |
|---|---:|---:|---:|
| Platform foundation, architecture and project setup | 5.0 | 2,250 | 5.4% |
| UI/UX design and design system | 8.0 | 3,600 | 8.6% |
| Frontend development | 24.0 | 10,800 | 25.7% |
| Backend API and business logic | 28.0 | 12,600 | 30.0% |
| Database design, tenancy and migration | 9.0 | 4,050 | 9.6% |
| Integrations (Hubtel, import/export, uploads, audit) | 8.0 | 3,600 | 8.6% |
| QA, deployment, documentation and handover | 11.3 | 5,100 | 12.1% |
| **Total** | **93.3** | **42,000** | **100%** |

> Section values are **effort-based allocations** of the total development value. The completion percentages in Section 9 and C.5 are scope-completion measures; they are not multiplied by the section values. The consolidated completed value is calculated once, at 92.5% of the total, in C.3.

### C.3 Completed vs Remaining Value

| Measure | Calculation | Value |
|---|---|---:|
| Total planning value | Section allocation total | **GH₵42,000** |
| Completed value | 92.5% × GH₵42,000 | **GH₵38,850** |
| Remaining value | 7.5% × GH₵42,000 | **GH₵3,150** |

### C.4 Remaining Work Cost Breakdown

| # | Remaining item | Share of total | Estimated cost (GH₵) | Equivalent effort (days) |
|---|---|---:|---:|---:|
| 1 | Organisation / workspace creation UI | 3.0% | 1,260 | 2.8 |
| 2 | Member group filter | 1.1% | 462 | 1.0 |
| 3 | Collection report member filter | 1.0% | 420 | 0.9 |
| 4 | Field officer assigned-member search | 1.0% | 420 | 0.9 |
| 5 | Full member timeline ("view all") | 0.5% | 210 | 0.5 |
| 6 | Expense report date range | 0.6% | 252 | 0.6 |
| 7 | Import validation error detail | 0.3% | 126 | 0.3 |
|  | **Total remaining** | **7.5%** | **3,150** | **7.0** |

### C.5 Cost by Delivery Area

| Delivery area | Included work | Value (GH₵) | Status |
|---|---|---:|---|
| Foundation and architecture | Project setup, architecture, environment configuration | 2,250 | Complete |
| UI/UX design | Design system, layouts, responsive behaviour, public site styling | 3,600 | Complete |
| Frontend development | 20 pages, 16-component UI kit, 7 feature modals, charts, forms, filters, exports | 10,800 | ~93% complete |
| Backend API | 15 route groups, 17 controllers, 3 roles, authentication, business logic, reports | 12,600 | ~99% complete |
| Database | 14 models, relationships, tenant isolation, soft delete, indexes, seed and migration | 4,050 | 100% complete |
| Integrations | Hubtel mobile money, callback, CSV/XLSX, bulk import, file uploads, audit | 3,600 | Complete |
| QA and delivery | Testing, deployment, documentation, handover, 30-day support preparation | 5,100 | Complete for MVP |
| **Total** |  | **42,000** | **92.5% complete** |

### C.6 What the Estimate Includes

- Architecture, database design and project setup
- UI/UX design system and responsive application shell
- Public landing page and login experience
- All 19 routed application pages
- Reusable component library and feature modals
- Authentication, roles and tenant isolation
- All 15 API route groups and 17 controllers
- 14 Mongoose models, relationships and seed/migration scripts
- Member import/export, report exports and file uploads
- Hubtel mobile-money integration (live and simulated modes)
- Audit trail and system settings
- Manual quality assurance, deployment support and documentation
- The seven remaining MVP items listed in C.4

### C.7 What the Estimate Excludes

- Hosting, server infrastructure, domain registration and TLS certificates
- MongoDB Atlas subscription, storage, backups and data transfer
- Hubtel merchant onboarding, transaction fees and settlement charges
- SMS, email, USSD or other messaging costs
- Bluetooth/USB scales and other hardware
- Content creation, photography, branding assets and copywriting
- Migration of legacy or spreadsheet data
- Native mobile applications
- Features listed in Section 10 (future scope)
- Ongoing maintenance, support, monitoring or service-level agreements beyond handover
- Applicable taxes, levies or statutory deductions
- Third-party premium themes, plugins, licences or API subscriptions

### C.8 Reference Proposal Note

The sample proposal supplied for comparison quotes **GH₵2,000–2,500** for a four-week, template-based informational website. KonnectCore is a different class of deliverable: a custom multi-tenant management platform with 20 pages, 17 controllers, 14 data models, authentication, role-based access, tenant isolation, mobile-money integration, audit logging, reporting and exports. The two scopes are not directly comparable, and the KonnectCore estimate reflects custom software development effort.

### C.9 Recommended Commercial Position

| Item | Amount |
|---|---:|
| Internal development value | **GH₵42,000** |
| Indicative range | **GH₵36,000–48,000** |
| Completed value to date | **GH₵38,850** |
| Remaining MVP value | **GH₵3,150** |

For a client-facing quotation, the Tech Team should add project management, contingency, margin, applicable taxes and a post-launch support plan. Those additions are commercial decisions and are not included in the development value above.

---

**Prepared by the Tech Team — KonnectCore Project Scope v1.0 — 07 November 2026**

