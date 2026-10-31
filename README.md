# HeliosFlow — Solar Installation Management System

Production-oriented MVP for a rooftop solar company. The app manages the full workflow from enquiry to survey, quotation, payment, inventory, installation, warranty, service tickets, and financial reporting.

There is **no demo data, seed script, public registration, or default login**. The database starts empty except for the first administrator created with the secure CLI command.

## Tech stack

- **Frontend:** React 18, Vite, JavaScript (JSX), Tailwind CSS, React Router, Axios, Redux Toolkit, Lucide React, Recharts, React Hook Form
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose (MVC), JWT, bcryptjs, Nodemailer, Multer, Cloudinary, PDFKit, QR codes, Zod

## Repository layout

```
client/     React SPA (feature-based)
server/     Express API (models, controllers, routes, services, middleware)
```

## 1. MongoDB Atlas

1. Create a cluster and a database user.
2. Allow your IP (or `0.0.0.0/0` for development only).
3. Copy the connection string into `server/.env` as `MONGODB_URI`.
4. The API uses database name `solar_management` unless you set `MONGODB_DB`.
5. If the API exits with MongoDB authentication failed, reset the database user password in Atlas and update `MONGODB_URI`. Do not commit the URI.

## 2. Environment variables

Copy `server/.env.example` to `server/.env` and fill in real values. Never commit `server/.env`.

```
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=5000
NODE_ENV=development
EMAIL_VERIFICATION_ENABLED=false
MONGODB_DB=solar_management
```

Compatible aliases if you already use them: `MONGO_URI`, `JWT_EXPIRE`, `SMTPEMAIL`, `SMTPPASS`.

SMTP failures are logged and **do not roll back** the related database write.

Photo uploads require Cloudinary. If those variables are empty, survey/installation photo upload returns a clear configuration error.

## 3. Install

```bash
npm install
cd server && npm install
cd ../client && npm install
```

## 4. Create the first administrator

From the project root, with MongoDB configured:

```bash
npm run create-admin
```

You will be prompted for name, email and password. If an admin already exists, the command exits without creating another account.

## 5. Run locally

```bash
npm run dev
```

- API: `http://localhost:5000/api/health`
- App: `http://localhost:5173`

Sign in with the administrator you created. Create staff accounts from **Users** (admin only).

## 6. End-to-end workflow

1. Create admin → sign in  
2. Customers → Enquiries → Convert to site survey  
3. Complete survey → Submit → Approve  
4. Generate quotation (BOM) → Accept → Convert to order  
5. Record advance payment  
6. Add products, receive stock (serials + QR)  
7. Accepting a quotation automatically creates the order and payment link when Razorpay is configured; without Razorpay, the order is still created for demo/manual payment
8. Reserve stock → assign serials → dispatch (blocked until the configured advance % is paid)
9. Add technicians → schedule installation → complete with confirmation
10. Warranties activate on dispatch or installation per product
11. Open a service ticket by serial → warranty check → repair → customer confirmation → close
12. Review Finance and Reports (CSV/PDF)

Refresh the browser or restart the server: records remain in MongoDB.

## Deployment

- Set `NODE_ENV=production`, a strong `JWT_SECRET`, Atlas IP allowlist, and `CLIENT_URL` / `SERVER_URL` to the real origins.
- Build the client with `npm run build --prefix client` and serve `client/dist` behind the API or a static host.
- Keep CORS origin equal to `CLIENT_URL`.
- Configure Cloudinary and SMTP on the host. Do not put secrets in frontend env vars.

## Completed features

- JWT auth, roles (admin, sales executive, warehouse manager, technician), forgot/reset password, optional email verification
- Profile, password change, user activation
- Customers (duplicate protection), enquiries, site surveys with photos and approval
- Quotations with BOM, templates API, PDF, accept/reject, convert to order
- Products, categories, stock receive/reserve/dispatch with transactions, serials, QR generate/scan, low-stock
- Orders, manual payments, receipts, payment gate before dispatch
- Technicians, installation schedule, photos, signature, PDF report
- Product-specific warranties and certificates
- Service tickets with warranty coverage and close-after-confirmation
- Expenses, subsidies (manual), director report CSV/PDF
- Dashboard KPIs and charts from live aggregations
- Audit logs, Helmet, CORS, auth rate limit, Zod validation

## Limitations

- Razorpay payment links and webhook payment updates require Razorpay test credentials; the order page also checks Razorpay automatically while payment is pending, and manual receipts remain available for demos
- No government subsidy API
- Photo storage needs Cloudinary credentials
- Email sending needs valid SMTP; the app still works if SMTP is missing
- Warranty month length uses a 30-day month approximation
- Camera QR scan needs HTTPS or localhost permission

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | API + Vite together |
| `npm run create-admin` | One-time first administrator |
| `npm run build` | Production client build |
| `npm start` | API only |
