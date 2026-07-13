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

`wrangler deploy` prints the worker URL, something like
`https://vaulterom-contact.<your-account>.workers.dev`.

## Wire up the site

Paste that URL into `FORM_ENDPOINT` at the top of the contact-form section
in `script.js`. That's it — form submissions are now a single click.

## Notes

- Recipient and from-address live in `wrangler.toml` (`CONTACT_TO`,
  `MAIL_FROM`). The from-domain must be the one you verified with Resend.
- The worker only accepts POSTs from the site's own origin (see
  `ALLOWED_ORIGINS` in `worker.js`); add a staging origin there if you
  need one.
- The visitor's address goes into Reply-To, so replying in your mail
  client goes straight to them.
