# KonnectCore

KonnectCore is an agricultural cooperative management platform built for Ghanaian farmer organisations, cooperatives, and associations in Ghana. It helps cooperatives manage their members, track crop collections, handle payments and loans, organise groups, and monitor field officer activity -- all from a single web application.

**Tech Stack:** React 19 + Vite 8 frontend with Tailwind CSS v4, Express.js 4 + MongoDB (Mongoose) backend, JWT authentication, Multer file uploads, XLSX export

**Default Login:** `admin@konnectcore.com` / `admin123`

---

## Table of Contents

1. [How to Run the Application](#how-to-run-the-application)
2. [Side Navigation Bar -- Page-by-Page Deep Explanation](#side-navigation-bar----page-by-page-deep-explanation)
   - [Dashboard](#1-dashboard)
   - [Members](#2-members)
   - [Register Member](#3-register-member)
   - [Groups](#4-groups)
   - [Farms & Crops](#5-farms--crops)
   - [Collections](#6-collections)
   - [Payments](#7-payments)
   - [Expenses](#8-expenses)
   - [Loans](#9-loans)
   - [Field Visits](#10-field-visits)
   - [Reports](#11-reports)
   - [Users (System)](#12-users-system)
3. [Pages That Are Fully Done](#pages-that-are-fully-done)
4. [Pages That Are Partially Done (What Is Left)](#pages-that-are-partially-done)
5. [Pages Not Yet Done or Not Yet Integrated](#pages-not-yet-done-or-not-yet-integrated)
6. [Project Structure](#project-structure)
7. [Known Issues & Discrepancies](#known-issues--discrepancies)

---

## How to Run the Application

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Set up environment variables

Create or edit `server/.env`:

```
PORT=5000
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<any random secret string>
JWT_EXPIRES_IN=7d
```

### 3. Seed the database

```bash
npm run seed
```

This creates a default admin user (`admin@konnectcore.com` / `admin123`) and a sample organisation.

### 4. Start development servers

```bash
npm run dev
```

### 5. Open the app

Go to `http://localhost:5173` and log in with the default credentials above.

---

## Side Navigation Bar -- Page-by-Page Deep Explanation

The side navigation bar is defined in `client/src/config/navigation.js` and rendered inside `client/src/layouts/AppLayout.jsx`. It is organised into 5 sections: **Overview**, **Management**, **Operations**, **Insights**, and **System**. Each menu item is role-based -- admin users see everything, managers see most items, and field officers see a limited set.

---

### 1. Dashboard

**Route:** `/dashboard`  
**File:** `client/src/pages/Dashboard.jsx`  
**Who can see it:** All logged-in users (admin, manager, field officer)

#### What this page does

The Dashboard is the first page you see after logging in. It gives you a quick overview of everything happening in your cooperative at a glance. Think of it as the "home screen" that tells you the most important numbers and recent events without having to dig through individual pages.

#### How it works

When you open the Dashboard, it makes two requests to the server at the same time:
- **Stats request** (`GET /api/dashboard/stats`) -- fetches all the key numbers
- **Activity request** (`GET /api/dashboard/activity`) -- fetches the 12 most recent events

The server runs all its database queries in parallel (using `Promise.all`) so the page loads fast even with lots of data.

#### What you see on the page

**Welcome message:** At the top, it greets you by your first name ("Welcome back, John") and shows a subtitle "Here's what's happening in your cooperative". There is also a quick-action button:
- If you are a **field officer**, the button says "Record Collection" and takes you to record a new collection
- If you are an **admin or manager**, the button says "Add Member" and takes you to the member registration form

**6 Stat Cards (in a row):**
1. **Total Members** -- shows the total number of registered members in the cooperative
2. **Active Members** -- shows only members whose status is "active" (not inactive or suspended)
3. **Groups** -- shows the number of groups in the cooperative (excluding the top-level organisation node)
4. **Collections** -- shows total number of collection records, with the total weight in kilograms shown below
5. **Payments Paid** -- shows the total amount of money that has been paid out, in Ghanaian Cedis (GHS)
6. **Outstanding Dues** -- shows the total money that members still owe to the cooperative (membership dues not yet paid)

All these numbers are live -- they are calculated from the actual database every time you load the page. If you add a new member and reload the dashboard, the Total Members count will go up by one.

**Recent Activity feed (left side, taking 2/3 of the width):**
This shows the 12 most recent events in the cooperative, sorted from newest to oldest. Each event has:
- A coloured dot (green for collections, blue for members, yellow for payments, purple for visits)
- A short description ("Member added -- Kwame Asante" or "Collection recorded -- Ama Cocoa 50kg")
- The date and time it happened

**Quick Actions (right side, taking 1/3 of the width):**
Four shortcut buttons that let you jump to commonly used pages:
- **View Members** -- goes to the Members list
- **Manage Groups** -- goes to the Groups page (only for admin/manager)
- **Record Payments** -- goes to the Payments page (only for admin/manager)
- **Manage Loans** -- goes to the Loans page (only for admin/manager)

#### What is NOT yet done on this page

- **No charts or graphs.** The backend has three ready-made data endpoints (`/api/dashboard/collection-trend`, `/api/dashboard/payment-breakdown`, `/api/dashboard/member-distribution`) that return real data for line charts, pie charts, and bar charts. The `recharts` library is installed but never used. These charts would show collection trends over time, payment breakdowns by method, and member distribution across groups.
- The field officer "Record Collection" button currently navigates to `/collections/new`, which is not a registered route and silently falls through to the dashboard. It should navigate to a working collection form.

---

### 2. Members

**Route:** `/members`  
**File:** `client/src/pages/Members.jsx`  
**Who can see it:** Admin, manager, field officer

#### What this page does

The Members page is your cooperative's member directory. It shows a searchable, filterable, paginated table of every registered member. This is where you go to find a specific member, see who is in the cooperative, and manage the member list.

#### How it works

When the page loads, it sends a request to `GET /api/members` with parameters like page number, search term, status filter, crop filter, and location filter. The server searches the database and returns 20 members at a time (paginated). If you type in the search box, it waits 300 milliseconds after you stop typing (debouncing) before sending the search request -- this prevents the app from sending a request for every single keystroke.

#### What you see on the page

**Page header:** Shows "Members" as the title and a subtitle like "47 members registered" (the count updates as you filter).

**Action buttons in the header:**
- **Export** -- downloads the current filtered list of members as an Excel (.xlsx) file
- **Import** -- opens a file picker to upload a .csv or .xlsx file containing member data. The server parses the file, validates each row, creates the members, and tells you how many were imported successfully and how many had errors
- **Add Member** -- takes you to the Register Member form

**Filter bar (4 fields in a row):**
1. **Search** -- type a name, phone number, or membership number to search
2. **Status filter** -- dropdown to show only active, inactive, or suspended members
3. **Crop filter** -- dropdown to show only members who grow a specific crop (Cocoa, Maize, etc.)
4. **Location filter** -- type a village or town name to filter by location

**Members table:**
Each row shows:
- **Member** -- avatar (photo or initials) and full name
- **Membership No.** -- the auto-generated ID like KC-00001
- **Phone** -- phone number
- **Location** -- village/town
- **Crops** -- up to 2 crop badges (the crops they grow)
- **Status** -- a coloured badge (green for active, red for inactive, yellow for suspended)

Clicking any row takes you to that member's full profile page.

**Pagination (at the bottom):**
If there are more than 20 members, you see "Page 1 of 3" with Prev/Next buttons.

#### What is NOT yet done on this page

- **No group filter.** The backend supports filtering by `groupId`, but the UI does not have a dropdown to select a group. This would let you see only the members belonging to a specific group or region.
- The import feature works but does not show a preview of the data before importing -- it imports immediately.

---

### 3. Register Member

**Route:** `/members/new` (new member) or `/members/:id/edit` (edit existing)  
**File:** `client/src/pages/MemberNew.jsx`  
**Who can see it:** All logged-in users

#### What this page does

This is the form you use to add a new farmer/member to the cooperative, or to edit an existing member's information. It is a long form divided into 4 sections, each in its own card. The same form is used for both creating and editing -- if you are editing, it loads the existing data and pre-fills all the fields.

#### How it works

When you open the form for a **new member**, all fields are empty. When you open it for **editing** (by clicking "Edit" on a member profile), it loads the member's current data from the server and fills in all the fields.

When you submit the form, it sends the data as a `FormData` object (because it includes a photo file upload). The server receives it, validates the data, auto-generates a membership number like `KC-00001` if you left that field blank, saves the photo to disk, and creates the member record. Then it redirects you to the new member's profile page.

#### What you see on the page

**Section 1 -- Personal Information:**
- **First Name** (required)
- **Last Name**
- **Phone** number
- **Membership Number** (auto-generated if left blank)
- **ID Type** dropdown (National ID, Voter ID, Passport, Other)
- **ID Number**
- **Photo** upload (choose an image file from your device)

**Section 2 -- Location:**
- **Village / Town**
- **Region**
- **District**
- **GPS Latitude** and **GPS Longitude** (for mapping the member's farm location)

**Section 3 -- Agriculture:**
- **Farm Size** in hectares
- **Group** dropdown (populated from all existing groups -- lets you assign the member to a group)
- **Assigned Officer** dropdown (populated from all staff users -- assigns a field officer to manage this member)
- **Main Crops** -- a row of crop buttons (Cocoa, Coffee, Maize, Cassava, Rice, etc.). Click to select/deselect. Selected crops are highlighted in the primary colour.

**Section 4 -- Membership:**
- **Status** dropdown (Active, Inactive, Suspended)
- **Notes** (optional text area for any extra information about this member)

**Error handling:** If the server rejects the form (e.g., missing required fields), a red error banner appears at the bottom of the form explaining what went wrong.

**Buttons:** Cancel (goes back) and Register Member / Update Member (submits the form).

#### What is NOT yet done on this page

- The form is quite complete. One issue is that the `mainCrops` array is sent as a JSON-serialized string in the multipart form data, and the server stores it as a single array element rather than parsing it back. This is a known bug that could cause crop data to be stored incorrectly.

---

### 4. Groups

**Route:** `/groups`  
**File:** `client/src/pages/GroupsPage.jsx`  
**Who can see it:** Admin, manager

#### What this page does

This page lets you manage the organisational structure of your cooperative. A cooperative is usually organised in a hierarchy: an Organisation at the top, then Regions, then Districts, then Groups, then Communities. This page lets you create this structure, add members to each level, assign leaders, and visualise the whole hierarchy as a tree.

#### How it works

When the page loads, it fetches the full group hierarchy from `GET /api/groups/tree`, which returns all groups organised as a parent-child tree. It also loads all staff users (to populate the "leader" dropdown in the create form).

#### What you see on the page

**Stat cards (4 in a row):**
- **Nodes in structure** -- total number of groups/organisations, with breakdown by regions and districts
- **Members in groups** -- total members assigned across all groups
- **Sub-groups** -- number of groups and communities combined
- **Organisations** -- count of top-level organisation nodes

**Left panel -- Organisation Structure (tree view):**
This is a collapsible tree that shows your entire cooperative structure. Each node shows:
- An icon based on its type (building for Organisation, map pin for Region, landmark for District, people for Group, house for Community)
- The group name
- A badge showing how many members are assigned to it

You can expand/collapse nodes by clicking the arrow. Clicking a node selects it and shows its details on the right. Hovering reveals a "+" button to add a child node under it.

If the tree is empty (no groups created yet), you see an empty state prompting you to "Create Organisation" as the first step.

**Right panel -- Group Detail:**
When you click a group in the tree, the right side shows:
- **Group header** -- icon, name, type badge, member count, leader name, location
- **Action buttons** -- Edit, Assign members, Delete
- **Description** (if any)
- **Two columns:**
  - **Members card** -- list of members assigned to this group, with avatar, name, membership number, phone. Each member has a remove button (X). There is also a "Remove selected" button for bulk removal.
  - **Child nodes card** -- list of sub-groups nested under this group. Clicking a child node selects it in the tree.
  - **Details card** -- shows name, type, leader, location, and creation date.

**Modals:**
- **New Group / Edit Group** -- form with Name, Type (Organisation/Region/District/Group/Community), Parent (filtered to only valid parent types), Leader (from staff users), Location, Description
- **Assign Members** -- shows a searchable list of unassigned members (members not in any group). You can search by name, select multiple members with checkboxes, and assign them all at once.
- **Remove Members** -- shows the current group's members with checkboxes for bulk removal
- **Delete Group** -- confirmation dialog before deleting

#### What is NOT yet done on this page

This page is actually **fully implemented** with all the key features: hierarchy tree view, create/edit/delete groups, assign/remove members, and leader assignment. It is one of the more complete pages in the application.

---

### 5. Farms & Crops

**Route:** `/farms`  
**File:** `client/src/pages/FarmsPage.jsx`  
**Who can see it:** Admin, manager

#### What this page does

This page has two views (tabs): **Farms** and **Crop Catalog**. The Farms tab shows a list of all farm profiles across all members -- essentially a view of every farm in the cooperative. The Crop Catalog is a reference list of crops that the cooperative deals in (like a master list of available crops).

#### How it works

**Farms tab:** Fetches farm profiles from `GET /api/farms` with search, crop, status, and location filters. Each farm is linked to a member, so the list shows the member's name alongside their farm details.

**Crop Catalog tab:** Fetches the crop reference list from `GET /api/crops`. These are the standard crops (Cocoa, Maize, Cassava, etc.) that are used throughout the application.

#### What you see on the page

**Tab switcher:** Two buttons at the top -- "Farms" and "Crop Catalog".

**Farms tab:**
- **Filter bar** -- Search (by member name/phone/ID), Crop dropdown, Status dropdown (Planted/Growing/Harvested/Failed), Location text
- **Farms table** with columns:
  - Member (avatar + name + membership number)
  - Farm Size (in hectares)
  - Location
  - Crops (up to 3 crop badges with status colours)
  - GPS coordinates
  - Last Updated date

Clicking a farm row opens a **slide-out drawer** (right side) showing the full farm profile:
- Member info at the top (clickable to go to member profile)
- Farm size, planted area, location, season, GPS
- List of all crops on the farm with their status, variety, area, planting date, expected harvest date, estimated yield, actual yield
- A button to go to the member's full profile

**Crop Catalog tab:**
- Table showing all crops with: Name, Category (cash crop, cereal, etc.), Default Unit (kg, bag, bunch), Status (Active/Inactive badge)
- Action buttons: Edit (pencil icon), Delete (trash icon)
- "Add Crop" button in the header

**Modals:**
- **Add/Edit Crop** -- form with Crop name, Category, Default unit, Active toggle
- **Delete Crop** -- confirmation dialog

#### What is NOT yet done on this page

This page is **fully implemented**. Farm profiles can be viewed, crop catalog can be managed (add/edit/delete), and farm details are shown in the drawer. Previously this page was a "Coming Soon" placeholder, but it has since been fully built out.

---

### 6. Collections

**Route:** `/collections`  
**File:** `client/src/pages/CollectionsPage.jsx`  
**Who can see it:** Admin, manager, field officer

#### What this page does

This page manages produce collection records -- when a farmer brings their harvest (like cocoa beans or maize) to the cooperative, it gets recorded here. It has two views: **Collections** (individual records) and **Batches** (groups of collections bundled together for shipping to a buyer).

#### How it works

The page loads collections from `GET /api/collections` with search, crop, and date range filters. It also calculates summary totals (total count, total weight in kg, total value in GHS) from the loaded data. When you switch to the Batches tab, it loads batch data from `GET /api/collections/batches`.

#### What you see on the page

**Page header:** Shows "Collections" with a "Record Collection" button that opens the collection form modal.

**View switcher:** Two tabs -- "Collections" and "Batches".

**Collections view:**
- **3 stat cards:**
  - Collection records (total count)
  - Total quantity (in kg)
  - Total value (in GHS)
- **Filter bar:** Search (by member name/phone), Crop dropdown, From date, To date
- **Collections table** with columns:
  - Date
  - Member name (clickable to go to member profile)
  - Crop name + batch number badge (if assigned to a batch)
  - Quantity + unit
  - Quality Grade badge (Grade A, B, C, Premium, Standard, Reject)
  - Total Value (auto-calculated as quantity x price)
  - Captured By (which staff member recorded it)
  - Action buttons: Edit (pencil), Delete (trash)

**Batches view:**
- Table of shipping batches with: Batch Number, Status badge (open/closed/shipped/delivered), Total Weight, Collection Point, Buyer, Created date, Actions (View/Edit/Delete)
- "New Batch" button to create a new batch

**Modals:**
- **Record/Edit Collection** (shared `CollectionModal` component):
  - Member search (type to search, click to select)
  - Crop dropdown (loads from both the hardcoded list and the crop catalog)
  - Quantity + Unit (kg/lb/bag/tonne)
  - Quality Grade (A/B/C/Premium/Standard/Reject)
  - Price per unit (auto-fills from organisation default prices if configured)
  - Total value display (auto-calculated)
  - Collection date (with date picker for back-dating)
  - Collection Location, GPS coordinates
  - Photo upload
  - Notes

- **New Shipping Batch:**
  - Batch number (e.g., BATCH-2026-001)
  - Collection point (e.g., Sunyani depot)
  - Buyer name
  - List of unassigned collections with checkboxes to select which ones go in this batch

- **Batch Detail:** Shows all collections in the batch with their details
- **Batch Edit:** Update batch status, collection point, buyer, certification
- **Delete Confirmation:** For both collections and batches

#### What is NOT yet done on this page

This page is **fully implemented**. It has collection recording with all fields (including date picker for back-dating), batch management (create/view/edit/delete), member search, filtering, and the full collection lifecycle. Previously this page had several gaps (no date picker, no batch UI, broken "Record Collection" button), but all of those have been addressed.

---

### 7. Payments

**Route:** `/payments`  
**File:** `client/src/pages/PaymentsPage.jsx`  
**Who can see it:** Admin, manager

#### What this page does

This is the financial hub of the cooperative. It tracks all money flowing in and out: membership dues collected from farmers, contributions, savings deposits, and produce payments (money paid to farmers for their harvest). It also shows who still owes money (outstanding dues).

#### How it works

When the page loads, it makes two requests: one for all payment records (`GET /api/payments`) and one for outstanding dues data (`GET /api/payments/outstanding`). The outstanding endpoint calculates how much each member still owes versus how much they have paid.

#### What you see on the page

**Page header:** "Payments & Dues" with a "Record Payment" button.

**Tab switcher:** Two tabs -- "All Payments" and "Outstanding Dues".

**All Payments tab:**
- **4 stat cards:**
  - Collected (momo + cash) -- total dues, contributions, and savings received
  - Paid out to members -- total produce payments made
  - Mobile money volume -- total transactions through Hubtel
  - Outstanding dues -- total money still owed by members, with count of members who owe
- **Filter bar:** Status dropdown (All/Paid/Part-paid/Pending/Cancelled), Type dropdown (All/Dues/Contribution/Savings/Produce Payment), Search (member name or number)
- **Payments table** with columns:
  - Date
  - Member name (clickable link to member profile)
  - Type (coloured by type: green for dues, blue for contribution, yellow for savings, red for expense)
  - Method (cash, mobile_money, bank_transfer, etc.)
  - Amount
  - Status badge (paid/part_paid/pending/cancelled)
  - Gateway status (for Hubtel mobile money transactions -- shows simulated or live status)
  - Receipt number
  - Delete button (admin only)

**Outstanding Dues tab:**
- Table showing each member who owes money:
  - Member name and membership number
  - Total dues owed
  - Amount already paid
  - Outstanding balance (in red)
  - "Record payment" button -- clicking it opens the payment form pre-filled with that member's name and the outstanding amount

**Payment Modal** (shared `PaymentModal` component):
- **Member search** -- type to search, click to select (or member is pre-filled if opened from a specific context)
- **Type** -- dropdown: Dues, Contribution, Savings, Produce Payment
- **Method** -- dropdown: Cash, Mobile Money (Hubtel), Bank Transfer, Cheque, Other
- **Amount** (total amount owed) and **Amount Paid** (how much is being paid now)
- **Payment date** (with date picker for back-dating)
- **Reference number** (optional external reference)
- **Description** (optional note)
- **Mobile money fields** (shown only when method is "Mobile Money"):
  - Mobile money number (phone number)
  - Network dropdown (MTN, Vodafone/Telecel, AirtelTigo)
  - A note explaining that Hubtel will process the transaction (or simulate it in demo mode)
- **Payable/Paid status bar** at the bottom showing the payment status (paid, part_paid, or pending)

#### What is NOT yet done on this page

This page is **fully implemented**. It has payment recording with member search, mobile money integration (Hubtel), outstanding dues tracking with quick-pay, filtering, stat cards, and admin delete capability. Previously this was a read-only page with no recording capability, but the PaymentModal and all the recording features have been added.

---

### 8. Expenses

**Route:** `/expenses`  
**File:** `client/src/pages/ExpensesPage.jsx`  
**Who can see it:** Admin, manager

#### What this page does

This page tracks the cooperative's operating costs -- money the cooperative spends on things like fuel, salaries, transport, supplies, and equipment. It helps you understand where the cooperative's money is going and how much is being spent in each category.

#### How it works

Loads expenses from `GET /api/expenses` with optional filters (category, date range). The page calculates totals and per-category breakdowns from the loaded data.

#### What you see on the page

**Page header:** "Expenses" with an "Add Expense" button.

**Stat cards (4 in a row):**
- **Total expenses** -- sum of all expense amounts, with the count of records
- **Fuel** -- total spent on fuel
- **Salary** -- total spent on salaries
- **Transport** -- total spent on transport

**Filter bar:**
- Category dropdown (All/Fuel/Salary/Transport/Supplies/Equipment/Other)
- From date
- To date

**Expenses table** with columns:
- Date
- Category (with an icon: fuel pump for Fuel, people for Salary, truck for Transport, package for Supplies, wrench for Equipment, ellipsis for Other)
- Description
- Recorded by (which staff member created it)
- Amount
- Delete button

**Expense Modal:**
- Category dropdown (Fuel, Salary, Transport, Supplies, Equipment, Other)
- Amount (in GHS)
- Date
- Receipt / reference number (optional)
- Description (optional text)

#### What is NOT yet done on this page

This page is **fully implemented**. It has expense recording, filtering by category and date range, stat cards with category breakdowns, and delete capability. Previously this page did not exist at all, but it has been fully built.

---

### 9. Loans

**Route:** `/loans` (list) or `/loans/:id` (detail)  
**Files:** `client/src/pages/LoansPage.jsx`, `client/src/pages/LoanDetailPage.jsx`  
**Who can see it:** Admin, manager (list); admin, manager, field officer (detail)

#### What this page does

This page manages the cooperative's loan programme -- money lent to farmers that they pay back over time. It covers the full loan lifecycle: requesting a loan, approving it, disbursing the money, recording repayments, checking for overdue loans, and auto-deducting from harvest payments.

#### How it works

The loans list page loads all loans from `GET /api/loans`. It also has client-side filtering (by status, type, and member search). The loan detail page loads a single loan from `GET /api/loans/:id` with its full repayment schedule and credit history.

#### What you see on the page

**Loans List page (`/loans`):**

**Page header:** "Loan Management" with two action buttons:
- **Check Overdue** -- triggers the server to scan all loans and mark any that are past their due date as "overdue"
- **Request Loan** -- opens the loan request form

**Stat cards (4 in a row):**
- **Total lent (active)** -- sum of amounts for all active loans
- **Outstanding balance** -- total money still to be collected from borrowers
- **Completed loans** -- number of fully repaid loans
- **Overdue** -- total money in overdue loans, with count

**Filter bar:** Status dropdown, Type dropdown (emergency/institutional/seasonal/individual), Search by member name

**Loans table** with columns:
- Member name (clickable to member profile)
- Type (emergency/institutional/seasonal/individual loan)
- Amount
- Interest rate (%)
- Amount repaid
- Balance (remaining)
- Due date
- Credit score (colour-coded: green 50+, yellow 30-49, red below 30)
- Status badge (pending/approved/disbursed/overdue/completed/rejected)
- Action buttons:
  - **View** -- goes to the loan detail page
  - **Approve** (for pending loans) -- approves the loan
  - **Disburse** (for approved loans) -- marks the money as given out
  - **Repay** (for overdue loans) -- goes to detail page to record repayment

**Loan Detail page (`/loans/:id`):**

**Overdue warning banner:** If the loan is overdue, a red banner appears at the top warning that the loan is overdue.

**Header card:** Shows loan type, member name, membership number, status badge, and credit score.

**Summary card (2/3 width):**
- Amount, Interest rate and type, Total repayable, Amount repaid, Balance
- Duration (months), Due date, Requested date, Requested by
- Approved date/by, Disbursed date
- Purpose and Notes (if any)

**Repayment card (1/3 width):**
- Outstanding balance (big number in a highlighted box)
- "Record Repayment" button (opens the repayment modal)
- "Auto-deduct from harvest" button (opens a modal where you enter the produce value, and up to 30% is automatically deducted against active loans)

**Credit history card:** Shows past credit score changes with dates.

**Repayment Schedule card:** Timeline of all repayments made, showing amount, method, date, and who recorded it.

**Loan Request Modal:**
- Member search (type to find the member)
- Loan type dropdown
- Amount
- Interest rate (%)
- Duration (months)
- Purpose (text)
- Notes

**Repayment Modal:**
- Amount to repay
- Payment method (cash/mobile_money/bank_transfer)
- Payment date
- Notes

#### What is NOT yet done on this page

This page is **fully implemented**. The full loan lifecycle works: request, approve, disburse, repay (manual and auto-deduct from harvest), overdue detection, credit scoring, and the repayment schedule timeline. Previously there was no loan request form and no repayment UI, but both have been added.

---

### 10. Field Visits

**Route:** `/visits`  
**File:** `client/src/pages/VisitsPage.jsx`  
**Who can see it:** Admin, manager, field officer

#### What this page does

Field visits are when a field officer goes out to visit a farmer -- checking on their crops, discussing issues, collecting information, or providing support. This page is supposed to show all recorded visits and let officers log new ones.

#### How it works

The page loads visits from `GET /api/visits` and displays them in a simple list. That is all it currently does.

#### What you see on the page

**Page header:** "Field Visits" with subtitle "Recorded visits to members". There is **no action button** to record a new visit.

**Visits list:**
Each visit shows:
- Member avatar and name
- Notes (what the visit was about)
- Officer name (who made the visit)
- Date and time

If there are no visits, an empty state says "No visits recorded yet."

#### What is NOT yet done on this page

This page is **read-only and incomplete**. Here is what is missing:

- **No "Record Visit" form.** The backend has a fully working endpoint (`POST /api/visits`) that accepts member ID, date, notes, GPS coordinates, photo upload, and follow-up flag. But there is no form in the UI to create a new visit record.
- **No assigned member view for field officers.** The backend has an endpoint (`GET /api/visits/me/members`) that returns only the members assigned to a specific officer. But the UI does not filter or scope anything for field officers -- they see the same full list as everyone else.
- **No visit detail view.** Clicking a visit does not open any detail page or modal.
- **No follow-up tracking.** The backend supports a `followUp` flag on visits, but there is no UI to set or view follow-ups.
- **No GPS/photo display.** Visits can have GPS coordinates and photos, but neither is shown in the list.
- **No officer performance view.** The backend has `GET /api/visits/me/performance` for officer stats, but no UI renders this.
- **No task management.** The backend has a Task model (`server/src/models/Task.js`) with assign, list, and update endpoints, but there is no Task page or UI at all.

---

### 11. Reports

**Route:** `/reports`  
**File:** `client/src/pages/ReportsPage.jsx`  
**Who can see it:** Admin, manager

#### What this page does

This page lets you generate and download reports about your cooperative's data. Reports are exported as Excel files (.xlsx) that you can open in Microsoft Excel or Google Sheets. There are 5 report types available.

#### How it works

When you click "Export Excel" on any report, the page makes a direct `fetch` request (not using the shared axios instance) to `/api/reports/{type}?format=xlsx&from=..&to=..`. The server generates the Excel file using the `xlsx` library and sends it back as a binary blob. The browser then downloads it.

#### What you see on the page

**Date filter card:**
- From Date picker
- To Date picker
- Clear Dates button

**Report cards (5 in a row):**
1. **Member Report** -- "All members with contact details and status"
2. **Collection / Harvest Report** -- "Harvests by crop, date, group and member"
3. **Payment Report** -- "Payments by status and date range"
4. **Group Summary** -- "Members, harvest and payment summaries by group"
5. **Loan Report** -- "Loans outstanding, repaid and status"

Each card has a spreadsheet icon, the report name, a short description, and an "Export Excel" button.

When you click Export, the button shows a loading state while the file is being generated, then the browser downloads the `.xlsx` file.

#### What is NOT yet done on this page

- **No dropdown filters.** The backend supports filtering reports by crop, group, member, and payment status. But the UI only has date range filters. Adding dropdowns for these would let you generate more targeted reports (e.g., "collections only for Cocoa" or "payments only for Group X").
- **No CSV export.** Only Excel (.xlsx) files are generated. The `json2csv` library is installed in `package.json` but never used. Adding CSV export would let users open reports in simpler tools.
- **No preview.** You cannot preview the report before downloading -- it downloads immediately.
- **No expense report on the frontend.** The backend has an expense report endpoint (`GET /api/reports/expenses`), but it is not listed among the available reports on this page.
- **No charts or visualisations.** The reports are purely tabular data exports. There are no charts, graphs, or visual summaries.
- The reports use `alert()` for error messages instead of toast notifications.

---

### 12. Users (System)

**Route:** `/users`  
**File:** `client/src/pages/UsersPage.jsx`  
**Who can see it:** Admin only

#### What this page does

This is the staff management page. It lets the admin create and manage the staff accounts that can log into the system. There are three types of staff: Admin (full access), Manager (most access), and Field Officer (limited access for field work).

#### How it works

Loads all users from `GET /api/users`. Creating a user sends the data to `POST /api/users`. New users are created with a default password of `password123` that they should change on first login.

#### What you see on the page

**Page header:** "Staff Users" with subtitle "Manage admin, manager and field officer accounts". A "New User" button.

**Users list:**
Each user row shows:
- Avatar (with initials)
- Name
- Email and phone
- Assigned area (if any)
- Active/Inactive badge
- Role badge (admin/manager/fieldOfficer)

**Create User Modal:**
- Name (required)
- Email (required)
- Phone
- Role dropdown (Admin, Manager, Field Officer)
- Assigned Area (text field for the geographic area this officer covers)
- Note: "Default password: password123"

#### What is NOT yet done on this page

- **No edit user functionality.** You can create users but cannot edit their name, email, phone, role, or assigned area after creation.
- **No delete/deactivate user.** There is no way to deactivate or delete a user account from the UI.
- **No password reset.** No way to reset a user's password if they forget it.
- **No user profile.** No way for users to view or edit their own profile settings.
- Error handling uses `alert()` instead of toast notifications.

---

## Pages That Are Fully Done

The following sidebar pages are **fully implemented** with all major features working end-to-end (form -> API -> database -> display):

| # | Page | What Works |
|---|------|------------|
| 1 | **Members** | List, search (debounced), filter by status/crop/location, pagination, import from Excel/CSV, export to Excel, empty states, loading skeletons |
| 2 | **Register Member** | Full form (personal info, location, GPS, agriculture, crops, group, officer, status, photo upload), works for both create and edit, auto-generates membership number |
| 3 | **Groups** | Hierarchy tree view (expandable/collapsible), create/edit/delete groups, assign members to groups (search + multi-select), remove members from groups, leader assignment, stat cards, 5-level hierarchy (Organisation > Region > District > Group > Community) |
| 4 | **Farms & Crops** | Farm list with filters, slide-out drawer with farm details, crop catalog management (add/edit/delete crops), crop status tracking (planted/growing/harvested/failed), GPS coordinates |
| 5 | **Collections** | Full collection list with filters (search/crop/date), record/edit/delete collections with all fields (member search, crop, quantity, grade, price, date, location, GPS, photo, notes), batch management (create/view/edit/delete batches), stat cards, total value auto-calculation |
| 6 | **Payments** | Full payment list with filters (status/type/search), record payments with member search, payment types (dues/contribution/savings/produce_payment), payment methods (cash/mobile_money/bank_transfer/cheque), mobile money via Hubtel integration, outstanding dues tab with per-member breakdown and quick-pay, stat cards, admin delete |
| 7 | **Expenses** | Full expense list with filters (category/date range), add/edit/delete expenses, category breakdown stat cards, 6 categories (fuel/salary/transport/supplies/equipment/other) |
| 8 | **Loans** | Full loan list with filters (status/type/search), approve/disburse buttons, loan request modal (member search, type, amount, interest, duration, purpose), loan detail page with full summary, repayment schedule timeline, record repayment, auto-deduct from harvest, credit score display, credit history, overdue detection |
| 9 | **Users** | Staff user list, create new users with name/email/phone/role/assigned area, role-based display |

---

## Pages That Are Partially Done

These pages exist and have some working features, but are missing important functionality:

### Dashboard (partially done)

| Feature | Status | Details |
|---------|--------|---------|
| 6 stat cards with live data | Done | Total Members, Active Members, Groups, Collections, Payments Paid, Outstanding Dues |
| Recent activity feed | Done | Shows 12 latest events (members, collections, payments, visits) |
| Quick actions | Done | Links to Members, Groups, Payments, Loans |
| Charts / graphs | **Not done** | Backend endpoints exist (`/api/dashboard/collection-trend`, `/api/dashboard/payment-breakdown`, `/api/dashboard/member-distribution`) returning real data. `recharts` is installed but never used. No line charts, pie charts, or bar charts render anywhere. |
| Officer "Record Collection" button | **Broken** | Navigates to `/collections/new` which is not a registered route |

### Reports (partially done)

| Feature | Status | Details |
|---------|--------|---------|
| Date range filter | Done | From/To date pickers |
| Excel export for 5 report types | Done | Members, Collections, Payments, Groups, Loans |
| Dropdown filters (crop, group, member, status) | **Not done** | Backend supports all these filters; UI only has date range |
| CSV export | **Not done** | `json2csv` library is installed but unused |
| Expense report on frontend | **Not done** | Backend endpoint exists but not listed on the page |
| Report preview | **Not done** | Downloads immediately without preview |
| Charts / visual summaries | **Not done** | Reports are purely tabular data |
| Toast notifications for errors | **Not done** | Uses `alert()` instead of toasts |

### Field Visits (partially done -- mostly incomplete)

| Feature | Status | Details |
|---------|--------|---------|
| View visits list | Done | Shows all visits with member name, officer, notes, date |
| Record a new visit | **Not done** | No form exists. Backend `POST /api/visits` is ready |
| Assigned member view for officers | **Not done** | Backend `GET /api/visits/me/members` exists but no UI |
| Visit detail view | **Not done** | Clicking a visit does nothing |
| GPS / photo display | **Not done** | Backend supports both; UI shows neither |
| Follow-up tracking | **Not done** | Backend `followUp` flag exists; no UI |
| Officer performance stats | **Not done** | Backend `GET /api/visits/me/performance` exists; no UI |

---

## Pages Not Yet Done or Not Yet Integrated

These are features, pages, or integrations that either have no UI at all, or exist on the backend but have never been connected to the frontend:

### Not Yet Integrated (Backend Ready, No Frontend)

| Feature | Backend Status | What Needs to Be Done |
|---------|---------------|----------------------|
| **Task Management** | Model exists (`server/src/models/Task.js`), API endpoints exist for creating/listing/updating tasks | Build a Tasks page with create/assign/update tasks for field officers |
| **Dashboard Charts** | 3 data endpoints ready (`collection-trend`, `payment-breakdown`, `member-distribution`) | Build chart components using `recharts` (line chart for collection trends, pie chart for payment breakdown, bar chart for member distribution) |
| **Audit Log** | Not implemented at all (no model, no routes, no middleware) | Build the entire audit trail: AuditLog model, middleware to log all create/update/delete operations, admin viewer page |
| **System Configuration UI** | `Organisation.settings` schema exists with fields for defaultCropPrices, qualityGrades, seasons, deductions | Build an admin settings page where the admin can configure default crop prices, quality grades, growing seasons, and loan deduction percentages |
| **Organisation Management UI** | `POST /api/organisations` API exists (admin-only) | Build a page where the admin can create/edit the organisation details, logo, and settings |
| **Crop Reference Management** | `GET/POST/PUT/DELETE /api/crops` endpoints exist | Build an admin page for managing the crop catalog (the Crop Catalog tab on FarmsPage partially covers this, but a standalone management page is needed) |
| **Batch Management (enhanced)** | Batch CRUD endpoints exist, basic UI exists on Collections page | Enhance with batch tracking, status workflow (open -> shipped -> delivered), and batch reports |
| **Officer Performance Dashboard** | `GET /api/visits/me/performance` endpoint exists | Build a page showing each officer's visit statistics, assigned members, and activity metrics |
| **Mobile Money Gateway (Hubtel)** | `server/src/services/hubtel.service.js` exists (likely a stub) | Complete the Hubtel integration for real mobile money send/receive transactions (currently simulated in demo mode) |

### Not Yet Started (No Backend or Frontend)

| Feature | What Needs to Be Done |
|---------|----------------------|
| **Audit Trail (Phase 11)** | Create AuditLog model (who did what, when, on which record), audit middleware that automatically logs all data changes, and an admin audit log viewer page |
| **CSV Export** | Implement CSV export alongside Excel export using the already-installed `json2csv` library |
| **Offline-First Mobile Support** | Service worker registration, local data caching, sync when online |
| **SMS / Notifications** | SMS gateway integration for sending notifications to farmers (loan reminders, meeting announcements, payment confirmations) |
| **Multi-Tenant Organisation Isolation** | Enforce `organisationId` filtering on all queries so each cooperative only sees its own data |
| **Soft Delete for Members** | Currently uses hard delete which can orphan financial records. Need to implement soft delete (mark as deleted but keep the record) |
| **Scheduled Loan Overdue Detection** | Currently manual (click "Check Overdue"). Should run automatically on a schedule (e.g., every 6 hours) |
| **PDF Export** | Generate PDF versions of reports and member profiles |
| **Farmer Self-Service Portal** | USSD or web portal where farmers can check their own balance, collections, and loan status |
| **Accounting Integration** | Balance sheet, income statement, cash flow tracking |
| **Document Management Enhancements** | Currently basic upload/download. Could add document types, expiry dates, verification status |
| **Dashboard Customisation** | Let users choose which cards/widgets appear on their dashboard |

---

## Project Structure

```
KonnectCore/
├── README.md                    # This file
├── package.json                 # Root scripts (dev, seed, build)
├── server/                      # Express + MongoDB backend
│   └── src/
│       ├── controllers/         # 16 controller files
│       ├── models/              # 13 models: User, Organisation, Member, Group,
│       │                        #   FarmProfile, Crop, Collection, Batch, Payment,
│       │                        #   Expense, Loan, FieldVisit, Task
│       ├── routes/              # 14 route files
│       ├── middleware/          # Auth, error, upload, validation
│       ├── services/            # Overdue detection, Hubtel mobile money
│       ├── utils/               # DB connection, Excel export
│       └── seed.js              # Database seeder (admin + sample org)
└── client/                      # React + Vite frontend
    └── src/
        ├── pages/               # 17 pages (Dashboard, Members, MemberDetail,
        │                        #   MemberNew, Groups, FarmsPage, CollectionsPage,
        │                        #   PaymentsPage, ExpensesPage, LoansPage,
        │                        #   LoanDetailPage, VisitsPage, ReportsPage,
        │                        #   UsersPage, Login, Landing, ComingSoon)
        ├── components/          # UI library (15 components) + collection/loan/payment modals
        ├── services/            # Axios API client with JWT auto-attach
        ├── context/             # AuthContext (auth state, login, logout, role check)
        ├── config/              # Navigation menu (role-based visibility)
        ├── layouts/             # AppLayout (sidebar + topbar shell)
        └── utils/               # Constants (crops, roles, statuses), formatters
```

---

## Known Issues & Discrepancies

- **Theme deviation:** The design spec called for sky-blue (`#0EA5E9`) accents. The actual theme uses teal primary (`#0F766E`) with blue secondary (`#2563EB`). The dark-blue sidebar (`#0F172A`) matches the spec.
- **mainCrops serialization bug:** When registering a member, the `mainCrops` array is JSON-stringified and sent as a multipart form field. The server stores the serialized string as a single array element instead of parsing it back into an array (`MemberNew.jsx:126-127`).
- **Dead code for default crop prices:** The collection controller tries to read `req.user.settings?.defaultCropPrices` to auto-fill prices, but the User model has no `settings` field. The organisation's configured default prices are never actually applied.
- **Multi-tenant data isolation not enforced:** Most queries are global and not filtered by `organisationId`. In a multi-organisation setup, one cooperative could see another's data.
- **Hard delete on members:** Deleting a member permanently removes the record, which can orphan collection, payment, and loan records that reference it.
- **Overdue detection is manual:** The server can detect overdue loans (`GET /api/loans/overdue`), but it only runs when someone clicks the button. No scheduled job runs automatically.
- **Topbar decorations:** The search button and notification bell in the top bar are decorative -- they have no handlers and do nothing when clicked.
- **`recharts` and `json2csv` installed but unused:** Both libraries are in `package.json` dependencies but no code imports or uses them.
