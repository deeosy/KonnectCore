# KonnectCore — MVP Status Report

KonnectCore is an agricultural cooperative management platform built for Ghanaian farmer organisations. This document explains what has been completed in the MVP and how each feature works.

**Tech Stack:** Node.js/Express backend, MongoDB database, React/Vite frontend with Tailwind CSS.

**Default Login:** `admin@konnectcore.com` / `admin123`

---

## MVP Completion Summary

| Section | Status |
|---|---|
| 2.1 Organisation & Member Management | **Fully Complete** |
| 2.2 Groups & Organisation Structure | **Fully Complete** |
| 2.3 Farm & Crop Profiles | **Fully Complete** |
| 2.4 Produce / Collection Records | **Fully Complete** |

**All four MVP sections are fully implemented.** The features excluded from MVP (disease/pest monitoring and detailed input inventory) were intentionally deferred and are noted at the bottom of this document.

---

## 2.1 Organisation & Member Management

### 2.1.1 Create an Organisation/Workspace

**Status:** Done

**How it works:** An organisation (also called a workspace) is the top-level container for all data. Every member, group, collection, and payment belongs to one organisation. The system supports multiple organisations, but each user is assigned to one.

**How to use it:**
- Go to **Dashboard** after login. A default "Sample Cooperative" organisation is created during setup.
- As an Admin, you can create additional organisations from the server API or seed data.
- Organisation settings include currency (default GHS), crop prices, quality grades (A/B/C), seasons (Major/Minor), and deduction rules.

---

### 2.1.2 Register and Edit Members

**Status:** Done

**How it works:** Members are the core entity in the system. Each member record stores personal details, identification, location, agricultural info, group assignment, and status.

**Fields captured:**
- **Name:** First name and last name
- **Phone:** Contact phone number
- **Membership Number:** Auto-generated as `KC-{timestamp}` if left blank
- **ID/Reference:** ID type (National ID, Voter ID, Passport, or Other) and ID number
- **Location:** Free-text location, plus region and district fields
- **Photo:** Upload a member photo
- **Status:** Active, Inactive, Suspended, or Blacklisted

**How to use it:**
1. Navigate to **Members** in the sidebar.
2. Click **"Add Member"** button (top right).
3. Fill in the form sections: Personal Info, Contact & Location, Agriculture Info, and Group Assignment.
4. Upload a photo if available.
5. Click **Save** to register the member.
6. To edit: click on a member's name in the list, then click the **Edit** button on their profile page.

---

### 2.1.3 Optional Agriculture Fields

**Status:** Done

**How it works:** During member registration or edit, you can optionally fill in agricultural details directly on the member record. For more detailed farm tracking, a separate Farm Profile can be created (see section 2.3).

**Fields:**
- **Farm Size:** In hectares
- **Farm Location/GPS:** Latitude and longitude coordinates
- **Main Crops:** A list of crops the farmer grows (e.g., Cocoa, Maize, Cassava)

**How to use it:**
- On the **Add/Edit Member** form, scroll to the "Agriculture Info" section.
- Fill in farm size, GPS coordinates (if known), and select the main crops from the dropdown.
- These fields are optional — you can skip them and add them later.

---

### 2.1.4 Search and Filter Members

**Status:** Done

**How it works:** The Members page has a search bar and filter options that let you find members quickly without scrolling through the full list. Filtering happens on the server side for accuracy.

**Filter options:**
- **Search:** Type a name or phone number to search
- **Status:** Filter by Active, Inactive, Suspended, or Blacklisted
- **Group:** Filter by assigned group
- **Crop:** Filter by main crops
- **Location:** Filter by location text
- **Assigned Officer:** Filter by field officer

**How to use it:**
1. Go to **Members** in the sidebar.
2. Use the **search bar** at the top to type a name or phone number.
3. Use the **dropdown filters** below the search bar to narrow results by status, group, crop, etc.
4. Results update automatically as you type or select filters.
5. Pagination controls at the bottom let you navigate through pages of results.

---

### 2.1.5 Attach Documents/Photos to a Member Profile

**Status:** Done

**How it works:** Each member has a Documents section on their profile where you can upload files. Documents are categorised as ID Card, Photo, Agreement, or Other. Files are stored on the server and linked to the member record.

