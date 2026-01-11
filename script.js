(function () {
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

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

  // ---------------------------
  // Header mobile menu
  // ---------------------------
  const menuBtn = $(".menu-btn");
  const nav = $("#nav");
  menuBtn && menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    nav && nav.classList.toggle("open", !open);
  });

  // ---------------------------
  // Pricing tabs
  // ---------------------------
  const tabs = $$(".tab");
  const panels = $$("[data-panel]");
  function setTab(key) {
    tabs.forEach((t) => {
      const active = t.dataset.tab === key;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach((p) => {
      p.classList.toggle("hidden", p.dataset.panel !== key);
    });
  }
  tabs.forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));
  if (tabs.length) setTab("personal");

  // ---------------------------
  // Tool pills highlight (Prompt / Brand / Templates)
  // ---------------------------
  $$(".tool-pill").forEach((p) => {
    p.addEventListener("click", () => {
      $$(".tool-pill").forEach((x) => x.classList.remove("is-active"));
      p.classList.add("is-active");
      const mode = p.dataset.tool || "prompt";
      if (mode === "brand") toast("Brand kit mode (demo)");
      else if (mode === "templates") toast("Templates mode (demo)");
      else toast("Prompt mode");
    });
  });

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
    const openBtn = $("#openSignIn");
    if (openBtn) openBtn.textContent = u ? `Signed in (${u.provider})` : "Sign in";
    if (authState) authState.textContent = u ? `Signed in as ${u.email || "demo"} (${u.provider})` : "";
  }

  $("#openSignIn") && $("#openSignIn").addEventListener("click", openAuth);
  authClose && authClose.addEventListener("click", closeAuth);
  authBackdrop && authBackdrop.addEventListener("click", closeAuth);

  $$(".auth-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.dataset.provider || "Provider";
      const email = (authEmail && authEmail.value.trim()) || "demo@creaite.local";
      auth.user = { provider, email, ts: Date.now() };
      toast(`Signed in with ${provider}`);
      closeAuth();
    });
  });

  authContinue && authContinue.addEventListener("click", () => {
    const email = (authEmail && authEmail.value.trim()) || "demo@creaite.local";
    auth.user = { provider: "Email", email, ts: Date.now() };
    toast("Signed in with Email");
    closeAuth();
  });

  renderAuthState();

  // ---------------------------
  // Landing prompt generator (topic-aware)
  // ---------------------------
  const landingForm = $("#promptForm");
  const promptInput = $("#promptInput");

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

  function landingGenerate(promptText) {
    const prompt = (promptText || (promptInput && promptInput.value) || "").trim();
    if (!prompt) return toast("Type a prompt first.");

    const p = prompt.toLowerCase();

    const isFood = /(adobo|cooking|recipe|luto|ulam|food|dish|kitchen|chef|sinigang|lechon|pancit|sisig|tinola)/i.test(p);
    const isCafe = /(milktea|milk tea|latte|coffee|cafe|tea|matcha|espresso|frappe)/i.test(p);
    const isFashion = /(streetwear|clothing|outfit|fashion|drop|collection|sneakers|apparel)/i.test(p);
    const isPoster = /(poster|flyer|promo|discount|sale|%|offer|ad|advert|marketing)/i.test(p);
    const isUIUX = /(ui\/ux|uiux|website|landing page|wireframe|sections|layout|hero section|navbar)/i.test(p);
    const isVideo = /(video|reel|tiktok|shorts|edit|cut|captions|b-roll|montage)/i.test(p);

    const pickTags = (arr, n = 7) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

    let title = "Generated output";
    let caption1 = "";
    let caption2 = "";
    let hashtags = [];
    let direction = "";
    let cta = "";

    if (isFood && /adobo/i.test(p)) {
      title = "Caption set — Filipino Adobo";
      caption1 = "Tonight’s comfort food: classic Filipino adobo — rich, savory, and slow-simmered to perfection. 🍲🇵🇭";
      caption2 = "Adobo on the menu! Tender bites, bold flavor, and that signature sauce over rice. 🍚✨";
      hashtags = ["#Adobo", "#FilipinoFood", "#PinoyCooking", "#HomeCooking", "#CookingShow", "#Ulam", "#FoodiePH", "#Sarap", "#Recipe"];
      direction = "Warm food close-up • steam + rice pairing • simple subtitle overlay • cozy lighting";
      cta = "“Watch the full recipe” / “Save this for later”";
    } else if (isUIUX) {
      title = "UI/UX Website Layout (Demo)";
      caption1 = "Hero: headline + subtext + primary CTA + social proof.";
      caption2 = "Sections: Features → How it works → Pricing → FAQ → Contact.";
      hashtags = ["#UIUX", "#WebDesign", "#LandingPage", "#Wireframe", "#ProductDesign", "#Startup"];
      direction = "Clean grid • generous spacing • clear hierarchy • CTA above the fold";
      cta = "“Get started” / “Request a demo”";
    } else if (isVideo) {
      title = "Video Edit Plan (Demo)";
      caption1 = "Hook (0–2s): big text + best shot. Cut fast to keep attention.";
      caption2 = "Body (3–12s): 3 highlights + captions. End (13–15s): CTA + logo.";
      hashtags = ["#VideoEditing", "#Reels", "#TikTok", "#ShortForm", "#ContentCreator", "#Marketing"];
      direction = "Jump cuts • caption burn-in • beat-synced clips • strong CTA end-card";
      cta = "“Follow for more” / “Order now”";
    } else if (isCafe || (isPoster && isCafe)) {
      title = "Promo captions — Cafe";
      caption1 = "New drink drop! 🧋 Try it today — limited time only.";
      caption2 = "Something sweet just landed. Grab your first sip now.";
      hashtags = ["#CafePH", "#Milktea", "#CoffeePH", "#NewMenu", "#LocalBusiness", "#FoodPH", "#SupportLocal"];
      direction = "Minimal layout • product highlight • brand color accents • bold CTA";
      cta = "“Order now” / “Visit us today”";
    } else if (isFashion) {
      title = "Captions — Streetwear Drop";
      caption1 = "New drop is live. Clean fits, bold details — don’t sleep on it. 🔥";
      caption2 = "Limited pieces. First come, first served. Tap in before it’s gone. 🧢";
      hashtags = ["#Streetwear", "#NewDrop", "#LocalBrand", "#OOTD", "#FashionPH", "#StyleUpdate", "#Hype"];
      direction = "High contrast • product focus • price/size tags • drop date highlight";
      cta = "“Shop the drop” / “Check the collection”";
    } else if (isPoster) {
      title = "Promo Copy (General)";
      caption1 = "Big deal, limited time — grab it while it lasts. ⚡";
      caption2 = "Don’t miss out: offer ends soon. Save more today.";
      hashtags = ["#Promo", "#Sale", "#LimitedOffer", "#Marketing", "#LocalBusiness", "#Deals", "#ShopNow"];
      direction = "Headline-first • clear discount block • one strong CTA";
      cta = "“Claim offer” / “Shop now”";
    } else if (isFood) {
      title = "Caption set — Food";
      caption1 = "Fresh off the pan — simple ingredients, big flavor. 🍳✨";
      caption2 = "Cook with me: easy steps, satisfying results, and good vibes in the kitchen. 🍽️";
      hashtags = ["#FoodContent", "#CookingShow", "#HomeCooking", "#RecipeIdeas", "#FoodiePH", "#KitchenDiaries", "#Sarap"];
      direction = "Overhead shots • step-by-step captions • final plating hero shot";
      cta = "“Watch the steps” / “Save this recipe”";
    } else {
      title = "Generated output";
      caption1 = "Here’s a clean first draft you can tweak for your brand tone.";
      caption2 = "Want it more formal, fun, or Gen Z? I can adjust the voice.";
      hashtags = ["#ContentCreation", "#Marketing", "#Branding", "#Copywriting", "#SocialMedia"];
      direction = "Clean structure • short lines • clear CTA • consistent voice";
      cta = "“Generate more” / “Refine”";
    }

    setLandingResult("Generating…", `
      <div class="loading">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <p class="muted" style="margin-top:10px;">Working on: <strong>${escapeHtml(prompt)}</strong></p>
    `);

    setTimeout(() => {
      const tagLine = pickTags(hashtags, Math.min(7, hashtags.length)).join(" ");
      setLandingResult("Done", `
        <h3>${escapeHtml(title)}</h3>
        <p class="muted"><strong>Prompt:</strong> ${escapeHtml(prompt)}</p>
        <div class="result-list">
          <div class="result-item"><strong>Caption (Option 1):</strong> ${escapeHtml(caption1)}</div>
          <div class="result-item"><strong>Caption (Option 2):</strong> ${escapeHtml(caption2)}</div>
          <div class="result-item"><strong>Hashtags:</strong> ${escapeHtml(tagLine)}</div>
          <div class="result-item"><strong>Design direction:</strong> ${escapeHtml(direction)}</div>
          <div class="result-item"><strong>CTA:</strong> ${escapeHtml(cta)}</div>
        </div>
      `);
    }, 700);
  }

  landingForm && landingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    landingGenerate();
  });

  $("#generateBtn") && $("#generateBtn").addEventListener("click", (e) => {
    e.preventDefault();
    landingGenerate();
  });

  // Chips fill prompt
  $$(".chip-action").forEach((c) => {
    c.addEventListener("click", () => {
      const text = c.dataset.suggest || "";
      if (promptInput) promptInput.value = text;
      toast("Prompt filled. Click Generate.");
    });
  });

  // Service cards: click effect + fill prompt
  $$(".service-card").forEach((c) => {
    c.addEventListener("click", () => {
      $$(".service-card").forEach((x) => x.classList.remove("is-active"));
      c.classList.add("is-active");

      const s = c.dataset.service;
      const map = {
        social: "Write 3 caption options + hashtags for a café promo this weekend.",
        branding: "Create a brand kit: colors, typography, and tone for a minimal skincare brand.",
        ads: "Generate 3 ad poster variations for a 20% off weekend sale.",
        web: "Design a UI/UX website landing page for a small business — sections + short copy."
      };
      if (promptInput) promptInput.value = map[s] || "";
      toast("Service selected. Click Generate.");
    });
  });

  landingMore && landingMore.addEventListener("click", () => toast("Generated variants (demo)."));
  landingRefine && landingRefine.addEventListener("click", () => toast("Refined output (demo)."));
  landingExport && landingExport.addEventListener("click", () => toast("Exported PNG (demo)."));

  // ---------------------------
  // Contact form (fake submit)
  // ---------------------------
  const contactForm = $("#contactForm");
  const formNote = $("#formNote");
  contactForm && contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (formNote) formNote.textContent = "Message sent. We'll get back to you soon.";
    toast("Sent!");
  });

  // Footer year
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------------------------
  // Features page generators
  // ---------------------------
  const uiuxForm = $("#uiuxForm");
  const uiuxInput = $("#uiuxInput");
  const uiuxResultCard = $("#uiuxResultCard");
  const uiuxStatus = $("#uiuxStatus");
  const uiuxBody = $("#uiuxBody");

  uiuxForm && uiuxForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const brand = (uiuxInput && uiuxInput.value || "").trim() || "your business";
    uiuxResultCard.hidden = false;
    uiuxStatus.textContent = "Generating…";

    uiuxBody.innerHTML = `
      <div class="loading"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <p class="muted" style="margin-top:10px;">Building UI/UX for: <strong>${escapeHtml(brand)}</strong></p>
    `;

    setTimeout(() => {
      uiuxStatus.textContent = "Done";
      uiuxBody.innerHTML = `
        <h3>Landing Structure — ${escapeHtml(brand)}</h3>
        <div class="result-list">
          <div class="result-item"><strong>Hero:</strong> Clear value prop + primary CTA + social proof</div>
          <div class="result-item"><strong>Features:</strong> 3–6 cards with icons + one-line benefits</div>
          <div class="result-item"><strong>How it works:</strong> Step-by-step (3–4 steps)</div>
          <div class="result-item"><strong>Pricing:</strong> 3 tiers with highlighted “Most Popular”</div>
          <div class="result-item"><strong>FAQ:</strong> 4–6 common questions</div>
          <div class="result-item"><strong>Contact:</strong> form + quick links</div>
        </div>
        <p class="muted" style="margin-top:10px;">
          Tip: Keep above-the-fold clean. One CTA only.
        </p>
      `;
    }, 650);
  });

  const videoForm = $("#videoForm");
  const videoFile = $("#videoFile");
  const videoPrompt = $("#videoPrompt");
  const videoResultCard = $("#videoResultCard");
  const videoStatus = $("#videoStatus");
  const videoBody = $("#videoBody");

  videoForm && videoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = videoFile && videoFile.files && videoFile.files[0];
    const goal = (videoPrompt && videoPrompt.value || "").trim() || "short promo reel";

    if (!file) return toast("Upload a video file first.");

    videoResultCard.hidden = false;
    videoStatus.textContent = "Analyzing…";

    videoBody.innerHTML = `
      <div class="loading"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <p class="muted" style="margin-top:10px;">Processing: <strong>${escapeHtml(file.name)}</strong></p>
    `;

    setTimeout(() => {
      videoStatus.textContent = "Done";
      videoBody.innerHTML = `
        <h3>AI Edit Plan</h3>
        <p class="muted"><strong>Goal:</strong> ${escapeHtml(goal)}</p>
        <div class="result-list">
          <div class="result-item"><strong>Hook (0–2s):</strong> Best shot + big text overlay</div>
          <div class="result-item"><strong>Cuts:</strong> Remove dead time, keep 0.8–1.5s clips</div>
          <div class="result-item"><strong>Captions:</strong> Burn-in subtitles, highlight keywords</div>
          <div class="result-item"><strong>B-roll:</strong> Insert closeups for texture + motion</div>
          <div class="result-item"><strong>End card:</strong> Logo + CTA + contact</div>
        </div>
        <div class="chips" style="margin-top:10px;">
          <button class="chip" type="button">Export MP4 (demo)</button>
          <button class="chip" type="button">Add captions (demo)</button>
          <button class="chip" type="button">Auto beat sync (demo)</button>
        </div>
      `;

      $$(".chips .chip").forEach((b) => b.addEventListener("click", () => toast(`${b.textContent}`)));
    }, 750);
  });

  // Features page demo prompt generator
  const demoPromptForm = $("#demoPromptForm");
  const demoPromptInput = $("#demoPromptInput");
  const demoResultCard = $("#demoResultCard");
  const demoStatus = $("#demoStatus");
  const demoBody = $("#demoBody");

  demoPromptForm && demoPromptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const prompt = (demoPromptInput && demoPromptInput.value || "").trim();
    if (!prompt) return toast("Type a prompt first.");

    demoResultCard.hidden = false;
    demoStatus.textContent = "Generating…";
    demoBody.innerHTML = `
      <div class="loading"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <p class="muted" style="margin-top:10px;">Working on: <strong>${escapeHtml(prompt)}</strong></p>
    `;

    setTimeout(() => {
      demoStatus.textContent = "Done";
      demoBody.innerHTML = `
        <h3>Generated output</h3>
        <p class="muted"><strong>Prompt:</strong> ${escapeHtml(prompt)}</p>
        <div class="result-list">
          <div class="result-item"><strong>Draft:</strong> Clean structure, clear hook, simple CTA.</div>
          <div class="result-item"><strong>Option A:</strong> Short + punchy</div>
          <div class="result-item"><strong>Option B:</strong> Warm + storytelling</div>
          <div class="result-item"><strong>Option C:</strong> Professional tone</div>
        </div>
      `;
    }, 650);
  });
})();
