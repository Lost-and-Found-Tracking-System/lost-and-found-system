# E2E Test Report — Lost & Found Tracking System

**Project:** Lost & Found Tracking System  
**Test Framework:** Playwright (TypeScript)  
**Total Test Cases:** 122  
**Passed:** 122  
**Failed:** 0  
**Pass Rate:** 100%  
**Execution Time:** ~4.8 minutes  
**Date:** 2026-02-10  
**Environment:** macOS, Chromium (headless), Node.js  

---

## Test Distribution Summary

| Team Member | Domains Covered | Tests | Passed | Failed |
|-------------|----------------|-------|--------|--------|
| **Member 1 — Vinay** | Authentication, Landing Page, API Integration | 30 | 30 | 0 |
| **Member 2 — Ankith** | Dashboard, Inventory, Item Details | 24 | 24 | 0 |
| **Member 3 — Praveen SB** | Report Item, Claims, Notifications | 26 | 26 | 0 |
| **Member 4 — RD Tarun** | Admin Dashboard, Admin Claims, Admin Roles | 22 | 22 | 0 |
| **Member 5 — Adithya Monish Kumar** | Admin Zones, Admin AI Config, Profile | 20 | 20 | 0 |

---

## Member 1 — Vinay

### Domain: Authentication (`auth.spec.ts`)
**Functional Scrutiny:** Validates user login flows for all three roles (student, faculty, admin), form rendering, input retention,
session management (logout), and route protection. Negative scenarios verify that invalid/wrong credentials produce error messages and
that empty submissions keep the user on the login page.  
**Testing Method:** Playwright UI automation with `.fill()` and `.click()` on the actual login form. Uses `.login-btn` class locator (ElasticButton component) for submit. Route protection tested via direct navigation without authentication.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-AUTH-01 | Student login navigates to user dashboard | Positive | Pass | 1.8s |
| TC-AUTH-02 | Admin login navigates to admin dashboard | Positive | Pass | 2.5s |
| TC-AUTH-03 | Faculty login navigates to user dashboard | Positive | Pass | 1.9s |
| TC-AUTH-04 | Login page displays email, password, and submit button | Positive | Pass | 1.8s |
| TC-AUTH-05 | Login form accepts and retains typed input | Positive | Pass | 1.6s |
| TC-AUTH-06 | Register link is visible on login page | Positive | Pass | 2.2s |
| TC-AUTH-07 | Logout clears session and redirects to login or home | Positive | Pass | 1.6s |
| TC-AUTH-08 | Invalid credentials display error message on login page | Negative | Pass | 5.5s |
| TC-AUTH-09 | Wrong password for valid email displays error | Negative | Pass | 3.9s |
| TC-AUTH-10 | Clicking submit with empty fields stays on login page | Negative | Pass | 3.8s |
| TC-AUTH-11 | Unauthenticated access to dashboard redirects to login | Negative | Pass | 1.4s |
| TC-AUTH-12 | Unauthenticated access to profile redirects to login | Negative | Pass | 1.1s |

### Domain: Landing Page (`landing.spec.ts`)
**Functional Scrutiny:** Confirms the public landing page renders correctly at root URL, displays a main heading, provides visible login and register navigation links, and contains descriptive content. Also verifies the `/home` alias route.  
**Testing Method:** Direct page navigation with `networkidle` wait state. URL verification via string matching. Content presence checks via `innerText()` length assertions.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-LAND-01 | Landing page loads successfully at root URL | Positive | Pass | 2.2s |
| TC-LAND-02 | Landing page displays a main heading | Positive | Pass | 1.6s |
| TC-LAND-03 | Landing page has login navigation link | Positive | Pass | 1.9s |
| TC-LAND-04 | Landing page has register navigation link | Positive | Pass | 1.6s |
| TC-LAND-05 | Login link navigates to /login page | Positive | Pass | 1.9s |
| TC-LAND-06 | Landing page has a non-empty document title | Positive | Pass | 1.8s |
| TC-LAND-07 | Landing page contains descriptive content | Positive | Pass | 1.6s |
| TC-LAND-08 | /home alias loads the same landing page | Positive | Pass | 2.0s |

