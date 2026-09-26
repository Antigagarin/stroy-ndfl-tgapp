# Task 8 Report — GateScreen + ControllerScreen

**Status:** DONE
**Commit:** cd3115f
**TSC result:** 0 errors

## Changes

### `src/screens/GateScreen.tsx`
- Replaced stub with full implementation (311 lines total across both files)
- Site selection view: lists all sites from `/api/tgapp/foreman`
- Gate log view: worker select dropdown, IN/OUT buttons, today's log list
- Refreshes log after each gate action
- Error handling + loading spinners

### `src/screens/ControllerScreen.tsx`
- Replaced stub with full implementation
- Site selection view: same pattern as GateScreen
- Worker checklist view: multi-select checkboxes, optional note input
- Shows "already checked today" badge per worker (from `/api/tgapp/control`)
- Fixed bottom CTA button showing count of selected workers
- Success screen after submission with back-to-sites button
- Error handling + loading states

## APIs Used
- GET `/api/tgapp/foreman` — site list
- GET `/api/tgapp/foreman?siteId=...` — worker list per site
- GET `/api/tgapp/gate?siteId=...` — today's gate logs
- POST `/api/tgapp/gate` — record IN/OUT
- GET `/api/tgapp/control?siteId=...` — today's checks
- POST `/api/tgapp/control` — record check batch
