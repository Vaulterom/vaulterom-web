// Vaulterom contact-form backend — a Cloudflare Worker.
// Receives the website form as JSON and emails it to CONTACT_TO via the
// Resend API. See README.md in this directory for deployment steps.

const ALLOWED_ORIGINS = [
  "https://vaulterom.com",
  "https://www.vaulterom.com",
];

const MAX_FIELD = 200;
const MAX_PROJECT = 5000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, cors);
    }

    const firstName = str(body.firstName, MAX_FIELD);
    const lastName = str(body.lastName, MAX_FIELD);
    const email = str(body.email, MAX_FIELD);
    const project = str(body.project, MAX_PROJECT);

    if (!firstName || !lastName || !email || !email.includes("@")) {
      return json({ error: "Missing or invalid required fields" }, 400, cors);
    }

    const subject =
      "[Generated from Vaulterom website form] Project inquiry - " +
      firstName + " " + lastName;
    const text =
      "This email was generated from the contact form on the Vaulterom website.\n\n" +
      "First name: " + firstName + "\n" +
      "Last name: " + lastName + "\n" +
      "Email: " + email + "\n\n" +
      "Project:\n" + (project || "(not provided)") + "\n";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!res.ok) {
      return json({ error: "Email send failed" }, 502, cors);
    }
    return json({ ok: true }, 200, cors);
  },
};

function str(v, max) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