### Domain: API Integration (`api-integration.spec.ts`)
**Functional Scrutiny:** Verifies backend REST API endpoints directly using Playwright's `request` context. Tests authentication token generation, role verification, user profile retrieval, items pagination, zones listing, dashboard statistics, admin statistics, and user claims. Negative tests confirm 401 responses for wrong credentials and missing tokens.  
**Testing Method:** Direct HTTP requests via `request.newContext()` — no browser UI. Validates JSON response structure, status codes, and field presence.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-API-01 | POST /auth/login returns accessToken for valid credentials | Positive | Pass | 145ms |
| TC-API-02 | POST /auth/login for admin returns role=admin | Positive | Pass | 200ms |
| TC-API-03 | GET /users/profile returns user data with valid token | Positive | Pass | 138ms |
| TC-API-04 | GET /items returns paginated items list | Positive | Pass | 139ms |
| TC-API-05 | GET /zones returns zones array | Positive | Pass | 3ms |
| TC-API-06 | GET /dashboard/stats returns user statistics | Positive | Pass | 140ms |
| TC-API-07 | GET /admin/stats returns admin statistics | Positive | Pass | 140ms |
| TC-API-08 | GET /claims/user/my-claims returns claims array | Positive | Pass | 131ms |
| TC-API-09 | POST /auth/login with wrong password returns 401 | Negative | Pass | 132ms |
| TC-API-10 | GET /users/profile without token returns 401 | Negative | Pass | 4ms |

---

## Member 2 — Ankith

### Domain: Dashboard (`dashboard.spec.ts`)
**Functional Scrutiny:** Verifies that an authenticated student's dashboard loads correctly, displays a heading, sidebar navigation with links to Report, Inventory, and Profile pages, and that navigation between pages works. Also checks that statistics or content sections render.  
**Testing Method:** Login via `LoginPage` page object, then navigate and assert element visibility using broad locators. Sidebar link clicks verified with URL change assertions.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-DASH-01 | Dashboard page loads for authenticated student | Positive | Pass | 2.0s |
| TC-DASH-02 | Dashboard displays heading text | Positive | Pass | 1.9s |
| TC-DASH-03 | Sidebar navigation is visible | Positive | Pass | 2.1s |
| TC-DASH-04 | Report item link is accessible from dashboard | Positive | Pass | 3.1s |
| TC-DASH-05 | Inventory link is accessible from sidebar | Positive | Pass | 1.7s |
| TC-DASH-06 | Navigate from dashboard to inventory page | Positive | Pass | 2.3s |
| TC-DASH-07 | Navigate from dashboard to profile page | Positive | Pass | 1.7s |
| TC-DASH-08 | Dashboard displays statistics or content section | Positive | Pass | 1.5s |

### Domain: Item Inventory (`inventory.spec.ts`)
**Functional Scrutiny:** Tests the full item inventory experience: page load, heading display, search input visibility and value retention, filter buttons (All/Lost/Found), items or empty state display, clickable item cards navigating to details, and overall content richness.  
**Testing Method:** Login + navigate via `InventoryPage` page object. Search interaction via `.fill()`. Filter interaction via button clicks with URL persistence checks. Content verified via `innerText()` length.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-INV-01 | Inventory page loads successfully | Positive | Pass | 2.7s |
| TC-INV-02 | Inventory page displays a heading | Positive | Pass | 2.9s |
| TC-INV-03 | Search input is visible on inventory page | Positive | Pass | 3.1s |
| TC-INV-04 | Search input accepts and retains typed text | Positive | Pass | 2.3s |
| TC-INV-05 | Filter options are visible on inventory page | Positive | Pass | 2.8s |
| TC-INV-06 | Clicking Lost filter does not break the page | Positive | Pass | 3.3s |
| TC-INV-07 | Clicking Found filter does not break the page | Positive | Pass | 3.5s |
| TC-INV-08 | Inventory shows items or an empty state message | Positive | Pass | 2.8s |
| TC-INV-09 | Item card is clickable and navigates to item details | Positive | Pass | 4.2s |
| TC-INV-10 | Inventory page contains meaningful content | Positive | Pass | 4.9s |

### Domain: Item Details (`item-details.spec.ts`)
**Functional Scrutiny:** Validates the item detail view accessed from inventory: page navigation, item information display, description/category presence, claim button visibility, back navigation capability, and graceful handling of invalid item IDs (404 scenario).  
**Testing Method:** Navigate to inventory, click the first item card, then assert detail page elements. Invalid ID test uses direct URL navigation and checks for error state.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-DET-01 | Navigate from inventory to item details page | Positive | Pass | 4.0s |
| TC-DET-02 | Item details page displays item information | Positive | Pass | 3.1s |
| TC-DET-03 | Item details page shows description or category | Positive | Pass | 3.0s |
| TC-DET-04 | Claim button is visible on item details page | Positive | Pass | 2.5s |
| TC-DET-05 | Item details page has back navigation capability | Positive | Pass | 4.6s |
| TC-DET-06 | Navigating to invalid item ID handles gracefully | Negative | Pass | 2.7s |

