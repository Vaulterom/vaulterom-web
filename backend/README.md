# Contact form backend

A single Cloudflare Worker that takes the website contact form's POST and
emails it to `contact@vaulterom.com`. Until it's deployed, the site's form
falls back to opening the visitor's own email app, so nothing breaks in the
meantime.

## One-time setup

1. **Resend** (sends the email): create a free account at resend.com, add
   and verify the `vaulterom.com` domain (they give you a couple of DNS
   records), then create an API key.
2. **Cloudflare** (hosts the worker): create a free account if you don't
   have one, and install the CLI: `npm install -g wrangler`.

## Deploy

```sh
cd backend
wrangler login
wrangler secret put RESEND_API_KEY   # paste the Resend key when prompted
wrangler deploy
```

`wrangler deploy` prints the worker URL. If this is a brand-new Cloudflare
account, wrangler will first prompt you to register a **workers.dev
subdomain** — the worker has no public URL until that exists.

> **The URL has TWO segments before `workers.dev`:**
> `https://<worker-name>.<account-subdomain>.workers.dev`
> (for example `https://vaulterom-contact.vaulterom-contact.workers.dev`).
> Copy it verbatim from the `wrangler deploy` output, or from the
> dashboard: Workers & Pages → the worker → the URL under its name on the
> Overview page. Dropping the middle segment gives a hostname that doesn't
> resolve, and the site will silently fall back to the mailto flow.

## Smoke-test the worker

Before touching the site, confirm the worker is reachable (this does NOT
send an email — it fails validation on purpose):

```sh
curl -s -X POST https://<worker-url> \
  -H "Content-Type: application/json" -d '{}'
```

Expected response: `{"error":"Missing or invalid required fields"}`.
Anything else (connection error, Cloudflare error page) means the URL is
wrong or the deploy didn't finish. When debugging a failing send, run
`wrangler tail` in this directory to stream the worker's live logs while
you submit the form.

## Wire up the site

Paste the full two-segment URL into `FORM_ENDPOINT` at the top of the
contact-form section in `script.js`, then push so GitHub Pages redeploys.
That's it — form submissions are now a single click.

## Notes

- Recipient and from-address live in `wrangler.toml` (`CONTACT_TO`,
  `MAIL_FROM`). The from-domain must be the one you verified with Resend.
- The worker only accepts POSTs from the site's own origin (see
  `ALLOWED_ORIGINS` in `worker.js`); add a staging origin there if you
  need one.
- The visitor's address goes into Reply-To, so replying in your mail
  client goes straight to them.
