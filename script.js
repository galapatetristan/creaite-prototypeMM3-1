(function () {
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

  // ---------------------------
  // Helpers
  // ---------------------------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
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

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickTags(arr, n = 7) {
    const copy = arr.slice();
    copy.sort(() => 0.5 - Math.random());
    return copy.slice(0, Math.min(n, copy.length));
  }

  // ---------------------------
  // Mobile menu (simple)
  // ---------------------------
  const menuBtn = $("#menuBtn");
  const nav = $("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      toast(open ? "Menu opened" : "Menu closed");
    });
  }

  // ---------------------------
  // Auth (demo simulation)
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

 const authBackdrop = document.querySelector("#authBackdrop");
const authModal = document.querySelector("#authModal");
const authState = document.querySelector("#authState");
const authEmail = document.querySelector("#authEmail");
const authContinue = document.querySelector("#authContinue");
const authClose = document.querySelector("#authClose");
  const authLogout = $("#authLogout");
  const authState = $("#authState");
  const authStateInline = $("#authStateInline");

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
    const labelTargets = ["#openSignIn", "#openSignIn2", "#openSignIn3"].map((id) => $(id)).filter(Boolean);
    labelTargets.forEach((btn) => {
      btn.textContent = u ? `Signed in: ${u.provider}` : "Sign in to save projects";
    });

    const text = u ? `Signed in as ${u.email || "demo-user"} (${u.provider})` : "";
    if (authState) authState.textContent = text;
    if (authStateInline) authStateInline.textContent = text;
  }

  // Hook sign-in open buttons
  const openBtns = ["#openSignIn", "#openSignIn2"]
  .map(id => document.querySelector(id))
  .filter(Boolean);

