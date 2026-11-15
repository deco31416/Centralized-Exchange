## Notifications Microservice — System Manifest

### Purpose
Centralized, self-hosted service to send all user-facing notifications across the ecosystem (emails and SMS). It exposes simple producer-facing APIs, enqueues work via BullMQ, renders templates, and delivers through providers (Resend for email, Twilio for SMS). It integrates tightly with `micro-ng-auth` to send OTP, verification, password reset, and welcome communications, and is intended to be reused by all current and future microservices.

### High-level Responsibilities
- Send transactional emails via Resend
- Send transactional SMS via Twilio
- Provide a stable, service-to-service API for other microservices to request notifications
- Queue all outbound notifications with BullMQ for reliability, rate control, and retries
- Manage and render templates (email HTML/MJML and SMS text) with variables
- Track delivery attempts, retries, and dead-letter jobs for troubleshooting
- Enforce idempotency and de-duplication where applicable (e.g., OTP or password reset)
- Support multi-tenant context where relevant (e.g., `org_id` from `micro-ng-auth` user)

### Non-goals
- This service does not perform user identity or token issuance
- This service does not persist long-term analytics beyond job logs/metadata
- This service will not rely on AWS-managed services; it is fully self-hosted

### Providers
- Email: Resend
  - Outbound API using API Key
  - Supports dynamic templates and sender domains
- SMS: Twilio
  - Outbound API using Account SID/Auth Token
  - Supports alphanumeric sender IDs where available; defaults to phone numbers

### Core Architecture
- Producer API: HTTP endpoints that other services call to request a notification
- Queue: BullMQ (Redis-backed) for durable, asynchronous processing
- Workers: Dedicated consumers for `email` and `sms` queues (separate concurrency controls)
- Template Renderer: Renders email (HTML) and SMS (plain text) templates with input variables
- Provider Clients: Resend/Twilio SDK wrappers with robust error handling and retries
- Retry/Backoff: Configurable retry strategy with exponential backoff; DLQ for hard failures
- Observability: Structured logs, metrics counters (enqueue, sent, failed, retries), health checks

### Message Flow
1) Producer (e.g., `micro-ng-auth`) calls `POST /notifications/email` or `POST /notifications/sms`
2) Service validates, normalizes, attaches metadata (idempotency key, correlation ids)
3) Job enqueued into BullMQ (`notifications:email` or `notifications:sms`)
4) Worker consumes job, renders template, calls Resend/Twilio
5) On success → mark job complete; On retryable errors → requeue with backoff; On terminal error → DLQ

### Integration with `micro-ng-auth`
This service will be the single notification channel for the auth domain:
- OTP delivery (email and optionally SMS)
- Email verification (magic link/token)
- Password reset
- Welcome/onboarding emails

Recommended changes in `micro-ng-auth`:
- Replace direct provider calls with producer calls to this service
- Include `user_id`, `email`, `org_id`, and correlation ids; the notifications service will resolve any additional properties if needed

### Contracts (Producer-facing API)
All endpoints are service-to-service (S2S) only. Authentication via bearer token or HMAC signature (see Security).

- POST `/notifications/email`
  - Purpose: Enqueue an email
  - Body (JSON):
    {
      "to": "user@example.com",
      "template": "auth.verify-email",
      "subject": "Verify your email",
      "variables": { "displayName": "Jane", "verifyUrl": "https://…" },
      "user_id": "<uuid|mongoId>",
      "org_id": "<string|optional>",
      "idempotency_key": "<optional string>",
      "priority": "normal|high"
    }
  - Response: 202 with `job_id`

- POST `/notifications/sms`
  - Purpose: Enqueue an SMS
  - Body (JSON):
    {
      "to": "+1xxxxxxxxxx",
      "template": "auth.otp",
      "variables": { "code": "123456" },
      "user_id": "<uuid|mongoId>",
      "org_id": "<string|optional>",
      "idempotency_key": "<optional string>",
      "priority": "normal|high"
    }
  - Response: 202 with `job_id`

- Optional bulk endpoints (`/notifications/email/bulk`, `/notifications/sms/bulk`) for batch enqueue with per-item results.

Job payload (internal canonical form):
{
  "channel": "email" | "sms",
  "to": "string",
  "template": "string",
  "subject": "string|optional (email)",
  "variables": { "key": "value" },
  "user": { "id": "string", "org_id": "string|optional" },
  "meta": { "idempotency_key": "string|optional", "correlation_id": "string|optional", "requested_by": "service-name" }
}

### Event/Template Catalog (initial)
- auth.verify-email (email)
- auth.reset-password (email)
- auth.welcome (email)
- auth.otp (sms/email)
- generic.notification (email/sms)

### Templates
- Location (proposed):
  - `src/templates/emails/<namespace>/<name>.mjml` (compiled to HTML at build or runtime)
  - `src/templates/sms/<namespace>/<name>.txt`
