# E2E Testing Framework Documentation

## Overview

This document provides a technical overview of the End-to-End (E2E) testing framework implemented for the Amrita Lost & Found System. The framework is built using Playwright, a modern automation tool designed for reliable web testing.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Test Framework | Playwright |
| Programming Language | TypeScript |
| Testing Environment | Chromium |
| Test Runner | Playwright Test Runner |
| Reporting | HTML Reporter |

## Why Playwright?

### Comparison with Other E2E Testing Tools

| Feature | Playwright | Cypress | Selenium | Puppeteer |
|---------|------------|---------|----------|-----------|
| Multi-browser Support | High (Chromium, Firefox, WebKit) | Limited (Chrome-family) | High (Cross-browser) | Low (Chromium only) |
| Speed | High | High | Low | High |
| Auto-wait | Built-in | Built-in | Manual | Manual |
| Parallel Execution | Native | Paid/Cloud | Native (Grid) | Manual |
| Network Interception | Yes | Yes | Limited | Yes |
| Mobile Emulation | Yes | Limited | No | Yes |
| TypeScript Support | Native | Native | Via Wrapper | Native |
| Maintenance | Microsoft (Active) | Cypress.io | Community | Google |

### Rationale for Selection

Playwright was selected as the primary testing tool for several technical reasons:

1.  **Speed and Concurrency**: It runs tests in parallel using multiple workers by default, significantly reducing the execution time for a large suite of 117 tests.
2.  **Reliability**: Its auto-wait mechanism reduces flakiness by ensuring elements are actionable before performing any interaction.
3.  **Modern Web Support**: It handles complex web scenarios like Shadow DOM, iframes, and Single Page Application (SPA) state transitions more effectively than legacy tools.
4.  **Debugging Tools**: The availability of the Playwright Trace Viewer allows for step-by-step post-mortem analysis of failed tests with full DOM snapshots and console logs.
5.  **Environment Emulation**: It allows for testing responsive designs by emulating specific device dimensions and user contexts within a single suite.

## What's Being Tested

### Application Coverage

The test suite covers the entire lifecycle of a lost or found item, from initial reporting to administrative approval.

```
+-----------------------------------------------------------------+
|                    AMRITA LOST & FOUND SYSTEM                   |
+-----------------------------------------------------------------+
|                                                                 |
|  [ LANDING ] ------> [ LOGIN ] ------> [ DASHBOARD ]            |
|      PAGE              PAGE              PAGE                   |
|                                            |                    |
|                                            v                    |
|  [ PROFILE ] <------ [ INVENTORY ] <--- [ SIDEBAR ]             |
|   SETTINGS             BROWSE             NAV                   |
|                                            |                    |
|                                            v                    |
|  [ REPORT ] -------- [ ITEM ] --------> [ CLAIM ]               |
|    ITEM              DETAILS             FORM                   |
|                                                                 |
+-----------------------------------------------------------------+
|                        ADMIN SECTION                            |
|  [ ADMIN ] --------> [ CLAIMS ]                                 |
|  DASHBOARD          MANAGEMENT                                  |
+-----------------------------------------------------------------+
```

### Detailed Testing Scope

1.  **Authentication and Authorization**: Verification of login flows for students, faculty, and admins. Includes negative testing for invalid credentials and unauthorized access to protected routes.
2.  **Landing Page**: Validation of public-facing content, including feature highlights, statistics, and navigation to the portal.
3.  **User Dashboard**: Verification of personalized metrics, quick-access sections for items and claims, and unified sidebar navigation.
4.  **Inventory Browsing**: Comprehensive testing of item listings, grid/list view toggles, advanced filtering by type/category, and pagination.
5.  **Item Details**: Verification of data integrity on detailed item views, status badges, and the accessibility of the claim process.
6.  **Report Item Workflow**: Testing of the multi-step reporting wizard, including data validation in each step, anonymous reporting options, and submission logic.
7.  **Claims Process**: End-to-end testing of claim submissions, ownership proof validation, and tracking status on the user's claims page.
8.  **Profile Management**: Verification of user profile editing, read-only constraints on system-critical fields, and notification setting persistence.
9.  **Admin Dashboard**: Validation of administrative headers, statistical summaries, and quick-action navigation for system oversight.
10. **Admin Claims Management**: Detailed testing of administrative oversight tools, including status filtering, search functionality, and the approval/rejection decision flow with remarks.