**How to use it:**
1. Go to **Members** and click on a member's name to open their profile.
2. Click the **"Documents"** tab on the member profile page.
3. Click **"Upload Document"**.
4. Enter a title, select a category (ID Card, Photo, Agreement, Other), and choose the file.
5. Click **Upload**. The document appears in the list.
6. To remove a document, click the delete icon next to it.

---

### 2.1.6 Bulk Import Members from Excel/CSV

**Status:** Done

**How it works:** Instead of entering members one by one, you can upload a spreadsheet (Excel `.xlsx` or CSV `.csv`) with many members at once. The system validates each row and reports any errors.

**How to use it:**
1. Go to **Members** in the sidebar.
2. Click the **"Import"** button.
3. First, download the **template file** using the "Download Template" link. This gives you an Excel file with the correct column headers.
4. Fill in your member data in the template, following the format exactly.
5. Upload the filled file by clicking **"Choose File"** and selecting your spreadsheet.
6. Click **"Import"**. The system will process the file and show you how many members were imported and any errors.
7. You can also **export** the current member list to Excel using the "Export" button.

---

### 2.1.7 View Member History/Timeline

**Status:** Done

**How it works:** Every member has a timeline that shows a chronological history of all their key activities — collections they made, payments received, loans taken, and field visits. This gives you a complete picture of a member's involvement.

**How to use it:**
1. Go to **Members** and click on a member's name.
2. On the member profile page, you will see the **"Overview"** tab which shows the timeline.
3. The timeline displays entries in chronological order with dates and descriptions.
4. You can also view specific tabs for **Collections**, **Payments**, **Loans**, and **Documents** for detailed views.

---

## 2.2 Groups & Organisation Structure

### 2.2.1 Create Groups/Branches/Communities

**Status:** Done

**How it works:** Groups are used to organise members into smaller units. Each group has a name, type, optional description, and location. Group types include: Organisation, Region, District, Group, and Community.

**How to use it:**
1. Navigate to **Groups** in the sidebar.
2. Click **"Create Group"**.
3. Enter the group name, select the type (Region, District, Group, or Community), add a description and location.
4. Click **Save**. The group appears as a card on the Groups page.

---

### 2.2.2 Assign Members to Groups

**Status:** Done

**How it works:** Members can be assigned to any group. A member can belong to one group at a time. When assigning, you select multiple members and add them to a group in one action.

**How to use it:**
1. Go to **Groups** and click on a group card to open its detail view.
2. Click **"Assign Members"**.
3. Select one or more members from the list.
4. Click **Confirm**. The members are now part of that group.
5. You can also assign a group when creating or editing a member from the Members page.

---

### 2.2.3 Assign a Group Leader

**Status:** Done

**How it works:** Each group can have one leader or responsible officer assigned. The leader is selected from the existing staff users (Admin, Manager, or Field Officer).

**How to use it:**
1. Go to **Groups** and click on a group card.
2. Click **Edit** (pencil icon).
3. Select a **Leader** from the dropdown (shows all staff users).
4. Click **Save**. The leader's name and role now appear on the group card.

---

### 2.2.4 Support a Simple Hierarchy

**Status:** Done

**How it works:** Groups support a parent-child hierarchy: Organisation > Region > District > Group > Community. This is implemented through a `parentId` field that links each group to its parent. The Groups page shows this hierarchy, and the API supports returning groups with hierarchy and member counts.

**How to use it:**
1. Create a **Region** group first (type: Region).
2. Create a **District** group and set its parent to the Region.
3. Create a **Group** and set its parent to the District.
4. Create a **Community** and set its parent to the Group.
5. On the Groups page, use the **hierarchy view** to see the structure with member counts at each level.

---

### 2.2.5 Staff Users with Basic Roles

**Status:** Done

**How it works:** The system supports three staff roles with different permission levels:

| Role | Can Do | Cannot Do |
|---|---|---|
| **Admin** | Full access to everything: manage users, approve loans, import/export data, CRUD on all records | — |
| **Manager** | Manage members, groups, collections, payments, expenses, request loans, view reports | Cannot manage users, cannot approve/disburse loans |
| **Field Officer** | Record collections, record field visits, view assigned members, request loans | Cannot create members, manage groups, or access reports |

