# User Flows

## F1 — Signup → First Published Comment

```mermaid
sequenceDiagram
  participant U as User
  participant App as CitePath App
  participant Scan as Scanner Worker
  participant AI as Draft Generator
  participant Ext as Chrome Extension
  participant R as Reddit (browser session)

  U->>App: Sign up
  App->>U: Onboarding (Solo/Team)
  U->>App: Create Campaign + Advocate + Subreddits
  U->>App: Connect Reddit username (lookup only)
  U->>Ext: Install + /extension-auth-callback
  Scan->>App: Scan active subs
  Scan->>AI: Score posts → generate drafts
  AI->>App: Drafts Pending
  App->>U: Email + Drafts page
  U->>App: Approve draft
  App->>App: Status Queued
  Ext->>App: Poll queue (daily window)
  Ext->>R: Insert comment via logged-in session
  Ext->>App: Mark Published + activity event
```

**Confidence:** CONFIRMED (Help Center)

## F2 — Draft state machine

```mermaid
stateDiagram-v2
  [*] --> Pending: AI generated
  Pending --> Queued: Approve (extension)
  Pending --> Published: Copy & Open marked posted
  Pending --> Archived: Skip/Archive
  Queued --> Published: Extension success
  Queued --> Queued: Retry (karma/cooldown/cap)
  Queued --> Archived: Manual archive stuck
  Published --> [*]
  Archived --> [*]
```

**Confidence:** CONFIRMED

## F3 — Brand Monitor

Brand/domain added → mention ingestion → classify sentiment → Overview metrics + Mentions feed + Subreddit breakdown

**Confidence:** CONFIRMED (surfaces); scoring internals UNKNOWN

## F4 — AI Visibility / GEO

Brand + competitors + topics → prompts → scheduled query runs (supported interfaces) → extract mentions/citations → Visibility Score / Share of Voice / Citation Rate → historical snapshots

**Confidence:** CONFIRMED (surfaces + metrics names); query execution mechanism HIGH-CONFIDENCE INFERENCE (public claims “as real users, not APIs” — we implement via supported provider APIs where available, document difference)

## F5 — Advocate Refine

Open refine → show 5 sample drafts → user rewrites → extract tone/vocab/structure/disclosure → bake into future generations

**Confidence:** CONFIRMED

## F6 — Billing trial expiry

Trial active → countdown banner → modals at 3d/1d/expiry → scanning pauses until plan selected

**Confidence:** CONFIRMED
