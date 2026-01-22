// ====== Config you should edit ======
const CONFIG = {
  bookingEmail: "bookings@yourdomain.com", // change me
  quotes: [
    "“A spiritual experience. Mostly fear.”",
    "“He played the wrong drop and somehow it worked.”",
    "“I booed, then I danced. Confusing night.”",
    "“Transitions: illegal. Energy: immaculate.”",
    "“The bass apologized before he did.”",
    "“If chaos had a set list.”",
  ],
  shows: [
    // Put real entries here
    { date: "2026-02-07", venue: "The Basement", city: "Coeur d’Alene, ID", note: "Doors 9pm · Bring earplugs (optional)" },
    { date: "2026-02-14", venue: "Heartbreak Club", city: "Spokane, WA", note: "Anti-love special" },
    { date: "2026-03-01", venue: "Rooftop Night", city: "Seattle, WA", note: "Sunset set · questionable remixes" },
  ],
  past: [
    { date: "2025-12-31", venue: "New Year’s Incident", city: "Somewhere", note: "We don’t talk about it." },
    { date: "2025-10-18", venue: "Wedding Afterparty", city: "Undisclosed", note: "Grandma requested drill. I complied." },
  ],
};

// ====== Utilities ======
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-on");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("is-on"), 2200);
}

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function animateCount(el, to, ms = 800) {
  if (!el) return;
  const start = 0;
  const t0 = performance.now();
  function tick(t) {
    const p = Math.min(1, (t - t0) / ms);
    const val = Math.round(start + (to - start) * (1 - Math.pow(1 - p, 3)));
    el.textContent = val.toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ====== Mobile menu ======
(function initMenu() {
  const btn = $("#menuBtn");
  const panel = $("#mobileNav");
  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    const open = panel.hasAttribute("hidden");
    panel.toggleAttribute("hidden");
    btn.setAttribute("aria-expanded", String(open));
  });

  // close when navigating
  $$("#mobileNav a").forEach(a => a.addEventListener("click", () => {
    panel.setAttribute("hidden", "");
    btn.setAttribute("aria-expanded", "false");
  }));
})();

// ====== Disabled links (clean no-access) ======
(function initDisabledLinks() {
  $$("[data-disabled]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      toast("Not connected yet — link will go live soon.");
    });
  });
})();

// ====== Footer year ======
(function initYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();

// ====== Home page features ======
(function homePage() {
  const quoteEl = $("#quote");
  const nextShowEl = $("#nextShow");
  const stat1 = $("#stat1");
  const stat2 = $("#stat2");
  const stat3 = $("#stat3");

  if (quoteEl) {
    const pick = () => CONFIG.quotes[Math.floor(Math.random() * CONFIG.quotes.length)];
    quoteEl.textContent = pick();
    $("#newQuote")?.addEventListener("click", () => (quoteEl.textContent = pick()));
  }

  if (nextShowEl) {
    const upcoming = CONFIG.shows
      .map(s => ({...s, _d: new Date(s.date + "T12:00:00")}))
      .sort((a,b) => a._d - b._d)
      .find(s => s._d >= new Date(Date.now() - 86400000));
    nextShowEl.textContent = upcoming
      ? `${fmtDate(upcoming.date)} · ${upcoming.venue} · ${upcoming.city}`
      : "No shows posted (yet).";
  }

  if (stat1 || stat2 || stat3) {
    animateCount(stat1, 1247);
    animateCount(stat2, 83);
    animateCount(stat3, 204);
  }

  // Subscribe fake form
  $("#subscribeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    toast("Subscribed (fake). Add a real form handler when ready.");
    e.target.reset?.();
  });
})();

// ====== Shows page render ======
(function showsPage() {
  const up = $("#showsUpcoming");
  const past = $("#showsPast");
  if (!up && !past) return;

  const renderList = (el, items) => {
    el.innerHTML = "";
    items.forEach(s => {
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
        <div>
          <strong>${fmtDate(s.date)} · ${s.venue}</strong>
          <span>${s.city}</span>
          <span>${s.note || ""}</span>
        </div>
        <span class="chip">WWDJ</span>
      `;
      el.appendChild(row);
    });
  };

  if (up) renderList(up, CONFIG.shows);
  if (past) renderList(past, CONFIG.past);

  // Copy buttons (promoter kit)
  $$("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.getAttribute("data-copy"));
        toast("Copied.");
      } catch {
        toast("Copy blocked by browser.");
      }
    });
  });
})();

// ====== Contact form (mailto generator + copy) ======
(function contactPage() {
  const form = $("#bookingForm");
  if (!form) return;

  const buildMessage = (data) => {
    return [
      `Booking request — World’s Worst DJ`,
      ``,
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Date: ${data.get("date")}`,
      `Event type: ${data.get("type")}`,
      `Location/Venue: ${data.get("location") || "(not provided)"}`,
      `Vibe/Genres: ${data.get("vibe") || "(not provided)"}`,
      ``,
      `Notes:`,
      `${data.get("notes") || "(none)"}`,
      ``,
      `— sent from the WorldsWorstDJ site`
    ].join("\n");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent("Booking request — World’s Worst DJ");
    const body = encodeURIComponent(buildMessage(data));
    const to = CONFIG.bookingEmail || "bookings@yourdomain.com";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    toast("Opening email app…");
  });

  $("#copyRequest")?.addEventListener("click", async () => {
    const data = new FormData(form);
    const msg = buildMessage(data);
    try {
      await navigator.clipboard.writeText(msg);
      toast("Booking request copied.");
    } catch {
      toast("Copy blocked by browser.");
    }
  });
})();