---

## Member 3 — Praveen SB

### Domain: Report Item (`report-item.spec.ts`)
**Functional Scrutiny:** Tests the multi-step report item form: page load, type selection button rendering (Lost/Found), type selection advancing the form, page heading, interactive elements, dashboard accessibility, button resilience, content richness, authentication guard, and button count.  
**Testing Method:** Login as student → navigate to `/report` → interact with Lost/Found buttons → verify page state. Auth guard tested via fresh browser context without login.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-RPT-01 | Report item page loads successfully | Positive | Pass | 2.0s |
| TC-RPT-02 | Lost and Found type selection buttons are visible | Positive | Pass | 2.2s |
| TC-RPT-03 | Selecting Lost type advances the form | Positive | Pass | 4.4s |
| TC-RPT-04 | Selecting Found type advances the form | Positive | Pass | 2.8s |
| TC-RPT-05 | Report page displays a heading | Positive | Pass | 2.3s |
| TC-RPT-06 | Report form displays interactive elements | Positive | Pass | 2.4s |
| TC-RPT-07 | Report page is accessible from dashboard navigation | Positive | Pass | 1.9s |
| TC-RPT-08 | Lost button click does not break the page | Positive | Pass | 4.2s |
| TC-RPT-09 | Found button click does not break the page | Positive | Pass | 3.2s |
| TC-RPT-10 | Report page contains meaningful text content | Positive | Pass | 2.3s |
| TC-RPT-11 | Unauthenticated access to report redirects to login | Negative | Pass | 2.9s |
| TC-RPT-12 | Report page has multiple interactive buttons | Positive | Pass | 2.6s |

### Domain: Claims (`claims.spec.ts`)
**Functional Scrutiny:** Validates the claims workflow: My Claims page load and heading, claims list vs empty state display, navigation from item details to claim form, claim form input fields, sidebar navigability, authentication guard, and status indicator display for existing claims.  
**Testing Method:** Login → navigate to `/my-claims`. Claim form tested via item-details → claim button flow. Status indicators checked via regex matching on page text.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-CLM-01 | My Claims page loads successfully | Positive | Pass | 2.3s |
| TC-CLM-02 | My Claims page displays heading | Positive | Pass | 2.0s |
| TC-CLM-03 | Claims page shows claims list or empty state | Positive | Pass | 2.7s |
| TC-CLM-04 | Navigate to claim submission from item details | Positive | Pass | 2.5s |
| TC-CLM-05 | Claim submission form displays input fields | Positive | Pass | 2.7s |
| TC-CLM-06 | My Claims link in sidebar navigates correctly | Positive | Pass | 1.7s |
| TC-CLM-07 | Unauthenticated access to my-claims redirects to login | Negative | Pass | 3.6s |
| TC-CLM-08 | Claims page displays status indicators if claims exist | Positive | Pass | 4.0s |

### Domain: Notifications (`notifications.spec.ts`)
**Functional Scrutiny:** Verifies the notifications page: successful load, heading display, list vs empty state rendering, mark-all-as-read button presence, sidebar navigation link, and authentication guard.  
**Testing Method:** Login → navigate to `/notifications`. Conditional visibility checks (`if visible`) for optional elements. Auth guard tested via direct URL in clean context.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-NTF-01 | Notifications page loads successfully | Positive | Pass | 3.9s |
| TC-NTF-02 | Notifications page displays heading | Positive | Pass | 2.2s |
| TC-NTF-03 | Notifications page shows list or empty state | Positive | Pass | 2.5s |
| TC-NTF-04 | Mark all as read button is visible if applicable | Positive | Pass | 2.0s |
| TC-NTF-05 | Notifications link in sidebar navigates correctly | Positive | Pass | 1.9s |
| TC-NTF-06 | Unauthenticated access to notifications redirects to login | Negative | Pass | 2.9s |

---

## Member 4 — RD Tarun

