## Secured Auth System Manifest (System Bible)

This document defines the end-to-end design, security controls, APIs, data model, and operational practices for the authentication and session platform powering the `deco31416-admin-auth` service. It is the single source of truth for product, engineering, security, and operations.

## Scope and Goals

- **Primary goals**: strong account security, excellent developer ergonomics, least-privilege access, operability, and observability.
- **Supported use cases**: user registration, email verification, password auth, multi-factor auth, passwordless, WebAuthn, token-based API auth, session and device management, account recovery, logout (single and global), and OAuth 2.1/OIDC for first- and third-party clients.
- **Non-goals**: full IdP federation UI, legacy grant types beyond Authorization Code + PKCE, or running a generic policy engine beyond RBAC/ABAC defined here.

## Architecture Overview

- **Components**
  - `Auth API (NestJS)`: public HTTP API for user and OAuth/OIDC flows.
  - `Auth Core`: domain services for users, credentials, tokens, sessions, devices, MFA, policy.
  - `MongoDB (replica set)`: primary persistence for users, credentials, sessions, devices, audit logs, OAuth clients; use TTL indexes for expirations and multi-document transactions for critical rotations/revocations.
  - `Redis`: cache, rate limits, one-time tokens, session index, and short-lived state (e.g., PKCE, magic links).
  - `Secrets Manager`: stores signing keys, encryption keys, SMTP/SMS credentials, pepper.
  - `Email/SMS Providers`: transactional email and SMS for verification and recovery.
  - `Message Bus (optional)`: emits auth events to other services.
  - `Frontends/Mobile`: SPA or native apps using Authorization Code + PKCE.
  - `Downstream Microservices`: verify JWT access tokens and apply authorization.
- **Trust boundaries**
  - Public internet → API Gateway/WAF → `Auth API`.
  - Internal trust for microservice-to-microservice via mTLS and service JWTs.
- **Data flows**
  - Access tokens (JWT) for resource access, short TTL.
  - Refresh tokens (opaque, hashed at rest) for renewal, long TTL, rotation with reuse detection.
  - Session objects track device, IP, user agent, and validity windows.

## Identity and Account Model

- **User**: immutable `user_id` (UUID v7), email(s), profile, status, and organization/tenant if applicable.
- **Credentials**: one-to-many relationship to user. Types: `password`, `webauthn`, `oauth_external`.
- **Factors**: MFA secrets (e.g., TOTP), WebAuthn credentials, recovery codes.
- **Attributes**: roles and permissions for RBAC/ABAC; minimal PII stored.

## Data Model (high-level)

MongoDB collections and suggested fields/indexes:

- `users`
  - `_id: ObjectId`, `status: enum('active','locked','pending_verification','deleted')`, `created_at`, `updated_at`, optional `org_id`.
  - Indexes: `{ status: 1 }`, optional `{ org_id: 1 }`.
- `emails`
  - `_id: ObjectId`, `user_id: ObjectId`, `email: string`, `email_lower: string`, `is_primary: boolean`, `is_verified: boolean`, `created_at`.
  - Indexes: unique `{ email_lower: 1 }`; `{ user_id: 1, is_primary: 1 }` (partial unique on `is_primary: true`).
- `credentials`
  - `_id: ObjectId`, `user_id: ObjectId`, `type: 'password'|'webauthn'|'oauth_external'`, `password_hash`, `password_salt`, `webauthn` fields, `created_at`, `last_used_at`.
  - Indexes: `{ user_id: 1, type: 1 }`.
- `mfa_factors`
  - `_id: ObjectId`, `user_id: ObjectId`, `type: 'totp'|'webauthn'`, `totp_secret_enc`, `label`, `created_at`, `last_used_at`.
  - Indexes: `{ user_id: 1, type: 1 }`.
- `recovery_codes`
  - `_id: ObjectId`, `user_id: ObjectId`, `code_hash`, `used_at`, `created_at`.
  - Indexes: `{ user_id: 1, used_at: 1 }`.
- `sessions`
  - `_id: string` (random `sid`), `user_id: ObjectId`, `device_id: ObjectId`, `ip_hash`, `user_agent_hash`, `created_at`, `last_seen_at`, `expires_at`, `revoked_at`, `reason`.
  - Indexes: TTL on `expires_at`; `{ user_id: 1, revoked_at: 1 }`, `{ device_id: 1, revoked_at: 1 }`.
- `devices`
  - `_id: ObjectId`, `user_id: ObjectId`, `display_name`, `device_fingerprint_hash`, `first_seen_at`, `last_seen_at`, `last_ip_hash`.
  - Indexes: `{ user_id: 1 }`, `{ device_fingerprint_hash: 1, user_id: 1 }`.
