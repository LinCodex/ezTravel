# Security

## Reporting a vulnerability

If you believe you have found a security issue in ezTravel, please email **support@eztravel.example.com** with:

- A clear description of the issue
- Steps to reproduce
- Impact assessment if known

Please do not open a public GitHub issue for vulnerabilities that could expose customer data, payments, or admin access.

## Secrets and environment

- Never commit `.env` or real credentials. Use `.env.example` as a template.
- In production, set:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD` (12+ characters)
  - `ADMIN_SESSION_SECRET` (24+ random characters)
- The app refuses weak or missing admin secrets when `NODE_ENV=production`.
- Rotate admin credentials if they may have been exposed.
- Keep `DATABASE_URL` and any future supplier API keys out of the repository and client-side code.

## Admin access

- Admin session cookies are `httpOnly`, `SameSite=Lax`, and `Secure` in production.
- Session lifetime is limited (8 hours).
- Credential checks use constant-time string comparison where applicable.
- Restrict who can reach `/admin` in production (VPN, IP allowlist, or reverse-proxy auth) when possible.

## Data handling

- Do not store full payment card numbers. Card checkout is intended to go through a payment processor (Square mock today).
- Order pages are tied to email + order reference; treat those links as confidential.
- Local SQLite databases (`prisma/*.db`) are gitignored and should not be published.

## Dependencies

- Run `npm audit` regularly and upgrade dependencies with security fixes.
- Prefer locked installs via `package-lock.json` in CI and production.

## Production checklist

- [ ] Strong unique `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`
- [ ] HTTPS terminated at the reverse proxy or host
- [ ] Real Zelle / WeChat / Square credentials configured
- [ ] Supplier API credentials stored only in server environment variables
- [ ] Database backups and access controls in place
- [ ] Support and privacy contact emails updated from example placeholders
