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
  // Auth (DEMO) — FIXED
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

  function openAuth() {
    if (!authBackdrop || !authModal) return;
    authBackdrop.hidden = false;
    authModal.hidden = false;
    document.body.style.overflow = "hidden";
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

  // Open buttons
  ["#openSignIn", "#openSignIn2"].map((id) => $(id)).filter(Boolean)
    .forEach((btn) => btn.addEventListener("click", openAuth));

  // Close by X (IMPORTANT: stopPropagation so it won't get eaten by backdrop click)
  if (authClose) {
    authClose.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAuth();
    });
  }

  // Close by clicking backdrop
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
      }, 350);
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
  // Tool pills (Prompt/Brand/Templates/Web/Video)
  // ---------------------------
  let activeTool = "prompt";

  function setActiveTool(tool) {
    activeTool = tool || "prompt";
    $$(".tool-pill").forEach((p) => p.classList.toggle("is-active", p.dataset.tool === activeTool));

    const videoRow = $("#videoUploadRow");
    if (videoRow) videoRow.hidden = (activeTool !== "video");

    if (activeTool === "video") toast("Video edit mode (demo).");
    else if (activeTool === "web") toast("Website mode (demo).");
  }

  $$(".tool-pill").forEach((p) => p.addEventListener("click", () => setActiveTool(p.dataset.tool)));

  // ---------------------------
  // Service cards (active highlight + prompt fill)
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

  // Suggestion chips fill prompt
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
    const p = (prompt || "").toLowerCase();

    const isFood = /(adobo|cooking|recipe|luto|ulam|food|dish|kitchen|chef|sinigang|lechon|pancit|sisig|tinola)/i.test(p);
    const isAdobo = /adobo/i.test(p);

    const isCafe = /(milktea|milk tea|latte|coffee|cafe|tea|matcha|espresso|frappe)/i.test(p);
    const isFashion = /(streetwear|clothing|outfit|fashion|drop|collection|sneakers|apparel)/i.test(p);
    const isPoster = /(poster|flyer|promo|discount|sale|%|offer|limited|ad\b|advert|marketing)/i.test(p);

    const isWebsite = /(website|landing page|ui\/ux|ui|ux|wireframe|sections|copy|homepage|navbar|3-page)/i.test(p) || tool === "web";
    const isVideo = /(video|edit|caption|subtitles|trim|reels|tiktok|color grade|cinematic|raw video|upload)/i.test(p) || tool === "video";

    let title = "Generated output (demo)";
    const blocks = [];
    let exportLabel = "Export PNG";

    // WEBSITE
    if (isWebsite && !isVideo) {
      title = "Website draft (UI/UX + Copy)";
      exportLabel = "Export PNG (demo)";

      blocks.push(`<div class="result-item"><strong>Hero headline:</strong> Make marketing content in minutes — not hours.</div>`);
      blocks.push(`<div class="result-item"><strong>Subheadline:</strong> Captions, posters, website sections, and video edits — guided by prompts + templates.</div>`);
      blocks.push(`<div class="result-item"><strong>Primary CTA:</strong> Start free • <strong>Secondary:</strong> View pricing</div>`);

      blocks.push(`<div class="result-item"><strong>Suggested sections:</strong><br>
        1) Benefits grid (Speed • Consistency • Control)<br>
        2) How it works (4 steps)<br>
        3) Services (Social, Ads, Web/UI, Video)<br>
        4) Pricing (Personal/Student/Business/Enterprise)<br>
        5) FAQ + Contact</div>`);

      blocks.push(`<div class="result-item"><strong>UI/UX notes:</strong> Sticky nav • Big prompt box • Card layout • Clear “Generate” button • Mobile-first</div>`);
      blocks.push(`<div class="result-item"><strong>Suggested prompt:</strong> “${escapeHtml(prompt)}”</div>`);

      return { title, blocks, exportLabel };
    }

    // VIDEO
    if (isVideo) {
      title = "Video edit plan (demo)";
      exportLabel = "Export MP4 (demo)";

      blocks.push(`<div class="result-item"><strong>Edits:</strong> Cut dead air • Auto captions • Hook text in first 2 seconds • Color polish</div>`);
      blocks.push(`<div class="result-item"><strong>Caption style:</strong> Large, high-contrast • 1–2 lines max • highlight keywords</div>`);
      blocks.push(`<div class="result-item"><strong>Pacing:</strong> quick jump cuts • beat-synced transitions • remove pauses</div>`);
      blocks.push(`<div class="result-item"><strong>Export formats:</strong> 9:16 (Reels/TikTok) • 1:1 (IG) • 16:9 (YT)</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> “Watch till the end” / “Follow for part 2”</div>`);

      return { title, blocks, exportLabel };
    }

    // FOOD — ADOB0 FIX
    if (isFood && isAdobo) {
      title = "Caption set — Filipino Adobo";
      const c1 = "Tonight’s comfort food: classic Filipino adobo — rich, savory, and slow-simmered to perfection. 🍲🇵🇭";
      const c2 = "Adobo on the menu! Tender bites, bold flavors, and that signature sauce you’ll want over rice. 🍚✨";
      const tags = ["#Adobo", "#FilipinoFood", "#PinoyCooking", "#HomeCooking", "#CookingShow", "#Ulam", "#FoodiePH", "#Sarap", "#Recipe"];

      blocks.push(`<div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Shot direction:</strong> close-up sauce gloss • steam + rice • plating hero shot • simple text overlay</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> Watch the full recipe / Try this at home</div>`);

      return { title, blocks, exportLabel };
    }

    // OTHER FOOD
    if (isFood) {
      title = "Caption set — Food";
      const c1 = "Fresh off the pan — simple ingredients, big flavor. 🍳✨";
      const c2 = "Cook with me: easy steps, satisfying results, and good vibes in the kitchen. 🍽️";
      const tags = ["#FoodContent", "#CookingShow", "#HomeCooking", "#RecipeIdeas", "#FoodiePH", "#KitchenDiaries", "#Sarap"];

      blocks.push(`<div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Shot direction:</strong> overhead cooking • step captions • final plating hero shot</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> Save this recipe / Watch the steps</div>`);

      return { title, blocks, exportLabel };
    }

    // CAFE
    if (isCafe || (isPoster && isCafe)) {
      title = "Promo captions — Café";
      const c1 = "New drink drop! 🧋 Try it today — limited time only.";
      const c2 = "Something sweet just landed. Grab your first sip now.";
      const tags = ["#CafePH", "#Milktea", "#CoffeePH", "#NewMenu", "#LocalBusiness", "#FoodPH", "#SupportLocal"];

      blocks.push(`<div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Design direction:</strong> minimal layout • product highlight • bold CTA • brand color accents</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> Order now / Visit us today</div>`);

      return { title, blocks, exportLabel };
    }

    // FASHION
    if (isFashion) {
      title = "Captions — Streetwear drop";
      const c1 = "New drop is live. Clean fits, bold details — don’t sleep on it. 🔥";
      const c2 = "Limited pieces. First come, first served. Tap in before it’s gone. 🧢";
      const tags = ["#Streetwear", "#NewDrop", "#LocalBrand", "#OOTD", "#FashionPH", "#StyleUpdate", "#Hype"];

      blocks.push(`<div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Design direction:</strong> high contrast • product focus • drop date highlight • one strong CTA</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> Shop the drop / Check the collection</div>`);

      return { title, blocks, exportLabel };
    }

    // POSTER / ADS
    if (isPoster) {
      title = "Promo copy — General";
      const c1 = "Big deal, limited time — grab it while it lasts. ⚡";
      const c2 = "Don’t miss out: offer ends soon. Save more today.";
      const tags = ["#Promo", "#Sale", "#LimitedOffer", "#Marketing", "#LocalBusiness", "#Deals", "#ShopNow"];

      blocks.push(`<div class="result-item"><strong>Copy (Option 1):</strong> ${escapeHtml(c1)}</div>`);
      blocks.push(`<div class="result-item"><strong>Copy (Option 2):</strong> ${escapeHtml(c2)}</div>`);
      blocks.push(`<div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(pickTags(tags).join(" "))}</div>`);
      blocks.push(`<div class="result-item"><strong>Layout direction:</strong> headline-first • discount block • social proof line • one CTA</div>`);
      blocks.push(`<div class="result-item"><strong>CTA:</strong> Claim offer / Shop now</div>`);

      return { title, blocks, exportLabel };
    }

    // DEFAULT
    title = "Generated output (General)";
    blocks.push(`<div class="result-item"><strong>Draft:</strong> Here’s a clean first draft you can tweak for your tone.</div>`);
    blocks.push(`<div class="result-item"><strong>Tip:</strong> Add audience + platform + goal for better results.</div>`);
    return { title, blocks, exportLabel };
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
    }, 600);
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

    panels.forEach((p) => {
      p.classList.toggle("hidden", p.dataset.panel !== name);
    });
  }

  tabs.forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));

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
