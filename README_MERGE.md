# ACLC Merge Status

The backend from `CodeNeticz-KHacks-3.0` has been successfully merged into `ACLC/backend`.

## Changes Made
1. **Backend Integration**:
   - Copied full backend server to `ACLC/backend/server`.
   - Updated Database Schemas (`Material`, `Assessment`, `Report`) to match ACLC Frontend requirements (added missing fields like `desc`, `difficulty`, `beforeStats`).
   - Updated Mock Data (`db.js`) and seeded the database with content matching the frontend design (Data Structures course, Assessment questions).

2. **Frontend Wiring**:
   - Created `src/services/api.js` to handle API requests.
   - Connected `Login.jsx` to real Authentication API (`/api/auth/login`).
   - Connected `Dashboard.jsx` to Dashboard API (`/api/student/dashboard`).
   - Connected `Classroom.jsx` to Materials API (`/api/student/classroom`).
   - Connected `Assessment.jsx` to Assessment API (`/api/student/assessment`).
   - Connected `Report.jsx` to Report API (`/api/student/report`).

## How to Run
This project now requires the Backend to be running.

1. **Start Backend**:
   Open a terminal:
   ```bash
   cd backend/server
   npm run dev
   ```
   *Note: Ensure MongoDB is running locally.*

2. **Start Frontend**:
   Open a second terminal:
   ```bash
   npm run dev
   ```

3. **Login Credentials**:
   - Uses the seeded student account.
   - Email: `student@example.com`
   - Password: `12345`

## Notes
- The database has been re-seeded with data matching the frontend's visual logic (e.g. Data Structures materials).
- All previous hardcoded data in the connected pages has been replaced with API calls.
