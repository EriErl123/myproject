/**
 * LearnHub — Quiz Engine
 * Manages rendering and scoring of interactive quizzes.
 */

const QuizEngine = (() => {
  let state = {
    quizId: null,
    questions: [],
    currentIndex: 0,
    answers: [],
    answered: false,
    courseId: null,
    lessonId: null,
    onComplete: null,
  };

  const XP_PER_CORRECT = 10;
  const BADGE_PERFECT = 'badge-perfect';
  const BADGE_FIRST_QUIZ = 'badge-first-quiz';

  const render = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const q = state.questions[state.currentIndex];
    const total = state.questions.length;
    const current = state.currentIndex;

    // Progress dots
    const dots = state.questions.map((_, i) => {
      if (i < current) return `<div class="quiz-dot done"></div>`;
      if (i === current) return `<div class="quiz-dot current"></div>`;
      return `<div class="quiz-dot"></div>`;
    }).join('');

    // Options
    const letters = ['A', 'B', 'C', 'D'];
    const optionsHTML = q.options.map((opt, i) => `
      <button class="quiz-option" id="qopt-${i}" onclick="QuizEngine.selectOption(${i})">
        <span class="quiz-option-letter">${letters[i]}</span>
        ${opt}
      </button>
    `).join('');

    container.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-progress-track">${dots}</div>
        <div class="quiz-question-num">Question ${current + 1} of ${total}</div>
        <div class="quiz-question-text">${q.q}</div>
      </div>
      <div class="quiz-options" id="quizOptions">${optionsHTML}</div>
      <div class="quiz-feedback" id="quizFeedback"></div>
      <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <button class="btn btn-primary" id="quizNextBtn" onclick="QuizEngine.next()" style="display:none;">
          ${current + 1 === total ? '🏆 Finish Quiz' : 'Next →'}
        </button>
      </div>
    `;
    state.answered = false;
  };

  const start = (quizId, courseId, lessonId, containerId, onComplete) => {
    const quiz = SeedData.getQuiz(quizId);
    if (!quiz) return;

    state = {
      quizId,
      questions: quiz.questions,
      currentIndex: 0,
      answers: [],
      answered: false,
      courseId,
      lessonId,
      onComplete,
    };

    render(containerId);
  };

  const selectOption = (index) => {
    if (state.answered) return;
    state.answered = true;

    const q = state.questions[state.currentIndex];
    const isCorrect = index === q.answer;
    state.answers.push({ selected: index, correct: q.answer, isCorrect });

    // Style options
    q.options.forEach((_, i) => {
      const btn = document.getElementById(`qopt-${i}`);
      if (!btn) return;
      btn.disabled = true;
      if (i === q.answer) btn.classList.add('correct');
      else if (i === index && !isCorrect) btn.classList.add('wrong');
    });

    // Feedback
    const fb = document.getElementById('quizFeedback');
    if (fb) {
      fb.className = `quiz-feedback ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
      fb.textContent = isCorrect
        ? `✅ Correct! +${XP_PER_CORRECT} XP`
        : `❌ The correct answer is: ${q.options[q.answer]}`;
    }

    if (isCorrect) Storage.addXP(XP_PER_CORRECT);

    // Show next button
    const nextBtn = document.getElementById('quizNextBtn');
    if (nextBtn) nextBtn.style.display = 'inline-flex';
  };

  const next = () => {
    if (!state.answered) return;

    if (state.currentIndex + 1 < state.questions.length) {
      state.currentIndex++;
      const container = document.getElementById('quizContainer');
      if (container) render('quizContainer');
    } else {
      finish();
    }
  };

  const finish = () => {
    const score = state.answers.filter((a) => a.isCorrect).length;
    const total = state.questions.length;
    const pct = Math.round((score / total) * 100);

    // Save result
    Storage.saveQuizScore(state.quizId, score, total);

    // Mark lesson done
    if (state.courseId && state.lessonId) {
      Storage.markLessonDone(state.courseId, state.lessonId);
    }

    // Badges
    const newBadges = [];
    if (Storage.earnBadge(BADGE_FIRST_QUIZ)) newBadges.push('🏅 First Quiz Completed!');
    if (pct === 100 && Storage.earnBadge(BADGE_PERFECT)) newBadges.push('🌟 Perfect Score!');

    // Check courses completion for badge
    const allCourses = SeedData.getAllCourses();
    const progress = Storage.getProgress();
    let completedCourses = 0;
    allCourses.forEach((course) => {
      const totalL = course.totalLessons || 9;
      const done = Storage.getLessonsDoneInCourse(course.id);
      if (done >= totalL) completedCourses++;
    });
    if (completedCourses >= 1 && Storage.earnBadge('badge-first-course')) newBadges.push('📚 First Course Done!');
    if (completedCourses >= 3 && Storage.earnBadge('badge-triple')) newBadges.push('🎓 3 Courses Completed!');

    // XP bonus for completion
    if (pct >= 80) Storage.addXP(25);

    const resultEmoji = pct === 100 ? '🌟' : pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    const resultMessage = pct === 100 ? 'Perfect Score!' : pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';

    const container = document.getElementById('quizContainer');
    if (container) {
      container.innerHTML = `
        <div class="quiz-result">
          <div class="quiz-result-icon">${resultEmoji}</div>
          <div class="quiz-result-score">${pct}%</div>
          <div class="quiz-result-label">${score}/${total} correct — ${resultMessage}</div>
          ${newBadges.length ? `<div style="margin: 16px 0; display:flex; flex-direction:column; gap:8px;">${newBadges.map(b => `<div class="badge badge-accent" style="font-size:0.85rem; padding: 8px 14px; border-radius: 8px;">${b}</div>`).join('')}</div>` : ''}
          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:24px;">
            <button class="btn btn-secondary" onclick="QuizEngine.retry()">🔁 Retry Quiz</button>
            ${state.courseId ? `<button class="btn btn-primary" onclick="App.navigate('course', { courseId: '${state.courseId}' })">📖 Back to Course</button>` : ''}
          </div>
        </div>
      `;
    }

    // Update sidebar XP
    App.refreshStudentCard();

    if (typeof state.onComplete === 'function') state.onComplete(score, total, pct);
  };

  const retry = () => {
    const container = document.getElementById('quizContainer');
    if (container) start(state.quizId, state.courseId, state.lessonId, 'quizContainer', state.onComplete);
  };

  return { start, selectOption, next, retry };
})();