- `refresh_tokens`
  - `_id: ObjectId`, `user_id: ObjectId`, `session_id: string`, `token_hash`, `parent_id: ObjectId|null`, `rotated_at`, `expires_at`, `revoked_at`, `reuse_detected: boolean`, `device_id: ObjectId`.
  - Indexes: TTL on `expires_at`; unique `{ token_hash: 1 }`; `{ session_id: 1, revoked_at: 1 }`; `{ user_id: 1, revoked_at: 1 }`.
- `verification_tokens`
  - `_id: ObjectId`, `user_id: ObjectId`, `email_id: ObjectId`, `purpose: 'verify_email'`, `token_hash`, `expires_at`, `consumed_at`.
  - Indexes: TTL on `expires_at`; unique `{ token_hash: 1 }`.
- `password_reset_tokens`
  - `_id: ObjectId`, `user_id: ObjectId`, `token_hash`, `expires_at`, `consumed_at`.
  - Indexes: TTL on `expires_at`; unique `{ token_hash: 1 }`.
- `oauth_clients`
  - `_id: ObjectId`, `client_id: string`, `client_name`, `redirect_uris: string[]`, `first_party: boolean`, `scopes: string[]`, `created_at`.
  - Indexes: unique `{ client_id: 1 }`.
- `audit_logs`
  - `_id: ObjectId`, `actor_user_id: ObjectId|null`, `action`, `target`, `ip_hash`, `user_agent_hash`, `metadata`, `occurred_at`.
  - Indexes: `{ actor_user_id: 1, occurred_at: -1 }`, TTL optional for retention.
- `service_keys`
  - `_id: ObjectId`, `service_name`, `key_id`, `public_jwk`, `created_at`, `expires_at`, `revoked_at`.
  - Indexes: unique `{ key_id: 1 }`.

Notes:
- All sensitive tokens are stored as salted hashes (e.g., token_id + random salt), never in plaintext.
- Use multi-document transactions (replica set) for refresh rotation and reuse detection to ensure atomicity.
- Enforce referential integrity at application level (no foreign keys); cascade revocations in code.

## Cryptography and Key Management

- **Password hashing**: Argon2id with recommended parameters (e.g., memoryCost ≥ 64MB, timeCost ≥ 3, parallelism ≥ 1). Store per-credential salt; store application-level `pepper` in secrets manager.
- **JWT signing**: Prefer EdDSA (Ed25519) or RS256 with key rotation. Use `kid` header, publish JWKS at `/.well-known/jwks.json`.
- **Envelope encryption**: Encrypt TOTP secrets and similar materials at rest with AES-GCM using DEK wrapped by KEK from secrets manager.
- **Randomness**: All secrets and tokens via CSPRNG with ≥128 bits entropy.
- **Key rotation**: Maintain multiple active signing keys; rotate on schedule (e.g., 90 days) and support grace period for validation.

## Token Model

- **Access Token**
  - Type: JWT, signed; audience-specific; short TTL (5–15 minutes); not refreshable.
  - Example claims: `iss`, `sub`, `aud`, `exp`, `iat`, `nbf`, `jti`, `scope`, `amr`, `acr`, `sid`, `device_id`, `org_id`.
  - Stored client-side only; never persisted server-side.
- **Refresh Token**
  - Type: opaque random string; store only a salted hash; long TTL (30–90 days); rotate on every use.
  - Bound to `user_id`, `session_id`, `device_id`, and client metadata. Reuse detection triggers session revocation.
  - One valid child per chain; parent becomes invalid after rotation.
- **Email/Magic/Recovery Tokens**
  - Opaque, single-use, short TTL (10–30 minutes), hashed in DB; rate-limited issuance.

## Authentication Flows

### Registration
- Input: email, password, optional profile.
- Validate email format and uniqueness; password against blocklist and minimum strength (zxcvbn ≥ threshold).
- Create user in `pending_verification`; create password credential; send verification email.
- Log audit event `user.registered`.

### Email Verification
- Input: token from email.
- Verify token (hash match, not expired, not consumed), mark email verified, transition user to `active`.
- Invalidate token; log `user.email_verified`.

### Login with Password
- Input: email, password, optional `code` for MFA if required.
- Rate-limit by IP and account; add progressive backoff and soft lock after repeated failures.
- Verify password via Argon2id; if MFA enabled, require step-up (TOTP or WebAuthn assertion).
- Create session and device if new; issue access and refresh tokens; set secure cookies for web (SameSite=Lax/Strict), or return tokens for native clients.
- Log `auth.login_succeeded` or `auth.login_failed` with minimal metadata.

### MFA (TOTP)
- Enrollment: show QR with TOTP secret (encrypted at rest); require two consecutive valid codes to confirm; issue recovery codes (hashed).
- Verification: TOTP with skew window ±1 step; lockout and rate-limit; log `auth.mfa_verified`.

