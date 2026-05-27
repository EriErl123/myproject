/* ========================================================
  ACENTRA — SCRIPT
  Fully functional business site with Messenger chat
  ======================================================== */
(function () {
  "use strict";

  // Firebase readiness flag (used by portfolio loader & chat)
  const firebaseReady = typeof firebase !== "undefined" && firebase.apps && firebase.apps.length > 0;

  /* ==============================
     EMAILJS NOTIFICATION CONFIG
     ============================== */
  // ➜ Replace these with your real EmailJS credentials (see setup guide at bottom)
  const EMAILJS_PUBLIC_KEY = "wU66TLNoKKtnEePP3";     // EmailJS public key
  const EMAILJS_SERVICE_ID = "service_6y0wzge";     // e.g. "service_gmail"
  const EMAILJS_TEMPLATE_ID = "template_4o5ar3n";   // e.g. "template_chat_notify"
  const NOTIFY_COOLDOWN_MS = 10 * 60 * 1000;        // 10 minutes between emails per chat

  function shouldNotifyAdmin(chatId) {
    const key = "notify_" + chatId;
    const lastNotified = parseInt(localStorage.getItem(key) || "0", 10);
    if (Date.now() - lastNotified > NOTIFY_COOLDOWN_MS) {
      localStorage.setItem(key, Date.now().toString());
      return true;
    }
    return false;
  }

  function doSendEmail(params) {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY)
      .then(function() { console.log("Email notification sent successfully"); })
      .catch(function(err) { console.error("EmailJS notification failed:", err); });
  }

  function sendEmailNotification(userName, userEmail, message) {
    var params = {
      to_email: "ramaserljay5@gmail.com",
      name: userName,
      email: userEmail,
      message: message,
      title: "💬 ",
      subject: "New Chat from " + userName,
      time: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    };

    if (typeof emailjs !== "undefined") {
      doSendEmail(params);
    } else {
      // Fallback: dynamically load EmailJS SDK then send
      console.warn("EmailJS not loaded yet, loading dynamically...");
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload = function() { doSendEmail(params); };
      s.onerror = function() { console.error("Failed to load EmailJS SDK"); };
      document.head.appendChild(s);
    }
  }

  /* ==============================
     HEADER SCROLL
     ============================== */
  const header = document.getElementById("header");
  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 60);
  }

  /* ==============================
     MOBILE MENU
     ============================== */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });

  /* ==============================
     ACTIVE NAV LINK
     ============================== */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function updateActiveNav() {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 200;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href) {
        link.classList.toggle("active", href === "#" + current);
      }
    });
  }

  /* ==============================
     SMOOTH SCROLL
     ============================== */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;
      // If the link carries a preferred service, prefill the request form select
      try {
        const svc = a.dataset && a.dataset.service;
        if (svc) {
          const sel = document.getElementById('reqService');
          if (sel) {
            // find option that matches (exact match)
            const opt = Array.from(sel.options).find(o => o.value === svc);
            if (opt) sel.value = svc;
          }
        }
      } catch (e) { /* ignore */ }
      target.scrollIntoView({ behavior: "smooth" });
      menuToggle.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });

  /* ==============================
     BACK TO TOP
     ============================== */
  const backToTop = document.getElementById("backToTop");
  function updateBackToTop() {
    backToTop.classList.toggle("visible", window.scrollY > 400);
  }
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ==============================
     TYPED EFFECT
     ============================== */
  const typedEl = document.getElementById("typed");
  const words = [
    "Complete IT Solutions",
    "PC Repairs & Upgrades",
    "Web Development",
    "Creative Media Services",
    "Custom Systems & Apps",
  ];
  let wordIdx = 0,
    charIdx = 0,
    deleting = false;

  function typeLoop() {
    const word = words[wordIdx];
    if (!deleting) {
      charIdx++;
      typedEl.textContent = word.substring(0, charIdx);
      if (charIdx === word.length) {
        setTimeout(() => { deleting = true; typeLoop(); }, 2000);
        return;
      }
      setTimeout(typeLoop, 60);
    } else {
      charIdx--;
      typedEl.textContent = word.substring(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 35);
    }
  }
  typeLoop();

  /* ==============================
     COUNTER ANIMATION + LIVE STATS
     ============================== */
  let counterDone = false;

  // Fetch stats from public stats document (no auth required)
  function loadLiveStats() {
    if (typeof firebase === "undefined" || !firebase.apps.length) return;
    const db = firebase.firestore();

    db.collection("stats").doc("public").get()
      .then((doc) => {
        if (!doc.exists) return;
        const data = doc.data();

        const projEl = document.getElementById("statProjects");
        const clientEl = document.getElementById("statClients");
        if (projEl && data.completedProjects != null) {
          const base = parseInt(projEl.dataset.base, 10) || 18;
          projEl.dataset.target = base + data.completedProjects;
        }
        if (clientEl && data.uniqueClients != null) {
          const base = parseInt(clientEl.dataset.base, 10) || 10;
          clientEl.dataset.target = base + data.uniqueClients;
        }

        // Re-run animation if it already triggered before data arrived
        if (counterDone) {
          countersAnimate();
        }
      })
      .catch((err) => console.warn("Stats fetch:", err));
  }

  function countersAnimate() {
    const counters = document.querySelectorAll(".counter");
    counters.forEach((c) => {
      const target = parseInt(c.dataset.target, 10);
      let val = 0;
      const step = Math.max(1, Math.floor(target / 50));
      const interval = setInterval(() => {
        val += step;
        if (val >= target) {
          val = target;
          clearInterval(interval);
        }
        c.textContent = val;
      }, 30);
    });
  }

  function animateCounters() {
    if (counterDone) return;
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;
    const first = counters[0];
    const rect = first.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      counterDone = true;
      countersAnimate();
    }
  }

  // Calculate years of experience from January 2022
  (function updateYears() {
    const el = document.getElementById("statYears");
    if (el) {
      const start = new Date(2022, 0, 1);
      const now = new Date();
      const years = Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000));
      el.dataset.target = Math.max(1, years);
    }
  })();

  // Hidden admin access — triple-click the copyright year
  (function hiddenAdmin() {
    const el = document.getElementById("footerYear");
    if (!el) return;
    let clicks = 0, timer = null;
    el.addEventListener("click", () => {
      clicks++;
      clearTimeout(timer);
      if (clicks >= 3) {
        clicks = 0;
        window.location.href = "admin.html";
      }
      timer = setTimeout(() => { clicks = 0; }, 600);
    });
  })();

  // Load live stats from Firestore on page load
  loadLiveStats();

  /* ==============================
     PORTFOLIO FILTERS + DYNAMIC LOAD
     ============================== */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const portfolioGrid = document.getElementById("portfolioGrid");

  // Re-apply filters to all current cards (including dynamically added ones)
  function applyPortfolioFilter() {
    const activeBtn = document.querySelector(".filter-btn.active");
    const filter = activeBtn ? activeBtn.dataset.filter : "all";
    const allCards = document.querySelectorAll(".portfolio-card");
    allCards.forEach((card) => {
      if (filter === "all" || card.dataset.category === filter) {
        card.classList.remove("hidden");
        card.style.animation = "fadeIn 0.5s ease forwards";
      } else {
        card.classList.add("hidden");
      }
    });
    // Rebuild pagination to reflect current filtered set
    try { setupPortfolioPagination(3); } catch (e) {}
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyPortfolioFilter();
    });
  });

  // Load completed projects from Firestore portfolio collection
  function loadDynamicPortfolio() {
    if (!firebaseReady || typeof firebase === "undefined" || !firebase.apps.length) return;
    const db = firebase.firestore();

    db.collection("portfolio").get().then((snap) => {
      if (snap.empty) return;

      // Color themes for dynamic cards
      const colorThemes = [
        "linear-gradient(135deg, #0a1628 0%, #142d52 100%)",
        "linear-gradient(135deg, #0a1520 0%, #162d42 100%)",
        "linear-gradient(135deg, #0a1a12 0%, #16422d 100%)",
        "linear-gradient(135deg, #1a1608 0%, #3d3018 100%)",
        "linear-gradient(135deg, #1a0a20 0%, #2d1452 100%)",
        "linear-gradient(135deg, #1a0a0a 0%, #421616 100%)"
      ];

      snap.docs.forEach((doc, idx) => {
        const d = doc.data();
        // Skip if a static card with same title already exists
        const existingTitles = Array.from(portfolioGrid.querySelectorAll(".portfolio-info h3"))
          .map(h => h.textContent.toLowerCase().trim());
        if (existingTitles.includes((d.title || "").toLowerCase().trim())) return;

        const card = document.createElement("div");
        card.className = "portfolio-card reveal-scale";
        card.dataset.category = d.category || "web";

        const tags = (d.tags || []).map(t => "<span>" + escapeHTML(t) + "</span>").join("");
        const bgColor = colorThemes[idx % colorThemes.length];
        const icon = d.icon || "fa-solid fa-code";

        card.innerHTML =
          '<div class="portfolio-thumb">' +
            '<div class="portfolio-overlay">' +
              '<a href="#request" class="portfolio-link"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>' +
            '</div>' +
            '<div class="portfolio-thumb-bg" style="background:' + bgColor + '">' +
              '<div class="portfolio-grid-lines"></div>' +
              '<i class="' + escapeHTML(icon) + '"></i>' +
            '</div>' +
          '</div>' +
          '<div class="portfolio-info">' +
            '<h3>' + escapeHTML(d.title || "") + '</h3>' +
            '<p>' + escapeHTML(d.description || "") + '</p>' +
            '<div class="portfolio-tags">' + tags + '</div>' +
          '</div>';

        // Insert before static cards (at the beginning)
        portfolioGrid.insertBefore(card, portfolioGrid.firstChild);
      });

      // Re-apply current filter
      applyPortfolioFilter();

      // Trigger scroll reveal for new cards
      setTimeout(checkReveals, 100);
      // Rebuild pagination now that dynamic cards were added
      setTimeout(() => { try { setupPortfolioPagination(3); } catch (e) {} }, 160);
    }).catch((err) => console.warn("Portfolio fetch:", err));
  }

  loadDynamicPortfolio();
  // initial pagination for static cards (will be rebuilt after dynamic load)
  setTimeout(() => { try { setupPortfolioPagination(3); } catch (e) {} }, 120);

  // --- Portfolio pagination (client-side) ---
  function renderPortfolioPage(page, perPage) {
    perPage = perPage || 3;
    const all = Array.from(portfolioGrid.querySelectorAll('.portfolio-card'));
    const visible = all.filter(c => !c.classList.contains('hidden'));
    const total = visible.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const end = start + perPage;
    visible.forEach((c, idx) => {
      c.style.display = (idx >= start && idx < end) ? '' : 'none';
    });
    // render pagination buttons
    let pag = document.getElementById('portfolioPagination');
    if (!pag) {
      pag = document.createElement('div'); pag.id = 'portfolioPagination'; pag.className = 'portfolio-pagination';
      portfolioGrid.parentNode.insertBefore(pag, portfolioGrid.nextSibling);
    }
    pag.innerHTML = '';
    for (let i = 1; i <= pages; i++) {
      const b = document.createElement('button');
      b.className = 'page-btn' + (i === page ? ' active' : '');
      b.textContent = i;
      b.addEventListener('click', () => renderPortfolioPage(i, perPage));
      pag.appendChild(b);
    }
  }

  function setupPortfolioPagination(perPage) {
    perPage = perPage || 3;
    // ensure all cards visible before calculating
    const allCards = Array.from(portfolioGrid.querySelectorAll('.portfolio-card'));
    allCards.forEach(c => { if (!c.classList.contains('hidden')) c.style.display = ''; });
    renderPortfolioPage(1, perPage);
  }

  /* ==============================
     FAQ ACCORDION
     ============================== */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      // Close all
      faqItems.forEach((i) => i.classList.remove("active"));
      // Open clicked if it wasn't active
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  /* ==============================
     FORM HANDLING — FORMSPREE + FIRESTORE
     Sends email via Formspree AND saves to Firestore
     ============================== */
  (function initRequestForm() {
    const form = document.getElementById("requestForm");
    const messageEl = document.getElementById("formMessage");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector(".btn-submit");
      const originalHTML = submitBtn.innerHTML;

      // Honeypot check — bots fill the hidden field
      const honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        messageEl.textContent = "✓ Request submitted! We'll get back to you within 24 hours.";
        messageEl.className = "form-message success";
        form.reset();
        return;
      }

      // Disable and show loading
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
      submitBtn.disabled = true;

      // Collect form data
      const reqData = {
        name: (form.querySelector('#reqName').value || '').trim().slice(0, 200),
        contact: (form.querySelector('#reqEmail').value || '').trim().slice(0, 200),
        service: (form.querySelector('#reqService').value || '').slice(0, 100),
        device: (form.querySelector('#reqDevice').value || '').trim().slice(0, 100),
        details: (form.querySelector('#reqDetails').value || '').trim().slice(0, 2000),
        budget: (form.querySelector('#reqBudget').value || '').slice(0, 50),
        deadline: (form.querySelector('#reqDeadline').value || '').slice(0, 20)
      };

      // Basic validation: require name and contact
      if (!reqData.name || !reqData.contact) {
        messageEl.textContent = "✗ Please fill in your name and contact info.";
        messageEl.className = "form-message error";
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        return;
      }

      let formspreeOk = false;
      let firestoreOk = false;

      // 1) Send email via Formspree
      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
        formspreeOk = response.ok;
      } catch (err) {
        console.warn("Formspree error:", err);
      }

      // 2) Save to Firestore for admin dashboard
      if (firebaseReady && fbDb) {
        try {
          await fbDb.collection('requests').add({
            ...reqData,
            status: 'new',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          firestoreOk = true;
        } catch (err) {
          console.warn("Firestore save error:", err);
        }
      }

      if (formspreeOk || firestoreOk) {
        messageEl.textContent = "✓ Request submitted! We'll review it and reach out to you within 24 hours.";
        messageEl.className = "form-message success";
        form.reset();
      } else {
        messageEl.textContent = "✗ Something went wrong. Please try again or message us on Facebook.";
        messageEl.className = "form-message error";
      }

      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;

      // Clear message after 6 seconds
      setTimeout(() => {
        messageEl.textContent = "";
        messageEl.className = "form-message";
      }, 6000);
    });
  })();

  /* ==============================
     LIVE CHAT WIDGET — Bot-First + Firebase Agent Chat
     Bot handles first interaction, then user can request a live agent
     ============================== */
  const fbAuth = firebaseReady ? firebase.auth() : null;
  const fbDb = firebaseReady ? firebase.firestore() : null;

  const chatWidget = document.getElementById("chatWidget");
  const chatToggle = document.getElementById("chatToggle");
  const chatClose = document.getElementById("chatClose");
  const chatAuthEl = document.getElementById("chatAuth");
  const chatBody = document.getElementById("chatBody");
  const chatInputArea = document.getElementById("chatInputArea");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");
  const chatGoogleBtn = document.getElementById("chatGoogleBtn");
  const chatHeaderStatus = document.getElementById("chatHeaderStatus");
  const chatAuthNote = document.getElementById("chatAuthNote");
  const chatBot = document.getElementById("chatBot");
  const chatBotBody = document.getElementById("chatBotBody");
  const chatBotOptions = document.getElementById("chatBotOptions");
  const chatBackToBot = document.getElementById("chatBackToBot");

  let chatUser = null;
  let chatDocId = null;
  let chatOpened = false;
  let unsubMessages = null;
  let unsubChatStatus = null;
  let botInitialized = false;
  let pendingAgentRequest = false;
  const displayedMsgIds = new Set();

  // Rate limiting: max 5 messages per 10 seconds
  const chatRateLimit = { count: 0, resetTime: 0, MAX: 5, WINDOW: 10000 };

  // ──── Bot Knowledge Base ────
  const botResponses = {
    "services": "We offer three main service categories:\n\n🖥️ **IT & PC Services** — Repairs, upgrades, OS install, virus removal, networking\n🌐 **Web Development** — Custom websites, e-commerce, web apps, SEO\n🎨 **Creative Media** — Logo design, video editing, social media content\n\nWould you like details on any specific service?",
    "pricing": "Our pricing starts at:\n\n💻 PC Repair — starting ₱300\n🌐 Basic Website — starting ₱3,000\n🎨 Logo Design — starting ₱1,500\n📹 Video Editing — starting ₱2,000\n\nAll prices are negotiable based on project scope. Check our pricing section for full details!",
    "hours": "⏰ We're available:\nMonday – Saturday: 8:00 AM – 6:00 PM\n\nFor urgent matters, reach us on Facebook Messenger anytime.",
    "location": "📍 We're based in Sagay City, Negros Occidental.\nWe offer both remote and on-site support!",
    "turnaround": "⏱️ Typical turnaround times:\n• PC Repairs: 1-3 days\n• Websites: 1-4 weeks depending on complexity\n• Logos/Graphics: 2-5 days\n• Video Editing: 3-7 days\n\nRush orders are available at additional cost.",
    "contact": "📬 You can reach us via:\n• Email: ramaserljay5@gmail.com\n• Facebook: facebook.com/erljayramas\n• Or request a service directly from our website!",
    "default": "I'm not sure about that one! Here are some things I can help with, or you can chat with a live agent for more detailed help. 😊"
  };

  function addBotBubbleAnimated(container, html, delay) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        var typing = document.createElement("div");
        typing.className = "chat-bubble bot-typing";
        typing.innerHTML = '<p><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></p>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        setTimeout(function() {
          typing.remove();
          var bubble = document.createElement("div");
          bubble.className = "chat-bubble";
          bubble.innerHTML = "<p>" + html + "</p>";
          container.appendChild(bubble);
          container.scrollTop = container.scrollHeight;
          resolve();
        }, 800);
      }, delay || 0);
    });
  }

  function showBotOptions(options) {
    chatBotOptions.innerHTML = "";
    options.forEach(function(opt) {
      var btn = document.createElement("button");
      btn.className = "chat-quick";
      btn.innerHTML = opt.icon + " " + opt.label;
      btn.addEventListener("click", function() { opt.action(); });
      chatBotOptions.appendChild(btn);
    });
  }

  function initBot() {
    if (botInitialized) return;
    botInitialized = true;
    chatBotBody.innerHTML = "";
    chatBotOptions.innerHTML = "";

    addBotBubbleAnimated(chatBotBody, "Hi there! 👋 I'm the Acentra assistant.", 300)
      .then(function() {
        return addBotBubbleAnimated(chatBotBody, "I can answer common questions or connect you with a live agent. What would you like to know?", 200);
      })
      .then(function() {
        showMainBotMenu();
      });
  }

  function showMainBotMenu() {
    showBotOptions([
      { icon: "🛠️", label: "Our Services", action: function() { botAnswer("services"); } },
      { icon: "💰", label: "Pricing", action: function() { botAnswer("pricing"); } },
      { icon: "⏰", label: "Hours & Availability", action: function() { botAnswer("hours"); } },
      { icon: "📍", label: "Location", action: function() { botAnswer("location"); } },
      { icon: "⏱️", label: "Turnaround Time", action: function() { botAnswer("turnaround"); } },
      { icon: "💬", label: "Chat with Agent", action: function() { requestLiveAgent(); } }
    ]);
  }

  function botAnswer(key) {
    // Show user's selected topic as a user bubble
    var labels = { services: "Our Services", pricing: "Pricing", hours: "Hours & Availability", location: "Location", turnaround: "Turnaround Time", contact: "Contact Info" };
    var userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.innerHTML = "<p>" + (labels[key] || key) + "</p>";
    chatBotBody.appendChild(userBubble);
    chatBotBody.scrollTop = chatBotBody.scrollHeight;

    var response = botResponses[key] || botResponses["default"];
    // Convert markdown-like **bold** and newlines
    var formatted = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    addBotBubbleAnimated(chatBotBody, formatted, 200).then(function() {
      // Show follow-up options
      showBotOptions([
        { icon: "🔙", label: "Main Menu", action: function() {
          var sep = document.createElement("div");
          sep.className = "chat-bubble";
          sep.innerHTML = "<p>Sure! Here's the main menu again:</p>";
          chatBotBody.appendChild(sep);
          chatBotBody.scrollTop = chatBotBody.scrollHeight;
          showMainBotMenu();
        }},
        { icon: "💬", label: "Chat with Agent", action: function() { requestLiveAgent(); } }
      ]);
    });
  }

  function requestLiveAgent() {
    var userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.innerHTML = "<p>I'd like to chat with an agent</p>";
    chatBotBody.appendChild(userBubble);

    // If user is already signed in, go straight to live chat
    if (chatUser) {
      addBotBubbleAnimated(chatBotBody, "Connecting you with a live agent now... 🙂", 200)
        .then(function() {
          chatBotOptions.innerHTML = "";
          showChatInterface(true);
        });
      return;
    }

    addBotBubbleAnimated(chatBotBody, "Sure! Let me connect you with a live agent. Please sign in so we can start the conversation. 🙂", 200)
      .then(function() {
        chatBotOptions.innerHTML = "";
        // Show auth screen — onAuthStateChanged will detect sign-in,
        // but we flag that this is an explicit agent request
        pendingAgentRequest = true;
        chatBot.style.display = "none";
        chatAuthEl.style.display = "flex";
      });
  }

  // Toggle chat panel
  chatToggle.addEventListener("click", function() {
    chatWidget.classList.toggle("open");
    chatWidget.classList.add("badge-hidden");
    chatOpened = true;
    // Initialize bot on first open
    if (!botInitialized) {
      initBot();
    }
  });

  chatClose.addEventListener("click", function() {
    chatWidget.classList.remove("open");
  });

  // Back to bot button
  if (chatBackToBot) {
    chatBackToBot.addEventListener("click", function() {
      chatAuthEl.style.display = "none";
      chatBot.style.display = "flex";
    });
  }

  // If Firebase not configured, show fallback
  if (!firebaseReady) {
    if (chatGoogleBtn) {
      chatGoogleBtn.disabled = true;
      chatGoogleBtn.style.opacity = "0.5";
    }
  } else {
    // Check if user already signed in
    fbAuth.onAuthStateChanged(async function(user) {
      if (user) {
        chatUser = {
          uid: user.uid,
          name: user.displayName ? user.displayName.split(" ")[0] : "User",
          photo: user.photoURL || "",
          email: user.email || ""
        };
        // Check if this sign-in was triggered by "Chat with Agent"
        if (pendingAgentRequest) {
          pendingAgentRequest = false;
          showChatInterface(true); // send email notification
        } else {
          // Page reload / already signed in — check chat status
          try {
            var chatDoc = await fbDb.collection("chats").doc(user.uid).get();
            if (chatDoc.exists && chatDoc.data().status === "active") {
              // Resume live chat (don't re-send email — just reconnect)
              showChatInterface(false);
            } else {
              // Chat archived or doesn't exist — show bot
              chatAuthEl.style.display = "none";
              chatBot.style.display = "flex";
              if (!botInitialized) initBot();
            }
          } catch (err) {
            console.error("Error checking chat status:", err);
            chatAuthEl.style.display = "none";
            chatBot.style.display = "flex";
            if (!botInitialized) initBot();
          }
        }
      }
    });
  }

  // Google sign-in
  if (chatGoogleBtn) {
    chatGoogleBtn.addEventListener("click", async function() {
      if (!firebaseReady) return;
      try {
        var provider = new firebase.auth.GoogleAuthProvider();
        await fbAuth.signInWithPopup(provider);
      } catch (err) {
        chatAuthNote.textContent = "Sign-in failed. Please try again.";
        console.error("Google sign-in error:", err);
      }
    });
  }

  // sendNotify = true when user explicitly requests agent, false on page reload/reconnect
  async function showChatInterface(sendNotify) {
    // Hide bot and auth, show live chat
    chatBot.style.display = "none";
    chatAuthEl.style.display = "none";
    chatBody.style.display = "flex";
    chatBody.style.flexDirection = "column";
    chatInputArea.style.display = "flex";
    chatHeaderStatus.textContent = "Chatting as " + chatUser.name;

    // Create or get chat doc
    chatDocId = chatUser.uid;
    var chatRef = fbDb.collection("chats").doc(chatDocId);
    var chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      await chatRef.set({
        userId: chatUser.uid,
        userName: chatUser.name,
        userPhoto: chatUser.photo,
        userEmail: chatUser.email,
        lastMessage: "",
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
        unreadByAdmin: 0,
        status: "active"
      });
    } else if (chatDoc.data().status !== "active") {
      // Reactivate archived chat for new agent request
      await chatRef.update({ status: "active" });
    }

    // ── Presence: mark user as online ──
    startPresenceTracking(chatDocId);

    // Clear display but preserve Firestore history
    chatBody.innerHTML = "";

    // Send email alert ONLY when client explicitly requests agent
    if (sendNotify) {
      sendEmailNotification(
        chatUser.name,
        chatUser.email,
        "🔔 Agent chat requested by " + chatUser.name + " (" + chatUser.email + ")"
      );
      // Show waiting typing animation then waiting bubble while an agent is being assigned
      addBotBubbleAnimated(chatBody, "Please wait a minute while we assign an agent for you.", 200);
    }

    // Quick replies for live chat (only show if no messages yet)
    var showQuickReplies = true;

    // Listen for messages in real-time (loads all history)
    if (unsubMessages) unsubMessages();
    displayedMsgIds.clear();

    unsubMessages = fbDb
      .collection("chats")
      .doc(chatDocId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .onSnapshot(function(snapshot) {
        // Batch DOM updates for smoothness
        var frag = document.createDocumentFragment();
        var added = 0;
        snapshot.docChanges().forEach(function(change) {
          if (change.type === "added" && !displayedMsgIds.has(change.doc.id)) {
            displayedMsgIds.add(change.doc.id);
            var msg = change.doc.data();
            var bubble = document.createElement("div");
            bubble.className = "chat-bubble" + (msg.sender === "user" ? " user" : "");
            bubble.innerHTML = "<p>" + escapeHTML(msg.text) + "</p>";
            frag.appendChild(bubble);
            added++;
          }
        });
        if (added > 0) {
          // Append once and smoothly scroll to last message
          chatBody.appendChild(frag);
          var last = chatBody.lastElementChild;
          if (last && typeof last.scrollIntoView === 'function') {
            last.scrollIntoView({ behavior: 'smooth', block: 'end' });
          } else {
            chatBody.scrollTop = chatBody.scrollHeight;
          }
        }

        // Hide quick replies once messages exist
        if (snapshot.size > 0) {
          showQuickReplies = false;
          const qr = chatBody.querySelector(".chat-quick-replies");
          if (qr) qr.remove();
        }
      });

    // Show quick replies only if this is a fresh conversation
    if (sendNotify) {
      var quickDiv = document.createElement("div");
      quickDiv.className = "chat-quick-replies";
      quickDiv.innerHTML =
        '<button class="chat-quick" data-msg="I need a website built">🌐 I need a website</button>' +
        '<button class="chat-quick" data-msg="My PC needs repair">💻 PC Repair</button>' +
        '<button class="chat-quick" data-msg="I need creative media services">🎨 Creative Media</button>' +
        '<button class="chat-quick" data-msg="I want to know your pricing">💰 Pricing Info</button>';
      chatBody.appendChild(quickDiv);

      quickDiv.querySelectorAll(".chat-quick").forEach(function(btn) {
        btn.addEventListener("click", function() {
          chatInput.value = btn.dataset.msg;
          sendChatMsg();
          quickDiv.remove();
        });
      });
    }

    // Listen for chat status changes (admin archives → return to bot)
    if (unsubChatStatus) unsubChatStatus();
    unsubChatStatus = chatRef.onSnapshot(function(doc) {
      if (doc.exists && doc.data().status === "archived") {
        // Admin ended the conversation — switch client back to bot
        returnToBot();
      }
    });
  }

  // Switch client back to bot screen (called when admin archives chat)
  function returnToBot() {
    // Cleanup listeners
    if (unsubMessages) { unsubMessages(); unsubMessages = null; }
    if (unsubChatStatus) { unsubChatStatus(); unsubChatStatus = null; }
    displayedMsgIds.clear();

    // Hide live chat, show bot
    chatBody.style.display = "none";
    chatInputArea.style.display = "none";
    chatBot.style.display = "flex";
    chatHeaderStatus.textContent = "";

    // Re-init bot with a message
    chatBotBody.innerHTML = "";
    chatBotOptions.innerHTML = "";
    addBotBubbleAnimated(chatBotBody, "The agent has ended this conversation. Thanks for chatting with us! 👋", 200)
      .then(function() {
        return addBotBubbleAnimated(chatBotBody, "If you need more help, I'm still here! What would you like to do?", 200);
      })
      .then(function() {
        showMainBotMenu();
      });
  }

  async function sendChatMsg() {
    const text = chatInput.value.trim();
    if (!text || !chatDocId) return;

    // Input length validation
    if (text.length > 2000) {
      addBotBubble("Message too long. Please keep it under 2000 characters.");
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (now > chatRateLimit.resetTime) {
      chatRateLimit.count = 0;
      chatRateLimit.resetTime = now + chatRateLimit.WINDOW;
    }
    chatRateLimit.count++;
    if (chatRateLimit.count > chatRateLimit.MAX) {
      addBotBubble("You're sending messages too fast. Please wait a moment.");
      return;
    }

    chatInput.value = "";

    try {
      await fbDb.collection("chats").doc(chatDocId).collection("messages").add({
        text: text,
        sender: "user",
        senderName: chatUser.name,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      await fbDb.collection("chats").doc(chatDocId).update({
        lastMessage: text,
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
        unreadByAdmin: firebase.firestore.FieldValue.increment(1)
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  if (chatSend) chatSend.addEventListener("click", sendChatMsg);
  if (chatInput) chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChatMsg(); });

  function addBotBubble(text) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    const p = document.createElement("p");
    p.textContent = text;
    bubble.appendChild(p);
    chatBody.appendChild(bubble);
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ==============================
     USER PRESENCE TRACKING
     Updates lastSeen & isOnline on the chat doc
     ============================== */
  var presenceInterval = null;

  function startPresenceTracking(docId) {
    if (!fbDb || !docId) return;
    var chatRef = fbDb.collection("chats").doc(docId);

    // Mark online immediately
    chatRef.update({
      isOnline: true,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function() {});

    // Heartbeat every 30 seconds
    if (presenceInterval) clearInterval(presenceInterval);
    presenceInterval = setInterval(function() {
      chatRef.update({
        isOnline: true,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(function() {});
    }, 30000);

    // Mark offline on page close / navigate away
    function goOffline() {
      if (presenceInterval) clearInterval(presenceInterval);
      // Use sendBeacon-style sync update
      try {
        chatRef.update({
          isOnline: false,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {}
    }

    window.addEventListener("beforeunload", goOffline);
    window.addEventListener("pagehide", goOffline);

    // Visibility change: away = offline, back = online
    document.addEventListener("visibilitychange", function() {
      if (document.hidden) {
        chatRef.update({
          isOnline: false,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(function() {});
      } else {
        chatRef.update({
          isOnline: true,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(function() {});
      }
    });
  }

  // Auto-show chat hint after 8 seconds
  setTimeout(() => {
    if (!chatOpened) {
      chatToggle.style.animation = "chat-bounce 0.6s ease 3";
    }
  }, 8000);

  /* ==============================
     HERO PARTICLES
     ============================== */
  const heroParticles = document.getElementById("heroParticles");
  function createParticles() {
    if (!heroParticles) return;
    const count = 40;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: rgba(0, 123, 255, ${Math.random() * 0.3 + 0.05});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particle-float ${Math.random() * 20 + 15}s linear infinite;
        animation-delay: ${Math.random() * -20}s;
      `;
      heroParticles.appendChild(particle);
    }
  }
  createParticles();

  // Dynamic keyframes
  const dynamicStyle = document.createElement("style");
  dynamicStyle.textContent = `
    @keyframes particle-float {
      0% { transform: translate(0, 0) scale(1); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translate(${Math.random() > 0.5 ? "" : "-"}${Math.random() * 200 + 50}px, -${Math.random() * 400 + 200}px) scale(0.5); opacity: 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes chat-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.12); }
    }
  `;
  document.head.appendChild(dynamicStyle);

  /* ==============================
     SCROLL REVEAL
     ============================== */
  function initReveals() {
    document.querySelectorAll(".section-header").forEach((el) => el.classList.add("reveal"));
    document.querySelectorAll(".hero-content").forEach((el) => el.classList.add("reveal"));
    document.querySelectorAll(".about-image").forEach((el) => el.classList.add("reveal-left"));
    document.querySelectorAll(".about-content").forEach((el) => el.classList.add("reveal-right"));
    document.querySelectorAll(".contact-cards-centered").forEach((el) => el.classList.add("reveal"));
    document.querySelectorAll(".request-info").forEach((el) => el.classList.add("reveal-left"));
    document.querySelectorAll(".request-form").forEach((el) => el.classList.add("reveal-right"));
    document.querySelectorAll(
      ".services-grid, .portfolio-grid, .portfolio-filters, .hero-stats, .about-timeline, .about-skills, .process-grid, .pricing-grid, .faq-grid, .team-grid"
    ).forEach((el) => el.classList.add("stagger"));
    document.querySelectorAll(
      ".service-card, .portfolio-card, .request-info-card, .contact-card, .process-step, .pricing-card, .faq-item, .team-card"
    ).forEach((el) => el.classList.add("reveal-scale"));
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

  /* ==============================
     UNIFIED SCROLL HANDLER
     ============================== */
  window.addEventListener(
    "scroll",
    () => {
      updateHeader();
      updateActiveNav();
      updateBackToTop();
      animateCounters();
      checkReveals();
    },
    { passive: true }
  );

  // Initial trigger
  setTimeout(() => {
    updateHeader();
    updateActiveNav();
    updateBackToTop();
    animateCounters();
    checkReveals();
  }, 100);

  // Fallback: ensure counters animate to base values even if Firebase or other initialization fails
  setTimeout(() => {
    try {
      if (!counterDone) {
        const counters = document.querySelectorAll('.counter');
        counters.forEach((c) => {
          if (!c.dataset.target || c.dataset.target === '0') {
            const base = parseInt(c.dataset.base || c.getAttribute('data-base') || '0', 10) || 0;
            c.dataset.target = base;
          }
        });
        animateCounters();
        counterDone = true;
      }
    } catch (e) {
      console.warn('Counter fallback failed:', e);
    }
  }, 800);

  /* ==============================
     FOOTER YEAR
     ============================== */
  const footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

})();
