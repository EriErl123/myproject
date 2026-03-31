/**
 * LearnHub — localStorage Manager
 * Manages all persistent data: student profile, progress, quiz scores, badges, settings
 */

const Storage = (() => {
  const KEYS = {
    STUDENT: 'lh_student',
    PROGRESS: 'lh_progress',
    QUIZ_SCORES: 'lh_quiz_scores',
    BADGES: 'lh_badges',
    COURSES: 'lh_courses',
    SETTINGS: 'lh_settings',
  };

  const get = (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  };

  const set = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  };

  const remove = (key) => localStorage.removeItem(key);

  // ── Student Profile ──────────────────────────────────────────────────────────
  const getStudent = () => get(KEYS.STUDENT) || {
    name: '',
    color: '#f59e0b',
    xp: 0,
    createdAt: Date.now(),
  };

  const saveStudent = (data) => set(KEYS.STUDENT, { ...getStudent(), ...data });

  const addXP = (amount) => {
    const student = getStudent();
    student.xp = (student.xp || 0) + amount;
    set(KEYS.STUDENT, student);
    return student.xp;
  };

  // ── Progress ─────────────────────────────────────────────────────────────────
  // Structure: { [courseId]: { [lessonId]: true } }
  const getProgress = () => get(KEYS.PROGRESS) || {};

  const markLessonDone = (courseId, lessonId) => {
    const progress = getProgress();
    if (!progress[courseId]) progress[courseId] = {};
    progress[courseId][lessonId] = true;
    set(KEYS.PROGRESS, progress);
  };

  const isLessonDone = (courseId, lessonId) => {
    const progress = getProgress();
    return !!(progress[courseId] && progress[courseId][lessonId]);
  };

  const getLessonsDoneInCourse = (courseId) => {
    const progress = getProgress();
    return progress[courseId] ? Object.keys(progress[courseId]).length : 0;
  };

  // ── Quiz Scores ───────────────────────────────────────────────────────────────
  // Structure: { [quizId]: { score, total, date } }
  const getQuizScores = () => get(KEYS.QUIZ_SCORES) || {};

  const saveQuizScore = (quizId, score, total) => {
    const scores = getQuizScores();
    scores[quizId] = { score, total, pct: Math.round((score / total) * 100), date: Date.now() };
    set(KEYS.QUIZ_SCORES, scores);
    return scores[quizId];
  };

  const getQuizScore = (quizId) => {
    const scores = getQuizScores();
    return scores[quizId] || null;
  };

  // ── Badges ───────────────────────────────────────────────────────────────────
  const getBadges = () => get(KEYS.BADGES) || [];

  const earnBadge = (badgeId) => {
    const badges = getBadges();
    if (!badges.includes(badgeId)) {
      badges.push(badgeId);
      set(KEYS.BADGES, badges);
      return true; // newly earned
    }
    return false;
  };

  const hasBadge = (badgeId) => getBadges().includes(badgeId);

  // ── Custom Courses (Admin-added) ──────────────────────────────────────────────
  const getCustomCourses = () => get(KEYS.COURSES) || [];

  const saveCustomCourse = (course) => {
    const courses = getCustomCourses();
    const existing = courses.findIndex((c) => c.id === course.id);
    if (existing >= 0) courses[existing] = course;
    else courses.push(course);
    set(KEYS.COURSES, courses);
  };

  const deleteCustomCourse = (courseId) => {
    const courses = getCustomCourses().filter((c) => c.id !== courseId);
    set(KEYS.COURSES, courses);
  };

  // ── Settings ─────────────────────────────────────────────────────────────────
  const getSettings = () => get(KEYS.SETTINGS) || { adminUnlocked: false };
  const saveSettings = (data) => set(KEYS.SETTINGS, { ...getSettings(), ...data });

  return {
    getStudent, saveStudent, addXP,
    getProgress, markLessonDone, isLessonDone, getLessonsDoneInCourse,
    getQuizScores, saveQuizScore, getQuizScore,
    getBadges, earnBadge, hasBadge,
    getCustomCourses, saveCustomCourse, deleteCustomCourse,
    getSettings, saveSettings,
  };
})();
