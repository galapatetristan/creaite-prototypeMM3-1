(function () {
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

  // ---------------------------
  // DEMO GENERATE (LANDING)
  // ---------------------------
  const landingForm = $("#promptForm");
  const promptInput = $("#promptInput");

  const landingCard = $("#landingResultCard");
  const landingBody = $("#landingResultBody");
  const landingStatus = $("#landingStatus");

  const landingMore = $("#landingMore");
  const landingRefine = $("#landingRefine");
  const landingExport = $("#landingExport");

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  function setLandingResult(statusText, html) {
    if (landingCard) landingCard.hidden = false;
    if (landingStatus) landingStatus.textContent = statusText || "";
    if (landingBody) landingBody.innerHTML = html || "";
  }

  function landingGenerate() {
    const prompt = (promptInput && promptInput.value || "").trim();
    if (!prompt) return toast("Type a prompt first.");

    setLandingResult("Generating…", `
      <div class="loading">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <p class="muted" style="margin-top:10px;">Working on: <strong>${escapeHtml(prompt)}</strong></p>
    `);

    setTimeout(() => {
      setLandingResult("Done", `
        <h3>Generated output (demo)</h3>
        <p class="muted"><strong>Prompt:</strong> ${escapeHtml(prompt)}</p>
        <div class="result-list">
          <div class="result-item"><strong>Caption (Option 1):</strong> New flavor drop! 🧋 Try it today — limited time only.</div>
          <div class="result-item"><strong>Caption (Option 2):</strong> Something sweet just landed. Grab your first sip now.</div>
          <div class="result-item"><strong>Hashtags:</strong> #Milktea #NewFlavor #LocalBusiness #FoodPH #CafePH</div>
          <div class="result-item"><strong>Design direction:</strong> Minimal layout, product highlight, bold CTA button</div>
          <div class="result-item"><strong>CTA:</strong> “Order now” / “Visit us today”</div>
        </div>
      `);
    }, 750);
  }

  // Submit + Click fallback (bulletproof)
  landingForm && landingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    landingGenerate();
  });

  const generateBtn = $("#generateBtn");
  generateBtn && generateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    landingGenerate();
  });

  // suggestion chips fill prompt
  $$(".chip-action").forEach((c) => {
    c.addEventListener("click", () => {
      const text = c.dataset.suggest || "";
      if (promptInput) promptInput.value = text;
      toast("Prompt filled. Click Generate.");
    });
  });

  // service cards fill prompt
  $$(".service-card").forEach((c) => {
    c.addEventListener("click", () => {
      const s = c.dataset.service;
      const map = {
        social: "Write 3 caption options + hashtags for a café promo this weekend.",
        branding: "Create a brand kit: colors, typography, and tone for a minimal skincare brand.",
        ads: "Generate 3 ad poster variations for a 20% off weekend sale.",
        web: "Design a landing page layout for a small business — sections + short copy."
      };
      if (promptInput) promptInput.value = map[s] || "";
      toast("Service selected. Click Generate.");
    });
  });

  // result action chips
  landingMore && landingMore.addEventListener("click", () => toast("Generated variants (demo)."));
  landingRefine && landingRefine.addEventListener("click", () => toast("Refined output (demo)."));
  landingExport && landingExport.addEventListener("click", () => toast("Exported PNG (demo)."));

  // ---------------------------
  // Tool pills (simple highlight only)
  // ---------------------------
  $$(".tool-pill").forEach((p) => {
    p.addEventListener("click", () => {
      $$(".tool-pill").forEach((x) => x.classList.remove("is-active"));
      p.classList.add("is-active");
      toast(`${p.textContent} mode (demo)`);
    });
  });

  // ---------------------------
  // Contact form fake submit
  // ---------------------------
  const contactForm = $("#contactForm");
  const formNote = $("#formNote");
  contactForm && contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (formNote) formNote.textContent = "Sent (demo). We’ll get back to you soon.";
    toast("Message sent (demo).");
  });

  // footer year
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------------------------
  // Toast
  // ---------------------------
  function toast(msg) {
    let t = $("#toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.classList.remove("show"), 1700);
  }
})();
