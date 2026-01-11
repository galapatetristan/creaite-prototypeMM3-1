(function () {
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

  // ---------------------------
  // Auth (prototype simulation)
  // ---------------------------
  const auth = {
    get user() {
      try { return JSON.parse(localStorage.getItem("creaite_user") || "null"); } catch { return null; }
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

  const authBackdrop = $("#authBackdrop");
  const authModal = $("#authModal");
  const authState = $("#authState");
  const authEmail = $("#authEmail");
  const authContinue = $("#authContinue");
  const authClose = $("#authClose");

  function openAuth() {
    if (!authModal || !authBackdrop) return;
    authBackdrop.hidden = false;
    authModal.hidden = false;
    authEmail && authEmail.focus();
  }
  function closeAuth() {
    if (!authModal || !authBackdrop) return;
    authBackdrop.hidden = true;
    authModal.hidden = true;
  }

  function renderAuthState() {
    const u = auth.user;
    const labelTargets = ["#openSignIn", "#openSignIn2"].map((id) => $(id)).filter(Boolean);
    labelTargets.forEach((btn) => {
      btn.textContent = u ? `Signed in: ${u.provider}` : "Sign in to save projects";
    });

    if (authState) {
      authState.textContent = u ? `Signed in as ${u.email || "demo-user"} (${u.provider})` : "";
    }
  }

  // Hook buttons
  const openBtns = ["#openSignIn", "#openSignIn2"].map((id) => $(id)).filter(Boolean);
  openBtns.forEach((b) => b.addEventListener("click", openAuth));
  authClose && authClose.addEventListener("click", closeAuth);
  authBackdrop && authBackdrop.addEventListener("click", closeAuth);

  $$(".auth-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.dataset.provider || "Provider";
      const email = (authEmail && authEmail.value) || "demo@creaite.local";
      auth.user = { provider, email, ts: Date.now() };

      if (authState) authState.textContent = "Signing in…";
      setTimeout(() => {
        if (authState) authState.textContent = `Signed in as ${email} (${provider})`;
        closeAuth();
      }, 600);
    });
  });

  authContinue && authContinue.addEventListener("click", () => {
    const email = (authEmail && authEmail.value.trim()) || "demo@creaite.local";
    auth.user = { provider: "Email", email, ts: Date.now() };
    closeAuth();
  });

  renderAuthState();

  // ---------------------------
  // Landing page suggestions
  // ---------------------------
  const promptInput = $("#promptInput");
  $$(".chip-action").forEach((c) => {
    c.addEventListener("click", () => {
      const text = c.dataset.suggest;
      if (promptInput) promptInput.value = text || "";
      const demoPrompt = $("#demoPromptInput");
      if (demoPrompt) demoPrompt.value = text || "";
    });
  });

  // Tool pills highlight (both pages)
  function setupToolPills(scope = document) {
    const pills = Array.from(scope.querySelectorAll(".tool-pill"));
    pills.forEach((p) => {
      p.addEventListener("click", () => {
        pills.forEach((x) => x.classList.remove("is-active"));
        p.classList.add("is-active");

        const mode = p.dataset.tool;
        const resultMode = $("#resultMode");
        if (resultMode) resultMode.textContent = (mode || "Prompt").toUpperCase();

        const resultBody = $("#resultBody");
        if (resultBody) {
          if (mode === "brand") {
            resultBody.innerHTML = `
              <h3>Brand kit (demo)</h3>
              <p class="muted">Click “Apply brand kit” to update palette and font choices for the generated designs.</p>
              <div class="chips">
                <span class="chip">Primary: #6D5EF6</span>
                <span class="chip">Accent: #25C2FF</span>
                <span class="chip">Font: Inter</span>
                <span class="chip">Tone: Professional</span>
              </div>
              <button class="btn btn-ghost" id="applyBrandBtn">Apply brand kit</button>
            `;
            const b = $("#applyBrandBtn");
            b && b.addEventListener("click", () => toast("Brand kit applied (demo)."));
          } else if (mode === "templates") {
            resultBody.innerHTML = `
              <h3>Templates (demo)</h3>
              <p class="muted">Pick a template, then Generate to create variations.</p>
              <div class="mini-grid">
                <button class="mini-card" data-tpl="IG Story Promo">IG Story Promo</button>
                <button class="mini-card" data-tpl="Poster / Flyer">Poster / Flyer</button>
                <button class="mini-card" data-tpl="Facebook Ad">Facebook Ad</button>
                <button class="mini-card" data-tpl="Product Launch">Product Launch</button>
              </div>
            `;
            $$(".mini-card").forEach((m) => {
              m.addEventListener("click", () => {
                const tpl = m.dataset.tpl || "Template";
                const demoPrompt = $("#demoPromptInput");
                if (demoPrompt) demoPrompt.value = `Use template: ${tpl}. ${demoPrompt.value || ""}`.trim();
                toast(`Selected template: ${tpl}`);
              });
            });
          } else if (mode === "export") {
            resultBody.innerHTML = `
              <h3>Export (demo)</h3>
              <p class="muted">Choose format and simulate download (for presentation).</p>
              <div class="chips">
                <button class="chip" data-exp="PNG">PNG</button>
                <button class="chip" data-exp="JPG">JPG</button>
                <button class="chip" data-exp="PDF">PDF</button>
                <button class="chip" data-exp="MP4">MP4</button>
              </div>
            `;
            $$("[data-exp]").forEach((b) => b.addEventListener("click", () => toast(`Exported ${b.dataset.exp} (demo).`)));
          } else {
            // prompt default
            if (resultBody && resultBody.dataset.locked !== "1") {
              resultBody.innerHTML = `
                <h3>Your results will appear here.</h3>
                <p class="muted">Type a prompt or click a suggestion, then Generate.</p>
              `;
            }
          }
        }
      });
    });
  }
  setupToolPills(document);

  // ---------------------------
  // Demo generator (features page)
  // ---------------------------
  const demoForm = $("#demoPromptForm");
  const demoInput = $("#demoPromptInput");
  const resultBody = $("#resultBody");
  const resultStatus = $("#resultStatus");
  const variantGrid = $("#variantGrid");

  function fakeGenerate(promptText) {
    const prompt = (promptText || "").trim();
    if (!prompt) return;

    if (resultStatus) resultStatus.textContent = "Generating…";
    if (resultBody) {
      resultBody.dataset.locked = "1";
      resultBody.innerHTML = `
        <div class="loading">
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
        <p class="muted" style="margin-top:10px;">Working on: <strong>${escapeHtml(prompt)}</strong></p>
      `;
    }

    setTimeout(() => {
      if (resultStatus) resultStatus.textContent = "Done";
      if (resultBody) {
        resultBody.innerHTML = `
          <h3>Generated (demo)</h3>
          <p class="muted">Prompt: <strong>${escapeHtml(prompt)}</strong></p>
          <div class="result-list">
            <div class="result-item"><strong>Design direction:</strong> Clean, modern, high-contrast CTA</div>
            <div class="result-item"><strong>Caption:</strong> “New drop is here. Limited time offer — tap to shop.”</div>
            <div class="result-item"><strong>Hashtags:</strong> #SmallBusiness #Promo #NewDrop #LocalBrand</div>
            <div class="result-item"><strong>Layout:</strong> Headline + product image + CTA button</div>
          </div>
        `;
      }
      if (variantGrid) {
        variantGrid.innerHTML = `
          <div class="mini-card ghost">Variant A<br><span class="muted">Minimal</span></div>
          <div class="mini-card ghost">Variant B<br><span class="muted">Bold</span></div>
          <div class="mini-card ghost">Variant C<br><span class="muted">Editorial</span></div>
          <div class="mini-card ghost">Variant D<br><span class="muted">Playful</span></div>
        `;
        variantGrid.setAttribute("aria-hidden", "false");
      }
    }, 900);
  }

  demoForm && demoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    fakeGenerate(demoInput && demoInput.value);
  });

  // bottom chips in result card
  $$("[data-action]").forEach((b) => {
    b.addEventListener("click", () => {
      const action = b.dataset.action;
      if (action === "variant") toast("Generated more variants (demo).");
      if (action === "refine") toast("Refined output (demo).");
      if (action === "export") toast("Exported PNG (demo).");
    });
  });

  // save project button (requires "sign in")
  const saveBtn = $("#saveProjectBtn");
  saveBtn && saveBtn.addEventListener("click", () => {
    if (!auth.user) {
      toast("Please sign in to save (demo).");
      openAuth();
      return;
    }
    toast("Project saved (demo).");
  });

  const resetBtn = $("#resetDemoBtn");
  resetBtn && resetBtn.addEventListener("click", () => {
    if (demoInput) demoInput.value = "";
    if (variantGrid) variantGrid.innerHTML = "";
    if (resultStatus) resultStatus.textContent = "Ready";
    if (resultBody) {
      resultBody.dataset.locked = "0";
      resultBody.innerHTML = `<h3>Your results will appear here.</h3><p class="muted">Type a prompt or click a suggestion, then Generate.</p>`;
    }
  });

  // Landing form (index)
  const landingForm = $("#promptForm");
  landingForm && landingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = promptInput && promptInput.value;
    toast(v ? "Generated (demo). Scroll down for workflow & pricing." : "Type a prompt first.");
  });

  // Service cards click → fill prompt box
  $$(".service-card").forEach((c) => {
    c.addEventListener("click", () => {
      const s = c.dataset.service;
      const map = {
        social: "Create 3 IG post ideas + captions for a small café this week.",
        branding: "Create a brand kit: colors, typography, tone for a minimal skincare brand.",
        ads: "Generate 3 promo poster variants for a 20% off weekend sale.",
        web: "Design a landing page layout for a small business — sections + copy."
      };
      if (promptInput) promptInput.value = map[s] || "";
      toast("Service selected (demo). Try Generate.");
    });
  });

  // Simple toast
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
    window.__toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }
})();