## Project Structure

The project follows the Page Object Model (POM) to ensure maintainability and separation of concerns.

```
e2e/
├── fixtures/
│   └── test-data.ts          # Centralized test users, routes, and constants
├── page-objects/
│   ├── login.page.ts         # Abstraction for authentication screens
│   ├── inventory.page.ts     # Abstraction for item discovery
│   └── report-item.page.ts   # Abstraction for the reporting wizard
├── tests/
│   ├── auth.spec.ts          # Authentication and session logic
│   ├── landing.spec.ts       # Public landing page structure
│   ├── dashboard.spec.ts     # User-specific dashboard features
│   ├── inventory.spec.ts     # Exploration and filtering logic
│   ├── item-details.spec.ts  # Information display and navigation
│   ├── report-item.spec.ts   # Reporting submission flow
│   ├── claims.spec.ts        # User-side claim workflows
│   ├── profile.spec.ts       # User settings and profile updates
│   ├── admin-dashboard.spec.ts   # Admin entry points and metrics
│   └── admin-claims.spec.ts      # Administrative processing logic
├── playwright.config.ts      # Global configuration and environment settings
└── package.json              # Script definitions and dependencies
```

## Running the Tests

To execute the test suite, navigate to the `e2e` directory and use the following commands:

```bash
# Install required dependencies
npm install

# Run all tests in headless mode
npm run e2e

# Run tests with the browser UI visible
npm run e2e:headed

# Open the HTML report after execution
npx playwright show-report
```

## Test Suites Overview

The suite contains 117 tests categorized by application module.

### 1. Authentication (13 tests)
Tests covers student, admin, and faculty login flows. It includes validation for empty fields, incorrect credentials, and redirection logic for protected resources.

### 2. Landing Page (7 tests)
Validates the presence and visibility of the hero section, integrated features, system statistics, and footer elements.

### 3. User Dashboard (11 tests)
Verifies that the dashboard correctly displays the welcome message, activity summary, and items relevant to the logged-in user.

### 4. Inventory (13 tests)
Tests focus on the item discovery experience, ranging from view toggles and category filtering to pagination and deep-linking to item details.

### 5. Item Details (8 tests)
Checks the accuracy of item information, status indicators (Lost/Found/Pending), and the visibility of the "Claim" button based on item state.

### 6. Report Item (17 tests)
A thorough evaluation of the reporting wizard, testing field validation, progress between steps, information review, and anonymous submission settings.

### 7. Claims (10 tests)
Covers the submission of ownership proof, the rendering of the user's personal claims history, and validation against empty submissions.

### 8. Profile (13 tests)
Validates that user attributes are correctly displayed and that editable fields (name, phone) save successfully while email remains protected.

### 9. Admin Dashboard (12 tests)
Ensures administrators see correct system metrics and quick-access cards for managing claims and system activity.

### 10. Admin Claims (14 tests)
Detailed testing of the administrative claim processing table, including advanced search, status-based filtering, and the approval/rejection modal logic.

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Test Suites | 10 |
| Total Test Cases | 117 |
| Positive Scenarios | 99 |
| Negative Scenarios | 18 |
| Execution Duration | ~3-4 Minutes (at 4 workers) |

## Test Categories

*   **UI/UX Verification**: Tests ensuring all elements render as expected and layouts are consistent across views.
*   **Workflow Verification**: End-to-end tests ensuring data flows correctly through a multi-step process (e.g., Reporting an item).
*   **Security and Access**: Tests validating that users can only access resources permitted by their role.
*   **Validation and Error Handling**: Negative scenarios ensuring the system rejects invalid data and displays helpful error messages.

## Configuration and CI

The configuration in `playwright.config.ts` is tuned for stability with:
*   **Parallelism**: Enabled across 4 workers.
*   **Retries**: Configured to retry once on failure to ignore transient network issues.
*   **Artifacts**: Screenshots and videos are captured on failure for debugging.
*   **CI Support**: Ready for integration with GitHub Actions or other CI runners.
