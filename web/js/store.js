/* ============================================================
   HabitFlow — data store (localStorage; offline-first)
   Records: records[habitId][YYYY-MM-DD] = 'done' | 'skip'
   ============================================================ */
window.Store = (function () {
  'use strict';

  var KEY = 'habitflow_v1';
  var state = null;
  var listeners = [];

  /* ---------------- dates ---------------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return dateKey(new Date()); }
  function parseKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return dateKey(d); }
  function dowOf(k) { return parseKey(k).getDay(); } // 0=Sun..6=Sat

  /** start (dateKey) of the week containing refKey, based on locale week start */
  function weekStartOf(refKey) {
    var ws = window.I18n.weekStart();
    var dow = dowOf(refKey);
    return addDays(refKey, -((dow - ws + 7) % 7));
  }

  /* ---------------- core ---------------- */
  function defaults() {
    return { v: 1, seq: 1, habits: [], records: {}, settings: { lang: null, theme: 'dark' } };
  }

  /* ---------------- validation helpers ----------------
     Stored data and imported backups are untrusted: every field is
     normalized so it can never inject markup/CSS (color, id are put
     into HTML attributes) or crash the render/stats engines. */
  var HEX_RE = /^#[0-9A-Fa-f]{6}$/;
  var ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var ICON_WHITELIST = ['droplet', 'book', 'dumbbell', 'yoga', 'leaf', 'code', 'music',
    'coffee', 'moon', 'pill', 'heart', 'brush', 'money', 'apple', 'zap', 'star',
    'pencil', 'sparkle', 'target', 'calendar'];
  function saneColor(c) { return (typeof c === 'string' && HEX_RE.test(c)) ? c : '#2E7F84'; }
  function saneIcon(ic) { return (typeof ic === 'string' && ICON_WHITELIST.indexOf(ic) !== -1) ? ic : 'star'; }
  function saneDays(v) {
    if (!Array.isArray(v)) return [0, 1, 2, 3, 4, 5, 6];
    var out = [];
    v.forEach(function (d) {
      var n = +d;
      if (n >= 0 && n <= 6 && out.indexOf(n) === -1) out.push(n);
    });
    return out.length ? out.sort() : [0, 1, 2, 3, 4, 5, 6];
  }
  function saneText(v, max) { return typeof v === 'string' ? v.slice(0, max) : ''; }
  function saneDate(v) { return (typeof v === 'string' && DATE_RE.test(v)) ? v : todayKey(); }
  function saneRecords(r) {
    var out = {};
    if (!r || typeof r !== 'object') return out;
    Object.keys(r).forEach(function (hid) {
      if (hid === '__proto__' || hid === 'constructor' || hid === 'prototype') return;
      var rec = r[hid];
      if (!rec || typeof rec !== 'object') return;
      var clean = {};
      Object.keys(rec).forEach(function (k) {
        if (DATE_RE.test(k) && (rec[k] === 'done' || rec[k] === 'skip')) clean[k] = rec[k];
      });
      if (Object.keys(clean).length) out[hid] = clean;
    });
    return out;
  }
  /** normalize a whole {habits, records, settings} blob (import / corrupt store) */
  function sanitize(data) {
    var usedIds = {};
    var seq = Math.max(1, Math.min(1e9, Math.floor(+data.seq) || 0));
    var habits = [];
    data.habits.forEach(function (h, i) {
      if (!h || typeof h !== 'object') return;
      var origId = (typeof h.id === 'string') ? h.id.slice(0, 40) : '';
      var id = (origId && ID_RE.test(origId)) ? origId : ('h' + (seq + i));
      while (usedIds[id]) id += 'x';
      usedIds[id] = true;
      habits.push({
        id: id,
        origId: (id === origId) ? null : origId, // records may be keyed by the old id
        name: saneText(h.name, 60).trim() || ('Habit ' + (i + 1)),
        desc: saneText(h.desc, 120).trim(),
        color: saneColor(h.color),
        icon: saneIcon(h.icon),
        days: saneDays(h.days),
        createdAt: saneDate(h.createdAt),
        order: (typeof h.order === 'number' && isFinite(h.order)) ? h.order : i
      });
    });
    var recsIn = saneRecords(data.records);
    var records = {};
    habits.forEach(function (h) {
      var r = recsIn[h.id] || (h.origId ? recsIn[h.origId] : null);
      if (r) records[h.id] = r;
    });
    habits.forEach(function (h) { delete h.origId; });
    var s = (data.settings && typeof data.settings === 'object') ? data.settings : {};
    return {
      v: 1,
      seq: seq || habits.length + 1,
      habits: habits,
      records: records,
      settings: {
        lang: (s.lang === 'fa' || s.lang === 'en') ? s.lang : null,
        theme: s.theme === 'light' ? 'light' : 'dark'
      }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : defaults();
    } catch (e) { state = defaults(); }
    if (!state || typeof state !== 'object') state = defaults();
    if (!Array.isArray(state.habits)) state.habits = [];
    if (!state.records || typeof state.records !== 'object') state.records = {};
    if (!state.settings || typeof state.settings !== 'object') state.settings = { lang: null, theme: 'dark' };
    // light-touch normalization of stored data (old versions / corruption)
    state = sanitize(state);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
    listeners.forEach(function (f) { f(); });
  }
  function onChange(fn) { listeners.push(fn); }
  function uid() { return 'h' + (state.seq++); }

  /* ---------------- habits ---------------- */
  function addHabit(data) {
    var h = {
      id: uid(),
      name: data.name,
      desc: data.desc || '',
      color: data.color || '#2E7F84',
      icon: data.icon || 'star',
      days: (data.days && data.days.length) ? data.days.slice().sort() : [0, 1, 2, 3, 4, 5, 6],
      createdAt: todayKey(),
      order: state.habits.length
    };
    state.habits.push(h);
    save();
    return h;
  }
  function updateHabit(id, patch) {
    var h = habitById(id);
    if (!h) return;
    ['name', 'desc', 'color', 'icon', 'days'].forEach(function (k) {
      if (patch[k] !== undefined) h[k] = patch[k];
    });
    if (h.days) h.days = h.days.slice().sort();
    save();
  }
  function deleteHabit(id) {
    state.habits = state.habits.filter(function (h) { return h.id !== id; });
    delete state.records[id];
    save();
  }
  function habitById(id) {
    for (var i = 0; i < state.habits.length; i++) if (state.habits[i].id === id) return state.habits[i];
    return null;
  }
  function allHabits() {
    return state.habits.slice().sort(function (a, b) { return a.order - b.order; });
  }

  /* ---------------- records ---------------- */
  function statusOf(id, date) {
    var r = state.records[id];
    return r ? (r[date] || null) : null;
  }
  function setStatus(id, date, st) {
    if (!state.records[id]) state.records[id] = {};
    if (st === null || st === undefined) delete state.records[id][date];
    else state.records[id][date] = st;
    save();
  }
  function toggleDone(id, date) {
    var cur = statusOf(id, date);
    setStatus(id, date, cur === 'done' ? null : 'done');
    return statusOf(id, date);
  }
  function isScheduled(h, dateKeyStr) {
    return h.days.indexOf(dowOf(dateKeyStr)) !== -1;
  }

  /* ---------------- queries ---------------- */
  function habitsForToday() {
    var t = todayKey();
    return allHabits().filter(function (h) { return isScheduled(h, t); });
  }
  function todayCounts() {
    var t = todayKey(), done = 0, skip = 0;
    habitsForToday().forEach(function (h) {
      var s = statusOf(h.id, t);
      if (s === 'done') done++;
      else if (s === 'skip') skip++;
    });
    var total = habitsForToday().length;
    return { done: done, skip: skip, total: total, pending: total - done - skip };
  }

  /** current streak: consecutive scheduled days done; skips are neutral; today-pending doesn't break */
  function currentStreak(h) {
    var recs = state.records[h.id] || {};
    var t = todayKey();
    var streak = 0, d = t, i = 0;
    for (; i < 3650; i++) {
      if (isScheduled(h, d)) {
        var st = recs[d];
        if (st === 'done') streak++;
        else if (st === 'skip') { /* neutral */ }
        else if (d !== t) break; // past miss breaks; today-pending doesn't
      }
      d = addDays(d, -1);
    }
    return streak;
  }
  function bestStreak(h) {
    var recs = state.records[h.id] || {};
    var best = 0, cur = 0;
    var d = h.createdAt || todayKey();
    var end = todayKey();
    while (d <= end) {
      if (isScheduled(h, d)) {
        var st = recs[d];
        if (st === 'done') { cur++; if (cur > best) best = cur; }
        else if (st === 'skip') { /* neutral */ }
        else if (d !== end) cur = 0;
      }
      d = addDays(d, 1);
    }
    return best;
  }
  /** completion rate over last n days: done / (scheduled - skipped) */
  function rate(h, n) {
    n = n || 30;
    var recs = state.records[h.id] || {};
    var sched = 0, done = 0, skip = 0;
    var d = todayKey(), i = 0;
    for (; i < n; i++) {
      if (isScheduled(h, d)) {
        sched++;
        var st = recs[d];
        if (st === 'done') done++;
        else if (st === 'skip') skip++;
      }
      d = addDays(d, -1);
    }
    var denom = sched - skip;
    return denom > 0 ? done / denom : 0;
  }
  function totalCounts(h) {
    var recs = state.records[h.id] || {};
    var done = 0, skip = 0;
    Object.keys(recs).forEach(function (k) {
      if (recs[k] === 'done') done++;
      else if (recs[k] === 'skip') skip++;
    });
    return { done: done, skip: skip };
  }

  /** per-day totals for charts: last n days → {date, done, sched} */
  function dayTotals(n) {
    var out = [];
    var d = addDays(todayKey(), -(n - 1));
    for (var i = 0; i < n; i++) {
      var done = 0, sched = 0;
      state.habits.forEach(function (h) {
        if (isScheduled(h, d)) {
          sched++;
          if (statusOf(h.id, d) === 'done') done++;
        }
      });
      out.push({ date: d, done: done, sched: sched });
      d = addDays(d, 1);
    }
    return out;
  }

  /** completion rate for the week at offset (0 = current) */
  function weekRate(offset) {
    var start = addDays(weekStartOf(todayKey()), offset * 7);
    var sched = 0, done = 0, skip = 0;
    for (var i = 0; i < 7; i++) {
      var d = addDays(start, i);
      if (d > todayKey()) break;
      state.habits.forEach(function (h) {
        if (isScheduled(h, d)) {
          sched++;
          var st = statusOf(h.id, d);
          if (st === 'done') done++;
          else if (st === 'skip') skip++;
        }
      });
    }
    var denom = sched - skip;
    return { rate: denom > 0 ? done / denom : 0, done: done, sched: sched };
  }

  /** avg completion rate per weekday over last n days (n multiple of 7 recommended) */
  function weekdayPerformance(n) {
    n = n || 56;
    var buckets = {}; // dow -> {done, sched}
    var d = addDays(todayKey(), -(n - 1));
    for (var i = 0; i < n; i++) {
      var dow = dowOf(d);
      state.habits.forEach(function (h) {
        if (isScheduled(h, d)) {
          if (!buckets[dow]) buckets[dow] = { done: 0, sched: 0 };
          buckets[dow].sched++;
          if (statusOf(h.id, d) === 'done') buckets[dow].done++;
        }
      });
      d = addDays(d, 1);
    }
    return buckets;
  }

  /* ---------------- settings ---------------- */
  function settings() { return state.settings; }
  function setSetting(k, v) { state.settings[k] = v; save(); }

  /* ---------------- bulk ---------------- */
  function exportJSON() { return JSON.stringify(state); }
  function importJSON(str) {
    var data = JSON.parse(str); // throws on invalid
    if (!data || !Array.isArray(data.habits)) throw new Error('bad');
    state = sanitize(data); // untrusted input — fully validated
    save();
  }
  function clearAll() {
    var theme = state.settings.theme, lng = state.settings.lang;
    state = defaults();
    state.settings.theme = theme; state.settings.lang = lng;
    save();
  }
  function loadSample() {
    var theme = state.settings.theme, lng = state.settings.lang;
    state = defaults();
    state.settings.theme = theme; state.settings.lang = lng;
    seed();
    save();
  }

  /* ---------------- sample data ---------------- */
  function seed() {
    var all = [0, 1, 2, 3, 4, 5, 6];
    var water = addHabit({ name: 'Drink water', desc: '8 glasses a day', color: '#2E7F84', icon: 'droplet', days: all });
    var med = addHabit({ name: 'Meditation', desc: '10 minutes of calm', color: '#8E6BD9', icon: 'yoga', days: [1, 2, 3, 4, 5] });
    var read = addHabit({ name: 'Reading', desc: '20 pages before bed', color: '#D9A93D', icon: 'book', days: all });
    var run = addHabit({ name: 'Workout', desc: 'Train 30 minutes', color: '#3AA76D', icon: 'dumbbell', days: [1, 3, 6] });
    var cfg = [
      { h: water, rate: 0.88, skip: 0.04 },
      { h: med, rate: 0.78, skip: 0.05 },
      { h: read, rate: 0.62, skip: 0.06 },
      { h: run, rate: 0.72, skip: 0.04 }
    ];
    // seeded habits have 70 days of history — backdate their creation
    [water, med, read, run].forEach(function (h) {
      h.createdAt = addDays(todayKey(), -70);
    });
    var s = 42;
    function rnd() { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }
    var t = todayKey();
    for (var i = 70; i >= 1; i--) {
      var d = addDays(t, -i);
      var dow = dowOf(d);
      cfg.forEach(function (c) {
        if (c.h.days.indexOf(dow) === -1) return;
        var r = rnd();
        if (r < c.skip) setStatusNoSave(c.h.id, d, 'skip');
        else if (r < c.rate) setStatusNoSave(c.h.id, d, 'done');
      });
    }
    // leave part of today open so the user can play with it
    setStatusNoSave(water.id, t, 'done');
    setStatusNoSave(read.id, t, 'skip');
  }
  function setStatusNoSave(id, date, st) {
    if (!state.records[id]) state.records[id] = {};
    state.records[id][date] = st;
  }

  return {
    load: load, save: save, onChange: onChange,
    state: function () { return state; },
    allHabits: allHabits, habitById: habitById,
    addHabit: addHabit, updateHabit: updateHabit, deleteHabit: deleteHabit,
    statusOf: statusOf, setStatus: setStatus, toggleDone: toggleDone,
    isScheduled: isScheduled,
    habitsForToday: habitsForToday, todayCounts: todayCounts,
    currentStreak: currentStreak, bestStreak: bestStreak,
    rate: rate, totalCounts: totalCounts,
    dayTotals: dayTotals, weekRate: weekRate, weekdayPerformance: weekdayPerformance,
    weekStartOf: weekStartOf,
    settings: settings, setSetting: setSetting,
    exportJSON: exportJSON, importJSON: importJSON,
    clearAll: clearAll, loadSample: loadSample,
    todayKey: todayKey, addDays: addDays, dowOf: dowOf, parseKey: parseKey
  };
})();
