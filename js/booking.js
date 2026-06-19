/* =====================================================================
   Scales Studios — Booking form (front-end demo, multi-step)
   ===================================================================== */
(function () {
  "use strict";
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const panels = Array.from(form.querySelectorAll(".step-panel"));
  const dots = Array.from(document.querySelectorAll(".stepper .dot"));
  const reviewList = document.getElementById("reviewList");

  /* Min date = today */
  const dateInput = form.querySelector("#f-date");
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  function showStep(step) {
    panels.forEach((p) => p.classList.toggle("active", p.dataset.step === String(step)));
    dots.forEach((d) => {
      const n = parseInt(d.dataset.dot, 10);
      d.classList.toggle("active", n === step);
      d.classList.toggle("done", n < step || step === "done");
    });
    if (step === "done") dots.forEach((d) => { d.classList.add("done"); d.classList.remove("active"); });
    const card = form.closest(".booking-card");
    if (card) {
      const top = card.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }

  /* ---- Validation helpers ---- */
  function setError(name, msg) {
    const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
    const err = form.querySelector(`[data-err-for="${name}"]`);
    if (field) field.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg || "";
  }

  function validateStep1() {
    const chosen = form.querySelector('input[name="service"]:checked');
    const err = document.getElementById("err-service");
    if (!chosen) { if (err) err.textContent = "Please choose a service to continue."; return false; }
    if (err) err.textContent = "";
    return true;
  }

  function validateStep2() {
    let ok = true;
    const checks = [
      ["name", (v) => v.trim().length >= 2, "Please enter your name."],
      ["phone", (v) => v.replace(/[^0-9]/g, "").length >= 7, "Enter a valid phone number."],
      ["email", (v) => v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address."],
      ["date", (v) => !!v, "Pick a preferred date."],
      ["time", (v) => !!v, "Pick a preferred time."],
    ];
    checks.forEach(([name, test, msg]) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      if (!test(input.value)) { setError(name, msg); ok = false; }
      else setError(name, "");
    });
    return ok;
  }

  /* Clear errors as the user types */
  form.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => { if (el.name) setError(el.name, ""); });
    el.addEventListener("change", () => {
      if (el.name === "service") { const e = document.getElementById("err-service"); if (e) e.textContent = ""; }
    });
  });

  /* ---- Build review ---- */
  function buildReview() {
    const data = new FormData(form);
    const rows = [
      ["Service", data.get("service")],
      ["Name", data.get("name")],
      ["Phone", data.get("phone")],
      ["Email", data.get("email")],
      ["Date", formatDate(data.get("date"))],
      ["Time", data.get("time")],
      ["Guest", data.get("guest")],
    ];
    const notes = (data.get("notes") || "").toString().trim();
    if (notes) rows.push(["Notes", notes]);
    reviewList.innerHTML = rows
      .map(([k, v]) => `<div class="review-row"><span>${k}</span><strong>${escapeHtml(v || "—")}</strong></div>`)
      .join("");
  }

  function formatDate(v) {
    if (!v) return "—";
    try {
      const d = new Date(v + "T00:00:00");
      return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
    } catch (e) { return v; }
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---- Navigation ---- */
  form.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = parseInt(btn.dataset.next, 10);
      if (target === 2 && !validateStep1()) return;
      if (target === 3) { if (!validateStep2()) return; buildReview(); }
      showStep(target);
    });
  });
  form.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => showStep(parseInt(btn.dataset.back, 10)));
  });

  /* ---- Submit (demo, no backend) ---- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    const name = (new FormData(form).get("name") || "").toString().split(" ")[0];
    const msg = document.getElementById("successMsg");
    if (msg && name) {
      msg.textContent = `Thank you, ${name}! We've received your request and will reach out shortly to confirm your appointment at Scales Studios.`;
    }
    showStep("done");
  });
})();