**How to use it:**
1. Navigate to **Users** in the sidebar (Admin only).
2. Click **"Add User"**.
3. Enter name, email, password, phone, and select a role (Admin, Manager, or Field Officer).
4. Optionally assign an area and organisation.
5. Click **Create**. The new user can now log in with their email and password.

---

## 2.3 Farm & Crop Profiles

### 2.3.1 Record Crops Grown by Each Farmer

**Status:** Done

**How it works:** Each member can have a Farm Profile with multiple crops. Each crop record stores the crop name, variety, area in hectares, planting date, season, expected harvest date, growing status, and yield data.

**How to use it:**
1. Go to **Members**, click on a member's name.
2. Click the **"Farm & Crops"** tab.
3. If no farm profile exists, click **"Create Farm Profile"** and fill in farm size, location, and GPS.
4. Click **"Add Crop"** to add individual crops with details (name, variety, area, planting date, season, expected harvest, status).
5. To update a crop (e.g., mark as harvested and add actual yield), click the crop and edit it.

---

### 2.3.2 Record Farm Size and Farm Location/GPS

**Status:** Done

**How it works:** The Farm Profile stores the overall farm size (in hectares), a text location, and GPS coordinates (latitude and longitude).

**How to use it:**
- When creating a Farm Profile (from the member's Farm & Crops tab), fill in the **Farm Size**, **Location**, and **GPS** fields.
- These can be updated at any time by editing the farm profile.

---

### 2.3.3 Record Season/Planting Period

**Status:** Done

**How it works:** Each crop record includes a **season** field (e.g., "Major", "Minor") and a **planting date**. The Farm Profile also has a **current season** field. Organisation settings define available seasons.

**How to use it:**
- When adding a crop, select the **season** from the dropdown and set the **planting date** using the date picker.
- The system uses these fields for filtering and reporting.

---

### 2.3.4 Record Estimated Yield and Actual Yield/Harvest Summary

**Status:** Done

**How it works:** Each crop record has both an **estimated yield** (set when planting) and an **actual yield** (set when harvested). The crop status tracks progress: Planted > Growing > Harvested > Failed.

**How to use it:**
1. When adding a crop, enter the **Estimated Yield** (in the same unit as your farm measurement).
2. When the crop is harvested, edit the crop, change the **Status** to "Harvested", and enter the **Actual Yield**.
3. Reports can compare estimated vs actual yield across the organisation.

---

### 2.3.5 Disease/Pest Monitoring and Input Inventory (Excluded from MVP)

**Status:** Intentionally deferred

These features were explicitly excluded from the MVP scope. They can be added in future iterations if needed.

---

## 2.4 Produce / Collection Records

### 2.4.1 Record Farmer/Member, Crop/Product, Quantity/Weight, Date, and Collection Location

**Status:** Done

**How it works:** A collection record captures who delivered what, how much, when, and where. Each record is linked to a member and stores the crop name, quantity, unit (kg, lb, bag, or tonne), date, and collection location.

**How to use it:**
1. Navigate to **Collections** in the sidebar.
2. Click **"Record Collection"**.
3. Select the **Member** from the dropdown.
4. Enter the **Crop** name, **Quantity**, **Unit**, and **Date**.
5. Enter the **Collection Location** (text) and optionally GPS coordinates.
6. Click **Save**.

---

### 2.4.2 Record Basic Quality Grade, Price Per Unit, and Calculated Total Value

**Status:** Done

**How it works:** Each collection record stores a quality grade (A, B, or C — configurable per organisation), a price per unit, and automatically calculates the total value (quantity × price). The total value updates automatically via a pre-save hook on the server.

**How to use it:**
1. When recording a collection, select the **Quality Grade** from the dropdown.
2. Enter the **Price Per Unit** (in the organisation's currency, default GHS).
3. The **Total Value** is calculated and displayed automatically (Quantity × Price Per Unit).
4. The total value feeds into payment calculations and reports.

---

### 2.4.3 Add Photo and Notes

**Status:** Done

**How it works:** When recording a collection, you can optionally upload a photo of the produce and add text notes. Photos are stored on the server and displayed in the collection detail and member timeline.

**How to use it:**
1. On the **Record Collection** form, scroll to the bottom.
2. Click **"Choose File"** to upload a photo.
3. Type any relevant **Notes** in the text area.
4. Save the collection. The photo and notes are visible when viewing the collection details.

---

### 2.4.4 Record Who Captured the Transaction

**Status:** Done

**How it works:** Every collection record automatically stores the ID of the user who created it (`capturedBy`). This is set server-side from the JWT token — the user cannot fake it. It provides an audit trail for accountability.

**How to use it:**
- This happens automatically. When you log in as a user and record a collection, your identity is captured.
- In the collection list and detail views, you can see who recorded each transaction.
- The member timeline also shows which officer captured each collection.

---

### 2.4.5 Show Collection History on Member Profile and in Reports

**Status:** Done

**How it works:** Collection history appears in two places:

1. **Member Profile:** Each member has a "Collections" tab that shows all their collections in reverse chronological order with crop, quantity, grade, value, and date.
2. **Reports Page:** The organisation-wide Collection Report shows all collections across all members with filtering by date range and crop. Reports can be exported to Excel.

**How to use it:**
- **On a member profile:** Go to Members > click a member > click the "Collections" tab.
- **In reports:** Go to Reports > click "Collection Report" > set date range > view results > click "Export to Excel" to download.

---

## Additional Features Beyond MVP Scope

The following features were implemented beyond the original MVP requirements:

| Feature | Description |
|---|---|
| **Batch Management** | Group collections into batches for shipping/tracking with total weight aggregation |
| **Payment Management** | Full payment system: produce payments, membership dues, contributions, savings; auto-receipt generation; partial payment support |
| **Produce Payment from Collections** | Auto-create payments from selected collections with total value calculation |
| **Outstanding Dues Tracking** | Track and report unpaid membership dues per member |
| **Expense Tracking** | Categorised expense management (fuel, salary, transport, supplies, equipment) |
| **Loan Management** | Full loan lifecycle: request → approve → disburse → repay → complete; flat and reducing balance interest; credit score calculation |
| **Auto Loan Deduction** | Automatically deduct loan repayments from harvest produce value (up to 30%) |
| **Overdue Loan Detection** | Automatically mark loans as overdue based on due date |
| **Field Visit Logging** | Log field visits with officer, member, GPS, photos, and notes |
| **Task Management** | Create, assign, and track tasks for field officers |
| **Officer Performance Reports** | Aggregate visit counts per officer over time |
| **Dashboard** | Statistics cards, recent activity feed, and quick action buttons |
| **Reports with Excel Export** | Member, collection, payment, group, loan, and expense reports with XLSX download |
| **Multi-Organisation Support** | The system supports multiple independent organisations |

---

## Features Explicitly Deferred from MVP

| Feature | Status | Notes |
|---|---|---|
| Disease/pest monitoring | Deferred | Was excluded from MVP scope unless a pilot requires it |
| Detailed input inventory | Deferred | Was excluded from MVP scope unless a pilot requires it |

---

## How to Run the Application

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables** in `server/.env`:
   - `PORT` — Server port (default: 5000)
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — Secret key for JWT tokens
   - `JWT_EXPIRES_IN` — Token expiry (default: 7d)

3. **Seed the database** with default admin and sample organisation:
   ```bash
   npm run seed
   ```

4. **Start the development servers** (both client and server):
   ```bash
   npm run dev
   ```

5. **Open the app** at `http://localhost:5173` and log in with:
   - Email: `admin@konnectcore.com`
   - Password: `admin123`

---

## Project Structure

```
KonnectCore/
├── server/                 # Express + MongoDB backend
│   └── src/
│       ├── models/         # 11 database models
│       ├── controllers/    # 15 controller files
│       ├── routes/         # 13 route files
│       ├── middleware/     # Auth, error handling, file upload
│       └── utils/          # DB connection, Excel export
│
└── client/                 # React + Vite frontend
    └── src/
        ├── pages/          # 13 page components
        ├── components/     # 15 reusable UI components
        ├── services/       # API client (Axios)
        ├── context/        # Authentication state
        ├── config/         # Navigation menu
        └── utils/          # Constants, formatters
```