openBtns.forEach(btn => btn.addEventListener("click", openAuth));
authClose && authClose.addEventListener("click", closeAuth);
authBackdrop && authBackdrop.addEventListener("click", closeAuth);

  authClose && authClose.addEventListener("click", closeAuth);
  authBackdrop && authBackdrop.addEventListener("click", closeAuth);

  $$(".auth-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.dataset.provider || "Provider";
      const email = (authEmail && authEmail.value.trim()) || "demo@creaite.local";
      if (authStateInline) authStateInline.textContent = "Signing in…";
      setTimeout(() => {
        auth.user = { provider, email, ts: Date.now() };
        toast(`Signed in (${provider})`);
        closeAuth();
      }, 450);
    });
  });

  authContinue && authContinue.addEventListener("click", () => {
    const email = (authEmail && authEmail.value.trim()) || "demo@creaite.local";
    auth.user = { provider: "Email", email, ts: Date.now() };
    toast("Signed in (Email)");
    closeAuth();
  });

  authLogout && authLogout.addEventListener("click", () => {
    auth.logout();
    toast("Signed out");
  });

  renderAuthState();

  // ---------------------------
  // Tool pills + mode
  // ---------------------------
  let activeTool = "prompt";

  function setActiveTool(tool) {
    activeTool = tool || "prompt";

    $$(".tool-pill").forEach((p) => {
      p.classList.toggle("is-active", p.dataset.tool === activeTool);
    });

    // show/hide video upload row on landing
    const videoRow = $("#videoUploadRow");
    if (videoRow) videoRow.hidden = (activeTool !== "video");

    // hint text
    if (activeTool === "video") toast("Video edit mode (demo) — upload a raw video below.");
    else if (activeTool === "web") toast("Website mode (demo) — generates sections + copy.");
    else toast(`${activeTool} mode (demo)`);
  }

  $$(".tool-pill").forEach((p) => {
    p.addEventListener("click", () => setActiveTool(p.dataset.tool));
  });

  // ---------------------------
  // Service cards (color on click + prompt fill)
  // ---------------------------
  const promptInput = $("#promptInput");
  $$(".service-card").forEach((c) => {
    c.addEventListener("click", () => {
      $$(".service-card").forEach((x) => x.classList.remove("is-active"));
      c.classList.add("is-active");

      const s = c.dataset.service;
      const map = {
        social: "Write 3 caption options + hashtags for a post this week. Add a short design direction.",
        branding: "Create a brand kit: colors, typography, tone, and a quick logo usage guide.",
        ads: "Generate 3 promo poster variations for a weekend sale. Add CTA + layout direction.",
        web: "Design a landing page for a small business — sections + short copy + CTA + UI/UX notes.",
        video: "Edit my raw video: add captions, cut dead air, improve colors, and suggest music vibe."
      };

      if (promptInput) promptInput.value = map[s] || "";
      if (s === "web") setActiveTool("web");
      if (s === "video") setActiveTool("video");
      toast("Service selected. Click Generate.");
    });
  });

  // Suggestion chips fill prompt (both pages)
  $$(".chip-action").forEach((c) => {
    c.addEventListener("click", () => {
      const text = c.dataset.suggest || "";
      const landing = $("#promptInput");
      const demo = $("#demoPromptInput");
      if (landing) landing.value = text;
      if (demo) demo.value = text;
      toast("Prompt filled. Click Generate.");
    });
  });

  // ---------------------------
  // LANDING GENERATE
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
    const p = (prompt || "").toLowerCase();

    // keyword detection
    const isFood = /(adobo|cooking|recipe|luto|ulam|food|dish|kitchen|chef|sinigang|lechon|pancit|sisig|tinola)/i.test(p);
    const isAdobo = /adobo/i.test(p);
    const isCafe = /(milktea|milk tea|latte|coffee|cafe|tea|matcha|espresso|frappe)/i.test(p);
    const isFashion = /(streetwear|clothing|outfit|fashion|drop|collection|sneakers|apparel)/i.test(p);
    const isPoster = /(poster|flyer|promo|discount|sale|%|offer|limited|ad\b|advert|marketing)/i.test(p);
    const isWebsite = /(website|landing page|ui\/ux|ui|ux|wireframe|sections|copy|homepage|navbar)/i.test(p) || tool === "web";
    const isVideo = /(video|edit|caption|subtitles|trim|reels|tiktok|color grade|cinematic|raw video|upload)/i.test(p) || tool === "video";

    // base output slots
    let title = "Generated output (demo)";
    let blocks = [];

    // WEBSITE MODE
    if (isWebsite && !isVideo) {
      title = "Website draft (UI/UX + Copy)";
      const businessType =
        (/(cafe|coffee|milktea|milk tea)/i.test(p) && "Café / Drinks") ||
        (/(clothing|streetwear|fashion)/i.test(p) && "Clothing brand") ||
        (/(school|student|org)/i.test(p) && "Student org") ||
        "Small business";

      blocks.push(`<div class="result-item"><strong>Type:</strong> ${escapeHtml(businessType)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hero headline:</strong> “Make marketing content in minutes — not hours.”</div>`);
      blocks.push(`<div class="result-item"><strong>Subheadline:</strong> One platform for captions, designs, website sections, and video edits — guided by prompts and templates.</div>`);
      blocks.push(`<div class="result-item"><strong>Primary CTA:</strong> “Start free” • Secondary: “View pricing”</div>`);

      blocks.push(`<div class="result-item"><strong>Sections:</strong>
        <br>1) Benefits grid (Speed • Consistency • Control)
        <br>2) How it works (5 steps)
        <br>3) Feature highlights (Brand kit, Templates, Web drafts, Video edits)
        <br>4) Pricing (Personal/Student/Business/Enterprise)
        <br>5) FAQ + Contact
      </div>`);

      blocks.push(`<div class="result-item"><strong>UI/UX notes:</strong> Sticky nav • 2-button CTA • Card-based sections • One clear “Generate” box • Minimal icons</div>`);

      blocks.push(`<div class="result-item"><strong>Suggested prompt for CreAIte:</strong> “Create a landing page for ${escapeHtml(businessType)} with sections + short copy + CTA.”</div>`);

      return { title, blocks, ctaLabel: "Export PNG (demo)" };
    }

    // VIDEO MODE
    if (isVideo) {
      title = "Video edit plan (demo)";
      blocks.push(`<div class="result-item"><strong>Edits:</strong> Cut dead air • Auto captions • Hook text in first 2s • Color polish</div>`);
      blocks.push(`<div class="result-item"><strong>Caption style:</strong> Large, high-contrast • Keywords highlighted • 1–2 lines max</div>`);
      blocks.push(`<div class="result-item"><strong>Suggested pacing:</strong> 0.95x–1.05x speed • Quick jump cuts • Beat-synced transitions</div>`);
      blocks.push(`<div class="result-item"><strong>Export formats:</strong> 9:16 (Reels/TikTok) • 1:1 (IG feed) • 16:9 (YouTube)</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> “Watch till the end” / “Follow for part 2”</div>`);
      return { title, blocks, ctaLabel: "Export MP4 (demo)" };
    }

    // FOOD (ADOB0 FIX)
    if (isFood && isAdobo) {
      title = "Generated caption set (Adobo)";
      const c1 = "Tonight’s comfort food: classic Filipino adobo — rich, savory, and slow-simmered to perfection. 🍲🇵🇭";
      const c2 = "Adobo on the menu! Tender bites, bold flavors, and that signature sauce you’ll want over rice. 🍚✨";
      const tags = ["#Adobo", "#FilipinoFood", "#PinoyCooking", "#HomeCooking", "#CookingShow", "#Ulam", "#FoodiePH", "#Sarap", "#Recipe"];
      blocks.push(`<div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Shot direction:</strong> Close-up sauce gloss • steam + rice • plating hero shot • simple text overlay</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> “Watch the full recipe” / “Try this at home”</div>`);
      return { title, blocks, ctaLabel: "Export PNG (demo)" };
    }

    // OTHER FOOD
    if (isFood) {
      title = "Generated caption set (Food)";
      const c1 = "Fresh off the pan — simple ingredients, big flavor. 🍳✨";
      const c2 = "Cook with me: easy steps, satisfying results, and good vibes in the kitchen. 🍽️";
      const tags = ["#FoodContent", "#CookingShow", "#HomeCooking", "#RecipeIdeas", "#FoodiePH", "#KitchenDiaries", "#Sarap"];
      blocks.push(`<div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Shot direction:</strong> Overhead cooking shots • step-by-step captions • final plating hero shot</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> “Save this recipe” / “Watch the steps”</div>`);
      return { title, blocks, ctaLabel: "Export PNG (demo)" };
    }

    // CAFE
    if (isCafe || (isPoster && isCafe)) {
      title = "Generated promo captions (Cafe)";
      const c1 = "New drink drop! 🧋 Try it today — limited time only.";
      const c2 = "Something sweet just landed. Grab your first sip now.";
      const tags = ["#CafePH", "#Milktea", "#CoffeePH", "#NewMenu", "#LocalBusiness", "#FoodPH", "#SupportLocal"];
      blocks.push(`<div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Design direction:</strong> Minimal layout • product highlight • bold CTA • brand color accents</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> “Order now” / “Visit us today”</div>`);
      return { title, blocks, ctaLabel: "Export PNG (demo)" };
    }

    // FASHION
    if (isFashion) {
      title = "Generated captions (Streetwear drop)";
      const c1 = "New drop is live. Clean fits, bold details — don’t sleep on it. 🔥";
      const c2 = "Limited pieces. First come, first served. Tap in before it’s gone. 🧢";
      const tags = ["#Streetwear", "#NewDrop", "#LocalBrand", "#OOTD", "#FashionPH", "#StyleUpdate", "#Hype"];
      blocks.push(`<div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Design direction:</strong> High-contrast layout • drop date highlight • product focus • clear CTA</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> “Shop the drop” / “Check the collection”</div>`);
      return { title, blocks, ctaLabel: "Export PNG (demo)" };
    }

    // POSTER / ADS GENERAL
    if (isPoster) {
      title = "Generated promo copy (General)";
      const c1 = "Big deal, limited time — grab it while it lasts. ⚡";
      const c2 = "Don’t miss out: offer ends soon. Save more today.";
      const tags = ["#Promo", "#Sale", "#LimitedOffer", "#Marketing", "#LocalBusiness", "#Deals", "#ShopNow"];
      blocks.push(`<div class="result-item"><strong>Copy (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Copy (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Layout direction:</strong> Headline-first • discount block • social proof line • one strong CTA</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> “Claim offer” / “Shop now”</div>`);
      return { title, blocks, ctaLabel: "Export PNG (demo)" };
    }

    // DEFAULT
    title = "Generated output (General)";
    blocks.push(`<div class="result-item"><strong>Draft:</strong> Here’s a clean first draft you can tweak for your brand tone.</div>`);
    blocks.push(`<div class="result-item"><strong>Next:</strong> Want it more formal, fun, or Gen Z? I can adjust the voice.</div>`);
    blocks.push(`<div class="result-item"><strong>Tip:</strong> Add audience + platform + goal for better results.</div>`);
    return { title, blocks, ctaLabel: "Export PNG (demo)" };
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
        <div class="result-list">
          ${out.blocks.join("")}
        </div>
      `);

      // make action chips reflect mode
      if (landingExport) landingExport.textContent = out.ctaLabel || "Export PNG";
    }, 750);
  }

  landingForm && landingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    landingGenerate();
  });

  const generateBtn = $("#generateBtn");
  generateBtn && generateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    landingGenerate();
  });

  landingMore && landingMore.addEventListener("click", () => toast("Generated variants (demo)."));
  landingRefine && landingRefine.addEventListener("click", () => toast("Refined output (demo)."));
  landingExport && landingExport.addEventListener("click", () => toast("Exported (demo)."));

  // ---------------------------
  // Video upload (landing demo)
  // ---------------------------
  const videoFile = $("#videoFile");
  const videoPresetBtn = $("#videoPresetBtn");
  const videoEditBtn = $("#videoEditBtn");
  const videoNote = $("#videoNote");

  function setVideoNote(msg) {
    if (videoNote) videoNote.textContent = msg || "";
  }

  videoPresetBtn && videoPresetBtn.addEventListener("click", () => {
    setVideoNote("Preset applied (demo): Cinematic + Auto captions + Clean cuts.");
    toast("Preset applied (demo).");
  });

  videoEditBtn && videoEditBtn.addEventListener("click", () => {
    const hasFile = videoFile && videoFile.files && videoFile.files.length > 0;
    if (!hasFile) {
      toast("Upload a raw video first.");
      setVideoNote("Please upload a raw video file first.");
      return;
    }
    setVideoNote("Editing… (demo) Trimming, captions, color polish…");
    toast("Editing video (demo)...");
    setTimeout(() => {
      setVideoNote("Done! (demo) Captions added • Dead air removed • Colors boosted • Export ready.");
      toast("Video edit done (demo).");
    }, 900);
  });

  // ---------------------------
  // Pricing tabs
  // ---------------------------
  const tabs = $$(".tab");
  const panels = $$("[data-panel]");
  function setTab(name) {
    tabs.forEach((t) => {
      const isActive = t.dataset.tab === name;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    panels.forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== name));
  }
  tabs.forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));
  if (tabs.length) setTab("personal");

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
  // FEATURES PAGE generator
  // ---------------------------
  const demoForm = $("#demoPromptForm");
  const demoInput = $("#demoPromptInput");
  const resultBody = $("#resultBody");
  const resultStatus = $("#resultStatus");
  const variantGrid = $("#variantGrid");

  function setResultModeLabel() {
    const resultMode = $("#resultMode");
    if (resultMode) resultMode.textContent = String(activeTool || "prompt").toUpperCase();
  }

  function fakeGenerateFeatures(promptText) {
    const prompt = (promptText || "").trim();
    if (!prompt) return toast("Type a prompt first.");

    setResultModeLabel();

    if (resultStatus) resultStatus.textContent = "Generating…";
    if (resultBody) {
      resultBody.innerHTML = `
        <div class="loading">
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
        <p class="muted" style="margin-top:10px;">Working on: <strong>${escapeHtml(prompt)}</strong></p>
      `;
    }

    setTimeout(() => {
      const out = buildOutput(prompt, activeTool);

      if (resultStatus) resultStatus.textContent = "Done";
      if (resultBody) {
        resultBody.innerHTML = `
          <h3>${escapeHtml(out.title)}</h3>
          <p class="muted">Prompt: <strong>${escapeHtml(prompt)}</strong></p>
          <div class="result-list">${out.blocks.join("")}</div>
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
    fakeGenerateFeatures(demoInput && demoInput.value);
  });

  // features action chips
  $$("[data-action]").forEach((b) => {
    b.addEventListener("click", () => {
      const action = b.dataset.action;
      if (action === "variant") toast("Generated more variants (demo).");
      if (action === "refine") toast("Refined output (demo).");
      if (action === "export") toast("Exported (demo).");
    });
  });

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
      resultBody.innerHTML = `<h3>Your results will appear here.</h3><p class="muted">Type a prompt or click a suggestion, then Generate.</p>`;
    }
  });

})();

// Close modal when clicking the backdrop or close button
document.addEventListener("click", (e) => {
  if (e.target.closest("#authClose")) {
    // Close modal when '×' is clicked
    closeAuth();
  }

  if (e.target.closest("#authBackdrop")) {
    // Close modal when backdrop is clicked
    closeAuth();
  }
});

// Function to open the auth modal
function openAuth() {
  const authBackdrop = document.querySelector("#authBackdrop");
  const authModal = document.querySelector("#authModal");

  if (!authModal || !authBackdrop) return;

  authBackdrop.hidden = false; // Show backdrop
  authModal.hidden = false; // Show modal
}

// Function to close the auth modal
function closeAuth() {
  const authBackdrop = document.querySelector("#authBackdrop");
  const authModal = document.querySelector("#authModal");

  if (!authModal || !authBackdrop) return;

  authBackdrop.hidden = true; // Hide backdrop
  authModal.hidden = true; // Hide modal
}

