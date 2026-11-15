# CoverBetter Chrome extension

Writes a cover letter from the job post in the current tab. It uses the saved resumes and the credits of the user's CoverBetter account.

## How it works

1. The user opens `/dashboard/extension` and clicks "Connect the extension".
2. The page makes a token (server action) and posts it with `window.postMessage`.
3. `connect.js` runs only on that page. It saves the token and the site origin in `chrome.storage.local`.
4. The popup calls the API with `Authorization: Bearer <token>`:
   - `GET /api/ext/me`: email, letters left, style choice allowed, saved resumes.
   - `POST /api/ext/letters`: `{ resumeId, jobDescription, tone, length }`. Same checks and credits as the dashboard.
   - `DELETE /api/ext/token`: disconnects this browser.
5. `extract.js` reads the job post: selected text, then JobPosting structured data, then known job sites, then the main page text. The user can edit the text before writing.

The database keeps only the SHA-256 hash of each token (`extension_tokens`). A user can connect 5 browsers. Account deletion removes all tokens.

## Load it for testing

1. Run the site locally on port 3600, or use coverbetter.io.
2. In Chrome, open `chrome://extensions`, turn on Developer mode, and click "Load unpacked". Pick this `extension` folder.
3. Sign in on the site and open `/dashboard/extension` (the local or the live one). Click "Connect the extension".
4. Open a job post and click the CoverBetter icon.

## Before the Chrome Web Store

- Remove `http://localhost:3600/*` from `host_permissions` and `content_scripts.matches` in `manifest.json`.
- Apply migration `drizzle/0002_extension_tokens.sql` to the remote database before the site deploy.
- Add a privacy note for the store listing: the extension reads the current page only when the user opens the popup, and sends the job post text to CoverBetter only when the user clicks "Write my cover letter".
