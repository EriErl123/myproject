/**
 * LearnHub — Main App Router & View Controller
 */

const App = (() => {
  // ─── State ───────────────────────────────────────────────────────────────────
  const state = {
    view: 'dashboard',
    params: {},
    adminUnlocked: false,
  };

  const ADMIN_PASSWORD = 'admin123';

  const BADGE_DEFS = [
    { id: 'badge-first-quiz', emoji: '🏅', name: 'First Step', desc: 'Complete your first quiz' },
    { id: 'badge-perfect', emoji: '🌟', name: 'Perfect Score', desc: 'Score 100% on any quiz' },
    { id: 'badge-first-course', emoji: '📚', name: 'Course Finisher', desc: 'Complete all lessons in a course' },
    { id: 'badge-triple', emoji: '🎓', name: 'Triple Crown', desc: 'Complete 3 full courses' },
    { id: 'badge-streak', emoji: '🔥', name: 'On Fire', desc: 'Take 5 quizzes in a row' },
    { id: 'badge-explorer', emoji: '🗺️', name: 'Explorer', desc: 'Visit all 3 subjects' },
  ];

  // ─── Init ─────────────────────────────────────────────────────────────────────
  const init = () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // Sidebar toggle
    document.getElementById('menuBtn').addEventListener('click', openSidebar);
    document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

    // Profile button
    document.getElementById('profileBtn').addEventListener('click', showProfileModal);
    document.getElementById('studentCard').addEventListener('click', showProfileModal);

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modalBackdrop')) closeModal();
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
      if (state.view === 'courses') renderCourses(e.target.value);
    });

    // Nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        navigate(view);
        closeSidebar();
      });
    });

    // Student profile
    const student = Storage.getStudent();
    if (!student.name) {
      showProfileModal(true); // force setup
    }

    state.adminUnlocked = Storage.getSettings().adminUnlocked || false;

    refreshStudentCard();
    navigate('dashboard');
  };

  // ─── Sidebar ──────────────────────────────────────────────────────────────────
  const openSidebar = () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('open');
  };
  const closeSidebar = () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
  };

  // ─── Navigation ───────────────────────────────────────────────────────────────
  const navigate = (view, params = {}) => {
    state.view = view;
    state.params = params;

    // Update active nav
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach((l) => l.classList.remove('active'));
    const activeLink = document.getElementById(`nav-${view}`);
    if (activeLink) activeLink.classList.add('active');
    const bNavLink = document.getElementById(`bnav-${view}`);
    if (bNavLink) bNavLink.classList.add('active');

    // Show/hide search
    const searchBox = document.getElementById('searchBox');
    searchBox.style.display = view === 'courses' ? 'block' : 'none';

    // Update topbar title
    const titles = {
      dashboard: '🏠 Dashboard',
      courses: '📖 My Courses',
      progress: '📊 My Progress',
      badges: '🏆 Badges',
      admin: '⚙️ Admin Panel',
      course: '📖 Course',
      lesson: '📄 Lesson',
      quiz: '📝 Quiz',
    };
    document.getElementById('topbarTitle').textContent = titles[view] || 'LearnHub';

    // Render the view
    const area = document.getElementById('contentArea');
    area.innerHTML = '';

    switch (view) {
      case 'dashboard': renderDashboard(); break;
      case 'courses': renderCourses(); break;
      case 'course': renderCourseDetail(params.courseId); break;
      case 'lesson': renderLesson(params.courseId, params.lessonId); break;
      case 'quiz': renderQuiz(params.quizId, params.courseId, params.lessonId); break;
      case 'progress': renderProgress(); break;
      case 'badges': renderBadges(); break;
      case 'admin': renderAdmin(); break;
      default: renderDashboard();
    }
  };

  // ─── Student Card ─────────────────────────────────────────────────────────────
  const refreshStudentCard = () => {
    const student = Storage.getStudent();
    const name = student.name || 'Guest';
    const xp = student.xp || 0;
    const initial = name.charAt(0).toUpperCase() || '?';

    document.getElementById('studentAvatar').textContent = initial;
    document.getElementById('studentAvatar').style.background = student.color || 'linear-gradient(135deg, #f59e0b, #8b5cf6)';
    document.getElementById('studentName').textContent = name;
    document.getElementById('studentXp').textContent = `${xp} XP`;
  };

  // ─── Profile Modal ────────────────────────────────────────────────────────────
  const AVATAR_COLORS = [
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #14b8a6, #3b82f6)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #22c55e, #14b8a6)',
    'linear-gradient(135deg, #f59e0b, #8b5cf6)',
    'linear-gradient(135deg, #ef4444, #f59e0b)',
  ];

  const showProfileModal = (force = false) => {
    const student = Storage.getStudent();
    const colorsHTML = AVATAR_COLORS.map((c, i) => `
      <div class="avatar-color-swatch ${student.color === c ? 'selected' : ''}"
           style="background:${c}; width:32px; height:32px; border-radius:50%; cursor:pointer; border: 2px solid ${student.color === c ? '#f59e0b' : 'transparent'}; transition: all 0.2s;"
           onclick="App.selectAvatarColor('${c}', this)">
      </div>
    `).join('');

    openModal('My Profile', `
      <div class="form-group">
        <label class="form-label">Your Name</label>
        <input type="text" class="form-input" id="profileName" placeholder="Enter your name" value="${student.name || ''}" maxlength="40" />
      </div>
      <div class="form-group">
        <label class="form-label">Avatar Color</label>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:6px;" id="colorPicker">
          ${colorsHTML}
        </div>
      </div>
      <div style="margin-top:4px; font-size:0.8rem; color:var(--text-muted);">Total XP: <strong style="color:var(--accent)">${student.xp || 0}</strong></div>
    `, [
      { label: 'Save Profile', class: 'btn-primary', onclick: 'App.saveProfile()' },
      ...(force ? [] : [{ label: 'Cancel', class: 'btn-ghost', onclick: 'App.closeModal()' }]),
    ], force);

    // Store temp color
    window._tempColor = student.color || AVATAR_COLORS[0];
  };

  const selectAvatarColor = (color, el) => {
    window._tempColor = color;
    document.querySelectorAll('.avatar-color-swatch').forEach((s) => {
      s.style.border = '2px solid transparent';
    });
    el.style.border = '2px solid #f59e0b';
  };

  const saveProfile = () => {
    const name = document.getElementById('profileName')?.value.trim();
    if (!name) { showToast('Please enter your name', 'error'); return; }
    Storage.saveStudent({ name, color: window._tempColor || AVATAR_COLORS[0] });
    refreshStudentCard();
    closeModal();
    showToast('Profile saved! 👤', 'success');
  };

  // ─── Modal Helpers ────────────────────────────────────────────────────────────
  const openModal = (title, bodyHTML, buttons = [], noClose = false) => {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalClose').style.display = noClose ? 'none' : 'flex';

    const footer = document.getElementById('modalFooter');
    footer.innerHTML = buttons.map((b) => `
      <button class="btn ${b.class}" onclick="${b.onclick}">${b.label}</button>
    `).join('');

    document.getElementById('modalBackdrop').classList.add('open');
  };

  const closeModal = () => {
    document.getElementById('modalBackdrop').classList.remove('open');
  };

  // ─── Toast ─────────────────────────────────────────────────────────────────────
  let toastTimer;
  const showToast = (msg, type = 'info') => {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast toast-${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  const renderDashboard = () => {
    const student = Storage.getStudent();
    const allCourses = SeedData.getAllCourses();
    const progress = Storage.getProgress();
    const badges = Storage.getBadges();
    const quizScores = Storage.getQuizScores();

    let totalLessons = 0, doneLessons = 0;
    allCourses.forEach((c) => {
      const t = c.totalLessons || 9;
      totalLessons += t;
      doneLessons += Math.min(Storage.getLessonsDoneInCourse(c.id), t);
    });
    const overallPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
    const quizCount = Object.keys(quizScores).length;

    const name = student.name || 'Guest';
    const greeting = getGreeting();

    // Continue Learning Logic
    let bestCourseToContinue = null;
    let highestIncompletePct = -1;

    allCourses.forEach((c) => {
      const totalL = c.totalLessons || 9;
      const done = Math.min(Storage.getLessonsDoneInCourse(c.id), totalL);
      const pct = Math.round((done / totalL) * 100);
      
      if (pct > 0 && pct < 100 && pct > highestIncompletePct) {
        highestIncompletePct = pct;
        bestCourseToContinue = c;
      }
    });

    if (!bestCourseToContinue) {
      bestCourseToContinue = allCourses.find((c) => {
        const totalL = c.totalLessons || 9;
        const done = Math.min(Storage.getLessonsDoneInCourse(c.id), totalL);
        return done < totalL;
      }) || allCourses[0];
    }

    const otherCourses = allCourses.filter(c => c.id !== bestCourseToContinue.id).slice(0, 2);

    document.getElementById('contentArea').innerHTML = `
      <div class="dashboard-grid">
        <div class="welcome-banner">
          <div class="welcome-text">
            <h2>${greeting}, ${name}! 👋</h2>
            <p>You have completed <strong>${doneLessons}</strong> of <strong>${totalLessons}</strong> lessons. Keep it up!</p>
            <div style="margin-top:14px;">
              <div class="progress-label"><span>Overall Progress</span><span>${overallPct}%</span></div>
              <div class="progress-bar-wrap" style="height:10px;"><div class="progress-bar-fill" style="width:${overallPct}%"></div></div>
            </div>
          </div>
          <div class="welcome-emoji">🎒</div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon">📖</div>
            <div class="stat-value" style="color:var(--teal)">${allCourses.length}</div>
            <div class="stat-label">Total Courses</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value" style="color:var(--green)">${doneLessons}</div>
            <div class="stat-label">Lessons Done</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-value" style="color:var(--accent)">${quizCount}</div>
            <div class="stat-label">Quizzes Taken</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-value" style="color:var(--purple)">${badges.length}</div>
            <div class="stat-label">Badges Earned</div>
          </div>
        </div>

        <div>
          <div class="section-header">
            <div class="section-title">Continue Learning</div>
          </div>
          <div class="courses-grid" style="margin-bottom: 24px;">
            ${bestCourseToContinue ? renderCourseCard(bestCourseToContinue) : ''}
          </div>

          <div class="section-header">
            <div class="section-title">Recommended For You</div>
            <a href="#" class="section-link" onclick="App.navigate('courses'); return false;">View All →</a>
          </div>
          <div class="courses-grid">
            ${otherCourses.map((c) => renderCourseCard(c)).join('')}
          </div>
        </div>

        ${badges.length ? `
        <div>
          <div class="section-header">
            <div class="section-title">Recent Badges</div>
            <a href="#" class="section-link" onclick="App.navigate('badges'); return false;">All Badges →</a>
          </div>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            ${badges.slice(-4).map((id) => {
              const b = BADGE_DEFS.find((x) => x.id === id);
              return b ? `<div style="background:var(--bg-card);border:1px solid var(--accent);border-radius:12px;padding:12px 18px;display:flex;align-items:center;gap:10px;font-size:0.85rem;font-weight:600;">
                <span style="font-size:1.5rem;">${b.emoji}</span> ${b.name}
              </div>` : '';
            }).join('')}
          </div>
        </div>` : ''}
      </div>
    `;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderCourseCard = (course) => {
    const totalL = course.totalLessons || 9;
    const done = Math.min(Storage.getLessonsDoneInCourse(course.id), totalL);
    const pct = Math.round((done / totalL) * 100);
    return `
      <div class="course-card" onclick="App.navigate('course', { courseId: '${course.id}' })">
        <div class="course-banner ${course.banner || 'banner-default'}">${course.emoji || '📚'}</div>
        <div class="course-card-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:4px;">
            <div class="course-title">${course.title}</div>
            <span class="badge badge-${getCategoryBadge(course.category)}">${course.category}</span>
          </div>
          <div class="course-meta">
            <span>📖 ${totalL} lessons</span>
            <span>✅ ${done} done</span>
          </div>
          <div class="progress-label"><span>${pct}% complete</span></div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        </div>
      </div>
    `;
  };

  const getCategoryBadge = (cat) => {
    const map = { 'Mathematics': 'purple', 'Science': 'teal', 'Filipino': 'rose' };
    return map[cat] || 'accent';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: COURSES
  // ─────────────────────────────────────────────────────────────────────────────
  const renderCourses = (search = '') => {
    const area = document.getElementById('contentArea');
    const allCourses = SeedData.getAllCourses();
    const categories = SeedData.getCategories();

    // Get active filter from URL-like state
    const activeFilter = state.params.filter || 'All';

    let filtered = allCourses;
    if (activeFilter !== 'All') filtered = filtered.filter((c) => c.category === activeFilter);
    if (search) filtered = filtered.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
    );

    const filterTabsHTML = categories.map((cat) => `
      <button class="filter-tab ${cat === activeFilter ? 'active' : ''}"
        onclick="App.navigate('courses', { filter: '${cat}' })">${cat}</button>
    `).join('');

    area.innerHTML = `
      <div class="filter-tabs">${filterTabsHTML}</div>
      <div class="courses-grid" id="coursesGrid">
        ${filtered.length
          ? filtered.map((c) => renderCourseCard(c)).join('')
          : `<div class="empty-state" style="grid-column:1/-1;">
               <div class="empty-state-icon">🔍</div>
               <h3>No courses found</h3>
               <p>Try adjusting your search or filter.</p>
             </div>`
        }
      </div>
    `;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: COURSE DETAIL
  // ─────────────────────────────────────────────────────────────────────────────
  const renderCourseDetail = (courseId) => {
    const course = SeedData.getCourse(courseId);
    if (!course) { navigate('courses'); return; }

    const totalL = course.totalLessons || 9;
    const done = Math.min(Storage.getLessonsDoneInCourse(courseId), totalL);
    const pct = Math.round((done / totalL) * 100);

    const modulesHTML = course.modules.map((mod) => {
      const lessonsHTML = mod.lessons.map((lesson) => {
        const isDone = Storage.isLessonDone(courseId, lesson.id);
        const score = lesson.quizId ? Storage.getQuizScore(lesson.quizId) : null;
        return `
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;transition:all 0.2s;"
               onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'"
               onclick="App.navigate('lesson', { courseId: '${courseId}', lessonId: '${lesson.id}' })">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:34px;height:34px;border-radius:50%;background:${isDone ? 'var(--green-soft)' : 'var(--bg-secondary)'};display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;border:1.5px solid ${isDone ? 'var(--green)' : 'var(--border)'};">
                ${isDone ? '✅' : '📄'}
              </div>
              <div>
                <div style="font-weight:600;font-size:0.88rem;">${lesson.title}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">⏱ ${lesson.duration}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
              ${score ? `<span class="badge badge-${score.pct >= 80 ? 'green' : 'accent'}">${score.pct}%</span>` : ''}
              ${lesson.quizId ? `<span class="badge badge-purple">Quiz</span>` : ''}
              <span style="color:var(--text-muted);font-size:0.85rem;">→</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div style="margin-bottom:20px;">
          <div style="font-family:'Nunito',sans-serif;font-weight:800;font-size:0.95rem;color:var(--text-secondary);margin-bottom:10px;padding-left:4px;">${mod.title}</div>
          <div style="display:flex;flex-direction:column;gap:8px;">${lessonsHTML}</div>
        </div>
      `;
    }).join('');

    document.getElementById('contentArea').innerHTML = `
      <div>
        <button class="lesson-back-btn" onclick="App.navigate('courses')">← Back to Courses</button>
        <div class="lesson-main" style="margin-bottom:24px;">
          <div class="lesson-header">
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="font-size:3rem;">${course.emoji || '📚'}</div>
              <div>
                <div class="lesson-category">${course.category}</div>
                <div class="lesson-title">${course.title}</div>
                <div style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">${course.description || ''}</div>
              </div>
            </div>
            <div style="margin-top:20px;">
              <div class="progress-label"><span>${done}/${totalL} lessons complete</span><span>${pct}%</span></div>
              <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            </div>
          </div>
          <div class="lesson-body">${modulesHTML}</div>
        </div>
      </div>
    `;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: LESSON
  // ─────────────────────────────────────────────────────────────────────────────
  const renderLesson = (courseId, lessonId) => {
    const data = SeedData.getLesson(courseId, lessonId);
    if (!data) { navigate('courses'); return; }
    const { lesson, module: mod, course } = data;

    // Build flat lesson list for prev/next
    const allLessons = [];
    course.modules.forEach((m) => m.lessons.forEach((l) => allLessons.push({ ...l, courseId })));
    const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
    const prev = allLessons[currentIdx - 1];
    const next = allLessons[currentIdx + 1];

    // Module sidebar
    const moduleSidebarHTML = course.modules.map((m) => {
      const isCurrentMod = m.id === mod.id;
      return `
        <div class="module-item">
          <div class="module-header ${isCurrentMod ? 'active' : ''}" onclick="this.nextElementSibling.classList.toggle('open');this.querySelector('.module-toggle').classList.toggle('open')">
            📦 ${m.title}
            <span class="module-toggle ${isCurrentMod ? 'open' : ''}">▼</span>
          </div>
          <div class="lesson-list ${isCurrentMod ? 'open' : ''}">
            ${m.lessons.map((l) => {
              const isDone = Storage.isLessonDone(courseId, l.id);
              const isActive = l.id === lessonId;
              return `<div class="lesson-link ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}"
                onclick="App.navigate('lesson', { courseId: '${courseId}', lessonId: '${l.id}' })">
                <span class="lesson-status">${isDone ? '✅' : isActive ? '▶' : '○'}</span>
                ${l.title}
              </div>`;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    const totalL = course.totalLessons || 9;
    const done = Math.min(Storage.getLessonsDoneInCourse(courseId), totalL);
    const pct = Math.round((done / totalL) * 100);

    // Mark lesson done on view
    Storage.markLessonDone(courseId, lessonId);

    document.getElementById('contentArea').innerHTML = `
      <button class="lesson-back-btn" onclick="App.navigate('course', { courseId: '${courseId}' })">← Back to ${course.title}</button>
      <div class="lesson-layout">
        <div>
          <div class="lesson-main">
            <div class="lesson-header">
              <div class="lesson-category">${mod.title}</div>
              <div class="lesson-title">${lesson.title}</div>
              <div style="display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap;">
                <span class="badge badge-accent">⏱ ${lesson.duration}</span>
                ${lesson.quizId ? `<span class="badge badge-purple">📝 Has Quiz</span>` : ''}
              </div>
            </div>
            <div class="lesson-body">
              <div class="lesson-content">${lesson.content}</div>
            </div>
            <div class="lesson-nav">
              ${prev ? `<button class="btn btn-secondary btn-sm" onclick="App.navigate('lesson',{courseId:'${courseId}',lessonId:'${prev.id}'})">← Previous</button>` : '<span></span>'}
              <div style="display:flex;gap:10px;">
                ${lesson.quizId ? `<button class="btn btn-primary btn-sm" onclick="App.navigate('quiz',{quizId:'${lesson.quizId}',courseId:'${courseId}',lessonId:'${lessonId}'})">📝 Take Quiz</button>` : ''}
                ${next ? `<button class="btn btn-secondary btn-sm" onclick="App.navigate('lesson',{courseId:'${courseId}',lessonId:'${next.id}'})">Next →</button>` : ''}
              </div>
            </div>
          </div>
        </div>

        <div class="module-sidebar">
          <div class="module-sidebar-header">📚 ${course.title}</div>
          <div class="progress-label" style="padding:12px 20px 0;"><span>Progress</span><span>${pct}%</span></div>
          <div class="progress-bar-wrap" style="margin:6px 20px 14px;"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          <div class="module-list">${moduleSidebarHTML}</div>
        </div>
      </div>
    `;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: QUIZ
  // ─────────────────────────────────────────────────────────────────────────────
  const renderQuiz = (quizId, courseId, lessonId) => {
    const quiz = SeedData.getQuiz(quizId);
    if (!quiz) { navigate('courses'); return; }

    document.getElementById('topbarTitle').textContent = `📝 ${quiz.title}`;
    document.getElementById('contentArea').innerHTML = `
      <button class="lesson-back-btn" onclick="App.navigate('lesson',{courseId:'${courseId}',lessonId:'${lessonId}'})">← Back to Lesson</button>
      <div class="quiz-container">
        <div style="margin-bottom:20px;">
          <h2 style="font-family:'Nunito',sans-serif;font-size:1.3rem;font-weight:900;">${quiz.title}</h2>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">${quiz.questions.length} questions · ${quiz.questions.length * 10} XP possible</p>
        </div>
        <div id="quizContainer"></div>
      </div>
    `;
    QuizEngine.start(quizId, courseId, lessonId, 'quizContainer', null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: PROGRESS
  // ─────────────────────────────────────────────────────────────────────────────
  const renderProgress = () => {
    const allCourses = SeedData.getAllCourses();
    const quizScores = Storage.getQuizScores();

    const cardsHTML = allCourses.map((course) => {
      const totalL = course.totalLessons || 9;
      const done = Math.min(Storage.getLessonsDoneInCourse(course.id), totalL);
      const pct = Math.round((done / totalL) * 100);

      // Quiz scores from this course
      const courseQuizIds = [];
      course.modules?.forEach((m) => m.lessons?.forEach((l) => { if (l.quizId) courseQuizIds.push(l.quizId); }));
      const scores = courseQuizIds.map((id) => quizScores[id]).filter(Boolean);
      const avgScore = scores.length ? Math.round(scores.reduce((s, q) => s + q.pct, 0) / scores.length) : null;

      return `
        <div class="progress-course-card">
          <div class="progress-course-name">
            <span class="progress-course-emoji">${course.emoji || '📚'}</span>
            ${course.title}
          </div>
          <div class="progress-label"><span>Lessons</span><span>${done}/${totalL}</span></div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          ${avgScore !== null ? `<div style="margin-top:12px;font-size:0.8rem;color:var(--text-muted);">Avg Quiz Score: <strong style="color:var(--accent)">${avgScore}%</strong></div>` : ''}
          <div style="margin-top:12px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('course',{courseId:'${course.id}'})">Go to Course →</button>
          </div>
        </div>
      `;
    }).join('');

    const student = Storage.getStudent();
    document.getElementById('contentArea').innerHTML = `
      <div style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:20px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px;">
          <div style="width:56px;height:56px;border-radius:50%;background:${student.color || 'linear-gradient(135deg,#f59e0b,#8b5cf6)'};display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:#fff;">
            ${(student.name || 'G').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-family:'Nunito',sans-serif;font-size:1.2rem;font-weight:900;">${student.name || 'Guest'}</div>
            <div style="color:var(--accent);font-weight:600;font-size:1rem;margin-top:2px;">⚡ ${student.xp || 0} Total XP</div>
          </div>
        </div>
      </div>
      <div class="section-title" style="margin-bottom:16px;">Course Progress</div>
      <div class="progress-grid">${cardsHTML}</div>
    `;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: BADGES
  // ─────────────────────────────────────────────────────────────────────────────
  const renderBadges = () => {
    const earned = Storage.getBadges();
    const html = BADGE_DEFS.map((b) => {
      const isEarned = earned.includes(b.id);
      return `
        <div class="badge-card ${isEarned ? 'earned' : ''}">
          <div class="badge-emoji">${b.emoji}</div>
          <div class="badge-name">${b.name}</div>
          <div class="badge-desc">${b.desc}</div>
          ${isEarned ? '<div style="margin-top:8px;"><span class="badge badge-green">Earned!</span></div>' : ''}
        </div>
      `;
    }).join('');

    document.getElementById('contentArea').innerHTML = `
      <div style="margin-bottom:20px;">
        <div class="section-title" style="margin-bottom:4px;">🏆 Achievement Badges</div>
        <span style="color:var(--text-muted);font-size:0.85rem;">${earned.length}/${BADGE_DEFS.length} earned</span>
      </div>
      <div class="badges-grid">${html}</div>
    `;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: ADMIN
  // ─────────────────────────────────────────────────────────────────────────────
  const renderAdmin = () => {
    if (!state.adminUnlocked) {
      document.getElementById('contentArea').innerHTML = `
        <div class="lock-screen">
          <div class="lock-icon">🔒</div>
          <h3>Admin Access</h3>
          <p>Enter the admin password to manage courses and content.</p>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;margin-top:8px;">
            <input type="password" class="form-input" id="adminPassInput" placeholder="Password" style="width:220px;" onkeydown="if(event.key==='Enter')App.unlockAdmin()" />
            <button class="btn btn-primary" onclick="App.unlockAdmin()">Unlock</button>
          </div>
        </div>
      `;
      return;
    }
    renderAdminPanel();
  };

  const unlockAdmin = () => {
    const pass = document.getElementById('adminPassInput')?.value;
    if (pass === ADMIN_PASSWORD) {
      state.adminUnlocked = true;
      Storage.saveSettings({ adminUnlocked: true });
      renderAdminPanel();
      showToast('Admin unlocked! ⚙️', 'success');
    } else {
      showToast('Incorrect password', 'error');
    }
  };

  let adminTab = 'courses';

  const renderAdminPanel = () => {
    const courses = SeedData.getAllCourses();
    const customCourses = Storage.getCustomCourses();

    const tableRows = courses.map((c) => {
      const isCustom = customCourses.find((x) => x.id === c.id);
      return `
        <tr>
          <td>${c.emoji || '📚'} ${c.title}</td>
          <td><span class="badge badge-${getCategoryBadge(c.category)}">${c.category}</span></td>
          <td>${c.totalLessons || 9}</td>
          <td>${isCustom ? `<button class="btn btn-danger btn-sm" onclick="App.deleteCourse('${c.id}')">Delete</button>` : '<span style="color:var(--text-muted);font-size:0.8rem;">Built-in</span>'}</td>
        </tr>
      `;
    }).join('');

    document.getElementById('contentArea').innerHTML = `
      <div class="admin-layout">
        <div>
          <div class="admin-sidebar">
            <div class="admin-sidebar-item ${adminTab === 'courses' ? 'active' : ''}" onclick="App.setAdminTab('courses')">📖 Manage Courses</div>
            <div class="admin-sidebar-item ${adminTab === 'add' ? 'active' : ''}" onclick="App.setAdminTab('add')">➕ Add Course</div>
            <div class="admin-sidebar-item" onclick="App.lockAdmin()" style="color:var(--rose);">🔒 Lock Admin</div>
          </div>
        </div>
        <div id="adminPanelContent">
          ${adminTab === 'courses' ? `
            <div class="admin-panel">
              <div class="admin-panel-title">All Courses</div>
              <table class="admin-table">
                <thead><tr><th>Title</th><th>Category</th><th>Lessons</th><th>Actions</th></tr></thead>
                <tbody>${tableRows}</tbody>
              </table>
            </div>
          ` : `
            <div class="admin-panel">
              <div class="admin-panel-title">Add New Course</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Course Title</label>
                  <input type="text" class="form-input" id="acTitle" placeholder="e.g. Araling Panlipunan – Gr.7" />
                </div>
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <input type="text" class="form-input" id="acCategory" placeholder="e.g. Social Studies" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Emoji Icon</label>
                  <input type="text" class="form-input" id="acEmoji" placeholder="📗" maxlength="4" />
                </div>
                <div class="form-group">
                  <label class="form-label">Banner Style</label>
                  <select class="form-select" id="acBanner">
                    <option value="banner-default">Default</option>
                    <option value="banner-math">Math (Blue/Purple)</option>
                    <option value="banner-science">Science (Green)</option>
                    <option value="banner-filipino">Filipino (Red)</option>
                    <option value="banner-history">History (Gold)</option>
                    <option value="banner-pe">PE (Blue)</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <input type="text" class="form-input" id="acDesc" placeholder="Short description of the course" />
              </div>
              <div style="margin-top:8px; padding:14px;background:var(--bg-secondary);border-radius:10px;border:1px solid var(--border);">
                <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:8px;">The new course will be created with a placeholder module and lesson. You can expand it by editing the data file.</div>
              </div>
              <div style="margin-top:16px;display:flex;gap:10px;">
                <button class="btn btn-primary" onclick="App.addCourse()">➕ Create Course</button>
                <button class="btn btn-ghost" onclick="App.setAdminTab('courses')">Cancel</button>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  };

  const setAdminTab = (tab) => {
    adminTab = tab;
    renderAdminPanel();
  };

  const lockAdmin = () => {
    state.adminUnlocked = false;
    Storage.saveSettings({ adminUnlocked: false });
    navigate('admin');
    showToast('Admin locked 🔒', 'info');
  };

  const addCourse = () => {
    const title = document.getElementById('acTitle')?.value.trim();
    const category = document.getElementById('acCategory')?.value.trim();
    const emoji = document.getElementById('acEmoji')?.value.trim() || '📗';
    const banner = document.getElementById('acBanner')?.value || 'banner-default';
    const desc = document.getElementById('acDesc')?.value.trim();

    if (!title || !category) { showToast('Title and category are required', 'error'); return; }

    const id = 'custom-' + Date.now();
    const course = {
      id,
      title,
      category,
      emoji,
      banner,
      description: desc,
      totalLessons: 1,
      modules: [
        {
          id: `${id}-m1`,
          title: 'Module 1: Introduction',
          lessons: [
            {
              id: `${id}-l1`,
              title: `Introduction to ${title}`,
              duration: '5 min',
              content: `<h3>Welcome to ${title}</h3><p>This is the introductory lesson. The teacher can edit the content by modifying the course data.</p>`,
            }
          ]
        }
      ]
    };

    Storage.saveCustomCourse(course);
    showToast(`Course "${title}" created! 🎉`, 'success');
    setAdminTab('courses');
  };

  const deleteCourse = (courseId) => {
    openModal('Delete Course', `<p>Are you sure you want to delete this course? This action cannot be undone.</p>`, [
      { label: 'Yes, Delete', class: 'btn-danger', onclick: `App._confirmDelete('${courseId}')` },
      { label: 'Cancel', class: 'btn-ghost', onclick: 'App.closeModal()' },
    ]);
  };

  const _confirmDelete = (courseId) => {
    Storage.deleteCustomCourse(courseId);
    closeModal();
    showToast('Course deleted.', 'info');
    renderAdminPanel();
  };

  return {
    init, navigate, refreshStudentCard,
    showProfileModal, saveProfile, selectAvatarColor,
    openModal, closeModal,
    unlockAdmin, lockAdmin, setAdminTab, addCourse, deleteCourse, _confirmDelete,
  };
})();

// === Boot ===
window.addEventListener('DOMContentLoaded', App.init);