### WebAuthn (Platform/Security Keys)
- Registration: create options, verify attestation, store credential public key and counters bound to user.
- Authentication: challenge-response assertion, verify RP ID, origin, and counters; supports MFA or passwordless depending on policy.

### Passwordless (Magic Link)
- Issue single-use, short-lived token; clicking link creates session after optional email confirmation screen; apply anti-abuse rate limits.

### Password Reset
- Forgot: issue single-use token; rate-limit and include no user enumeration in responses.
- Reset: validate token, require new password, invalidate all sessions and refresh tokens for the user; log `user.password_changed`.

### Change Password (Authenticated)
- Require current password and new password strength; rotate all refresh tokens on success.

### Token Refresh with Rotation
- Input: refresh token; verify hash match, not expired, not revoked, and parent-child chain rules.
- On success: in a single MongoDB transaction, create new refresh token (child), revoke parent, issue new access token; detect reuse and revoke chain if detected.

### Logout
- Current session logout: revoke session and current refresh token; invalidate access token via TTL expiry only.
- Global logout: revoke all active sessions and refresh tokens for the user.

## Session and Device Management

- **Session creation**: on successful auth, create `session` bound to `device`. Capture IP (hashed), user agent (hashed), and risk signals.
- **Device fingerprint**: stable, privacy-preserving signal (e.g., via client hints, not invasive); never store raw fingerprint, only a salted hash.
- **Concurrent sessions**: configurable maximum; oldest sessions revoked when exceeding limit if policy dictates.
- **Reuse detection**: if a used refresh token was already rotated, mark `reuse_detected`, revoke the session chain, and alert.
- **Visibility**: users can list sessions/devices, see last seen, location approximation, and revoke.

## OAuth 2.1 and OpenID Connect

- **Grants**: Authorization Code with PKCE only for public clients; client credentials for service-to-service.
- **Endpoints**
  - `/.well-known/openid-configuration` and `/.well-known/jwks.json`.
  - `/oauth/authorize`, `/oauth/token`, `/oauth/userinfo`, `/oauth/introspect` (optional), `/oauth/revoke`.
- **Scopes**: `openid`, `profile`, `email`, and application-specific scopes. Minimal default scopes.
- **Consents**: first-party skips UI; third-party requires explicit consent and records grant.
- **Claims**: OIDC `sub`, `email`, `email_verified`, `name`, and custom claims as needed.

## API Authentication Between Microservices

- **Incoming**: Resource servers validate JWT access tokens using JWKS, enforce `aud`, `iss`, `exp`, and `scope`/permissions.
- **Outgoing**: Service-to-service uses either mTLS with SPIFFE/SPIRE or client credential JWTs signed by `service_keys` with short TTL.
- **Propagation**: Downstream services propagate `sub`, `sid`, and correlation IDs for auditing.

## Authorization Model

- **RBAC**: roles map to permissions (e.g., `user:read`, `user:update`).
- **ABAC**: optional attribute checks like `org_id` match, resource ownership, or feature flags.
- **Policy evaluation**: performed in resource services using claims and centralized permission catalogs.

## Security Controls

- **Transport**: HTTPS everywhere, HSTS enabled; TLS 1.2+.
- **CSRF**: For cookie-based web, SameSite=Lax/Strict, CSRF token double-submit or SameSite=Strict; no CSRF needed for pure bearer token APIs.
- **CORS**: Strict allowlist of origins, methods, and headers; no wildcard for credentials.
- **Content security**: Set secure headers; CSP defined at web app layer.
- **Rate limiting**: per-IP and per-account on sensitive endpoints; exponential backoff.
- **Brute force**: account-level soft lockouts with incremental delays; captcha after threshold; IP reputation checks.
- **PII minimization**: store only necessary PII; hash or encrypt where possible; redact logs.
- **Secrets**: never in code or env files committed; always via secrets manager; rotate regularly.
- **Input validation**: strict schemas; reject on unknown fields.
- **Output encoding**: no user-controlled content in emails without sanitization.

## Auditing, Logging, and Telemetry

- **Audit events**: registration, email verification, login success/fail, MFA enroll/verify, password reset/change, token refresh, logout, session/device revocation, admin actions.
- **Redactions**: never log secrets, tokens, or PII beyond minimal necessity; hash IP and user agent.
- **Metrics**: login success rate, failed auths, MFA adoption, token refresh rate, reuse detections, issuance volumes, latency, saturation.
- **Tracing**: propagate request IDs; trace critical flows for SLOs.
- **Alerts**: sudden spikes in failures, reuse detection, signing key errors, email/SMS delivery failures.

## Privacy and Compliance

- **Data retention**: configurable TTLs for logs and tokens; prune expired and revoked artifacts.
- **User rights**: deletion/anonymization flow; export personal data on request; verify requester identity.
- **Regionality**: data residency controls if required; ensure providers comply.

