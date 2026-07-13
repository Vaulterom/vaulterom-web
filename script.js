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

// Contact form: no backend on this site, so submitting opens the visitor's
// email app with everything pre-filled, addressed to contact@vaulterom.com.
(function () {
  const form = document.getElementById("project-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const first = data.get("firstName");
    const last = data.get("lastName");
    const subject = "[Generated from Vaulterom website form] Project inquiry - " + first + " " + last;
    const body =
      "This email was generated from the contact form on the Vaulterom website.\n\n" +
      "First name: " + first + "\n" +
      "Last name: " + last + "\n" +
      "Email: " + data.get("email") + "\n\n" +
      "Project:\n" + (data.get("project") || "(not provided)") + "\n";
    window.location.href =
      "mailto:contact@vaulterom.com?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  });
})();
