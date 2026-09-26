# Task 6 Report — WorkerRegisterScreen + WorkerCheckinScreen

**Status:** DONE

**Commit:** f97bf83

**TSC result:** 0 errors (clean)

## Changes

### `src/screens/WorkerRegisterScreen.tsx`
- Replaced TODO stub with full implementation
- Fetches organizations list from `/api/tgapp/organizations` on mount
- Form fields: ФИО (required), ИНН (optional, numeric, max 12), Дата рождения (optional date), налоговый статус (checkbox, default резидент), организация (select, required)
- Submits to `/api/tgapp/register` and calls `onRegistered` with AuthResult
- Inline validation errors, loading states for both orgs fetch and submit

### `src/screens/WorkerCheckinScreen.tsx`
- Replaced TODO stub with full implementation
- Attempts optional geolocation (5 s timeout) before posting
- Posts to `/api/tgapp/checkin` with optional lat/lng
- Shows success state (checkmark + date) or error message
- Displays worker's first name in greeting
