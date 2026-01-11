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
    window.__toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }

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

  // optional: file upload demo
  const videoUpload = $("#videoUpload");
  const videoFileName = $("#videoFileName");
  let selectedVideoName = "";

  videoUpload && videoUpload.addEventListener("change", () => {
    const f = videoUpload.files && videoUpload.files[0];
    selectedVideoName = f ? f.name : "";
    if (videoFileName) videoFileName.textContent = selectedVideoName || "No file selected";
    toast(f ? "Video selected (demo)." : "No file selected.");
  });

  function setLandingResult(statusText, html) {
    if (landingCard) landingCard.hidden = false;
    if (landingStatus) landingStatus.textContent = statusText || "";
    if (landingBody) landingBody.innerHTML = html || "";
  }

  // helpers for tags
  const pickTags = (arr, n = 7) =>
    arr.slice().sort(() => 0.5 - Math.random()).slice(0, n).join(" ");

  function landingGenerate() {
    const prompt = (promptInput && promptInput.value || "").trim();
    if (!prompt) return toast("Type a prompt first.");

    const p = prompt.toLowerCase();

    // classify prompt
    const isFood = /(adobo|cooking|recipe|luto|ulam|food|dish|kitchen|chef|sinigang|lechon|pancit|sisig|tinola)/i.test(p);
    const isCafe = /(milktea|milk tea|latte|coffee|cafe|tea|matcha|espresso|frappe)/i.test(p);
    const isFashion = /(streetwear|clothing|outfit|fashion|drop|collection|sneakers|apparel)/i.test(p);
    const isPoster = /(poster|flyer|promo|discount|sale|%|offer|limited|ad|advert|marketing)/i.test(p);
    const isWeb = /(landing page|website|ui\/ux|uiux|wireframe|homepage|sections|html|css)/i.test(p);
    const isVideo = /(video|reel|tiktok|edit|caption|subtitles|cuts|beat|raw video|upload)/i.test(p);

    // show loading
    setLandingResult("Generating…", `
      <div class="loading">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <p class="muted" style="margin-top:10px;">Working on: <strong>${escapeHtml(prompt)}</strong></p>
    `);

    setTimeout(() => {
      // output blocks
      let title = "Generated output (demo)";
      let blocks = [];
      let extraCode = "";

      // WEBSITE / UIUX
      if (isWeb) {
        title = "Generated website plan (UI/UX → Website demo)";
        blocks = [
          ["Goal", "A clean landing page that converts: clear headline, value props, proof, CTA."],
          ["Sections", "Hero • Problem → Solution • Features • How it works • Pricing • FAQ • Contact"],
          ["Copy idea", "Headline: “Create marketing content in minutes — not hours.” Subhead: “Design + captions + templates + exports in one platform.”"],
          ["UI notes", "2-column hero • feature cards • sticky nav • one primary CTA"],
          ["CTA", "“Start free demo” / “Generate my first output”"]
        ];

        const htmlSkeleton =
`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CreAIte — Landing</title>
</head>
<body>
  <header>
    <nav>
      <strong>CreAIte</strong>
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main>
    <section id="hero">
      <h1>Create marketing content in minutes — not hours.</h1>
      <p>Designs, captions, templates, and exports — guided and brand-consistent.</p>
      <button>Start free demo</button>
    </section>

    <section id="features">
      <h2>Features</h2>
      <ul>
        <li>Prompt → Generate</li>
        <li>Brand kit consistency</li>
        <li>Template variations</li>
        <li>Export PNG/JPG/PDF</li>
      </ul>
    </section>

    <section id="pricing">
      <h2>Pricing</h2>
      <p>Free • Standard • Premium</p>
    </section>

    <section id="contact">
      <h2>Contact</h2>
      <form>
        <input placeholder="Name">
        <input placeholder="Email">
        <textarea placeholder="Message"></textarea>
        <button>Send</button>
      </form>
    </section>
  </main>
</body>
</html>`;

        extraCode = `<pre><code>${escapeHtml(htmlSkeleton)}</code></pre>`;
      }

      // VIDEO EDITING
      else if (isVideo) {
        title = "Generated video edit plan (AI Video Editing demo)";
        const fileLine = selectedVideoName ? `Selected file: ${selectedVideoName}` : "No file uploaded (demo).";
        blocks = [
          ["Input", fileLine],
          ["Edit objective", "Turn raw clip into a 15s Reel/TikTok: hook → value → CTA."],
          ["Hook ideas", "1) “Stop scrolling—here’s the 3-sec trick…” • 2) “This is why your posts don’t convert…”"],
          ["Cut plan", "Cut every 0.7–1.2s • remove dead air • zoom on key words • match beat drops"],
          ["Captions style", "Auto-captions + highlight keywords • 2 lines max • punchy phrasing"],
          ["Export", "1080x1920 • 30fps • loudness normalized • add end slate CTA"]
        ];
      }

      // FOOD: ADOBO (specific)
      else if (isFood && /adobo/i.test(p)) {
        title = "Generated caption set (Adobo)";
        blocks = [
          ["Caption (Option 1)", "Tonight’s comfort food: classic Filipino adobo — rich, savory, and slow-simmered to perfection. 🍲🇵🇭"],
          ["Caption (Option 2)", "Adobo on the menu! Tender bites, bold flavors, and that signature sauce you’ll want over rice. 🍚✨"],
          ["Hashtags", pickTags(["#Adobo","#FilipinoFood","#PinoyCooking","#HomeCooking","#CookingShow","#Ulam","#FoodiePH","#Sarap","#Recipe"], 7)],
          ["Design direction", "Warm, cozy food shot • close-up sauce gloss • steam + rice pairing • simple text overlay"],
          ["CTA", "“Watch the full recipe” / “Try this at home”"]
        ];
      }

      // FOOD: general
      else if (isFood) {
        title = "Generated caption set (Food)";
        blocks = [
          ["Caption (Option 1)", "Fresh off the pan — simple ingredients, big flavor. 🍳✨"],
          ["Caption (Option 2)", "Cook with me: easy steps, satisfying results, and good vibes in the kitchen. 🍽️"],
          ["Hashtags", pickTags(["#FoodContent","#CookingShow","#HomeCooking","#RecipeIdeas","#FoodiePH","#KitchenDiaries","#Sarap"], 7)],
          ["Design direction", "Overhead cooking shots • step-by-step captions • final plating hero shot"],
          ["CTA", "“Watch the steps” / “Save this recipe”"]
        ];
      }

      // CAFE
      else if (isCafe || (isPoster && isCafe)) {
        title = "Generated promo captions (Cafe)";
        blocks = [
          ["Caption (Option 1)", "New drink drop! 🧋 Try it today — limited time only."],
          ["Caption (Option 2)", "Something sweet just landed. Grab your first sip now."],
          ["Hashtags", pickTags(["#CafePH","#Milktea","#CoffeePH","#NewMenu","#LocalBusiness","#FoodPH","#SupportLocal"], 7)],
          ["Design direction", "Minimal layout • product highlight • bold CTA button • brand color accents"],
          ["CTA", "“Order now” / “Visit us today”"]
        ];
      }

      // FASHION
      else if (isFashion) {
        title = "Generated captions (Streetwear drop)";
        blocks = [
          ["Caption (Option 1)", "New drop is live. Clean fits, bold details — don’t sleep on it. 🔥"],
          ["Caption (Option 2)", "Limited pieces. First come, first served. Tap in before it’s gone. 🧢"],
          ["Hashtags", pickTags(["#Streetwear","#NewDrop","#LocalBrand","#OOTD","#FashionPH","#StyleUpdate","#Hype"], 7)],
          ["Design direction", "High-contrast layout • model/product focus • size/price tags • drop date highlight"],
          ["CTA", "“Shop the drop” / “Check the collection”"]
        ];
      }

      // POSTER general
      else if (isPoster) {
        title = "Generated promo copy (General)";
        blocks = [
          ["Caption (Option 1)", "Big deal, limited time — grab it while it lasts. ⚡"],
          ["Caption (Option 2)", "Don’t miss out: offer ends soon. Save more today."],
          ["Hashtags", pickTags(["#Promo","#Sale","#LimitedOffer","#Marketing","#LocalBusiness","#Deals","#ShopNow"], 7)],
          ["Design direction", "Headline-first layout • clear discount block • one strong CTA"],
          ["CTA", "“Claim offer” / “Shop now”"]
        ];
      }

      // DEFAULT
      else {
        title = "Generated output (General)";
        blocks = [
          ["Draft idea", "Here’s a clean first draft you can tweak for your brand tone."],
          ["Tone options", "Professional • Friendly • Gen Z • Minimal • Sales-y"],
          ["Next step", "Tell me your target audience + platform (FB/IG/TikTok) for better output."]
        ];
      }

      const list = blocks.map(([k, v]) =>
        `<div class="result-item"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</div>`
      ).join("");

      setLandingResult("Done", `
        <h3>${escapeHtml(title)}</h3>
        <p class="muted"><strong>Prompt:</strong> ${escapeHtml(prompt)}</p>
        <div class="result-list">${list}</div>
        ${extraCode || ""}
      `);
    }, 750);
  }

  // Submit handler
  landingForm && landingForm.addEventListener("submit", (e) => {
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

  // service cards: highlight + fill prompt
  const serviceMap = {
    social: "Write 3 caption options + hashtags for a café promo this weekend.",
    branding: "Create a brand kit: colors, typography, and tone for a minimal skincare brand.",
    ads: "Generate 3 ad poster variations for a 20% off weekend sale.",
    webui: "Design a landing page for a small business — sections + copy + CTA. Include a simple HTML skeleton.",
    video: "Edit a raw video into a 15s TikTok/Reel — add captions, cuts, beat sync, and a hook."
  };

  $$(".service-card").forEach((c) => {
    c.addEventListener("click", () => {
      $$(".service-card").forEach((x) => x.classList.remove("is-selected"));
      c.classList.add("is-selected");

      const s = c.dataset.service;
      if (promptInput) promptInput.value = serviceMap[s] || "";
      toast("Service selected. Click Generate.");
    });
  });

  // result action chips
  landingMore && landingMore.addEventListener("click", () => toast("Generated variants (demo)."));
  landingRefine && landingRefine.addEventListener("click", () => toast("Refined output (demo)."));
  landingExport && landingExport.addEventListener("click", () => toast("Exported PNG (demo)."));

  // tool pills highlight only
  $$(".tool-pill").forEach((p) => {
    p.addEventListener("click", () => {
      $$(".tool-pill").forEach((x) => x.classList.remove("is-active"));
      p.classList.add("is-active");
      toast(`${p.textContent} mode (demo)`);
    });
  });

  // contact form fake submit
  const contactForm = $("#contactForm");
  const formNote = $("#formNote");
  contactForm && contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (formNote) formNote.textContent = "Sent (demo). We’ll get back to you soon.";
    toast("Message sent (demo).");
    contactForm.reset();
  });

  // footer year
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
