/* ============================================================
   HabitFlow — sheets: add/edit habit, habit details, templates
   ============================================================ */
window.Sheets = (function () {
  'use strict';
  var t = function (k, v) { return window.I18n.t(k, v); };
  var esc = UI.esc, icon = UI.icon;

  var COLORS = ['#2E7F84', '#C87F3D', '#8E6BD9', '#4C8FD9', '#3AA76D', '#D06BA8', '#D9A93D', '#D95F5F', '#4FB8A8', '#9A8BD9'];
  var ICONS = ['droplet', 'book', 'dumbbell', 'yoga', 'leaf', 'code', 'music', 'coffee', 'moon', 'pill', 'heart', 'brush', 'money', 'apple', 'zap', 'star'];

  var TEMPLATES = [
    { name: 'Drink water', desc: '8 glasses a day', icon: 'droplet', color: '#2E7F84' },
    { name: 'Meditation', desc: '10 minutes of calm', icon: 'yoga', color: '#8E6BD9' },
    { name: 'Reading', desc: '20 pages before bed', icon: 'book', color: '#D9A93D' },
    { name: 'Workout', desc: 'Train 30 minutes', icon: 'dumbbell', color: '#3AA76D' },
    { name: 'Early sleep', desc: 'In bed before 11 pm', icon: 'moon', color: '#4C8FD9' },
    { name: 'No sugar', desc: 'Skip sweets today', icon: 'apple', color: '#D95F5F' },
    { name: 'Journaling', desc: 'Write down your day', icon: 'pencil', color: '#4FB8A8' },
    { name: 'Deep work', desc: 'Focus 1 hour', icon: 'code', color: '#C87F3D' }
  ];

  var Ed = null; // editor draft

  /* ---------------- ADD / EDIT ---------------- */
  function addHabit(prefill) {
    Ed = {
      id: null,
      name: prefill && prefill.name || '',
      desc: prefill && prefill.desc || '',
      color: prefill && prefill.color || COLORS[0],
      icon: prefill && prefill.icon || 'star',
      days: [0, 1, 2, 3, 4, 5, 6]
    };
    openEditor(t('addHabit'));
  }
  function editHabit(id) {
    var h = Store.habitById(id);
    if (!h) return;
    Ed = { id: h.id, name: h.name, desc: h.desc, color: h.color, icon: h.icon, days: h.days.slice() };
    openEditor(t('editHabit'));
  }

  function openEditor(title) {
    UI.openSheet(editorHTML(title), function (sheet) {
      var nameInput = sheet.querySelector('#f-name');
      if (nameInput && Ed.id) { /* keep focus off on mobile for edits */ }
      if (nameInput && !Ed.id) {
        setTimeout(function () { try { nameInput.focus(); } catch (e) { } }, 350);
      }
      sheet.addEventListener('input', function (e) {
        if (e.target.id === 'f-name') Ed.name = e.target.value;
        if (e.target.id === 'f-desc') Ed.desc = e.target.value;
      });
    });
  }

  function editorHTML(title) {
    var html = '<div class="sheet-title">' + esc(title) + '</div>';
    html += '<label class="field-lab" for="f-name">' + esc(t('name')) + '</label>' +
      '<input class="field' + (Ed._nameErr ? ' err' : '') + '" id="f-name" type="text" maxlength="60" ' +
      'placeholder="' + esc(t('namePh')) + '" value="' + esc(Ed.name) + '">';
    html += '<label class="field-lab" for="f-desc">' + esc(t('description')) + '</label>' +
      '<textarea class="field" id="f-desc" rows="2" maxlength="120" placeholder="' + esc(t('descPh')) + '">' + esc(Ed.desc) + '</textarea>';

    html += '<span class="field-lab">' + esc(t('icon')) + '</span><div class="icon-grid">';
    ICONS.forEach(function (ic) {
      html += '<button class="icon-pick" data-action="ed-icon" data-v="' + ic + '" aria-pressed="' + (Ed.icon === ic) + '" aria-label="' + ic + '">' + icon(ic) + '</button>';
    });
    html += '</div>';

    html += '<span class="field-lab">' + esc(t('color')) + '</span><div class="color-row">';
    COLORS.forEach(function (c) {
      html += '<button class="swatch" data-action="ed-color" data-v="' + c + '" style="background:' + c + '"' +
        ' aria-pressed="' + (Ed.color === c) + '" aria-label="' + c + '"></button>';
    });
    html += '</div>';

    html += '<span class="field-lab">' + esc(t('repeatOn')) + '</span><div class="day-chips">';
    for (var pos = 0; pos < 7; pos++) {
      var dow = (I18n.weekStart() + pos) % 7;
      var on = Ed.days.indexOf(dow) !== -1;
      html += '<button class="day-chip" data-action="ed-day" data-v="' + dow + '" aria-pressed="' + on + '">' +
        esc(I18n.dayName(dow, true)) + '</button>';
    }
    html += '</div>';

    html += '<div class="edit-preview">' + previewHTML() + '</div>';

    html += '<div class="btn-row">' +
      (Ed.id ? '<button class="btn btn-danger" data-action="ed-delete">' + icon('trash') + esc(t('del')) + '</button>' : '') +
      '<button class="btn btn-tonal" data-action="close-sheet">' + esc(t('cancel')) + '</button>' +
      '<button class="btn btn-primary" data-action="ed-save">' + esc(t('save')) + '</button>' +
      '</div>';
    return html;
  }

  function previewHTML() {
    var days = Ed.days.length === 7 ? t('everyday') : schedLabel();
    return '<div class="wcard" style="--hc:' + Ed.color + ';margin-bottom:0">' +
      '<div class="w-head"><span class="w-name">' + (esc(Ed.name) || '&nbsp;') + '</span>' +
      '<span class="w-sched">' + esc(days) + '</span></div></div>';
  }
  function schedLabel() {
    var names = [];
    Ed.days.slice().sort().forEach(function (d) { names.push(I18n.dayName(d, true)); });
    return names.join(' · ');
  }

  function refreshEditor() {
    UI.setSheetBody(editorHTML(Ed.id ? t('editHabit') : t('addHabit')));
  }

  function edAction(action, el) {
    if (action === 'ed-icon') { Ed.icon = el.dataset.v; refreshEditor(); }
    else if (action === 'ed-color') { Ed.color = el.dataset.v; refreshEditor(); }
    else if (action === 'ed-day') {
      var d = +el.dataset.v;
      var i = Ed.days.indexOf(d);
      if (i === -1) Ed.days.push(d); else Ed.days.splice(i, 1);
      if (!Ed.days.length) Ed.days = [(I18n.weekStart())]; // never empty
      refreshEditor();
    } else if (action === 'ed-save') {
      Ed.name = (document.getElementById('f-name') || {}).value || Ed.name;
      Ed.desc = (document.getElementById('f-desc') || {}).value || Ed.desc;
      if (!Ed.name.trim()) {
        Ed._nameErr = true;
        var inp = document.getElementById('f-name');
        if (inp) { inp.classList.add('err'); inp.focus(); }
        UI.toast(t('nameRequired'));
        return;
      }
      var days = Ed.days.slice().sort();
      if (Ed.id) Store.updateHabit(Ed.id, { name: Ed.name.trim(), desc: Ed.desc.trim(), color: Ed.color, icon: Ed.icon, days: days });
      else Store.addHabit({ name: Ed.name.trim(), desc: Ed.desc.trim(), color: Ed.color, icon: Ed.icon, days: days });
      UI.closeSheet();
      UI.haptic(12);
      UI.toast(t('saved'));
      Views.render();
    } else if (action === 'ed-delete') {
      var h = Store.habitById(Ed.id);
      UI.closeSheet();
      UI.confirm({
        title: t('deleteHabitTitle'),
        msg: t('deleteHabitMsg', { name: h ? h.name : '' }),
        okLabel: t('yes'), danger: true
      }).then(function (yes) {
        if (yes) {
          Store.deleteHabit(Ed.id);
          UI.toast(t('deleted'));
          Views.render();
        }
      });
    }
  }

  /* ---------------- DETAIL ---------------- */
  function detail(id) {
    var h = Store.habitById(id);
    if (!h) return;
    var streak = Store.currentStreak(h);
    var best = Store.bestStreak(h);
    var r = UI.pct(Store.rate(h, 30));
    var totals = Store.totalCounts(h);

    var html = '<div class="d-head">' +
      '<span class="o-icochip" style="--hc:' + h.color + '">' + icon(h.icon) + '</span>' +
      '<div><div class="d-name">' + esc(h.name) + '</div>' +
      (h.desc ? '<div class="d-desc">' + esc(h.desc) + '</div>' : '') + '</div></div>';

    html += '<div class="d-chips">' +
      '<span class="d-chip">' + icon('flame') + '<b>' + streak + '</b> ' + esc(t('dayStreaks', { n: '' })).trim() + '</span>' +
      '<span class="d-chip">' + icon('target') + '<b>' + r + '%</b> ' + esc(t('rate30')) + '</span>' +
      '<span class="d-chip">' + icon('sparkle') + '<b>' + totals.done + '</b> ' + esc(t('totalDone')) + '</span>' +
      '<span class="d-chip">' + icon('calendar') + '<b>' + (h.days.length === 7 ? esc(t('everyday')) : esc(schedLabelOfH(h))) + '</b></span>' +
      '</div>';

    // mini 8-week grid
    var today = Store.todayKey();
    var ws = Store.weekStartOf(today);
    var start = Store.addDays(ws, -7 * 7);
    html += '<div class="d-grid"><div class="ogrid mini" style="--hc:' + h.color + '">';
    for (var col = 0; col < 8; col++) {
      for (var row = 0; row < 7; row++) {
        var date = Store.addDays(start, col * 7 + row);
        var dow = Store.dowOf(date);
        var scheduled = h.days.indexOf(dow) !== -1;
        var st = Store.statusOf(h.id, date);
        var cls = 'gcell';
        if (date > today) cls += ' future';
        else if (st === 'done') cls += ' done';
        else if (st === 'skip') cls += ' skipp';
        else if (!scheduled) cls += ' na';
        html += '<div class="' + cls + '"></div>';
      }
    }
    html += '</div></div>';

    html += '<div class="btn-row">' +
      '<button class="btn btn-danger" data-action="ed-delete" data-id="' + h.id + '">' + icon('trash') + esc(t('del')) + '</button>' +
      '<button class="btn btn-tonal" data-action="ed-edit" data-id="' + h.id + '">' + icon('pencil') + esc(t('edit')) + '</button>' +
      '</div>';
    UI.openSheet(html);
  }
  function schedLabelOfH(h) {
    var names = [];
    h.days.forEach(function (d) { names.push(I18n.dayName(d, true)); });
    return names.join(' · ');
  }

  /* ---------------- TEMPLATES ---------------- */
  function templates() {
    var html = '<div class="sheet-title">' + esc(t('quickAdd')) + '</div>' +
      '<div class="sr-sub" style="color:var(--text-2);font-size:13px;padding:2px 2px 12px">' + esc(t('quickAddSub')) + '</div>';
    TEMPLATES.forEach(function (tp, i) {
      html += '<button class="set-row" data-action="tpl-pick" data-i="' + i + '" style="background:none">' +
        '<span class="o-icochip" style="--hc:' + tp.color + ';width:40px;height:40px;border-radius:13px">' + icon(tp.icon) + '</span>' +
        '<span class="sr-body"><span class="sr-title">' + esc(tp.name) + '</span><span class="sr-sub">' + esc(tp.desc) + '</span></span>' +
        '<span class="sr-end">' + icon('plus') + '</span></button>';
    });
    UI.openSheet(html);
  }
  function pickTemplate(i) {
    var tp = TEMPLATES[i];
    if (tp) {
      UI.closeSheet();
      setTimeout(function () { addHabit(tp); }, 120);
    }
  }

  /* ---------------- action router (delegated from main) ---------------- */
  function handle(action, el) {
    if (action === 'ed-icon' || action === 'ed-color' || action === 'ed-day' || action === 'ed-save' || action === 'ed-delete') {
      edAction(action, el);
    } else if (action === 'ed-edit') {
      UI.closeSheet();
      setTimeout(function () { editHabit(el.dataset.id); }, 120);
    } else if (action === 'tpl-pick') {
      pickTemplate(+el.dataset.i);
    }
  }

  return {
    addHabit: addHabit, editHabit: editHabit, detail: detail, templates: templates,
    handle: handle
  };
})();
