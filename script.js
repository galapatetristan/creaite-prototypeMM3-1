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

  const p = prompt.toLowerCase();

  // classify prompt (simple rules)
  const isFood = /(adobo|cooking|recipe|lut[o|u]|ulam|food|dish|kitchen|chef|sinigang|lechon|pancit|sisig|tinola)/i.test(p);
  const isCafe = /(milktea|milk tea|latte|coffee|cafe|tea|matcha|espresso|frappe)/i.test(p);
  const isFashion = /(streetwear|clothing|outfit|fashion|drop|collection|sneakers|apparel)/i.test(p);
  const isPoster = /(poster|flyer|promo|discount|sale|%|offer|limited|ad|advert|marketing)/i.test(p);

  // helpers
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pickTags = (arr, n=7) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

  // outputs by category
  let title = "Generated output (demo)";
  let caption1 = "";
  let caption2 = "";
  let hashtags = [];
  let direction = "";
  let cta = "";

  if (isFood && /adobo/i.test(p)) {
    title = "Generated caption set (Adobo)";
    caption1 = "Tonight’s comfort food: classic Filipino adobo — rich, savory, and slow-simmered to perfection. 🍲🇵🇭";
    caption2 = "Adobo on the menu! Tender bites, bold flavors, and that signature sauce you’ll want over rice. 🍚✨";
    hashtags = ["#Adobo", "#FilipinoFood", "#PinoyCooking", "#HomeCooking", "#CookingShow", "#Ulam", "#FoodiePH", "#Sarap", "#Recipe"];
    direction = "Warm, cozy food shot • close-up sauce gloss • steam + rice pairing • simple text overlay";
    cta = "“Watch the full recipe” / “Try this at home”";
  } else if (isFood) {
    title = "Generated caption set (Food)";
    caption1 = "Fresh off the pan — simple ingredients, big flavor. 🍳✨";
    caption2 = "Cook with me: easy steps, satisfying results, and lots of good vibes in the kitchen. 🍽️";
    hashtags = ["#FoodContent", "#CookingShow", "#HomeCooking", "#RecipeIdeas", "#FoodiePH", "#KitchenDiaries", "#Sarap"];
    direction = "Overhead cooking shots • step-by-step captions • final plating hero shot";
    cta = "“Watch the steps” / “Save this recipe”";
  } else if (isCafe || (isPoster && isCafe)) {
    title = "Generated promo captions (Cafe)";
    caption1 = "New drink drop! 🧋 Try it today — limited time only.";
    caption2 = "Something sweet just landed. Grab your first sip now.";
    hashtags = ["#CafePH", "#Milktea", "#CoffeePH", "#NewMenu", "#LocalBusiness", "#FoodPH", "#SupportLocal"];
    direction = "Minimal layout • product highlight • bold CTA button • brand color accents";
    cta = "“Order now” / “Visit us today”";
  } else if (isFashion) {
    title = "Generated captions (Streetwear drop)";
    caption1 = "New drop is live. Clean fits, bold details — don’t sleep on it. 🔥";
    caption2 = "Limited pieces. First come, first served. Tap in before it’s gone. 🧢";
    hashtags = ["#Streetwear", "#NewDrop", "#LocalBrand", "#OOTD", "#FashionPH", "#StyleUpdate", "#Hype"];
    direction = "High-contrast layout • model/product focus • size/price tags • drop date highlight";
    cta = "“Shop the drop” / “Check the collection”";
  } else if (isPoster) {
    title = "Generated promo copy (General)";
    caption1 = "Big deal, limited time — grab it while it lasts. ⚡";
    caption2 = "Don’t miss out: offer ends soon. Save more today.";
    hashtags = ["#Promo", "#Sale", "#LimitedOffer", "#Marketing", "#LocalBusiness", "#Deals", "#ShopNow"];
    direction = "Headline-first layout • clear discount block • one strong CTA";
    cta = "“Claim offer” / “Shop now”";
  } else {
    title = "Generated output (General)";
    caption1 = "Here’s a clean first draft you can tweak for your brand tone.";
    caption2 = "Want it more formal, fun, or Gen Z? I can adjust the voice.";
    hashtags = ["#ContentCreation", "#Marketing", "#Branding", "#Copywriting", "#SocialMedia"];
    direction = "Clean structure • short lines • clear CTA • consistent voice";
    cta = "“Generate more” / “Refine”";
  }

  // show loading first
  setLandingResult("Generating…", `
    <div class="loading">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
    </div>
    <p class="muted" style="margin-top:10px;">Working on: <strong>${escapeHtml(prompt)}</strong></p>
  `);

  setTimeout(() => {
    // randomize hashtags a bit but keep relevant
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
