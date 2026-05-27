/* ============================================================
  ADMIN DASHBOARD — Acentra
  Firebase Auth + Firestore for projects & real-time chat
  ============================================================ */

(function () {
  "use strict";

  const ADMIN_EMAILS = window.ADMIN_EMAILS || ["ramaserljay5@gmail.com"];
  const MAIN_ADMIN = "ramaserljay5@gmail.com";
  function isAdmin(email) {
    return ADMIN_EMAILS.map(e => e.toLowerCase()).includes((email || "").toLowerCase());
  }
  function isMainAdmin() {
    return currentUser && currentUser.email &&
      currentUser.email.toLowerCase() === MAIN_ADMIN.toLowerCase();
  }

  /* ==============================
     EMAILJS — NOTIFY AGENT ON ASSIGN
     ============================== */
  const EMAILJS_PUBLIC_KEY = "wU66TLNoKKtnEePP3";
  const EMAILJS_SERVICE_ID = "service_6y0wzge";
  const EMAILJS_TEMPLATE_ID = "template_4o5ar3n";

  function notifyAgentByEmail(agentEmail, clientName, lastMessage) {
    if (typeof emailjs === "undefined") return;
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: agentEmail,
      name: clientName || "A client",
      email: agentEmail,
      message: lastMessage || "(no recent message)",
      title: "📋 ",
      subject: "Chat Assigned to You — " + (clientName || "New Client"),
      time: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    }, EMAILJS_PUBLIC_KEY).then(function() {
      console.log("Assignment notification sent to " + agentEmail);
    }).catch(function(err) {
      console.error("Assignment notification failed:", err);
    });
  }

  /* ==============================
     DOM REFERENCES
     ============================== */
  const adminLogin = document.getElementById("adminLogin");
  const adminApp = document.getElementById("adminApp");
  const adminGoogleBtn = document.getElementById("adminGoogleBtn");
  const adminLogout = document.getElementById("adminLogout");
  const loginError = document.getElementById("loginError");

  let currentUser = null;
  let currentChatId = null;

  // Firestore unsubscribe handles
  let unsubProjectStats = null;
  let unsubChatStats = null;
  let unsubProjectList = null;
  let unsubChatList = null;
  let unsubChatMessages = null;
  let unsubRequestStats = null;
  let unsubRequestList = null;

  // Project data cache
  let allProjects = [];
  let editingProjectId = null;

  // Request data cache
  let allRequests = [];

  /* ==============================
     FIREBASE CHECK
     ============================== */
  const firebaseReady =
    typeof firebase !== "undefined" && firebase.apps && firebase.apps.length > 0;

  if (!firebaseReady) {
    document.querySelector(".admin-login-card > p").textContent =
      "Firebase is not configured. Follow the setup instructions in firebase-config.js.";
    adminGoogleBtn.disabled = true;
    adminGoogleBtn.style.opacity = "0.5";
    adminGoogleBtn.style.cursor = "not-allowed";
  }

  /* ==============================
     AUTHENTICATION
     ============================== */
  if (firebaseReady) {
    // Handle redirect result (from signInWithRedirect on mobile)
    firebase.auth().getRedirectResult().catch((err) => {
      if (err.code && err.code !== "auth/credential-already-in-use") {
        showLoginError("Sign-in failed: " + err.message);
      }
    });

    firebase.auth().onAuthStateChanged((user) => {
      if (user && isAdmin(user.email)) {
        currentUser = user;
        showApp();
      } else if (user) {
        firebase.auth().signOut();
        showLoginError("Access denied. " + user.email + " is not an admin.");
      } else {
        showLogin();
      }
    });
  }

  // Detect mobile / tablets where popups are commonly blocked
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
  }

  adminGoogleBtn.addEventListener("click", async () => {
    if (!firebaseReady) return;
    loginError.style.display = "none";
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Always try popup first — works on most mobile & desktop browsers.
    // If popup is blocked or closed, fall back to redirect.
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' ||
          err.code === 'auth/popup-closed-by-browser' ||
          err.code === 'auth/cancelled-popup-request') {
        try {
          await firebase.auth().signInWithRedirect(provider);
        } catch (redirectErr) {
          showLoginError("Sign-in failed: " + redirectErr.message);
        }
      } else {
        showLoginError("Sign-in failed: " + err.message);
      }
    }
  });

  adminLogout.addEventListener("click", () => {
    if (firebaseReady) firebase.auth().signOut();
  });

  function showLogin() {
    adminLogin.style.display = "flex";
    adminApp.style.display = "none";
    cleanupListeners();
  }

  function showApp() {
    adminLogin.style.display = "none";
    adminApp.style.display = "flex";

    // Update sidebar user info
    const photo = document.getElementById("sidebarUserPhoto");
    const name = document.getElementById("sidebarUserName");
    if (currentUser.photoURL) photo.src = currentUser.photoURL;
    name.textContent = currentUser.displayName || "Admin";

    // Init all sections
    initNavigation();
    initDashboard();
    initProjects();
    initMessages();
    initRequests();
  }

  function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.style.display = "block";
  }

  function cleanupListeners() {
    [unsubProjectStats, unsubChatStats, unsubProjectList, unsubChatList, unsubChatMessages, unsubRequestStats, unsubRequestList].forEach(
      (fn) => { if (fn) fn(); }
    );
  }

  /* ==============================
     PUBLIC STATS SYNC
     Writes aggregated counts to stats/public
     so the main site can show them without
     exposing raw project data.
     ============================== */
  function updatePublicStats(snap) {
    const completed = snap.docs.filter((d) => d.data().status === "completed");
    const uniqueClients = new Set();
    completed.forEach((d) => {
      const client = d.data().client;
      if (client) uniqueClients.add(client.toLowerCase().trim());
    });

    firebase.firestore().collection("stats").doc("public").set({
      completedProjects: completed.length,
      uniqueClients: uniqueClients.size,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch((err) => console.warn("Stats sync:", err));
  }

  /* ==============================
     NAVIGATION
     ============================== */
  let navInitialized = false;
  function initNavigation() {
    if (navInitialized) return;
    navInitialized = true;

    const links = document.querySelectorAll(".sidebar-link");
    const pages = document.querySelectorAll(".admin-page");
    const pageTitle = document.getElementById("pageTitle");
    const sidebar = document.getElementById("adminSidebar");

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
      });
    });

    // Sidebar toggle (mobile)
    document.getElementById("sidebarToggle").addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    // Clickable stat cards
    document.querySelectorAll(".stat-card.clickable").forEach((card) => {
      card.addEventListener("click", () => {
        const page = card.dataset.goto;
        navigateTo(page);
        // If a filter is specified, click that filter tab after navigating
        const filter = card.dataset.filter;
        if (filter) {
          setTimeout(() => {
            const tab = document.querySelector('.filter-tab[data-status="' + filter + '"]');
            if (tab) tab.click();
          }, 50);
        }
      });
    });

    // Escape key closes any open modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeDetailModal();
        closeRequestDetailModal();
      }
    });
  }

  function navigateTo(page) {
    const links = document.querySelectorAll(".sidebar-link");
    const pages = document.querySelectorAll(".admin-page");
    const pageTitle = document.getElementById("pageTitle");
    const sidebar = document.getElementById("adminSidebar");

    links.forEach((l) => l.classList.toggle("active", l.dataset.page === page));
    pages.forEach((p) => p.classList.toggle("active", p.id === "page-" + page));
    pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    sidebar.classList.remove("open");
  }

  /* ==============================
     DASHBOARD
     ============================== */
  function initDashboard() {
    const db = firebase.firestore();

    // Projects stats + recent
    if (unsubProjectStats) unsubProjectStats();
    unsubProjectStats = db.collection("projects").onSnapshot((snap) => {
      const total = snap.size;
      const active = snap.docs.filter(
        (d) => d.data().status === "in-progress"
      ).length;

      document.getElementById("statTotalProjects").textContent = total;
      document.getElementById("statActiveProjects").textContent = active;

      // Update public stats document for the main site hero counters
      updatePublicStats(snap);

      // Recent projects
      const el = document.getElementById("recentProjects");
      const sorted = snap.docs
        .sort(
          (a, b) =>
            (b.data().createdAt?.seconds || 0) -
            (a.data().createdAt?.seconds || 0)
        )
        .slice(0, 5);

      if (sorted.length === 0) {
        el.innerHTML = '<p class="empty-state">No projects yet.</p>';
      } else {
        el.innerHTML = sorted
          .map((doc) => {
            const d = doc.data();
            return (
              '<div class="recent-item" data-projectid="' + doc.id + '">' +
              '<div class="recent-item-info">' +
              "<strong>" + esc(d.title) + "</strong>" +
              "<span>" + esc(d.client || "") + "</span>" +
              "</div>" +
              '<span class="status-badge ' + esc(d.status) + '">' + esc(d.status) + "</span>" +
              "</div>"
            );
          })
          .join("");

        // Click to show project detail popup
        el.querySelectorAll(".recent-item[data-projectid]").forEach((item) => {
          item.addEventListener("click", () => {
            showProjectDetail(item.dataset.projectid);
          });
        });
      }
    });

    // Request stats + recent
    if (unsubRequestStats) unsubRequestStats();
    unsubRequestStats = db.collection("requests").onSnapshot((snap) => {
      const newCount = snap.docs.filter((d) => d.data().status === "new").length;
      document.getElementById("statNewRequests").textContent = newCount;

      // Badge in sidebar
      const badge = document.getElementById("requestBadge");
      if (newCount > 0) {
        badge.textContent = newCount;
        badge.style.display = "inline";
      } else {
        badge.style.display = "none";
      }

      // Recent requests
      const el = document.getElementById("recentRequests");
      const sorted = snap.docs
        .sort(
          (a, b) =>
            (b.data().createdAt?.seconds || 0) -
            (a.data().createdAt?.seconds || 0)
        )
        .slice(0, 5);

      if (sorted.length === 0) {
        el.innerHTML = '<p class="empty-state">No requests yet.</p>';
      } else {
        el.innerHTML = sorted
          .map((doc) => {
            const d = doc.data();
            return (
              '<div class="recent-item" data-reqid="' + doc.id + '">' +
              '<div class="recent-item-info">' +
              "<strong>" + esc(d.name) + "</strong>" +
              "<span>" + esc(d.service || "") + "</span>" +
              "</div>" +
              '<span class="status-badge ' + esc(d.status) + '">' + esc(d.status) + "</span>" +
              "</div>"
            );
          })
          .join("");

        el.querySelectorAll(".recent-item[data-reqid]").forEach((item) => {
          item.addEventListener("click", () => {
            navigateTo("requests");
            setTimeout(() => showRequestDetail(item.dataset.reqid), 100);
          });
        });
      }
    });

    // Chat stats + recent
    // Main admin sees all; assigned admins see only their assigned chats
    if (unsubChatStats) unsubChatStats();
    const mainAdminDash = currentUser && currentUser.email &&
      currentUser.email.toLowerCase() === MAIN_ADMIN.toLowerCase();
    let chatStatsQuery = db.collection("chats");
    if (!mainAdminDash && currentUser && currentUser.email) {
      chatStatsQuery = db.collection("chats")
        .where("assignedTo", "==", currentUser.email);
    }
    unsubChatStats = chatStatsQuery.onSnapshot((snap) => {
      const total = snap.size;
      const unread = snap.docs.reduce(
        (sum, d) => sum + (d.data().unreadByAdmin || 0),
        0
      );

      document.getElementById("statTotalChats").textContent = total;
      document.getElementById("statUnreadChats").textContent = unread;

      // Badge in sidebar
      const badge = document.getElementById("unreadBadge");
      if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = "inline";
      } else {
        badge.style.display = "none";
      }

      // Recent messages
      const el = document.getElementById("recentMessages");
      const sorted = snap.docs
        .sort(
          (a, b) =>
            (b.data().lastMessageAt?.seconds || 0) -
            (a.data().lastMessageAt?.seconds || 0)
        )
        .slice(0, 5);

      if (sorted.length === 0) {
        el.innerHTML = '<p class="empty-state">No messages yet.</p>';
      } else {
        el.innerHTML = sorted
          .map((doc) => {
            const d = doc.data();
            return (
              '<div class="recent-item" data-chatid="' + doc.id + '">' +
              '<div class="recent-item-info">' +
              "<strong>" + esc(d.userName) + "</strong>" +
              "<span>" + esc(d.lastMessage || "No messages") + "</span>" +
              "</div>" +
              (d.unreadByAdmin > 0 ? '<div class="chat-list-unread"></div>' : "") +
              "</div>"
            );
          })
          .join("");

        // Click to navigate to messages
        el.querySelectorAll(".recent-item[data-chatid]").forEach((item) => {
          item.addEventListener("click", () => {
            const chatId = item.dataset.chatid;
            document.querySelector('[data-page="messages"]').click();
            setTimeout(() => loadChat(chatId), 100);
          });
        });
      }
    });
  }

  /* ==============================
     PROJECTS
     ============================== */
  let projectsInitialized = false;
  function initProjects() {
    if (projectsInitialized) return;
    projectsInitialized = true;

    const db = firebase.firestore();

    // Real-time project list
    if (unsubProjectList) unsubProjectList();
    unsubProjectList = db
      .collection("projects")
      .orderBy("createdAt", "desc")
      .onSnapshot((snap) => {
        allProjects = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        applyProjectFilters();
      });

    // Filter tabs
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        applyProjectFilters();
      });
    });

    // Search input
    const searchInput = document.getElementById("projectSearch");
    if (searchInput) {
      searchInput.addEventListener("input", () => applyProjectFilters());
    }

    // Add project button
    document.getElementById("addProjectBtn").addEventListener("click", () => {
      editingProjectId = null;
      document.getElementById("modalTitle").textContent = "Add Project";
      document.getElementById("modalSaveText").textContent = "Save Project";
      document.getElementById("projectForm").reset();
      document.getElementById("projectModal").style.display = "flex";
    });

    // Modal close / cancel
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalCancel").addEventListener("click", closeModal);
    document.getElementById("projectModal").addEventListener("click", (e) => {
      if (e.target.id === "projectModal") closeModal();
    });

    // Portfolio toggle — show/hide extra fields
    const portfolioCheck = document.getElementById("projShowPortfolio");
    const portfolioExtra = document.getElementById("portfolioExtra");
    portfolioCheck.addEventListener("change", () => {
      portfolioExtra.style.display = portfolioCheck.checked ? "block" : "none";
    });

    // Form submit
    document
      .getElementById("projectForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const showInPortfolio = document.getElementById("projShowPortfolio").checked;

        const data = {
          title: document.getElementById("projTitle").value.trim(),
          client: document.getElementById("projClient").value.trim(),
          service: document.getElementById("projService").value,
          status: document.getElementById("projStatus").value,
          budget: document.getElementById("projBudget").value.trim(),
          deadline: document.getElementById("projDeadline").value,
          contact: document.getElementById("projContact").value.trim(),
          details: document.getElementById("projDetails").value.trim(),
          showInPortfolio: showInPortfolio,
          portfolioDesc: document.getElementById("projPortfolioDesc").value.trim(),
          portfolioCategory: document.getElementById("projPortfolioCategory").value,
          portfolioTags: document.getElementById("projPortfolioTags").value.trim(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
          if (editingProjectId) {
            await db.collection("projects").doc(editingProjectId).update(data);
            showToast("Project updated successfully", "success");
          } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("projects").add(data);
            showToast("Project added successfully", "success");
          }

          // Sync portfolio collection
          const projectId = editingProjectId || (await getLastProjectId(db));
          await syncPortfolio(db, projectId, data);

          closeModal();
        } catch (err) {
          console.error("Error saving project:", err);
          showToast("Failed to save project", "error");
        }
      });
  }

  function applyProjectFilters() {
    const activeTab = document.querySelector(".filter-tab.active");
    const status = activeTab ? activeTab.dataset.status : "all";
    const searchInput = document.getElementById("projectSearch");
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    renderProjects(status, query);
  }

  function renderProjects(filter, search) {
    const tbody = document.getElementById("projectsTableBody");
    let filtered = filter === "all"
      ? allProjects
      : allProjects.filter((p) => p.status === filter);

    if (search) {
      filtered = filtered.filter((p) =>
        (p.title || "").toLowerCase().includes(search) ||
        (p.client || "").toLowerCase().includes(search) ||
        (p.service || "").toLowerCase().includes(search)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="empty-state">No projects found.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered
      .map(
        (p) =>
          '<tr class="project-row" data-id="' + p.id + '">' +
          '<td><strong class="project-title-link">' + esc(p.title) + "</strong></td>" +
          "<td>" + esc(p.client || "—") + "</td>" +
          "<td>" + esc(p.service || "—") + "</td>" +
          '<td><span class="status-badge ' + esc(p.status) + '">' + esc(p.status) + "</span></td>" +
          "<td>" + esc(p.budget || "—") + "</td>" +
          "<td>" + esc(p.deadline || "—") + "</td>" +
          "<td>" +
          '<div class="table-actions">' +
          '<button class="table-btn edit-btn" data-id="' + p.id + '"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="table-btn delete delete-btn" data-id="' + p.id + '"><i class="fa-solid fa-trash"></i></button>' +
          "</div>" +
          "</td>" +
          "</tr>"
      )
      .join("");

    // Click project title to show detail
    tbody.querySelectorAll(".project-title-link").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = el.closest("tr").dataset.id;
        showProjectDetail(id);
      });
    });

    // Bind edit buttons
    tbody.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => editProject(btn.dataset.id));
    });

    // Bind delete buttons
    tbody.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteProject(btn.dataset.id));
    });
  }

  /* ==============================
     PROJECT DETAIL POPUP
     ============================== */
  function showProjectDetail(id) {
    const project = allProjects.find((p) => p.id === id);
    if (!project) return;

    const detailModal = document.getElementById("projectDetailModal");
    const detailBody = document.getElementById("detailBody");
    document.getElementById("detailTitle").textContent = project.title || "Project Details";

    detailBody.innerHTML =
      '<div class="detail-row">' +
        '<div class="detail-field"><label>Client</label><p>' + esc(project.client || "—") + '</p></div>' +
        '<div class="detail-field"><label>Service</label><p>' + esc(project.service || "—") + '</p></div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-field"><label>Status</label><span class="status-badge ' + esc(project.status || "") + '">' + esc(project.status || "—") + '</span></div>' +
        '<div class="detail-field"><label>Budget</label><p>' + esc(project.budget || "—") + '</p></div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-field"><label>Deadline</label><p>' + esc(project.deadline || "—") + '</p></div>' +
        '<div class="detail-field"><label>Contact</label><p>' + esc(project.contact || "—") + '</p></div>' +
      '</div>' +
      (project.details ? '<div class="detail-field"><label>Notes</label><p>' + esc(project.details) + '</p></div>' : '');

    // Wire up edit/delete buttons
    const editBtn = document.getElementById("detailEditBtn");
    const deleteBtn = document.getElementById("detailDeleteBtn");
    const newEdit = editBtn.cloneNode(true);
    const newDelete = deleteBtn.cloneNode(true);
    editBtn.parentNode.replaceChild(newEdit, editBtn);
    deleteBtn.parentNode.replaceChild(newDelete, deleteBtn);

    newEdit.addEventListener("click", () => {
      closeDetailModal();
      editProject(id);
    });
    newDelete.addEventListener("click", async () => {
      closeDetailModal();
      deleteProject(id);
    });

    detailModal.style.display = "flex";

    // Close handlers
    document.getElementById("detailClose").onclick = closeDetailModal;
    detailModal.addEventListener("click", (e) => {
      if (e.target === detailModal) closeDetailModal();
    });
  }

  function closeDetailModal() {
    const m = document.getElementById("projectDetailModal");
    if (m) m.style.display = "none";
  }

  function editProject(id) {
    const project = allProjects.find((p) => p.id === id);
    if (!project) return;

    editingProjectId = id;
    document.getElementById("modalTitle").textContent = "Edit Project";
    document.getElementById("modalSaveText").textContent = "Update Project";
    document.getElementById("projTitle").value = project.title || "";
    document.getElementById("projClient").value = project.client || "";
    document.getElementById("projService").value = project.service || "Web Development";
    document.getElementById("projStatus").value = project.status || "pending";
    document.getElementById("projBudget").value = project.budget || "";
    document.getElementById("projDeadline").value = project.deadline || "";
    document.getElementById("projContact").value = project.contact || "";
    document.getElementById("projDetails").value = project.details || "";

    // Portfolio fields
    const showInPortfolio = project.showInPortfolio || false;
    document.getElementById("projShowPortfolio").checked = showInPortfolio;
    document.getElementById("portfolioExtra").style.display = showInPortfolio ? "block" : "none";
    document.getElementById("projPortfolioDesc").value = project.portfolioDesc || "";
    document.getElementById("projPortfolioCategory").value = project.portfolioCategory || "web";
    document.getElementById("projPortfolioTags").value = project.portfolioTags || "";

    document.getElementById("projectModal").style.display = "flex";
  }

  async function deleteProject(id) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await firebase.firestore().collection("projects").doc(id).delete();
      showToast("Project deleted", "info");
    } catch (err) {
      console.error("Error deleting project:", err);
      showToast("Failed to delete project", "error");
    }
  }

  function closeModal() {
    document.getElementById("projectModal").style.display = "none";
    document.getElementById("projShowPortfolio").checked = false;
    document.getElementById("portfolioExtra").style.display = "none";
    editingProjectId = null;
  }

  /* ==============================
     PORTFOLIO SYNC
     Keeps the public portfolio collection
     in sync with project data.
     ============================== */
  async function syncPortfolio(db, projectId, data) {
    if (!projectId) return;

    const portfolioRef = db.collection("portfolio").doc(projectId);

    if (data.showInPortfolio && data.status === "completed") {
      // Map service type to icon
      const iconMap = {
        "Web Development": "fa-solid fa-globe",
        "IT & PC Services": "fa-solid fa-desktop",
        "Creative Media": "fa-solid fa-palette"
      };
      // Map service type to category
      const catMap = {
        "Web Development": "web",
        "IT & PC Services": "system",
        "Creative Media": "creative"
      };

      await portfolioRef.set({
        title: data.title,
        description: data.portfolioDesc || data.details || "",
        category: data.portfolioCategory || catMap[data.service] || "web",
        tags: (data.portfolioTags || "").split(",").map(t => t.trim()).filter(Boolean),
        icon: iconMap[data.service] || "fa-solid fa-code",
        service: data.service,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } else {
      // Remove from portfolio if unchecked or not completed
      const doc = await portfolioRef.get();
      if (doc.exists) await portfolioRef.delete();
    }
  }

  async function getLastProjectId(db) {
    // Get the most recently created project's ID
    const snap = await db.collection("projects")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    return snap.empty ? null : snap.docs[0].id;
  }

  /* ==============================
     MESSAGES / CHAT
     ============================== */
  let messagesInitialized = false;
  let chatFilterStatus = "active"; // "active" | "archived" | "all"

  function initMessages() {
    if (messagesInitialized) return;
    messagesInitialized = true;

    const db = firebase.firestore();
    const filterLabel = document.getElementById("chatFilterLabel");

    // Chat filter tabs
    document.querySelectorAll(".chat-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".chat-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        chatFilterStatus = tab.dataset.filter;
        // Re-render from cached snapshot
        if (lastChatSnap) renderChatList(lastChatSnap);
      });
    });

    // Populate assign dropdown options
    const assignSelect = document.getElementById("chatAssignSelect");
    assignSelect.innerHTML = '<option value="">Unassigned</option>';
    ADMIN_EMAILS.forEach((email) => {
      const name = email.split("@")[0];
      const opt = document.createElement("option");
      opt.value = email;
      opt.textContent = name;
      assignSelect.appendChild(opt);
    });

    // Only main admin can assign — hide for agents
    const mainAdmin = currentUser && currentUser.email &&
      currentUser.email.toLowerCase() === MAIN_ADMIN.toLowerCase();
    if (!mainAdmin) {
      assignSelect.style.display = "none";
      filterLabel.textContent = "My chats";
    }

    // Handle assignment change
    assignSelect.addEventListener("change", async () => {
      if (!currentChatId) return;
      const agentEmail = assignSelect.value || null;
      try {
        // Store email exactly as-is from the dropdown (matches auth token case)
        await db.collection("chats").doc(currentChatId).update({
          assignedTo: agentEmail ? agentEmail : null
        });
        showToast("Chat assigned", "success");

        // Send email notification to the assigned agent
        if (agentEmail) {
          const chatDoc = await db.collection("chats").doc(currentChatId).get();
          const chatData = chatDoc.exists ? chatDoc.data() : {};
          notifyAgentByEmail(agentEmail, chatData.userName || "Unknown", chatData.lastMessage || "");
        }
      } catch (err) {
        console.error("Assign error:", err);
        showToast("Failed to assign", "error");
      }
    });

    // Archive / Unarchive button
    document.getElementById("chatArchiveBtn").addEventListener("click", async () => {
      if (!currentChatId) return;
      try {
        const doc = await db.collection("chats").doc(currentChatId).get();
        const isArchived = doc.exists && doc.data().status === "archived";
        await db.collection("chats").doc(currentChatId).update({
          status: isArchived ? "active" : "archived"
        });
        showToast(isArchived ? "Chat restored" : "Chat archived", "success");
        // Reset view
        document.getElementById("chatViewEmpty").style.display = "flex";
        document.getElementById("chatViewActive").style.display = "none";
        currentChatId = null;
      } catch (err) {
        console.error("Archive error:", err);
        showToast("Failed to update chat", "error");
      }
    });

    // Delete chat button
    document.getElementById("chatDeleteBtn").addEventListener("click", async () => {
      if (!currentChatId) return;
      if (!confirm("Delete this entire conversation? This cannot be undone.")) return;
      try {
        // Delete subcollection messages first
        const msgs = await db.collection("chats").doc(currentChatId).collection("messages").get();
        const batch = db.batch();
        msgs.docs.forEach((m) => batch.delete(m.ref));
        batch.delete(db.collection("chats").doc(currentChatId));
        await batch.commit();
        showToast("Chat deleted", "success");
        document.getElementById("chatViewEmpty").style.display = "flex";
        document.getElementById("chatViewActive").style.display = "none";
        currentChatId = null;
      } catch (err) {
        console.error("Delete error:", err);
        showToast("Failed to delete chat", "error");
      }
    });

    // Real-time chat list
    let lastChatSnap = null;
    if (unsubChatList) unsubChatList();

    // Main admin queries all chats; assigned admins must filter by assignedTo
    // (Firestore rules require queries to match security rule constraints)
    const mainAdminUser = currentUser && currentUser.email &&
      currentUser.email.toLowerCase() === MAIN_ADMIN.toLowerCase();
    let chatQuery = db.collection("chats").orderBy("lastMessageAt", "desc");
    if (!mainAdminUser && currentUser && currentUser.email) {
      // Use exact email from auth (same case Firestore rules see)
      chatQuery = db.collection("chats")
        .where("assignedTo", "==", currentUser.email)
        .orderBy("lastMessageAt", "desc");
    }

    unsubChatList = chatQuery
      .onSnapshot((snap) => {
        lastChatSnap = snap;
        renderChatList(snap);
      }, (err) => {
        console.error("Chat list query error:", err);
        // If index is missing, Firestore error contains a link to create it
        if (err.message && err.message.includes("index")) {
          showToast("Firestore index needed — check browser console for link", "error");
        } else {
          showToast("Failed to load chats: " + err.code, "error");
        }
      });

    function renderChatList(snap) {
      const body = document.getElementById("chatListBody");

      if (snap.empty) {
        body.innerHTML = '<p class="empty-state">No conversations yet.</p>';
        return;
      }

      // Filter: main admin sees all; assigned admins already filtered by query
      let docs = snap.docs;
      const mainAdminLoggedIn = currentUser && currentUser.email &&
        currentUser.email.toLowerCase() === MAIN_ADMIN.toLowerCase();

      // Filter by tab: active / archived / all
      if (chatFilterStatus !== "all") {
        docs = docs.filter((doc) => {
          const d = doc.data();
          const status = d.status || "active";
          return status === chatFilterStatus;
        });
      }

      if (docs.length === 0) {
        const msg = chatFilterStatus === "archived"
          ? "No archived conversations."
          : (!mainAdminLoggedIn ? "No conversations assigned to you yet." : "No conversations yet.");
        body.innerHTML = '<p class="empty-state">' + msg + '</p>';
        return;
      }

      body.innerHTML = docs
        .map((doc) => {
          const d = doc.data();
          const initial = (d.userName || "?")[0].toUpperCase();
          const isActive = doc.id === currentChatId;
          const isUnread = (d.unreadByAdmin || 0) > 0;
          const isArchived = d.status === "archived";
          const time = d.lastMessageAt
            ? formatTime(d.lastMessageAt.toDate())
            : "";
          const assignedName = d.assignedTo
            ? d.assignedTo.split("@")[0]
            : "";

          // Online presence for list item
          var userOnline = d.isOnline === true;
          var ls = d.lastSeen ? d.lastSeen.toDate() : null;
          var isOnlineNow = userOnline && ls && (Date.now() - ls.getTime() < 60000);

          return (
            '<div class="chat-list-item' +
            (isActive ? " active" : "") +
            (isUnread ? " unread" : "") +
            (isArchived ? " archived" : "") +
            '" data-chatid="' + doc.id + '">' +
            '<div class="chat-list-avatar" style="position:relative;">' +
            (d.userPhoto
              ? '<img src="' + esc(d.userPhoto) + '" alt="' + esc(d.userName) + '" />'
              : initial) +
            (isOnlineNow ? '<span class="chat-list-online-dot"></span>' : '') +
            "</div>" +
            '<div class="chat-list-info">' +
            "<h4>" + esc(d.userName) + " <span>" + time + "</span></h4>" +
            "<p>" + esc(d.lastMessage || "No messages yet") + "</p>" +
            '<div class="chat-list-meta">' +
            (assignedName
              ? '<span class="chat-assigned-tag"><i class="fa-solid fa-user-tag"></i> ' + esc(assignedName) + "</span>"
              : "") +
            (isArchived
              ? '<span class="chat-archived-tag"><i class="fa-solid fa-box-archive"></i> Archived</span>'
              : "") +
            "</div>" +
            "</div>" +
            (isUnread ? '<div class="chat-list-unread"></div>' : "") +
            "</div>"
          );
        })
        .join("");

      // Bind click handlers
      body.querySelectorAll(".chat-list-item").forEach((item) => {
        item.addEventListener("click", () => {
          loadChat(item.dataset.chatid);
        });
      });
    }
  }

  function loadChat(chatId) {
    currentChatId = chatId;
    const db = firebase.firestore();

    // Show active view
    document.getElementById("chatViewEmpty").style.display = "none";
    document.getElementById("chatViewActive").style.display = "flex";

    // Highlight in list
    document.querySelectorAll(".chat-list-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.chatid === chatId);
    });

    // Get chat info — use real-time listener for live presence
    if (typeof window._unsubChatPresence === "function") window._unsubChatPresence();
    window._unsubChatPresence = db.collection("chats")
      .doc(chatId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("chatViewName").textContent = data.userName;
          const isArchived = data.status === "archived";
          const statusEl = document.getElementById("chatViewStatus");

          if (isArchived) {
            statusEl.textContent = "Archived";
            statusEl.className = "chat-view-status archived";
          } else {
            // Calculate real online/offline status from lastSeen + isOnline
            var onlineNow = data.isOnline === true;
            var lastSeen = data.lastSeen ? data.lastSeen.toDate() : null;
            var STALE_MS = 60000; // consider offline if no heartbeat for 60s

            if (onlineNow && lastSeen && (Date.now() - lastSeen.getTime() < STALE_MS)) {
              statusEl.innerHTML = '<span class="presence-dot online"></span> Online';
              statusEl.className = "chat-view-status online";
            } else if (lastSeen) {
              statusEl.innerHTML = '<span class="presence-dot offline"></span> ' + formatLastSeen(lastSeen);
              statusEl.className = "chat-view-status offline";
            } else {
              statusEl.innerHTML = '<span class="presence-dot offline"></span> Offline';
              statusEl.className = "chat-view-status offline";
            }
          }

          // Toggle archive button icon/title
          const archiveBtn = document.getElementById("chatArchiveBtn");
          if (isArchived) {
            archiveBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
            archiveBtn.title = "Restore chat";
            archiveBtn.className = "chat-action-btn restore";
          } else {
            archiveBtn.innerHTML = '<i class="fa-solid fa-box-archive"></i>';
            archiveBtn.title = "Archive chat";
            archiveBtn.className = "chat-action-btn archive";
          }

          // Set assign dropdown to current assignment
          const assignSelect = document.getElementById("chatAssignSelect");
          assignSelect.value = data.assignedTo || "";

          // Mark as read
          db.collection("chats").doc(chatId).update({ unreadByAdmin: 0 });
        }
      });

    // Listen for messages (incremental updates for admin view)
    if (unsubChatMessages) unsubChatMessages();
    const messagesEl = document.getElementById("chatViewMessages");
    messagesEl.innerHTML = "";
    const displayedAdminMsgIds = new Set();

    unsubChatMessages = db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .onSnapshot((snap) => {
        // Use docChanges to avoid rebuilding entire list
        var frag = document.createDocumentFragment();
        var added = 0;
        snap.docChanges().forEach((change) => {
          if (change.type === 'added' && !displayedAdminMsgIds.has(change.doc.id)) {
            displayedAdminMsgIds.add(change.doc.id);
            const msg = change.doc.data();
            const time = msg.timestamp ? formatTime(msg.timestamp.toDate()) : "";
            const div = document.createElement("div");
            div.className = "admin-msg " + (msg.sender === "admin" ? "admin" : "user");
            div.innerHTML = "<p>" + esc(msg.text) + "</p>" + '<div class="msg-time">' + time + "</div>";
            frag.appendChild(div);
            added++;
          }
          // Handle modified/deleted if necessary (not implemented here)
        });
        if (added > 0) {
          messagesEl.appendChild(frag);
          // Smooth scroll to latest
          const last = messagesEl.lastElementChild;
          if (last && typeof last.scrollIntoView === 'function') {
            last.scrollIntoView({ behavior: 'smooth', block: 'end' });
          } else {
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        }
      });

    // Setup send input — clone to remove old listeners
    const sendBtn = document.getElementById("adminChatSend");
    const inputEl = document.getElementById("adminChatInput");
    const newSend = sendBtn.cloneNode(true);
    const newInput = inputEl.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSend, sendBtn);
    inputEl.parentNode.replaceChild(newInput, inputEl);

    async function sendReply() {
      const text = newInput.value.trim();
      if (!text) return;
      if (text.length > 2000) {
        showToast("Message too long (max 2000 chars)", "error");
        return;
      }
      newInput.value = "";

      try {
        await db
          .collection("chats")
          .doc(chatId)
          .collection("messages")
            .add({
            text: text,
            sender: "admin",
            senderName: "Acentra",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });

        await db.collection("chats").doc(chatId).update({
          lastMessage: text,
          lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error("Error sending reply:", err);
      }
    }

    newSend.addEventListener("click", sendReply);
    newInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendReply();
    });
    newInput.focus();
  }

  /* ==============================
     REQUESTS
     ============================== */
  let requestsInitialized = false;
  function initRequests() {
    if (requestsInitialized) return;
    requestsInitialized = true;

    const db = firebase.firestore();

    // Real-time request list
    if (unsubRequestList) unsubRequestList();
    unsubRequestList = db
      .collection("requests")
      .orderBy("createdAt", "desc")
      .onSnapshot((snap) => {
        allRequests = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        applyRequestFilters();
      });

    // Filter tabs
    document.querySelectorAll(".req-filter").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".req-filter").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        applyRequestFilters();
      });
    });

    // Search input
    const searchInput = document.getElementById("requestSearch");
    if (searchInput) {
      searchInput.addEventListener("input", () => applyRequestFilters());
    }
  }

  function applyRequestFilters() {
    const activeTab = document.querySelector(".req-filter.active");
    const status = activeTab ? activeTab.dataset.status : "all";
    const searchInput = document.getElementById("requestSearch");
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    renderRequests(status, query);
  }

  function renderRequests(filter, search) {
    const tbody = document.getElementById("requestsTableBody");
    let filtered = filter === "all"
      ? allRequests
      : allRequests.filter((r) => r.status === filter);

    if (search) {
      filtered = filtered.filter((r) =>
        (r.name || "").toLowerCase().includes(search) ||
        (r.contact || "").toLowerCase().includes(search) ||
        (r.service || "").toLowerCase().includes(search) ||
        (r.details || "").toLowerCase().includes(search)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="empty-state">No requests found.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered
      .map(
        (r) =>
          '<tr class="project-row" data-id="' + r.id + '">' +
          '<td><strong class="request-name-link">' + esc(r.name) + "</strong></td>" +
          "<td>" + esc(r.contact || "—") + "</td>" +
          "<td>" + esc(r.service || "—") + "</td>" +
          "<td>" + esc(r.budget || "—") + "</td>" +
          '<td><span class="status-badge ' + esc(r.status) + '">' + esc(r.status) + "</span></td>" +
          "<td>" + formatDate(r.createdAt) + "</td>" +
          "<td>" +
          '<div class="table-actions">' +
          '<button class="table-btn view-req-btn" data-id="' + r.id + '" title="View"><i class="fa-solid fa-eye"></i></button>' +
          '<button class="table-btn delete delete-req-btn" data-id="' + r.id + '" title="Delete"><i class="fa-solid fa-trash"></i></button>' +
          "</div>" +
          "</td>" +
          "</tr>"
      )
      .join("");

    // Click name to view details
    tbody.querySelectorAll(".request-name-link").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = el.closest("tr").dataset.id;
        showRequestDetail(id);
      });
    });

    // View buttons
    tbody.querySelectorAll(".view-req-btn").forEach((btn) => {
      btn.addEventListener("click", () => showRequestDetail(btn.dataset.id));
    });

    // Delete buttons
    tbody.querySelectorAll(".delete-req-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteRequest(btn.dataset.id));
    });
  }

  /* ==============================
     REQUEST DETAIL POPUP
     ============================== */
  function showRequestDetail(id) {
    const req = allRequests.find((r) => r.id === id);
    if (!req) return;

    const modal = document.getElementById("requestDetailModal");
    const body = document.getElementById("reqDetailBody");
    document.getElementById("reqDetailTitle").textContent = req.name || "Request Details";

    body.innerHTML =
      '<div class="detail-row">' +
        '<div class="detail-field"><label>Client Name</label><p>' + esc(req.name || "—") + '</p></div>' +
        '<div class="detail-field"><label>Contact</label><p>' + esc(req.contact || "—") + '</p></div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-field"><label>Service</label><p>' + esc(req.service || "—") + '</p></div>' +
        '<div class="detail-field"><label>Device</label><p>' + esc(req.device || "—") + '</p></div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-field"><label>Budget</label><p>' + esc(req.budget || "—") + '</p></div>' +
        '<div class="detail-field"><label>Deadline</label><p>' + esc(req.deadline || "—") + '</p></div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-field"><label>Status</label><span class="status-badge ' + esc(req.status || "") + '">' + esc(req.status || "—") + '</span></div>' +
        '<div class="detail-field"><label>Submitted</label><p>' + formatDate(req.createdAt) + '</p></div>' +
      '</div>' +
      (req.details ? '<div class="detail-field"><label>Details / Description</label><p class="req-details-text">' + esc(req.details) + '</p></div>' : '');

    // Wire up action buttons (clone to remove old listeners)
    wireReqButton("reqMarkContacted", id, req);
    wireReqButton("reqConvertProject", id, req);
    wireReqButton("reqArchive", id, req);

    const delBtn = document.getElementById("reqDeleteBtn");
    const newDel = delBtn.cloneNode(true);
    delBtn.parentNode.replaceChild(newDel, delBtn);
    newDel.addEventListener("click", () => {
      closeRequestDetailModal();
      deleteRequest(id);
    });

    // Show/hide buttons based on current status
    document.getElementById("reqMarkContacted").style.display = req.status === "new" ? "" : "none";
    document.getElementById("reqConvertProject").style.display = (req.status === "new" || req.status === "contacted") ? "" : "none";
    document.getElementById("reqArchive").style.display = req.status !== "archived" ? "" : "none";

    modal.style.display = "flex";

    document.getElementById("reqDetailClose").onclick = closeRequestDetailModal;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeRequestDetailModal();
    });
  }

  function wireReqButton(btnId, reqId, req) {
    const btn = document.getElementById(btnId);
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", async () => {
      const status = newBtn.dataset.status;

      if (status === "converted") {
        // Convert request to a project
        try {
          await firebase.firestore().collection("projects").add({
            title: req.service + " — " + req.name,
            client: req.name,
            service: req.service || "Web Development",
            status: "pending",
            budget: req.budget || "",
            deadline: req.deadline || "",
            contact: req.contact || "",
            details: req.details || "",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
          await firebase.firestore().collection("requests").doc(reqId).update({ status: "converted" });
          showToast("Request converted to project!", "success");
        } catch (err) {
          console.error("Error converting request:", err);
          showToast("Failed to convert request", "error");
        }
      } else {
        try {
          await firebase.firestore().collection("requests").doc(reqId).update({ status: status });
          showToast("Request marked as " + status, "success");
        } catch (err) {
          console.error("Error updating request:", err);
          showToast("Failed to update request", "error");
        }
      }
      closeRequestDetailModal();
    });
  }

  function closeRequestDetailModal() {
    const m = document.getElementById("requestDetailModal");
    if (m) m.style.display = "none";
  }

  async function deleteRequest(id) {
    if (!confirm("Delete this request? This cannot be undone.")) return;
    try {
      await firebase.firestore().collection("requests").doc(id).delete();
      showToast("Request deleted", "info");
    } catch (err) {
      console.error("Error deleting request:", err);
      showToast("Failed to delete request", "error");
    }
  }

  function formatDate(timestamp) {
    if (!timestamp || !timestamp.toDate) return "—";
    return timestamp.toDate().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  /* ==============================
     HELPERS
     ============================== */
  function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function formatLastSeen(date) {
    if (!date) return "Offline";
    var now = new Date();
    var diff = now - date;
    if (diff < 60000) return "Last seen just now";
    if (diff < 3600000) return "Last seen " + Math.floor(diff / 60000) + "m ago";
    if (diff < 86400000) return "Last seen " + Math.floor(diff / 3600000) + "h ago";
    if (diff < 172800000) return "Last seen yesterday";
    return "Last seen " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function esc(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ==============================
     TOAST NOTIFICATIONS
     ============================== */
  function showToast(message, type) {
    type = type || "info";
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const icons = {
      success: "fa-circle-check",
      error: "fa-circle-xmark",
      info: "fa-circle-info"
    };

    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerHTML = '<i class="fa-solid ' + (icons[type] || icons.info) + '"></i> ' + esc(message);
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fadeOut");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
})();