### Domain: Admin Dashboard (`admin-dashboard.spec.ts`)
**Functional Scrutiny:** Confirms the admin dashboard loads after admin login, displays heading and sidebar navigation, shows statistics cards (Total/Users/Items/Claims), activity feed, claims/roles management sidebar links, and prevents non-admin access via redirect or unauthorized display.  
**Testing Method:** Admin login via `LoginPage` → wait for `/admin` URL. Stats verified via regex text matching. Non-admin test uses separate browser context with student credentials + `.login-btn` click.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-ADM-01 | Admin dashboard loads successfully | Positive | Pass | 2.2s |
| TC-ADM-02 | Admin dashboard displays heading | Positive | Pass | 2.6s |
| TC-ADM-03 | Admin sidebar navigation is visible | Positive | Pass | 2.6s |
| TC-ADM-04 | Admin dashboard displays statistics cards | Positive | Pass | 2.9s |
| TC-ADM-05 | Admin dashboard shows activity feed or recent activity | Positive | Pass | 2.2s |
| TC-ADM-06 | Claims management link is accessible from admin sidebar | Positive | Pass | 2.4s |
| TC-ADM-07 | Role management link is accessible from admin sidebar | Positive | Pass | 2.2s |
| TC-ADM-08 | Non-admin user is redirected away from admin dashboard | Negative | Pass | 6.5s |

### Domain: Admin Claims (`admin-claims.spec.ts`)
**Functional Scrutiny:** Tests admin claims management: page load and heading, claims list or empty state display, filter buttons (Pending/Approved/Rejected) visibility and click resilience, and search input availability.  
**Testing Method:** Admin login → navigate to `/admin/claims`. Filter buttons tested via click + URL persistence. Search input verified with conditional visibility check.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-ACL-01 | Admin claims management page loads | Positive | Pass | 2.5s |
| TC-ACL-02 | Admin claims page displays heading | Positive | Pass | 2.2s |
| TC-ACL-03 | Admin claims shows claims list or empty state | Positive | Pass | 3.2s |
| TC-ACL-04 | Pending filter button is visible | Positive | Pass | 2.3s |
| TC-ACL-05 | Clicking Pending filter does not break the page | Positive | Pass | 2.8s |
| TC-ACL-06 | Clicking Approved filter does not break the page | Positive | Pass | 2.6s |
| TC-ACL-07 | Clicking Rejected filter does not break the page | Positive | Pass | 2.9s |
| TC-ACL-08 | Search input is visible on claims management page | Positive | Pass | 2.5s |

### Domain: Admin Roles (`admin-roles.spec.ts`)
**Functional Scrutiny:** Validates admin role management: page load and heading, user list content visibility (via body text matching for student/faculty/admin keywords), search/filter availability, role badges display, and edit/change button visibility.  
**Testing Method:** Admin login → navigate to `/admin/roles`. User content verified via regex on body text. Action buttons located via multi-fallback locator strategy.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-ARL-01 | Admin role management page loads | Positive | Pass | 2.7s |
| TC-ARL-02 | Role management page displays heading | Positive | Pass | 2.3s |
| TC-ARL-03 | User list or table is visible | Positive | Pass | 2.4s |
| TC-ARL-04 | Search or filter input is available | Positive | Pass | 2.5s |
| TC-ARL-05 | User role badges are visible in the list | Positive | Pass | 2.3s |
| TC-ARL-06 | Role change or edit button is visible for users | Positive | Pass | 2.7s |

---

## Member 5 — Adithya Monish Kumar

### Domain: Admin Zones (`admin-zones.spec.ts`)
**Functional Scrutiny:** Tests admin zone management: page load and heading, zone content visibility (verified via body text matching for Zone/Campus/Area/Location keywords), add zone button availability, zone name display, and overall page content richness.  
**Testing Method:** Admin login → navigate to `/admin/zones`. Zone content verified via regex matching on body text. Button visibility uses multi-fallback locator.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-AZN-01 | Admin zone management page loads | Positive | Pass | 2.2s |
| TC-AZN-02 | Zone management page displays heading | Positive | Pass | 2.2s |
| TC-AZN-03 | Zone list or map is visible | Positive | Pass | 2.3s |
| TC-AZN-04 | Add zone button is visible | Positive | Pass | 2.4s |
| TC-AZN-05 | Zone names are displayed in the list | Positive | Pass | 2.2s |
| TC-AZN-06 | Zone management page has meaningful content | Positive | Pass | 2.3s |

