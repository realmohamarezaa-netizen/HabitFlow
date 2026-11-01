/* ============================================================
   HabitFlow — views: Home (Today/Weekly/Overall), Stats,
   More + swipe gesture engine
   ============================================================ */
window.Views = (function () {
  'use strict';

  var A = { screen: 'home', tab: 'today', weekOffset: 0, statsTab: 'dashboard' };
  var t = function (k, v) { return window.I18n.t(k, v); };
  var esc = UI.esc, icon = UI.icon, pct = UI.pct;

  /* =================== HEADER / NAV =================== */
  function renderHeader() {
    if (A.screen === 'home') {
      return '<header class="app-header">' +
        '<button class="icon-btn" data-action="goto-overall" aria-label="' + esc(t('overall')) + '">' + icon('grid2') + '</button>' +
        '<span class="spacer"></span>' +
        '<button class="icon-btn" data-action="open-add" aria-label="' + esc(t('addHabit')) + '">' + icon('plus') + '</button>' +
        '<button class="icon-btn" data-action="open-templates" aria-label="' + esc(t('quickAdd')) + '">' + icon('bookmark') + '</button>' +
        '</header>';
    }
    return '';
  }

  function renderNav() {
    function btn(id, ic, label) {
      var cur = A.screen === id;
      return '<button class="nav-btn" data-action="nav" data-screen="' + id + '"' +
        (cur ? ' aria-current="page"' : '') + ' aria-label="' + esc(label) + '">' +
        '<span class="nav-ico">' + icon(ic) + '</span><span>' + esc(label) + '</span></button>';
    }
    return '<nav class="bottom-nav" aria-label="Main">' +
      btn('home', 'rows', t('home')) +
      btn('stats', 'chart', t('stats')) +
      btn('more', 'dots', t('more')) +
      '</nav>';
  }

  /* =================== HOME =================== */
  function renderHome() {
    var html = '<h1 class="page-title">' + esc(t('habits')) + '</h1>';
    html += '<div class="tabs" role="tablist">' +
      tabBtn('today', t('today')) + tabBtn('weekly', t('weekly')) + tabBtn('overall', t('overall')) +
      '</div>';
    if (A.tab === 'today') html += renderToday();
    else if (A.tab === 'weekly') html += renderWeekly();
    else html += renderOverall();
    return html;
  }
  function tabBtn(id, label) {
    return '<button class="tab" role="tab" data-action="tab" data-tab="' + id + '"' +
      ' aria-selected="' + (A.tab === id) + '">' + esc(label) + '</button>';
  }

  /* ---------- TODAY ---------- */
  function renderToday() {
    var counts = Store.todayCounts();
    var html = '';
    if (counts.total === 0) {
      html += '<div class="empty-state">' + emptyArt() +
        '<h3>' + esc(t('emptyTodayTitle')) + '</h3><p>' + esc(t('emptyTodaySub')) + '</p>' +
        '<div class="actions">' +
        '<button class="btn btn-primary" data-action="open-add">' + icon('plus') + esc(t('addFirst')) + '</button>' +
        '<button class="btn btn-tonal" data-action="sample-empty">' + esc(t('trySample')) + '</button>' +
        '</div></div>';
      return html;
    }
    var p = counts.total ? counts.done / counts.total : 0;
    html += '<div class="day-progress">' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + (p * 100) + '%"></div></div>' +
      '<div class="p-label"><span class="num' + (counts.done === counts.total ? ' ok' : '') + '">' + counts.done + '</span> ' +
      esc(t('completed', { n: '' })) + (counts.done === counts.total ? ' · ' + esc(t('allDoneToday')) : '') +
      '</div></div>';

    var habits = Store.habitsForToday();
    var pending = [], resolved = [];
    habits.forEach(function (h) {
      var s = Store.statusOf(h.id, Store.todayKey());
      (s ? resolved : pending).push({ h: h, s: s });
    });

    pending.forEach(function (o) { html += swipeRow(o.h); });
    if (resolved.length) {
      html += '<div class="list-divider">' + esc(t('doneSection')) + '</div>';
      resolved.forEach(function (o) { html += resolvedRow(o.h, o.s); });
    }
    html += '<div class="swipe-hint">' +
      '<span class="hint-item"><i class="hint-dot ok"></i>' + esc(t('swipeDone')) + '</span>' +
      '<span class="hint-item"><i class="hint-dot skip"></i>' + esc(t('swipeSkip')) + '</span>' +
      '</div>';
    return html;
  }

  function swipeRow(h) {
    // Drag LEFT  → card slides left  → right reveal shows the GREEN check (done)
    // Drag RIGHT → card slides right → left  reveal shows the ORANGE skip label
    return '<div class="hrow">' +
      '<div class="reveal reveal-l"><span class="rv-label">' + esc(t('skip')) + icon('arrowR') + '</span></div>' +
      '<div class="reveal reveal-r">' + icon('check') + '</div>' +
      '<div class="hcard swipe" data-id="' + h.id + '" style="--hc:' + h.color + '"' +
      ' role="button" aria-label="' + esc(h.name) + '">' +
      '<span class="h-name">' + esc(h.name) + '</span></div></div>';
  }

  function resolvedRow(h, status) {
    var inner;
    if (status === 'done') {
      inner = '<span class="seg-check">' + icon('check') + '</span><span class="h-name">' + esc(h.name) + '</span>';
      return '<div class="hrow"><div class="hcard done" data-action="resolve-undo" data-id="' + h.id + '" style="--hc:' + h.color + '" role="button">' + inner + '</div></div>';
    }
    inner = '<span class="h-name">' + esc(h.name) + '</span><span class="seg-skip">' + esc(t('skipped')) + icon('undo') + '</span>';
    return '<div class="hrow"><div class="hcard skiped" data-action="resolve-undo" data-id="' + h.id + '" style="--hc:' + h.color + '" role="button">' + inner + '</div></div>';
  }

  /* ---------- WEEKLY ---------- */
  function weekAnchor() {
    var base = Store.addDays(Store.todayKey(), A.weekOffset * 7);
    return Store.weekStartOf(base);
  }
  function fmtDayShort(key) {
    var d = Store.parseKey(key);
    var months = t('monthsShort');
    return d.getDate() + ' ' + months[d.getMonth()];
  }
  function renderWeekly() {
    var start = weekAnchor();
    var end = Store.addDays(start, 6);
    var html = '<div class="week-nav">' +
      '<div><div class="wn-label">' + (A.weekOffset === 0 ? esc(t('thisWeek')) : esc(fmtDayShort(start) + ' – ' + fmtDayShort(end))) + '</div>' +
      '<div class="wn-range">' + (A.weekOffset === 0 ? esc(fmtDayShort(start) + ' – ' + fmtDayShort(end)) : '&nbsp;') + '</div></div>' +
      '<div class="wn-btns">' +
      (A.weekOffset !== 0 ? '<button class="wn-today-btn" data-action="week-today">' + esc(t('todayBtn')) + '</button>' : '') +
      '<button class="icon-btn" data-action="week-prev" aria-label="Previous week">' + icon('chevL', 'flip-rtl') + '</button>' +
      '<button class="icon-btn" data-action="week-next" aria-label="Next week">' + icon('chevR', 'flip-rtl') + '</button>' +
      '</div></div>';

    var habits = Store.allHabits();
    if (!habits.length) return html + emptyStateAll();
    var today = Store.todayKey();
    habits.forEach(function (h) {
      var schedLabel = h.days.length === 7 ? t('everyday') : schedLabelOf(h);
      html += '<section class="wcard" style="--hc:' + h.color + '">' +
        '<div class="w-head"><span class="w-name">' + esc(h.name) + '</span>' +
        '<span class="w-sched">' + esc(schedLabel) + '</span></div><div class="w-days">';
      for (var pos = 0; pos < 7; pos++) {
        var date = Store.addDays(start, pos);
        var dow = Store.dowOf(date);
        var scheduled = h.days.indexOf(dow) !== -1;
        var st = Store.statusOf(h.id, date);
        var cls = 'day-circle' + (scheduled ? '' : ' off') + (st === 'done' ? ' is-done' : '') + (st === 'skip' ? ' is-skip' : '');
        html += '<div class="w-daycol' + (date === today ? ' today-col' : '') + '">' +
          '<span class="d-lab">' + esc(I18n.dayName(dow, true)) + '</span>' +
          '<button class="' + cls + '" data-action="toggle-day" data-id="' + h.id + '" data-date="' + date + '"' +
          (scheduled ? '' : ' disabled aria-disabled="true"') +
          ' aria-label="' + esc(h.name + ' ' + date) + '">' +
          (st === 'done' ? icon('check') : '') +
          '</button></div>';
      }
      html += '</div></section>';
    });
    return html;
  }
  function schedLabelOf(h) {
    var names = [];
    h.days.forEach(function (d) { names.push(I18n.dayName(d, true)); });
    return names.join(' · ');
  }

  /* ---------- OVERALL (contribution grids) ---------- */
  var GRID_WEEKS = 16;
  function renderOverall() {
    var habits = Store.allHabits();
    if (!habits.length) return '<div style="height:10px"></div>' + emptyStateAll();
    var today = Store.todayKey();
    var ws = Store.weekStartOf(today);
    var gridStart = Store.addDays(ws, -(GRID_WEEKS - 1) * 7);
    var html = '<div style="height:10px"></div>';
    var months = t('monthsShort');

    habits.forEach(function (h) {
      var doneToday = Store.statusOf(h.id, today) === 'done';
      var streak = Store.currentStreak(h);
      var r = pct(Store.rate(h, 30));
      var totals = Store.totalCounts(h);

      // month labels aligned with the grid columns (label where a new month begins)
      var monthRow = '';
      var prevM = -1;
      for (var c = 0; c < GRID_WEEKS; c++) {
        var colDate = Store.parseKey(Store.addDays(gridStart, c * 7));
        var m = colDate.getMonth();
        monthRow += '<span' + (m !== prevM ? '' : ' aria-hidden="true"') + '>' +
          (m !== prevM ? esc(months[m]) : '') + '</span>';
        prevM = m;
      }

      html += '<section class="ocard" style="--hc:' + h.color + '">' +
        '<div class="o-head">' +
        '<span class="o-icochip">' + icon(h.icon) + '</span>' +
        '<button class="o-meta" data-action="open-detail" data-id="' + h.id + '" style="text-align:inherit;background:none;border:0">' +
        '<div class="o-name">' + esc(h.name) + '</div>' +
        (h.desc ? '<div class="o-desc">' + esc(h.desc) + '</div>' : '') +
        '</button>' +
        '<button class="o-check' + (doneToday ? ' on' : '') + '" data-action="check-today" data-id="' + h.id + '"' +
        ' aria-label="' + esc(t('done')) + ' — ' + esc(h.name) + '">' + icon('check') + '</button>' +
        '</div>' +
        '<div class="ogrid-wrap"><div class="og-months">' + monthRow + '</div><div class="ogrid">';
      for (var col = 0; col < GRID_WEEKS; col++) {
        for (var row = 0; row < 7; row++) {
          var date = Store.addDays(gridStart, col * 7 + row);
          var dow = Store.dowOf(date);
          var scheduled = h.days.indexOf(dow) !== -1;
          var st = Store.statusOf(h.id, date);
          var cls = 'gcell';
          if (date > today) cls += ' future';
          else if (st === 'done') cls += ' done';
          else if (st === 'skip') cls += ' skipp';
          else if (!scheduled) cls += ' na';
          html += '<div class="' + cls + '" title="' + date + '"></div>';
        }
      }
      html += '</div></div>' +
        '<div class="o-foot">' +
        '<span class="o-stat">' + icon('flame') + '<b>' + streak + '</b>&nbsp;' + esc(t('dayStreaks', { n: '' })).trim() + '</span>' +
        '<span class="o-stat">' + icon('target') + '<b>' + r + '%</b>&nbsp;' + esc(t('rate30')) + '</span>' +
        '<span class="o-stat">' + icon('check') + '<b>' + totals.done + '</b>&nbsp;' + esc(t('totalDone')) + '</span>' +
        '</div></section>';
    });
    return html;
  }

  function emptyArt() {
    return '<svg class="art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true">' +
      '<rect x="3.75" y="3.75" width="16.5" height="16.5" rx="5"/>' +
      '<path d="M8.5 12.4l2.6 2.6 4.9-5.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M18.5 1.5v1M22.5 6h-1M2.5 18.5h-1" stroke-linecap="round" opacity=".55"/></svg>';
  }
  function emptyStateAll() {
    return '<div class="empty-state">' + emptyArt() +
      '<h3>' + esc(t('emptyAllTitle')) + '</h3><p>' + esc(t('emptyAllSub')) + '</p>' +
      '<div class="actions">' +
      '<button class="btn btn-primary" data-action="open-add">' + icon('plus') + esc(t('addFirst')) + '</button>' +
      '<button class="btn btn-tonal" data-action="sample-empty">' + esc(t('trySample')) + '</button>' +
      '</div></div>';
  }

  /* =================== STATS =================== */
  function renderStats() {
    var html = '<h1 class="page-title">' + esc(t('stats')) + '</h1>';
    html += '<div class="seg-row"><div class="seg-pill" role="tablist">' +
      '<button data-action="stats-tab" data-tab="dashboard" aria-pressed="' + (A.statsTab === 'dashboard') + '">' + esc(t('dashboard')) + '</button>' +
      '<button data-action="stats-tab" data-tab="analytics" aria-pressed="' + (A.statsTab === 'analytics') + '">' + esc(t('analytics')) + '</button>' +
      '</div></div>';
    html += A.statsTab === 'dashboard' ? renderDashboard() : renderAnalytics();
    return html;
  }

  /* ---------- shared bits ---------- */
  function scardHead(labelHtml, rightHtml) {
    return '<div class="scard-head"><div class="s-label">' + labelHtml + '</div>' + (rightHtml || '') + '</div>';
  }
  function sChip(inner, cls) {
    return '<span class="s-chip' + (cls ? ' ' + cls : '') + '">' + inner + '</span>';
  }
  function ringSVG(p) {
    var r = 46, c = 2 * Math.PI * r;
    var off = c * (1 - Math.max(0, Math.min(1, p)));
    return '<div class="ring-wrap"><svg width="108" height="108" viewBox="0 0 108 108">' +
      '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="var(--accent-strong)"/><stop offset="1" stop-color="var(--ok)"/>' +
      '</linearGradient></defs>' +
      '<circle class="ring-bg" cx="54" cy="54" r="46" stroke-width="9" fill="none"/>' +
      '<circle class="ring-fg" cx="54" cy="54" r="46" stroke-width="9" fill="none" stroke-linecap="round" ' +
      'style="stroke:url(#ringGrad)" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>' +
      '<div class="ring-center"><b>' + pct(p) + '%</b><span>' + esc(t('todayProgress')) + '</span></div></div>';
  }
  /** items: [{h:0-100, lab?, hot?, color?, title?, pctLabel?}] ; opts: {height, avgH, labels[]} */
  function barChart(items, opts) {
    opts = opts || {};
    var avgLine = '';
    if (opts.avgH !== undefined && opts.avgH !== null) {
      var b = Math.max(2, Math.min(94, opts.avgH));
      avgLine = '<div class="avg-line" style="bottom:' + b.toFixed(1) + '%"></div>';
    }
    var html = '<div class="chart-plot" style="height:' + (opts.height || 96) + 'px">' + avgLine;
    items.forEach(function (it) {
      var h = Math.max(4, Math.min(100, Math.round(it.h)));
      var labH = Math.min(h, 88); // keep % label inside the plot area
      html += '<div class="bar-col">' +
        (it.pctLabel ? '<span class="bar-pct" style="bottom:calc(' + labH + '% + 4px)">' + it.pctLabel + '</span>' : '') +
        '<div class="bar-v' + (it.hot ? ' hot' : '') + '" style="height:' + h + '%' + (it.color ? ';background:' + it.color : '') + '"' +
        (it.title ? ' title="' + esc(it.title) + '"' : '') + '></div>' +
        '</div>';
    });
    html += '</div>';
    if (opts.labels) {
      html += '<div class="chart-x">';
      opts.labels.forEach(function (l) { html += '<span>' + l + '</span>'; });
      html += '</div>';
    }
    return html;
  }
  function qtile(ico, color, val, lab) {
    return '<div class="qtile">' +
      '<span class="qt-ico" style="color:' + color + ';background:color-mix(in srgb, ' + color + ' 14%, transparent)">' + icon(ico) + '</span>' +
      '<div class="qt-val">' + val + '</div>' +
      '<div class="qt-lab">' + esc(lab) + '</div></div>';
  }
  function weekMiniBars() {
    var days = Store.dayTotals(7);
    var items = days.map(function (d) {
      var rate = d.sched ? d.done / d.sched : 0;
      return { h: rate * 100, hot: d.date === Store.todayKey(), title: d.done + ' / ' + d.sched };
    });
    var labels = days.map(function (d) { return esc(I18n.dayName(Store.dowOf(d.date), true)); });
    return '<div class="mini-bars">' + barChart(items, { height: 44, labels: labels }) + '</div>';
  }
  /** aggregated completion ratio per day across all habits, `weeks` columns */
  function heatGrid(weeks) {
    var habits = Store.allHabits();
    var today = Store.todayKey();
    var ws = Store.weekStartOf(today);
    var start = Store.addDays(ws, -(weeks - 1) * 7);
    var html = '<div class="ogrid heat">';
    for (var col = 0; col < weeks; col++) {
      for (var row = 0; row < 7; row++) {
        var date = Store.addDays(start, col * 7 + row);
        var cls = 'gcell';
        if (date > today) cls += ' future';
        else {
          var sched = 0, done = 0;
          habits.forEach(function (h) {
            if (Store.isScheduled(h, date)) { sched++; if (Store.statusOf(h.id, date) === 'done') done++; }
          });
          if (!sched) cls += ' na';
          else {
            var ratio = done / sched;
            var q = ratio <= 0 ? 0 : ratio < 0.34 ? 1 : ratio < 0.67 ? 2 : ratio < 1 ? 3 : 4;
            cls += ' q' + q;
          }
        }
        html += '<div class="' + cls + '" title="' + date + '"></div>';
      }
    }
    return html + '</div>';
  }
  function heatSwatches() {
    var s = '';
    for (var i = 0; i <= 4; i++) s += '<i class="lg q' + i + '"></i>';
    return s;
  }
  /** days (all-time) where every scheduled habit was completed */
  function perfectDays() {
    var habits = Store.allHabits();
    if (!habits.length) return 0;
    var today = Store.todayKey();
    var start = today;
    habits.forEach(function (h) { if (h.createdAt && h.createdAt < start) start = h.createdAt; });
    var count = 0, d = start, guard = 0;
    while (d <= today && guard < 3650) {
      var sched = 0, done = 0;
      habits.forEach(function (h) {
        if (h.createdAt && d < h.createdAt) return; // habit didn't exist yet
        if (Store.isScheduled(h, d)) { sched++; if (Store.statusOf(h.id, d) === 'done') done++; }
      });
      if (sched > 0 && done === sched) count++;
      d = Store.addDays(d, 1); guard++;
    }
    return count;
  }
  /** all-time done / skip / missed totals over each habit's lifetime */
  function qualityTotals() {
    var habits = Store.allHabits();
    var today = Store.todayKey();
    var start = today;
    habits.forEach(function (h) { if (h.createdAt && h.createdAt < start) start = h.createdAt; });
    var done = 0, skip = 0, missed = 0, d = start, guard = 0;
    while (d <= today && guard < 3650) {
      habits.forEach(function (h) {
        if (h.createdAt && d < h.createdAt) return; // not created yet → never "missed"
        if (!Store.isScheduled(h, d)) return;
        var st = Store.statusOf(h.id, d);
        if (st === 'done') done++;
        else if (st === 'skip') skip++;
        else if (d !== today) missed++;
      });
      d = Store.addDays(d, 1); guard++;
    }
    return { done: done, skip: skip, missed: missed };
  }
  function trendSVG(series) {
    if (!series || series.length < 2) return '';
    var W = 320, H = 152, L = 12, R = 12, T = 22, B = 30;
    var pw = W - L - R, ph = H - T - B, base = T + ph;
    var pts = [];
    series.forEach(function (s, i) {
      pts.push({
        x: L + (i * pw) / (series.length - 1),
        y: T + (1 - Math.max(0, Math.min(1, s.rate))) * ph,
        s: s
      });
    });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
    var area = line + ' L' + (L + pw) + ' ' + base + ' L' + L + ' ' + base + ' Z';
    var dots = '', labels = '';
    pts.forEach(function (p, i) {
      var last = i === pts.length - 1;
      dots += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (last ? 4.5 : 3) + '" ' +
        'fill="var(--bg)" stroke="var(--accent-strong)" stroke-width="2.2"/>';
      if (last) {
        dots += '<text x="' + Math.min(p.x, W - 26).toFixed(1) + '" y="' + Math.max(12, p.y - 10).toFixed(1) + '" ' +
          'text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--accent-strong)">' + pct(p.s.rate) + '%</text>';
      }
      labels += '<text x="' + p.x.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="8.5" fill="var(--text-3)">' +
        esc(fmtDayShort(Store.weekStartOf(Store.addDays(Store.todayKey(), (i - 7) * 7)))) + '</text>';
    });
    return '<svg class="trend-svg" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="var(--accent-strong)" stop-opacity=".28"/>' +
      '<stop offset="1" stop-color="var(--accent-strong)" stop-opacity="0"/></linearGradient></defs>' +
      '<line x1="' + L + '" y1="' + base + '" x2="' + (L + pw) + '" y2="' + base + '" stroke="var(--line)" stroke-width="1"/>' +
      '<path d="' + area + '" fill="url(#trendGrad)"/>' +
      '<path d="' + line + '" fill="none" stroke="var(--accent-strong)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots + labels + '</svg>';
  }
  function donutSVG(q) {
    var r = 40, c = 2 * Math.PI * r;
    var total = q.done + q.skip + q.missed;
    var segs = [
      { v: q.done, col: 'var(--ok)' },
      { v: q.skip, col: 'var(--skip)' },
      { v: q.missed, col: 'var(--text-3)' }
    ];
    var off = 0, circles = '';
    segs.forEach(function (s) {
      if (!s.v || !total) return;
      var len = (s.v / total) * c;
      circles += '<circle cx="54" cy="54" r="40" fill="none" stroke="' + s.col + '" stroke-width="15" ' +
        'stroke-dasharray="' + Math.max(0, len - 2).toFixed(1) + ' ' + (c - len + 2).toFixed(1) + '" ' +
        'stroke-dashoffset="' + (-off).toFixed(1) + '" transform="rotate(-90 54 54)"/>';
      off += len;
    });
    var denom = q.done + q.missed;
    var quality = denom ? pct(q.done / denom) : 0;
    return '<div class="ring-wrap">' +
      '<svg width="108" height="108" viewBox="0 0 108 108">' +
      '<circle cx="54" cy="54" r="40" fill="none" stroke="var(--card-2)" stroke-width="15"/>' + circles + '</svg>' +
      '<div class="ring-center"><b>' + quality + '%</b><span>' + esc(t('done')) + '</span></div></div>';
  }
  function legendRow(col, lab, v) {
    return '<div class="legend-row"><span class="ld" style="background:' + col + '"></span>' + esc(lab) + '<b>' + v + '</b></div>';
  }
  function recRow(ico, color, lab, name, endVal) {
    return '<div class="rec-row">' +
      '<span class="rec-ico" style="color:' + color + ';background:color-mix(in srgb, ' + color + ' 14%, transparent)">' + icon(ico) + '</span>' +
      '<span class="rec-body"><span class="rec-lab">' + esc(lab) + '</span><span class="rec-val">' + esc(name) + '</span></span>' +
      '<span class="rec-end">' + endVal + '</span></div>';
  }

  function renderDashboard() {
    var habits = Store.allHabits();
    if (!habits.length) return '<div class="empty-state">' + emptyArt() + '<h3>' + esc(t('noData')) + '</h3>' +
      '<div class="actions"><button class="btn btn-primary" data-action="open-add">' + icon('plus') + esc(t('addFirst')) + '</button></div></div>';

    var counts = Store.todayCounts();
    var p = counts.total ? counts.done / counts.total : 0;
    var maxCur = 0, bestAll = 0, totalDone = 0;
    habits.forEach(function (h) {
      maxCur = Math.max(maxCur, Store.currentStreak(h));
      bestAll = Math.max(bestAll, Store.bestStreak(h));
      totalDone += Store.totalCounts(h).done;
    });
    var perfect = perfectDays();

    var html = '<div class="stat-grid">';

    // hero — today's ring + status chips
    html += '<div class="scard full"><div class="ring-row">' + ringSVG(p) +
      '<div style="flex:1;min-width:0">' +
      '<div class="s-label">' + esc(t('todayProgress')) + '</div>' +
      '<div class="s-value">' + counts.done + '<span class="unit">/ ' + counts.total + '</span></div>' +
      '<div class="s-sub">' + (counts.total && counts.done === counts.total ? esc(t('allDoneToday')) : esc(t('completed', { n: counts.done }))) + '</div>' +
      '<div class="hero-chips">' +
      '<span class="chip"><i class="cdot acc"></i>' + counts.pending + ' ' + esc(t('pendingToday')) + '</span>' +
      '<span class="chip"><i class="cdot skip"></i>' + counts.skip + ' ' + esc(t('skipped')) + '</span>' +
      '</div></div></div></div>';

    // quick tiles 2×2
    html += qtile('flame', 'var(--ok)', maxCur, t('currentStreak'));
    html += qtile('star', 'var(--skip)', bestAll, t('bestStreak'));
    html += qtile('check', 'var(--accent-strong)', totalDone, t('totalDone'));
    html += qtile('calendar', '#A78BFA', perfect, t('perfectDays'));

    // daily activity — 14 days with average line
    var totals = Store.dayTotals(14);
    var maxV = 1, sum = 0;
    totals.forEach(function (d) { if (d.done > maxV) maxV = d.done; sum += d.done; });
    var avg = sum / totals.length;
    var today = Store.todayKey();
    var items = totals.map(function (d) {
      return {
        h: (d.done / maxV) * 100,
        hot: d.date === today,
        title: d.done + ' / ' + d.sched + ' · ' + d.date,
        lab: Store.parseKey(d.date).getDate()
      };
    });
    html += '<div class="scard full">' +
      scardHead(esc(t('weeklyActivity')), sChip(esc(t('avg')) + ' ' + (Math.round(avg * 10) / 10), 'acc')) +
      barChart(items, { height: 96, avgH: (avg / maxV) * 100 }) + '</div>';

    // this week vs last week + per-day mini bars
    var tw = Store.weekRate(0), lw = Store.weekRate(-1);
    var delta = pct(tw.rate) - pct(lw.rate);
    html += '<div class="scard full">' +
      scardHead(esc(t('thisWeekRate')), deltaChip(delta)) +
      '<div class="ring-row" style="margin-top:2px">' +
      '<div style="flex:1;min-width:0">' +
      '<div class="s-value">' + pct(tw.rate) + '%</div>' +
      '<div class="s-sub">' + tw.done + ' / ' + tw.sched + ' · ' + esc(t('lastWeekRate')) + ': ' + pct(lw.rate) + '%</div>' +
      '</div></div>' +
      '<div class="week-track"><div class="week-fill" style="width:' + pct(tw.rate) + '%"></div></div>' +
      weekMiniBars() + '</div>';

    // consistency heatmap — all habits, 12 weeks
    html += '<div class="scard full">' +
      scardHead(esc(t('consistency')) + ' · ' + esc(t('last12Weeks')),
        '<span class="heat-legend">' + esc(t('less')) + heatSwatches() + esc(t('more')) + '</span>') +
      heatGrid(12) + '</div>';

    html += '</div>';
    return html;
  }

  function deltaChip(delta) {
    if (delta === 0) return '<span class="delta-chip" style="color:var(--text-2)">±0</span>';
    var up = delta > 0;
    return '<span class="delta-chip ' + (up ? 'up' : 'down') + '">' + icon(up ? 'up' : 'down') + Math.abs(delta) + '</span>';
  }

  function renderAnalytics() {
    var habits = Store.allHabits();
    if (!habits.length) return '<div class="empty-state">' + emptyArt() + '<h3>' + esc(t('noData')) + '</h3>' +
      '<div class="actions"><button class="btn btn-primary" data-action="open-add">' + icon('plus') + esc(t('addFirst')) + '</button></div></div>';

    var html = '<div class="stat-grid">';

    // 8-week trend
    var series = [];
    for (var w = 7; w >= 0; w--) series.push(Store.weekRate(-w));
    var avgW = 0;
    series.forEach(function (s) { avgW += s.rate; });
    avgW = pct(avgW / series.length);
    html += '<div class="scard full">' +
      scardHead(esc(t('weeklyTrend')) + ' · ' + esc(t('last8Weeks')), sChip(esc(t('avg')) + ' ' + avgW + '%', 'acc')) +
      trendSVG(series) + '</div>';

    // this week / last week
    var tw = series[7], lw = series[6];
    var delta = pct(tw.rate) - pct(lw.rate);
    html += '<div class="scard"><div class="s-label">' + esc(t('thisWeekRate')) + '</div>' +
      '<div class="s-value">' + pct(tw.rate) + '%</div>' +
      '<div class="s-sub">' + tw.done + ' / ' + tw.sched + '</div>' +
      '<div class="week-track sm"><div class="week-fill" style="width:' + pct(tw.rate) + '%"></div></div></div>';
    html += '<div class="scard"><div class="s-label">' + esc(t('lastWeekRate')) + '</div>' +
      '<div class="s-value">' + pct(lw.rate) + '%</div>' +
      '<div class="s-sub">' + lw.done + ' / ' + lw.sched + '</div>' +
      '<div class="week-track sm"><div class="week-fill" style="width:' + pct(lw.rate) + '%"></div></div>' +
      '<div style="margin-top:9px">' + deltaChip(delta) + '</div></div>';

    // per habit (tap → details)
    html += '<div class="scard full">' + scardHead(esc(t('perHabit')), '') + '<div style="margin-top:2px">';
    habits.forEach(function (h) {
      var r = Store.rate(h, 30);
      var streak = Store.currentStreak(h);
      var tot = Store.totalCounts(h);
      html += '<button class="hstat-row" data-action="open-detail" data-id="' + h.id + '">' +
        '<span class="hstat-dot" style="background:' + h.color + '"></span>' +
        '<span class="hstat-main"><span class="hstat-name">' + esc(h.name) + '</span>' +
        '<span class="hstat-sub">' + icon('flame') + '<b>' + streak + '</b>&nbsp;' + esc(t('dayStreaks', { n: '' })).trim() +
        '&nbsp;·&nbsp;' + icon('check') + '<b>' + tot.done + '</b>&nbsp;' + esc(t('totalDone')) + '</span></span>' +
        '<span class="hstat-ratebar"><span class="hstat-ratefill" style="width:' + pct(r) + '%;background:' + h.color + '"></span></span>' +
        '<span class="hstat-rate">' + pct(r) + '%</span></button>';
    });
    html += '</div></div>';

    // weekday performance (56 days)
    var perf = Store.weekdayPerformance(56);
    var wsStart = I18n.weekStart();
    var bestDow = -1, toughDow = -1, bestRateV = -1, toughRateV = 2;
    var rates = [];
    for (var pos = 0; pos < 7; pos++) {
      var dow = (wsStart + pos) % 7;
      var b = perf[dow] || { done: 0, sched: 0 };
      rates.push({ dow: dow, rate: b.sched ? b.done / b.sched : 0, sched: b.sched });
    }
    rates.forEach(function (rr) {
      if (rr.sched > 0 && rr.rate > bestRateV) { bestRateV = rr.rate; bestDow = rr.dow; }
      if (rr.sched > 0 && rr.rate < toughRateV) { toughRateV = rr.rate; toughDow = rr.dow; }
    });
    var items = [], labels = [];
    rates.forEach(function (rr) {
      items.push({ h: rr.rate * 100, hot: rr.dow === bestDow, pctLabel: pct(rr.rate) + '%', title: pct(rr.rate) + '%' });
      labels.push(esc(I18n.dayName(rr.dow, true)));
    });
    html += '<div class="scard full">' +
      scardHead(esc(t('bestDay')) + ': ' + (bestDow >= 0 ? esc(I18n.dayName(bestDow, false)) : '—'),
        toughDow >= 0 ? sChip(esc(t('toughest')) + ': ' + esc(I18n.dayName(toughDow, false))) : '') +
      barChart(items, { height: 84, labels: labels }) + '</div>';

    // completion quality (all-time donut)
    var q = qualityTotals();
    html += '<div class="scard full">' + scardHead(esc(t('completionQuality')), '') +
      '<div class="donut-row">' + donutSVG(q) +
      '<div class="legend">' +
      legendRow('var(--ok)', t('done'), q.done) +
      legendRow('var(--skip)', t('skipped'), q.skip) +
      legendRow('var(--text-3)', t('missed'), q.missed) +
      '</div></div>' +
      '<div class="s-sub" style="margin-top:10px">' + esc(t('trackedDays')) + ': ' + trackedDays(habits) + ' · ' +
      esc(t('skipRate')) + ': ' + (q.done + q.skip ? pct(q.skip / (q.done + q.skip)) : 0) + '%</div>' +
      '</div>';

    // records
    var recs = habits.map(function (h) {
      return { h: h, best: Store.bestStreak(h), tot: Store.totalCounts(h) };
    });
    var longest = recs[0], mostDone = recs[0], mostSkip = recs[0];
    recs.forEach(function (rr) {
      if (rr.best > longest.best) longest = rr;
      if (rr.tot.done > mostDone.tot.done) mostDone = rr;
      if (rr.tot.skip > mostSkip.tot.skip) mostSkip = rr;
    });
    html += '<div class="scard full">' + scardHead(esc(t('records')), '') + '<div style="margin-top:2px">' +
      recRow('flame', 'var(--skip)', t('longestStreak'), longest.h.name,
        longest.best ? longest.best + ' ' + esc(t('dayStreaks', { n: '' })).trim() : '—') +
      recRow('check', 'var(--ok)', t('mostDone'), mostDone.h.name, mostDone.tot.done) +
      recRow('x', 'var(--danger)', t('mostSkipped'), mostSkip.tot.skip ? mostSkip.h.name : '—', mostSkip.tot.skip) +
      '</div></div>';

    html += '</div>';
    return html;
  }
  function trackedDays(habits) {
    var set = {};
    habits.forEach(function (h) {
      var recs = Store.state().records[h.id] || {};
      Object.keys(recs).forEach(function (k) { set[k] = 1; });
    });
    return Object.keys(set).length;
  }

  /* =================== MORE =================== */
  function renderMore() {
    var s = Store.settings();
    var theme = s.theme || 'dark';
    var lang = I18n.get();
    var html = '<h1 class="page-title">' + esc(t('more')) + '</h1>';

    html += '<div class="set-group"><div class="sg-title">' + esc(t('appearance')) + '</div><div class="set-card">' +
      '<div class="set-row"><span class="sr-ico">' + icon('sun') + '</span>' +
      '<div class="sr-body"><div class="sr-title">' + esc(t('theme')) + '</div></div>' +
      '<div class="seg-pill" role="group" aria-label="' + esc(t('theme')) + '">' +
      '<button data-action="set-theme" data-v="dark" aria-pressed="' + (theme === 'dark') + '">' + esc(t('dark')) + '</button>' +
      '<button data-action="set-theme" data-v="light" aria-pressed="' + (theme === 'light') + '">' + esc(t('light')) + '</button>' +
      '</div></div>' +
      '<div class="set-row"><span class="sr-ico">' + icon('globe') + '</span>' +
      '<div class="sr-body"><div class="sr-title">' + esc(t('language')) + '</div></div>' +
      '<div class="seg-pill" role="group" aria-label="' + esc(t('language')) + '">' +
      '<button data-action="set-lang" data-v="en" aria-pressed="' + (lang === 'en') + '">English</button>' +
      '<button data-action="set-lang" data-v="fa" aria-pressed="' + (lang === 'fa') + '">فارسی</button>' +
      '</div></div>' +
      '</div></div>';

    html += '<div class="set-group"><div class="sg-title">' + esc(t('dataSection')) + '</div><div class="set-card">' +
      '<button class="set-row" data-action="export-data"><span class="sr-ico">' + icon('download') + '</span>' +
      '<span class="sr-body"><span class="sr-title">' + esc(t('exportData')) + '</span><span class="sr-sub">' + esc(t('exportSub')) + '</span></span></button>' +
      '<button class="set-row" data-action="import-pick"><span class="sr-ico">' + icon('upload') + '</span>' +
      '<span class="sr-body"><span class="sr-title">' + esc(t('importData')) + '</span><span class="sr-sub">' + esc(t('importSub')) + '</span></span></button>' +
      '<button class="set-row" data-action="sample-data"><span class="sr-ico">' + icon('sparkle') + '</span>' +
      '<span class="sr-body"><span class="sr-title">' + esc(t('sampleData')) + '</span><span class="sr-sub">' + esc(t('sampleSub')) + '</span></span></button>' +
      '<button class="set-row danger" data-action="clear-data"><span class="sr-ico">' + icon('trash') + '</span>' +
      '<span class="sr-body"><span class="sr-title">' + esc(t('clearData')) + '</span><span class="sr-sub">' + esc(t('clearSub')) + '</span></span></button>' +
      '</div></div>';

    html += '<div class="set-group"><div class="sg-title">' + esc(t('about')) + '</div><div class="set-card">';
    if (!UI.isFileProtocol()) {
      html += '<a class="set-row" href="/api/apk" download="HabitFlow-1.0.0.apk"><span class="sr-ico">' + icon('download') + '</span>' +
        '<span class="sr-body"><span class="sr-title">' + esc(t('downloadApk')) + '</span><span class="sr-sub">' + esc(t('downloadSub')) + '</span></span>' +
        '<span class="sr-end">' + icon('chevR') + '</span></a>';
    }
    html += '<div class="set-row"><span class="sr-ico">' + icon('info') + '</span>' +
      '<span class="sr-body"><span class="sr-title">' + esc(t('appName')) + '</span><span class="sr-sub">' + esc(t('version')) + ' 1.0.0</span></span></div>' +
      '</div></div>';

    html += '<div class="app-about"><b>' + esc(t('appName')) + '</b> · ' + esc(t('version')) + ' 1.0.0<br>' + esc(t('tagline')) +
      '<span class="app-author">realmohamareza</span></div>';
    return html;
  }

  /* =================== SWIPE ENGINE =================== */
  var drag = null;          // active pointer drag
  var suppressClick = false;

  function onPointerDown(e) {
    var card = e.target.closest ? e.target.closest('.swipe') : null;
    if (!card || drag) return;
    drag = { card: card, x: e.clientX, y: e.clientY, dx: 0, active: false, id: e.pointerId };
  }
  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        drag.active = true;
        try { drag.card.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
        drag.card.classList.add('dragging');
      } else if (Math.abs(dy) > 14) {
        drag = null; // scrolling vertically
        return;
      } else return;
    }
    drag.dx = Math.max(-170, Math.min(170, dx));
    drag.card.style.transform = 'translateX(' + drag.dx + 'px)';
    // reveal icons fade/scale in with drag progress
    var prog = Math.max(0, Math.min(1, (Math.abs(dx) - 12) / 60));
    var row = drag.card.parentNode;
    if (row && row.style) row.style.setProperty('--prog', prog.toFixed(2));
  }
  function clearProgress(card) {
    var row = card.parentNode;
    if (row && row.style) row.style.removeProperty('--prog');
  }
  function onPointerUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    if (!d.active) {
      if (e.pointerType !== 'mouse' || e.button === 0) Sheets.detail(d.card.dataset.id);
      return;
    }
    d.card.classList.remove('dragging');
    clearProgress(d.card);
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 350);
    var dx = d.dx, id = d.card.dataset.id;
    if (dx < -76) finishSwipe(d.card, id, 'done', dx);        // drag LEFT  = done
    else if (dx > 76) finishSwipe(d.card, id, 'skip', dx);    // drag RIGHT = skip
    else {
      d.card.style.transform = '';
      d.card.classList.add('anim');
      setTimeout(function () { d.card.classList.remove('anim'); }, 240);
    }
  }
  function onPointerCancel() {
    if (!drag) return;
    drag.card.classList.remove('dragging');
    clearProgress(drag.card);
    drag.card.style.transform = '';
    drag = null;
  }
  function finishSwipe(card, id, status, dx) {
    UI.haptic(14);
    card.classList.add('anim');
    card.style.transform = 'translateX(' + (dx > 0 ? '130%' : '-130%') + ')';
    card.style.opacity = '0.25';
    var prev = Store.statusOf(id, Store.todayKey());
    setTimeout(function () {
      Store.setStatus(id, Store.todayKey(), status);
      var h = Store.habitById(id);
      UI.toast(t(status === 'done' ? 'markedDone' : 'markedSkip', { name: h ? h.name : '' }), {
        action: { label: t('undone'), fn: function () { Store.setStatus(id, Store.todayKey(), prev); } }
      });
    }, 170);
  }

  /* long-press on weekly circles → skip */
  var lpTimer = null, lpFired = false;
  function onLPDown(e) {
    var el = e.target.closest ? e.target.closest('.day-circle[data-action="toggle-day"]') : null;
    if (!el || el.disabled) return;
    lpFired = false;
    lpTimer = setTimeout(function () {
      lpFired = true;
      UI.haptic(18);
      var id = el.dataset.id, date = el.dataset.date;
      var cur = Store.statusOf(id, date);
      Store.setStatus(id, date, cur === 'skip' ? null : 'skip');
    }, 480);
  }
  function onLPEnd() { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } }

  /* =================== RENDER + ACTIONS =================== */
  function render() {
    var app = document.getElementById('app');
    var scroll = document.getElementById('main');
    var sy = scroll ? scroll.scrollTop : 0;
    app.innerHTML = renderHeader() +
      '<main class="screen-scroll" id="main" tabindex="-1">' +
      (A.screen === 'home' ? renderHome() : A.screen === 'stats' ? renderStats() : renderMore()) +
      '</main>' + renderNav();
    var ns = document.getElementById('main');
    if (ns && (A.screen !== 'home' || A.tab === A._lastTab)) ns.scrollTop = sy;
    if (A.screen === 'home') A._lastTab = A.tab;
  }

  function handle(action, el) {
    switch (action) {
      case 'nav':
        A.screen = el.dataset.screen; render(); break;
      case 'goto-overall':
        A.screen = 'home'; A.tab = 'overall'; render(); break;
      case 'tab':
        A.tab = el.dataset.tab; render(); break;
      case 'open-add': Sheets.addHabit(); break;
      case 'open-templates': Sheets.templates(); break;
      case 'open-detail': Sheets.detail(el.dataset.id); break;
      case 'week-prev': A.weekOffset--; render(); break;
      case 'week-next': A.weekOffset++; render(); break;
      case 'week-today': A.weekOffset = 0; render(); break;
      case 'toggle-day': {
        var id = el.dataset.id, date = el.dataset.date;
        Store.toggleDone(id, date);
        UI.haptic(10);
        render(); break;
      }
      case 'check-today': {
        Store.toggleDone(el.dataset.id, Store.todayKey());
        UI.haptic(10);
        render(); break;
      }
      case 'resolve-undo': {
        Store.setStatus(el.dataset.id, Store.todayKey(), null);
        UI.toast(t('undone'));
        render(); break;
      }
      case 'stats-tab': A.statsTab = el.dataset.tab; render(); break;
      case 'set-theme':
        Store.setSetting('theme', el.dataset.v);
        document.documentElement.dataset.theme = el.dataset.v;
        render(); break;
      case 'set-lang':
        I18n.setLang(el.dataset.v);
        Store.setSetting('lang', el.dataset.v);
        render(); break;
      case 'export-data': {
        try {
          var blob = new Blob([Store.exportJSON()], { type: 'application/json' });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'habitflow-backup.json';
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
          UI.toast(t('exported'));
        } catch (err) { UI.toast(t('importFailed')); }
        break;
      }
      case 'import-pick': {
        var inp = document.getElementById('import-input');
        if (inp) { inp.value = ''; inp.click(); }
        break;
      }
      case 'sample-data':
        UI.confirm({
          title: t('sampleConfirmTitle'), msg: t('sampleConfirmMsg'),
          okLabel: t('replace'), danger: true
        }).then(function (yes) {
          if (yes) { Store.loadSample(); UI.toast(t('sampleLoaded')); render(); }
        });
        break;
      case 'sample-empty':
        Store.loadSample(); UI.toast(t('sampleLoaded')); render(); break;
      case 'clear-data':
        UI.confirm({
          title: t('clearConfirmTitle'), msg: t('clearConfirmMsg'),
          okLabel: t('yes'), danger: true
        }).then(function (yes) {
          if (yes) { Store.clearAll(); UI.toast(t('cleared')); render(); }
        });
        break;
    }
  }

  /* =================== INIT =================== */
  function init() {
    var app = document.getElementById('app');
    // click delegation
    app.addEventListener('click', function (e) {
      if (suppressClick) { e.stopPropagation(); e.preventDefault(); return; }
      if (lpFired) { lpFired = false; e.stopPropagation(); e.preventDefault(); return; }
      var el = e.target.closest ? e.target.closest('[data-action]') : null;
      if (el && !el.disabled) handle(el.dataset.action, el);
    }, false);
    // swipe
    app.addEventListener('pointerdown', onPointerDown, false);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, false);
    window.addEventListener('pointercancel', onPointerCancel, false);
    // long-press skip
    app.addEventListener('pointerdown', onLPDown, true);
    window.addEventListener('pointerup', onLPEnd, true);
    window.addEventListener('pointercancel', onLPEnd, true);
    // hidden import input
    if (!document.getElementById('import-input')) {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json';
      inp.style.display = 'none';
      inp.id = 'import-input';
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          UI.confirm({
            title: t('importConfirmTitle'), msg: t('importConfirmMsg'),
            okLabel: t('replace'), danger: true
          }).then(function (yes) {
            if (!yes) return;
            try {
              Store.importJSON(String(reader.result));
              UI.toast(t('imported'));
              render();
            } catch (err) { UI.toast(t('importFailed')); }
          });
        };
        reader.readAsText(f);
      });
      document.body.appendChild(inp);
    }
  }

  return {
    init: init, render: render, handle: handle,
    state: function () { return A; }
  };
})();