- Variables must be explicitly documented per template
- Safe defaults for missing optional variables
- Brand/theme support via layout partials and theme variables

### Queue Design (BullMQ)
- Redis key prefix: `notifications:`
- Queues:
  - `notifications:email` (concurrency configurable, e.g., 5–20)
  - `notifications:sms` (concurrency configurable, e.g., 10–50)
- Backoff: exponential (e.g., 5s → 30s → 2m → 10m), max attempts configurable
- DLQ: `notifications:dead-letter`
- Rate limits: provider-specific throttling (e.g., `max` per window) to avoid bursts
- Idempotency: based on `idempotency_key` when provided, or derived from a stable tuple (template + user + token)

### Security
- S2S Authentication:
  - Option A (default): Static bearer token per calling service (env-configured allowlist)
  - Option B: HMAC signature header (`X-Signature` + `X-Timestamp`) using a shared secret per service
- Network: Only internal network exposure (ingress/firewall) where possible
- PII handling:
  - Log redaction on `to`, tokens, OTPs
  - Store minimal metadata in job data; no sensitive tokens at rest
- Transport: HTTPS/TLS for all inbound calls

### Configuration (Environment)

| Key | Required | Default | Description |
| --- | --- | --- | --- |
| PORT | no | 3001 | HTTP port |
| NODE_ENV | no | development | Node environment |
| REDIS_URI | yes | — | Redis connection for BullMQ |
| RESEND_API_KEY | yes | — | Resend API key |
| RESEND_FROM_EMAIL | yes | — | Default from email/address |
| TWILIO_ACCOUNT_SID | yes | — | Twilio SID |
| TWILIO_AUTH_TOKEN | yes | — | Twilio auth token |
| TWILIO_FROM_NUMBER | yes | — | Default from number/sender |
| SERVICE_TOKENS | yes | — | JSON map of serviceName→bearer token for S2S auth |
| HMAC_KEYS | no | — | JSON map of serviceName→shared secret (if HMAC used) |
| EMAIL_RATE_MAX | no | 60 | Max emails per minute |
| SMS_RATE_MAX | no | 120 | Max SMS per minute |
| QUEUE_EMAIL_CONCURRENCY | no | 10 | Email worker concurrency |
| QUEUE_SMS_CONCURRENCY | no | 25 | SMS worker concurrency |
| QUEUE_MAX_ATTEMPTS | no | 6 | Max retry attempts |
| BASE_TEMPLATE_URL | no | — | Public base URL for links in templates |

### Data & Models
- No user table persists here; the user model is owned by `micro-ng-auth`
- Jobs store minimal user references: `user.id`, `user.org_id`, `to`
- Delivery logs stored in job history and optional append-only log collection (if needed)

### Idempotency & De-duplication
- Honor `idempotency_key` from producers; one successful send per key
- Provider-level de-dup (e.g., do not resend same OTP code within a short TTL)
- Cache keys in Redis to enforce temporary de-dup windows

### Error Handling & Retries
- Transient errors (network, 429/5xx): retry with exponential backoff
- Permanent errors (4xx invalid numbers/emails): no retry → DLQ
- DLQ review tooling and requeue capability

### Observability
- Health endpoint: `GET /health` (OK if Redis + workers connected)
- Metrics: enqueue count, sent count, failure count, retry count, DLQ size, worker latency
- Structured logs with `correlation_id` propagation

### Deployment (Self-hosted)
- Containerized service (Node 18+/20+, pnpm), local Redis or managed Redis-compatible self-hosted instance
- No AWS dependencies required
- Recommended: docker-compose with `app`, `worker`, and `redis`
- Horizontal scaling: multiple worker replicas safe (BullMQ supports concurrency & locking)

### Local Development
- Run Redis locally (Docker)
- Start API and workers in watch mode
- Use sandbox Resend and Twilio test credentials where available

### Security Considerations with `micro-ng-auth`
- Prefer per-service bearer tokens or HMAC for calls from `micro-ng-auth`
- Do not accept user-provided tokens directly without server-side verification
- Ensure OTPs and tokens are never logged; mask sensitive values

### Versioning & Backwards Compatibility
- Contract-first approach; use semantic versioning for API changes
- Introduce new templates or variables in a backwards-compatible way

### Initial Rollout Plan
1) Create templates for: `auth.verify-email`, `auth.reset-password`, `auth.welcome`, `auth.otp`
2) Add producer integration in `micro-ng-auth` to call notifications API instead of sending directly
3) Configure environment variables and secrets for Resend/Twilio
4) Validate rate limits and retry behavior in staging
5) Roll out gradually; monitor metrics and DLQ

### Future Extensions
- Web push and in-app notifications
- Per-tenant theming and branded sender domains
- Template management UI with preview and versioning


