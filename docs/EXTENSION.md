# Extension

Manifest V3 project in `/extension`.

Workflow:

1. User logs into CitePath web app
2. Opens `/extension-auth-callback`
3. Extension popup fetches `/api/v1/extension?action=queue` with credentials
4. User opens Reddit thread; content script offers **Insert draft**
5. User reviews and submits on Reddit
6. Extension reports completion via `/api/v1/extension` `complete` action

Does **not**: steal cookies, bypass CAPTCHA, mass-account automation, or stealth systems.