### Domain: Admin AI Config (`admin-ai-config.spec.ts`)
**Functional Scrutiny:** Validates the AI Engine configuration page: page load and heading, threshold settings visibility (via text matching), weight configuration fields (Description/Visual/Geolocation/Time text matching), save/apply button, and overall content richness.  
**Testing Method:** Admin login → navigate to `/admin/ai-config`. Config fields verified via regex matching on body text for AI-specific keywords. Button located via multi-text fallback.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-AIC-01 | Admin AI configuration page loads | Positive | Pass | 2.9s |
| TC-AIC-02 | AI configuration page displays heading | Positive | Pass | 2.8s |
| TC-AIC-03 | AI threshold settings are visible | Positive | Pass | 2.4s |
| TC-AIC-04 | AI weight configuration fields are visible | Positive | Pass | 2.3s |
| TC-AIC-05 | Save or Update configuration button is visible | Positive | Pass | 2.6s |
| TC-AIC-06 | AI configuration page has meaningful content | Positive | Pass | 2.1s |

### Domain: Profile (`profile.spec.ts`)
**Functional Scrutiny:** Tests user profile management: page load and heading, user email/name display, edit form field visibility (name, phone, department), change password section, login activity/security section, sidebar navigation link, and authentication guard.  
**Testing Method:** Login → navigate to `/profile`. Form fields verified via input locators. Password section checked via text matching. Auth guard tested via direct URL without login.

| TC ID | Test Name | Type | Result | Duration |
|-------|-----------|------|--------|----------|
| TC-PRF-01 | Profile page loads successfully | Positive | Pass | 2.3s |
| TC-PRF-02 | Profile page displays heading | Positive | Pass | 2.5s |
| TC-PRF-03 | Profile page displays user email or name | Positive | Pass | 2.4s |
| TC-PRF-04 | Profile edit form fields are visible | Positive | Pass | 3.6s |
| TC-PRF-05 | Change password section is visible on profile page | Positive | Pass | 2.3s |
| TC-PRF-06 | Profile page shows login activity or security section | Positive | Pass | 2.1s |
| TC-PRF-07 | Profile link in sidebar navigates correctly | Positive | Pass | 3.5s |
| TC-PRF-08 | Unauthenticated access to profile redirects to login | Negative | Pass | 3.2s |

---

## Test Architecture

### Structure
```
e2e/
├── fixtures/
│   ├── test-data.ts          # Centralized test credentials, routes, constants
│   └── auth.fixture.ts       # Reusable login/logout helpers
├── page-objects/
│   ├── login.page.ts         # Login page locators and actions
│   ├── dashboard.page.ts     # Dashboard locators
│   ├── inventory.page.ts     # Inventory page locators
│   ├── report-item.page.ts   # Report form locators
│   ├── profile.page.ts       # Profile page locators
│   └── admin-dashboard.page.ts # Admin dashboard locators
├── tests/
│   ├── auth.spec.ts           # 12 tests (Vinay)
│   ├── landing.spec.ts        # 8 tests (Vinay)
│   ├── api-integration.spec.ts # 10 tests (Vinay)
│   ├── dashboard.spec.ts      # 8 tests (Ankith)
│   ├── inventory.spec.ts      # 10 tests (Ankith)
│   ├── item-details.spec.ts   # 6 tests (Ankith)
│   ├── report-item.spec.ts    # 12 tests (Praveen SB)
│   ├── claims.spec.ts         # 8 tests (Praveen SB)
│   ├── notifications.spec.ts  # 6 tests (Praveen SB)
│   ├── admin-dashboard.spec.ts # 8 tests (RD Tarun)
│   ├── admin-claims.spec.ts   # 8 tests (RD Tarun)
│   ├── admin-roles.spec.ts    # 6 tests (RD Tarun)
│   ├── admin-zones.spec.ts    # 6 tests (Adithya Monish Kumar)
│   ├── admin-ai-config.spec.ts # 6 tests (Adithya Monish Kumar)
│   └── profile.spec.ts        # 8 tests (Adithya Monish Kumar)
└── playwright.config.ts
```

### Design Patterns Used
- **Page Object Model (POM):** All pages encapsulated as classes with locators and helper methods
- **Fixture-based Auth:** Centralized login logic in `auth.fixture.ts` with reusable `loginAs()` helper
- **Data-Driven Constants:** All credentials, routes, and test data in `test-data.ts`
- **Graceful Fallbacks:** Optional elements use conditional visibility checks (`if visible`)
- **Multi-fallback Locators:** Buttons found via multiple text/selector alternatives to handle UI variations

### Test Types
- **Positive Tests (104):** Verify intended functionality works correctly
- **Negative Tests (18):** Verify error handling, auth guards, invalid inputs, and access control

### Running the Tests
```bash
cd e2e
npx playwright test                    # Run all 122 tests
npx playwright test --reporter=html    # Generate HTML report
npx playwright test tests/auth.spec.ts # Run specific spec file
```
