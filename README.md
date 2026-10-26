# The Foreign Express — Security and Production Readiness

## Current status

This repository is a **static HTML/CSS/JavaScript website**. It currently uses browser `localStorage` as a demo data store for accounts, sessions, settings, leads, and permissions. GitHub Pages can host static files, but it cannot securely run authentication, role checks, payment verification, or private database operations.

The changes in this package improve layout and make the payment flow fail closed rather than showing a fake successful payment. **This is not yet an enterprise-secure production application.** Do not use it to collect real payments or sensitive student information until the backend work below is completed.

## Changes in this update

- Reduced and standardised left/right page gutters and added overflow protection for responsive layouts.
- Removed the visible demo credential panel from the login page.
- Added a temporary starter admin login for local preview only; see the separately supplied credentials note. This is NOT secure for production because frontend credentials can be inspected.
- Disabled the simulated payment-success path. A simulated checkout can no longer unlock IELTS access.
- Changed the browser-side Razorpay callback so it does not grant access merely because the checkout callback ran.
- Made the public payment-unlock helper fail closed because a static browser cannot verify Razorpay payment signatures.
- Added an IELTS page re-check when the browser restores the page from its back/forward cache.
- Kept user-facing messaging in plain English.

## Important security limitation

Client-side checks are not an authorization boundary. A visitor can inspect or modify JavaScript, use browser developer tools, or change `localStorage`. Because this project has no trusted server, it cannot securely guarantee that:
- only an administrator can grant IELTS access;
- a student has paid before using IELTS;
- administrator permissions are enforced;
- session expiry and logout invalidate all access;
- passwords or student records are safely stored;
- lead and application data remain private between users.

Do not put production passwords, Razorpay secrets, API keys, or personal data in HTML, JavaScript, Git history, or `localStorage`. Any secret previously committed must be rotated; deleting it from the latest file does not remove it from Git history.

## Required production architecture

Before launch, migrate authentication, payments, and authorization to a trusted backend. A recommended architecture is:

1. **Frontend:** this site, served over HTTPS.
2. **Backend API:** a maintained server application (for example, FastAPI or Node.js) deployed on a server platform. Every protected endpoint must authenticate the request and enforce permissions on the server.
3. **Database:** PostgreSQL or another managed database. Store password hashes using Argon2id or an equivalent established password-hashing implementation; never store plain-text passwords.
4. **Sessions:** secure server-managed sessions using `HttpOnly`, `Secure`, and appropriate `SameSite` cookies, CSRF protection, session expiry, and server-side revocation. Rotate session identifiers after login and privilege changes.
5. **Role-based access control:** define least-privilege roles such as `student`, `staff`, and `admin`. Check permissions on every protected API request, not only by hiding buttons or pages. Log administrative changes.
6. **Razorpay:** create orders on the backend; use the official checkout on the frontend; verify the payment signature on the backend using a secret stored only in server environment variables; verify payment status with Razorpay where appropriate; process webhooks with signature verification and idempotency. Grant IELTS entitlement only after trusted verification. Never trust a payment ID or a browser callback by itself.
7. **IELTS authorization:** the backend must return content and test data only after checking the authenticated user's active entitlement. A frontend redirect is helpful UX, not security.
8. **Admin security:** the starter credentials in this preview are hard-coded in frontend JavaScript and are public to anyone who can load the site. They are for local preview only. Before public deployment, remove them and use a server-side first-admin bootstrap, password hashing, optional MFA, rate limiting, login throttling, audit logs, re-authentication for sensitive actions, and tested account recovery.
9. **Privacy:** collect only required data, document retention/deletion, restrict staff access, encrypt traffic, protect backups, redact secrets and personal data from logs, and publish accurate privacy and retention policies.
10. **Operational controls:** validate inputs server-side, apply security headers and a restrictive Content Security Policy, dependency scanning, backups and restore tests, monitoring/alerting, error handling, and a documented incident-response process.

## Razorpay setup checklist

- Create a Razorpay account and configure test mode first.
- Store the **Key ID** and **Key Secret** in the backend's environment/secret manager; never expose the Key Secret in the website.
- Implement a backend order-creation endpoint and signature-verification endpoint.
- Configure and verify webhooks on the backend.
- Test success, failure, cancellation, duplicate webhook, delayed payment, refund, and forged-callback cases.
- Move to live mode only after reconciliation and end-to-end security tests pass.

The current static project does not include a backend payment endpoint, so the real payment flow is intentionally not represented as complete. Do not deploy this version as a paid-access system.

## Layout and accessibility checks

Test at 320px, 375px, 768px, 1024px, 1366px, and 1920px widths. Check all pages for horizontal scrolling, keyboard focus, readable contrast, labels on form controls, mobile navigation, and errors announced accessibly. A CSS change cannot guarantee that every page is perfectly aligned at every browser zoom; verify with real-browser testing.

## Run locally

```bash
python3 -m http.server 8080
```

Open <http://localhost:8080/>.

## Deployment note

GitHub Pages is suitable for a public static frontend only. Keep the frontend on GitHub Pages if desired, but deploy the authentication/payment/data API separately and connect it using HTTPS. Do not store privileged data in a public repository or treat frontend-only access checks as enterprise security.

## Temporary admin preview login

The starter admin login is provided separately for convenience. Treat it as public and temporary. Anyone who can inspect the static website can discover or bypass client-side checks. Do not use it for real student data or public production access.


## IELTS permission master password (starter default)

**Initial password:** `TFE-Ielts@2026#Access`

Use this value in the **Previous / Current Password** field the first time you change the IELTS permission master password. Choose a new password, confirm it, and click **Update Permission Password**. The code also falls back to this default when an older browser installation has an empty saved permission password.

**Security warning:** this is a temporary convenience password in a static frontend, not a secret. Anyone who can inspect the public JavaScript can discover it, and browser `localStorage` can be changed. Do not rely on this password to protect real student data or paid IELTS access. Before public production use, move permission checks and password storage to a trusted backend; use a unique server-managed secret/password and never commit production credentials.
