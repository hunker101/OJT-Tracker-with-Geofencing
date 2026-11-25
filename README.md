# OJT Tracker with Geofencing

React-based location tracking and attendance management for On-the-Job Training (OJT) programs. Built March to April 2026 by Junard D. Chua.

A student clocks in automatically when they enter the OJT site geofence, and clocks out automatically when they leave it. Work-from-home days are tracked manually. The Dashboard shows progress toward the required OJT hours, and the DTR page shows a daily time record that can be exported as CSV.

## Features

- Geofence auto clock-in and clock-out using the Haversine formula and the browser Geolocation API, with a Leaflet map showing the site circle and the user's position
- Server-side geofence check: the server re-checks the distance and rejects clock-in with 403 when the user is outside the site radius
- Session recovery: if the page is refreshed while a session is open, the active session is fetched from the server so auto clock-out still works
- On-site sessions AM (6am to 12pm) and PM (12pm to 6pm), and WFH sessions Fri to Sun (8am to 5pm) with manual Start / End Work
- Manual log for past sessions, with a 1-hour lunch deduction when the session spans 12pm to 1pm
- Edit an attendance record, with a required reason, and delete a record
- Sites page: list, add, edit, delete, and set the active site used on the Dashboard
- Holidays page: list, add, and delete holidays; holidays are excluded from DTR totals and appear in the DTR even on days with no log
- DTR report grouped by day (AM in/out, PM/WFH in/out, daily hours, running total) with CSV export
- Progress toward 486 required hours

## Tech stack

- Frontend: React 19, Vite, Tailwind CSS 4, Leaflet / react-leaflet, React Router 7, Axios, date-fns
- Backend: Node.js, Express 5, Mongoose 9
- Database: MongoDB (`ojt_tracker` by default)

## Prerequisites

- Node.js 20 or newer
- MongoDB running locally on `mongodb://localhost:27017`, or a `MONGO_URI` pointing to another MongoDB (for example MongoDB Atlas)

## Setup

```bash
# 1. Install dependencies (root, server, and client)
npm install
npm install --prefix server
npm install --prefix client

# 2. Server environment
cp server/.env.example server/.env
# Edit server/.env if needed:
#   PORT=5000
#   MONGO_URI=mongodb://localhost:27017/ojt_tracker
#   CORS_ORIGIN=http://localhost:5173   (optional, defaults to this)

# 3. Seed one sample site (TechHub Offices, Makati, 200m radius)
#    Warning: seed deletes all existing sites first.
npm run seed
```

## Run

```bash
# Both server and client together (from the project root)
npm run dev
# Server: http://localhost:5000
# Client: http://localhost:5173
```

Or separately:

```bash
# Server only
npm run dev --prefix server

# Client only
npm run dev --prefix client

# Production build of the client
npm run build --prefix client
```

## API

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/attendance` | List all attendance logs, newest first |
| GET | `/attendance/active` | Today's open log (no clock-out), or `null` |
| POST | `/attendance/clock-in` | Clock in; onsite requires `siteId` and a location inside the geofence |
| POST | `/attendance/clock-out` | Clock out a session by `sessionId` |
| POST | `/attendance/manual` | Add a full past session |
| PATCH | `/attendance/:id` | Edit a log (requires `editReason`) |
| DELETE | `/attendance/:id` | Delete a log |
| GET | `/sites` | List sites |
| GET | `/sites/:id` | Get one site |
| POST | `/sites` | Add a site |
| PUT | `/sites/:id` | Update a site |
| DELETE | `/sites/:id` | Delete a site; blocked with 400 if any attendance log uses it |
| GET | `/holidays` | List holidays |
| POST | `/holidays` | Add a holiday |
| DELETE | `/holidays/:id` | Delete a holiday |
| GET | `/reports/dtr` | Daily time record, totals, and `requiredHours: 486` |

Unknown `/api` routes return JSON `404 { "error": "API route not found: ..." }`, and server errors return JSON `{ "error": "..." }` instead of crashing.

## Data model

- **OJTSite**: `name`, `address`, `location { lat, lng }`, `radius_meters` (default 150)
- **Attendance**: `siteId` (ref OJTSite), `workMode` (`onsite` / `wfh`), `session` (`AM` / `PM` / `WFH`), `clockIn`, `clockOut`, `durationMinutes`, `method` (`auto` / `manual`), `edited`, `editReason`, `location { lat, lng }`
- **Holiday**: `date` (unique), `name`, `type` (`regular` / `special`)

## Known limitations

- **Single-user, no login/auth.** There is no User model, no login, and no roles. Anyone who can reach the API can read, create, edit, or delete records. Do not expose the server publicly as-is.
- **No supervisor view.** There is no supervisor or multi-student monitoring dashboard; the app tracks one student's logs.
- **Hardcoded for Junard's OJT.** The 486 required hours, the AM / PM / WFH session times, and the Fri to Sun WFH rule are hardcoded, not settings.
- **No tests.** There is no automated test suite yet.
- **Geolocation depends on the device.** GPS accuracy, browser permission, and HTTPS (on a real phone) affect auto clock-in/out. Manual log is the fallback when GPS is unavailable.
