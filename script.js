(function () {
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

  // ---------------------------
  // Helpers
  // ---------------------------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[c]));
  }

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

  function pickTags(arr, n = 7) {
    const copy = arr.slice();
    copy.sort(() => 0.5 - Math.random());
    return copy.slice(0, Math.min(n, copy.length));
  }

  // ---------------------------
  // Mobile menu
  // ---------------------------
  const menuBtn = $("#menuBtn");
  const nav = $("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ---------------------------
  // Auth (DEMO) — HARD QUICK FIX (no auto-open)
  // ---------------------------
  const authBackdrop = $("#authBackdrop");
  const authModal = $("#authModal");
  const authClose = $("#authClose");
  const authEmail = $("#authEmail");
  const authContinue = $("#authContinue");
  const authLogout = $("#authLogout");
  const authState = $("#authState");
  const authStateInline = $("#authStateInline");

  const auth = {
    get user() {
      try { return JSON.parse(localStorage.getItem("creaite_user") || "null"); }
      catch { return null; }
    },
    set user(val) {
      localStorage.setItem("creaite_user", JSON.stringify(val));
      renderAuthState();
    },
    logout() {
      localStorage.removeItem("creaite_user");
      renderAuthState();
    }
  };

  function forceAuthLayerFix() {
    // This overrides bad CSS that blocks clicks on modal buttons
    if (authBackdrop) {
      authBackdrop.style.zIndex = "9998";
      authBackdrop.style.pointerEvents = "auto";
    }
    if (authModal) {
      authModal.style.zIndex = "9999";
      authModal.style.pointerEvents = "auto";
    }
    const card = authModal ? authModal.querySelector(".modal-card") : null;
    if (card) {
      card.style.pointerEvents = "auto";
    }
    if (authClose) {
      authClose.style.pointerEvents = "auto";
      authClose.style.zIndex = "10000";
    }
  }

  function openAuth() {
    if (!authBackdrop || !authModal) return;
    authBackdrop.hidden = false;
    authModal.hidden = false;
    document.body.style.overflow = "hidden";
    forceAuthLayerFix();
    setTimeout(() => authEmail && authEmail.focus(), 0);
  }

  function closeAuth() {
    if (!authBackdrop || !authModal) return;
    authBackdrop.hidden = true;
    authModal.hidden = true;
    document.body.style.overflow = "";
  }

  function renderAuthState() {
    const u = auth.user;
    const signed = u ? `Signed in as ${u.email || "demo-user"} (${u.provider})` : "";

    if (authState) authState.textContent = signed;
    if (authStateInline) authStateInline.textContent = signed;

    const labelTargets = ["#openSignIn", "#openSignIn2"].map((id) => $(id)).filter(Boolean);
    labelTargets.forEach((btn) => {
      btn.textContent = u ? `Signed in: ${u.provider}` : "Sign in to save projects";
    });
  }

  // IMPORTANT: do NOT auto-open on load
  // (Make sure you do NOT call openAuth() anywhere)

  // Open buttons (manual lang)
  ["#openSignIn", "#openSignIn2"]
    .map((id) => $(id))
    .filter(Boolean)
    .forEach((btn) => btn.addEventListener("click", openAuth));

  // Close by X (still keep, but we won't rely on it only)
  if (authClose) {
    authClose.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAuth();
    });
  }

  // Close by clicking backdrop (main close method)
  if (authBackdrop) {
    authBackdrop.addEventListener("click", (e) => {
      e.preventDefault();
      closeAuth();
    });
  }

  // Close by ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && authModal && authModal.hidden === false) closeAuth();
  });

  // Provider buttons
  $$(".auth-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.dataset.provider || "Provider";
      const email = (authEmail && authEmail.value.trim()) || "demo@creaite.local";
      if (authStateInline) authStateInline.textContent = "Signing in…";
      setTimeout(() => {
        auth.user = { provider, email, ts: Date.now() };
        toast(`Signed in (${provider})`);
        closeAuth();
      }, 250);
    });
  });

  if (authContinue) {
    authContinue.addEventListener("click", () => {
      const email = (authEmail && authEmail.value.trim()) || "demo@creaite.local";
      auth.user = { provider: "Email", email, ts: Date.now() };
      toast("Signed in (Email)");
      closeAuth();
    });
  }

  if (authLogout) {
    authLogout.addEventListener("click", () => {
      auth.logout();
      toast("Signed out");
    });
  }

  renderAuthState();

  // ---------------------------
  // Tool pills
  // ---------------------------
  let activeTool = "prompt";

  function setActiveTool(tool) {
    activeTool = tool || "prompt";
    $$(".tool-pill").forEach((p) =>
      p.classList.toggle("is-active", p.dataset.tool === activeTool)
    );

    const videoRow = $("#videoUploadRow");
    if (videoRow) videoRow.hidden = (activeTool !== "video");

    if (activeTool === "video") toast("Video edit mode (demo).");
    else if (activeTool === "web") toast("Website mode (demo).");
  }

  $$(".tool-pill").forEach((p) => p.addEventListener("click", () => setActiveTool(p.dataset.tool)));

  // ---------------------------
  // Service cards
  // ---------------------------
  const promptInput = $("#promptInput");

  $$(".service-card").forEach((c) => {
    c.addEventListener("click", () => {
      $$(".service-card").forEach((x) => x.classList.remove("is-active"));
      c.classList.add("is-active");

      const s = c.dataset.service;
      const map = {
        social: "Create 5 caption options + hashtags for an IG Reel. Include hook + CTA.",
        branding: "Create a brand kit: colors (hex), typography, tone guide, and logo usage rules.",
        ads: "Generate 3 poster copy variations for a weekend sale. Add CTA + layout direction.",
        web: "Create a landing page structure (sections + short copy) for an SME. Include UI/UX notes.",
        video: "Edit my raw video: add captions, cut dead air, polish colors, and suggest pacing."
      };

      if (promptInput) promptInput.value = map[s] || "";
      if (s === "web") setActiveTool("web");
      if (s === "video") setActiveTool("video");
      toast("Service selected. Click Generate.");
    });
  });

  // Suggestion chips
  $$(".chip-action").forEach((c) => {
    c.addEventListener("click", () => {
      const text = c.dataset.suggest || "";
      if (promptInput) promptInput.value = text;
      toast("Prompt filled. Click Generate.");
    });
  });

  // ---------------------------
  // Landing Generate
  // ---------------------------
  const landingForm = $("#promptForm");
  const landingCard = $("#landingResultCard");
  const landingBody = $("#landingResultBody");
  const landingStatus = $("#landingStatus");
  const landingMore = $("#landingMore");
  const landingRefine = $("#landingRefine");
  const landingExport = $("#landingExport");

  function setLandingResult(statusText, html) {
    if (landingCard) landingCard.hidden = false;
    if (landingStatus) landingStatus.textContent = statusText || "";
    if (landingBody) landingBody.innerHTML = html || "";
  }

  function renderLoading(prompt) {
    setLandingResult("Generating…", `
      <div class="loading">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <p class="muted" style="margin-top:10px;">Working on: <strong>${escapeHtml(prompt)}</strong></p>
    `);
  }

  function buildOutput(prompt, tool) {
    // keep your old complex logic if you want; this is safe default
    const tags = ["#CreAIte", "#ContentCreation", "#Design", "#Copywriting", "#Student", "#SME", "#Marketing"];
    return {
      title: "Generated output (demo)",
      blocks: [
        `<div class="result-item"><strong>Prompt:</strong> ${escapeHtml(prompt)}</div>`,
        `<div class="result-item"><strong>Output:</strong> Ready-to-use draft + direction (demo).</div>`,
        `<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags, 7).join(" "))}</div>`
      ],
      exportLabel: "Export PNG"
    };
  }

  function landingGenerate() {
    const prompt = (promptInput && promptInput.value || "").trim();
    if (!prompt) return toast("Type a prompt first.");

    renderLoading(prompt);

    setTimeout(() => {
      const out = buildOutput(prompt, activeTool);
      setLandingResult("Done", `
        <h3>${escapeHtml(out.title)}</h3>
        <p class="muted"><strong>Prompt:</strong> ${escapeHtml(prompt)}</p>
        <div class="result-list">${out.blocks.join("")}</div>
      `);

      if (landingExport) landingExport.textContent = out.exportLabel || "Export PNG";
    }, 500);
  }

  if (landingForm) {
    landingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      landingGenerate();
    });
  }

  const generateBtn = $("#generateBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      landingGenerate();
    });
  }

  if (landingMore) landingMore.addEventListener("click", () => toast("Generated variants (demo)."));
  if (landingRefine) landingRefine.addEventListener("click", () => toast("Refined output (demo)."));
  if (landingExport) landingExport.addEventListener("click", () => toast("Exported (demo)."));

  // ---------------------------
  // Video upload demo
  // ---------------------------
  const videoFile = $("#videoFile");
  const videoPresetBtn = $("#videoPresetBtn");
  const videoEditBtn = $("#videoEditBtn");
  const videoNote = $("#videoNote");

  function setVideoNote(msg) { if (videoNote) videoNote.textContent = msg || ""; }

  if (videoPresetBtn) {
    videoPresetBtn.addEventListener("click", () => {
      setVideoNote("Preset applied (demo): Cinematic + Auto captions + Clean cuts.");
      toast("Preset applied (demo).");
    });
  }

  if (videoEditBtn) {
    videoEditBtn.addEventListener("click", () => {
      const hasFile = videoFile && videoFile.files && videoFile.files.length > 0;
      if (!hasFile) {
        toast("Upload a raw video first.");
        setVideoNote("Please upload a raw video file first.");
        return;
      }
      setVideoNote("Editing… (demo) Trimming, captions, polish…");
      toast("Editing video (demo)…");
      setTimeout(() => {
        setVideoNote("Done! (demo) Captions added • Dead air removed • Colors boosted • Export ready.");
        toast("Video edit done (demo).");
      }, 900);
    });
  }

  // ---------------------------
  // Pricing tabs (default personal)
  // ---------------------------
  const tabs = $$(".tab");
  const panels = $$("[data-panel]");

  function setTab(name) {
    tabs.forEach((t) => {
      const isActive = t.dataset.tab === name;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    panels.forEach((p) => {
      p.classList.toggle("hidden", p.dataset.panel !== name);
    });
  }

  tabs.forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));
  if (tabs.length) setTab("personal");

  // Footer year
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Contact form
  const contactForm = $("#contactForm");
  const formNote = $("#formNote");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (formNote) formNote.textContent = "Sent (demo). We’ll get back to you soon.";
      toast("Message sent (demo).");
    });
  }
})();
