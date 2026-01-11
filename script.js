(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Year
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav
  const btn = $(".menu-btn");
  const nav = $("#nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });

    // close on click
    $$("#nav a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }));
  }

  // Pricing tabs
  const tabs = $$(".tab");
  const panels = $$(".pricing");
  const setTab = (name) => {
    tabs.forEach(t => {
      const active = t.dataset.tab === name;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach(p => p.classList.toggle("hidden", p.dataset.panel !== name));
  };
  tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));

  // Contact form (prototype)
  const form = $("#contactForm");
  const note = $("#formNote");
  if (form && note) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      note.textContent = "Saved locally (prototype). Hook this up to a real form endpoint later.";
      form.reset();
    });
  }
})();
