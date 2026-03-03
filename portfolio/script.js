/* ========================================================
   ERL PORTFOLIO  SCRIPT (Ember Edition)
   ======================================================== */
(function () {
  "use strict";

  /* ---------- LOADER ---------- */
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loaderBar");
  let loaderPct = 0;
  const loaderInt = setInterval(() => {
    loaderPct += Math.random() * 18 + 4;
    if (loaderPct > 100) loaderPct = 100;
    loaderBar.style.width = loaderPct + "%";
    if (loaderPct >= 100) {
      clearInterval(loaderInt);
      setTimeout(() => loader.classList.add("done"), 400);
    }
  }, 120);
  // safety
  window.addEventListener("load", () => {
    loaderBar.style.width = "100%";
    setTimeout(() => loader.classList.add("done"), 600);
  });

  /* ---------- CUSTOM CURSOR ---------- */
  const cur = document.getElementById("cur");
  const curFollow = document.getElementById("curFollow");
  let mx = 0, my = 0, fx = 0, fy = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + "px";
    cur.style.top = my + "px";
  });
  (function moveCurFollow() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    curFollow.style.left = fx + "px";
    curFollow.style.top = fy + "px";
    requestAnimationFrame(moveCurFollow);
  })();
  document.querySelectorAll("a, button, .btn, .sk-card, .w-card, .expertise-card, .stat-card, input, textarea").forEach((el) => {
    el.addEventListener("mouseenter", () => { cur.classList.add("active"); curFollow.classList.add("active"); });
    el.addEventListener("mouseleave", () => { cur.classList.remove("active"); curFollow.classList.remove("active"); });
  });
  document.addEventListener("mousedown", () => cur.style.transform = "translate(-50%,-50%) scale(.7)");
  document.addEventListener("mouseup", () => cur.style.transform = "translate(-50%,-50%) scale(1)");

  /* ---------- PARTICLE CANVAS ---------- */
  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas.getContext("2d");
  let W, H;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const PARTICLE_COUNT = 60;
  const particles = [];
  function getAccentRGB() {
    const s = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = s;
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }
  let accentRGB = getAccentRGB();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.5,
    });
  }
  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    const [r, g, b] = accentRGB;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ",0.15)";
      ctx.fill();
      // connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = dx * dx + dy * dy;
        if (dist < 18000) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + (0.04 * (1 - dist / 18000)) + ")";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ---------- SCROLL PROGRESS ---------- */
  const scrollLine = document.getElementById("scrollLine");
  function updateScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    scrollLine.style.width = pct + "%";
  }

  /* ---------- TOPBAR SCROLL ---------- */
  const topbar = document.getElementById("topbar");
  function updateTopbar() {
    topbar.classList.toggle("scrolled", window.scrollY > 60);
  }

  /* ---------- SIDE NAV ACTIVE ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".sn");
  function updateSideNav() {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 200;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.sec === current);
    });
  }

  /* ---------- COUNTER ---------- */
  let counterDone = false;
  function animateCounters() {
    if (counterDone) return;
    const counters = document.querySelectorAll(".count");
    if (!counters.length) return;
    const first = counters[0];
    const rect = first.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      counterDone = true;
      counters.forEach((c) => {
        const to = parseInt(c.dataset.to, 10);
        let val = 0;
        const step = Math.max(1, Math.floor(to / 40));
        const interval = setInterval(() => {
          val += step;
          if (val >= to) {
            val = to;
            clearInterval(interval);
          }
          c.textContent = val;
        }, 30);
      });
    }
  }

  /* ---------- SKILL BAR FILL ---------- */
  let skillsDone = false;
  function animateSkills() {
    if (skillsDone) return;
    const fills = document.querySelectorAll(".sk-fill");
    if (!fills.length) return;
    const rect = fills[0].getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      skillsDone = true;
      fills.forEach((f) => {
        f.style.width = f.dataset.w + "%";
      });
    }
  }

  /* ---------- SCROLL REVEALS ---------- */
  function initReveals() {
    document.querySelectorAll(".sec-title, .hero-left, .hero-right, .about-img, .skills-info").forEach((el) => el.classList.add("reveal"));
    document.querySelectorAll(".about-text, .contact-info").forEach((el) => el.classList.add("reveal-right"));
    document.querySelectorAll(".contact-form").forEach((el) => el.classList.add("reveal-left"));
    document.querySelectorAll(".about-cards, .skills-cards, .stats-row, .works-grid, .expertise-grid, .tl-track, .w-tags, .w-feats").forEach((el) => el.classList.add("stagger"));
    document.querySelectorAll(".w-card, .sk-card, .expertise-card, .a-card, .stat-card").forEach((el) => el.classList.add("reveal-scale"));
  }
  function checkReveals() {
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        el.classList.add("visible");
      }
    });
  }
  initReveals();

  /* ---------- UNIFIED SCROLL ---------- */
  window.addEventListener("scroll", () => {
    updateScroll();
    updateTopbar();
    updateSideNav();
    animateCounters();
    animateSkills();
    checkReveals();
  }, { passive: true });
  // initial trigger
  setTimeout(() => {
    updateScroll();
    updateTopbar();
    updateSideNav();
    animateCounters();
    animateSkills();
    checkReveals();
  }, 100);

  /* ---------- TYPED EFFECT ---------- */
  const typedEl = document.getElementById("typed");
  const words = ["Full-Stack Developer", "AI Enthusiast", "Security Learner", "Problem Solver"];
  let wordIdx = 0, charIdx = 0, deleting = false;
  function typeLoop() {
    const word = words[wordIdx];
    if (!deleting) {
      charIdx++;
      typedEl.textContent = word.substring(0, charIdx);
      if (charIdx === word.length) {
        setTimeout(() => { deleting = true; typeLoop(); }, 1800);
        return;
      }
      setTimeout(typeLoop, 70);
    } else {
      charIdx--;
      typedEl.textContent = word.substring(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 40);
    }
  }
  typeLoop();

  /* ---------- TERMINAL TYPED ---------- */
  const termTyped = document.getElementById("termTyped");
  const termText = "Full-stack developer crafting digital solutions.";
  let ti = 0;
  function termType() {
    if (ti <= termText.length) {
      termTyped.textContent = termText.substring(0, ti);
      ti++;
      setTimeout(termType, 50);
    }
  }
  setTimeout(termType, 1200);

  /* ---------- SMOOTH SCROLL (nav) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth" });
      // close mobile menu
      mobMenu.classList.remove("open");
      menuBtn.classList.remove("open");
    });
  });

  /* ---------- MOBILE MENU ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const mobMenu = document.getElementById("mobMenu");
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("open");
    mobMenu.classList.toggle("open");
  });

  /* ---------- WORKS PAGINATION ---------- */
  const WORKS_PER_PAGE = 3;
  const worksGrid = document.getElementById("worksGrid");
  const worksPrev = document.getElementById("worksPrev");
  const worksNext = document.getElementById("worksNext");
  const worksDots = document.getElementById("worksDots");
  if (worksGrid && worksPrev && worksNext && worksDots) {
    const allCards = Array.from(worksGrid.querySelectorAll(".w-card"));
    const totalPages = Math.ceil(allCards.length / WORKS_PER_PAGE);
    let currentPage = 0;

    // build dots
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("span");
      dot.classList.add("works-pg-dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToPage(i));
      worksDots.appendChild(dot);
    }

    function goToPage(page) {
      currentPage = page;
      allCards.forEach((card, idx) => {
        const start = currentPage * WORKS_PER_PAGE;
        const end = start + WORKS_PER_PAGE;
        if (idx >= start && idx < end) {
          card.classList.remove("w-hidden");
        } else {
          card.classList.add("w-hidden");
        }
      });
      // update dots
      worksDots.querySelectorAll(".works-pg-dot").forEach((d, i) => {
        d.classList.toggle("active", i === currentPage);
      });
      // update buttons
      worksPrev.disabled = currentPage === 0;
      worksNext.disabled = currentPage === totalPages - 1;
    }

    worksPrev.addEventListener("click", () => { if (currentPage > 0) goToPage(currentPage - 1); });
    worksNext.addEventListener("click", () => { if (currentPage < totalPages - 1) goToPage(currentPage + 1); });
    goToPage(0);
  }

  /* ---------- YEAR ---------- */
  const yrEl = document.getElementById("yr");
  if (yrEl) yrEl.textContent = new Date().getFullYear();

})();
