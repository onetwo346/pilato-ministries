/* =========================================
PILATO — INTERACTION ENGINE
========================================= */

const lerp = (a, b, n) => a + (b - a) * n;

/* =========================================
UNIFIED POINTER STATE (single listener, no jank)
========================================= */

const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener("mousemove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
}, { passive: true });

/* =========================================
CURSOR LIGHT + 3D ORB — driven by one rAF loop, lerped for smoothness
========================================= */

const cursorGlow = document.querySelector(".cursor-glow");
const orb = document.querySelector("#orb");

const glow = { x: pointer.x, y: pointer.y };
const tilt = { x: 0, y: 0 };
let scrollOffset = 0;

function animate() {

  if (cursorGlow) {
    glow.x = lerp(glow.x, pointer.x, 0.16);
    glow.y = lerp(glow.y, pointer.y, 0.16);
    cursorGlow.style.transform =
      `translate3d(${glow.x}px, ${glow.y}px, 0) translate(-50%, -50%)`;
  }

  if (orb) {
    const targetX = (window.innerWidth / 2 - pointer.x) / 45;
    const targetY = (window.innerHeight / 2 - pointer.y) / 45;

    tilt.x = lerp(tilt.x, targetY, 0.06);
    tilt.y = lerp(tilt.y, -targetX, 0.06);

    orb.style.transform =
      `translateY(calc(-50% + ${scrollOffset}px)) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

/* =========================================
CARD 3D TILT
========================================= */

document.querySelectorAll(".service-card").forEach(card => {

  card.addEventListener("mousemove", (e) => {

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y / rect.height) - .5) * -8;
    const rotateY = ((x / rect.width) - .5) * 8;

    card.style.transform =
      `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;

  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });

});

/* =========================================
LIVE SCREEN 3D TILT
========================================= */

const liveScreen = document.querySelector(".live-screen");

if (liveScreen) {

  liveScreen.addEventListener("mousemove", (e) => {

    const rect = liveScreen.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y / rect.height) - .5) * -4;
    const rotateY = ((x / rect.width) - .5) * 4;

    liveScreen.style.transform =
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  });

  liveScreen.addEventListener("mouseleave", () => {
    liveScreen.style.transform = "";
  });

}

/* =========================================
SCROLL REVEAL
========================================= */

const revealElements = document.querySelectorAll(
  ".section-heading, .live-stage, .service-card, .channel, .final-section > *"
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      }
    });
  },
  { threshold: .15 }
);

revealElements.forEach(el => observer.observe(el));

/* =========================================
PARALLAX GOLD LIGHT (reads scroll, applied inside rAF loop above)
========================================= */

window.addEventListener("scroll", () => {
  scrollOffset = window.scrollY < window.innerHeight
    ? window.scrollY * .12
    : window.innerHeight * .12;
}, { passive: true });

/* =========================================
MOBILE NAV DRAWER
========================================= */

const menuToggle = document.querySelector("#menu-toggle");
const mobileNav = document.querySelector("header.nav nav");
const navScrim = document.querySelector("#nav-scrim");

function closeMenu() {
  menuToggle?.classList.remove("active");
  mobileNav?.classList.remove("open");
  navScrim?.classList.remove("active");
  document.body.classList.remove("no-scroll");
  document.documentElement.classList.remove("no-scroll");
}

if (menuToggle && mobileNav) {

  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    menuToggle.classList.toggle("active", isOpen);
    navScrim?.classList.toggle("active", isOpen);
    document.body.classList.toggle("no-scroll", isOpen);
    document.documentElement.classList.toggle("no-scroll", isOpen);
  });

  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  navScrim?.addEventListener("click", closeMenu);

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });

}

/* =========================================
DAY / NIGHT THEME TOGGLE
========================================= */

const THEME_KEY = "pilato-theme";
const themeToggle = document.querySelector("#theme-toggle");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeToggle) themeToggle.setAttribute("aria-pressed", theme === "light");
}

if (themeToggle) {

  setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

  themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

}

/* =========================================
"COMING SOON" TOAST — for placeholder links
========================================= */

let toastEl = null;
let toastTimer = null;

function showToast(message) {

  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    document.body.appendChild(toastEl);
  }

  toastEl.textContent = message;
  toastEl.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);

}

document.querySelectorAll(".soon").forEach(el => {

  el.addEventListener("click", (e) => {
    e.preventDefault();
    showToast(el.dataset.tooltip || "Coming soon");
  });

});

/* =========================================
GALLERY — VIDEO TILES
========================================= */

const videoTiles = document.querySelectorAll(".video-tile");

videoTiles.forEach(tile => {

  const video = tile.querySelector("video");
  if (!video) return;

  tile.addEventListener("click", () => {

    const isPlaying = tile.classList.contains("playing");

    videoTiles.forEach(other => {
      if (other === tile) return;
      const otherVideo = other.querySelector("video");
      other.classList.remove("playing");
      if (otherVideo) { otherVideo.pause(); otherVideo.muted = true; }
    });

    if (isPlaying) {
      video.pause();
      tile.classList.remove("playing");
    } else {
      video.muted = false;
      video.currentTime = 0;
      video.play().catch(() => {});
      tile.classList.add("playing");
    }

  });

  video.addEventListener("ended", () => {
    tile.classList.remove("playing");
  });

});

/* =========================================
CONTACT FORM
NOTE: this is a static site — there is no backend wired up yet, so
submissions are only confirmed in the UI. To actually receive messages,
connect this form to a service like Formspree/EmailJS, or a server
endpoint, then swap the code below for a real fetch() submission.
========================================= */

const contactForm = document.querySelector("#contact-form");

if (contactForm) {

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const status = contactForm.querySelector("#form-status");
    status.textContent = "Sending...";

    setTimeout(() => {
      status.textContent = "Message received — we'll be in touch soon.";
      contactForm.reset();
    }, 700);

  });

}

/* =========================================
MAGNETIC BUTTONS
========================================= */

document.querySelectorAll(".btn, .nav-live").forEach(button => {

  button.addEventListener("mousemove", e => {

    const rect = button.getBoundingClientRect();

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform =
      `translate(${x * .12}px, ${y * .12}px)`;

  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "";
  });

});