## Configuration and Defaults

- Token TTLs: access 10m, refresh 45d, email verify 24h, reset 30m, magic 15m.
- Session TTL: 45d sliding; limit concurrent sessions (e.g., 10).
- Hashing parameters: Argon2id memory/time costs as above; recalibrate annually.
- Cookie settings: `Secure`, `HttpOnly`, `SameSite=Lax` by default; `Domain` scoped narrowly.
- Rate limits: configurable per endpoint with sane defaults; separate for issuance and verification endpoints.

## Operational Playbooks

- **Signing key rotation**
  - Generate new keypair; publish to JWKS with `kid` and set as active signer.
  - Keep previous keys available for validation until all tokens expire; then retire.
- **Pepper rotation**
  - Dual-pepper strategy: accept hashes with old or new peppers during migration; rehash on next successful login.
- **Compromised refresh token**
  - Trigger chain revocation; notify user; require re-auth; consider MFA step-up.
- **Breach response**
  - Force global logout, rotate signing keys and secrets, invalidate outstanding reset tokens; communicate transparently.
- **Provider failover**
  - Active-passive for email/SMS; automatic retry with backoff; deduplicate sends.
- **Backups and DR**
  - Regular snapshots and point-in-time recovery using oplog-based PITR; test restores quarterly; encrypt backups at rest and in transit.

## Testing and Quality Gates

- **Unit tests**: credential verification, token issuance/validation, rotation and reuse detection, rate limiters.
- **E2E tests**: register→verify→login→mfa→refresh→logout flows; negative paths (wrong code, expired token, reuse attempt).
- **Security tests**: fuzzing inputs, dependency scanning, SAST, DAST for public endpoints.
- **Compliance checks**: headers, cookie flags, TLS version, CORS rules.

## High-level API Reference

Public endpoints (paths illustrative; adjust to actual routes):
- POST `/auth/register`: create user; sends verification email.
- POST `/auth/login`: password login; returns tokens; may require MFA.
- POST `/auth/mfa/challenge`: start MFA challenge when needed.
- POST `/auth/mfa/verify`: verify TOTP or WebAuthn assertion.
- POST `/auth/password/forgot`: request reset; no enumeration in response.
- POST `/auth/password/reset`: reset with token; revokes sessions.
- POST `/auth/magic-link`: issue passwordless link.
- POST `/auth/logout`: revoke current session/refresh.
- POST `/auth/logout-all`: revoke all sessions for user.
- POST `/auth/token/refresh`: rotate and return new access/refresh tokens.
- GET `/auth/sessions`: list user sessions.
- DELETE `/auth/sessions/:id`: revoke a session.
- GET `/auth/devices`: list devices.
- DELETE `/auth/devices/:id`: revoke device sessions.
- GET `/.well-known/jwks.json`: public keys for JWT validation.
- GET `/.well-known/openid-configuration`: OIDC metadata.

Admin/service endpoints:
- POST `/admin/users/:id/lock` and `/unlock`.
- POST `/admin/users/:id/roles` to set roles.
- POST `/admin/rotate-keys` to begin signing key rotation.

Responses follow consistent envelopes and error codes; no user enumeration; RFC 7807 for problem details where applicable.

## Threat Model (abridged)

- **Assets**: user accounts, credentials, tokens, signing keys, PII, audit logs.
- **Adversaries**: external attackers, malicious insiders, compromised clients, MITM, botnets.
- **Attack surfaces**: login/reset endpoints, token refresh, OAuth flows, JWKS exposure, email links.
- **Key mitigations**
  - Strong hashing and secret handling; defense-in-depth on tokens (hashing, rotation, reuse detection).
  - Rate limiting, lockouts, captchas, IP reputation.
  - MFA and WebAuthn support; step-up for sensitive actions.
  - Strict CORS/CSRF/cookie flags; HTTPS; HSTS.
  - Audit and alerting on anomalies; least-privilege access between services.

## Roadmap and Future Enhancements

- Passkeys-first onboarding; discoverable credentials.
- Device-bound refresh tokens with platform secure storage attestation where available.
- Risk-based authentication and anomaly detection (geo-velocity, impossible travel).
- FIDO2 resident keys and conditional UI for frictionless sign-in.
- SCIM and enterprise SSO integrations.

## Implementation Notes (service-wide)

- Prefer DTO validation with strict schemas; reject unknown fields.
- Centralize error responses and avoid leaking which factor failed.
- Use `kid` and stable `iss` per environment; separate audiences for internal vs external APIs.
- Keep business logic deterministic and side-effect free; externalize I/O.
- Idempotency keys for email/magic/reset token issuance to avoid duplicates.

This manifest is living documentation. Proposals that change flows, token semantics, or security controls must update this file and include migration notes.


