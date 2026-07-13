// Scroll-reveal: fade sections in as they enter the viewport.
// Falls back to always-visible if IntersectionObserver is unavailable.
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
})();

// Contact form. With FORM_ENDPOINT set (see backend/README.md), submitting
// POSTs the fields there and the backend emails contact@vaulterom.com —
// one click for the visitor. While it's unset (or unreachable), we fall
// back to opening the visitor's email app with everything pre-filled.
(function () {
  const form = document.getElementById("project-form");
  if (!form) return;

  // Paste your deployed backend URL here, e.g. "https://vaulterom-contact.<account>.workers.dev"
  const FORM_ENDPOINT = "https://vaulterom-contact.workers.dev";

  const status = document.getElementById("form-status");
  const button = document.querySelector('button[form="project-form"]');

  const say = (msg) => {
    if (status) {
      status.textContent = msg;
      status.hidden = false;
    }
  };

  const mailtoFallback = (data) => {
    const subject =
      "[Generated from Vaulterom website form] Project inquiry - " +
      data.get("firstName") + " " + data.get("lastName");
    const body =
      "This email was generated from the contact form on the Vaulterom website.\n\n" +
      "First name: " + data.get("firstName") + "\n" +
      "Last name: " + data.get("lastName") + "\n" +
      "Email: " + data.get("email") + "\n\n" +
      "Project:\n" + (data.get("project") || "(not provided)") + "\n";
    window.location.href =
      "mailto:contact@vaulterom.com?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    if (!FORM_ENDPOINT) {
      mailtoFallback(data);
      return;
    }

    if (button) button.disabled = true;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      if (!res.ok) throw new Error("send failed");
      form.reset();
      say("Thanks — your message is on its way. We'll be in touch soon.");
    } catch {
      say("Couldn't reach the form service — opening your email app instead.");
      mailtoFallback(data);
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
