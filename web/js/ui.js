/* ============================================================
   HabitFlow — UI core: icons, helpers, toasts, sheets, modals
   ============================================================ */
window.UI = (function () {
  'use strict';

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function pct(n) { return Math.round(n * 100); }
  function haptic(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) { /* noop */ }
  }
  function isFileProtocol() {
    return typeof location !== 'undefined' && location.protocol === 'file:';
  }

  /* ---------------- icons (24x24, stroke) ---------------- */
  var P = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M4.5 12.5l5 5L19.5 6.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevL: '<path d="M14.5 5l-7 7 7 7"/>',
    chevR: '<path d="M9.5 5l7 7-7 7"/>',
    arrowR: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    grid2: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
    bookmark: '<path d="M7 4h10a1 1 0 0 1 1 1v15.5l-6-4.2-6 4.2V5a1 1 0 0 1 1-1z"/>',
    rows: '<rect x="4" y="4.5" width="16" height="6" rx="2.6"/><rect x="4" y="13.5" width="16" height="6" rx="2.6"/>',
    chart: '<path d="M5.5 20v-7M12 20V4.5M18.5 20v-10"/>',
    dots: '<circle cx="5" cy="5" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="5" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="5" r="1.7" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="5" cy="19" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="19" r="1.7" fill="currentColor" stroke="none"/>',
    flame: '<path d="M12 3c2 3.5 5 5.6 5 9a5 5 0 0 1-10 0c0-3.4 3-5.5 5-9z"/><path d="M12 21a3 3 0 0 1-1.2-5.7c.4-.2.9.1.9.5 0 .9 1 1.2 1.6.6.3-.3.3-.7.2-1 .8.6 1.5 1.6 1.5 2.6A3 3 0 0 1 12 21z" fill="currentColor" stroke="none" opacity=".55"/>',
    pencil: '<path d="M4 20l4.5-1L20 7.5a2.1 2.1 0 0 0-3-3L5.5 16 4 20z"/><path d="M14.5 6.5l3 3"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7.5 7l1 13h7l1-13M10.5 11v5M13.5 11v5"/>',
    download: '<path d="M12 4v10M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 14V4M7 9l5-5 5 5M5 20h14"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11.5V16"/><path d="M12 8.2h.01"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.8 2.7 2.8 14.3 0 17-2.8-2.7-2.8-14.3 0-17z"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
    tune: '<path d="M4 7h7M17.5 7H20M4 17h3M13.5 17H20"/><circle cx="14.5" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>',
    sparkle: '<path d="M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9L12 17l-1.9-4.8-4.9-1.9 4.9-1.9L12 3.5z" fill="currentColor" stroke="none"/>',
    undo: '<path d="M8 5L4 9l4 4"/><path d="M4 9h9.5a5.5 5.5 0 1 1 0 11H8"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10.5h16M9 3v4M15 3v4"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.8 2-1.8 0-.9-.6-1.4-.6-2.2 0-1 .8-1.8 2-1.8H17a4.5 4.5 0 0 0 4-4.5C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle cx="10.5" cy="7.3" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="7.3" r="1.2" fill="currentColor" stroke="none"/>',
    star: '<path d="M12 4l2.35 4.9 5.4.7-4 3.7.95 5.3L12 16l-4.7 2.5.95-5.3-4-3.7 5.4-.7L12 4z"/>',
    droplet: '<path d="M12 3.5c3.2 3.7 5.5 6.4 5.5 9.4a5.5 5.5 0 0 1-11 0c0-3 2.3-5.7 5.5-9.4z"/>',
    book: '<path d="M12 6.2C10.5 4.9 8.5 4.2 6 4.2v13.6c2.5 0 4.5.7 6 2 1.5-1.3 3.5-2 6-2V4.2c-2.5 0-4.5.7-6 2z"/><path d="M12 6.2v13.6"/>',
    dumbbell: '<path d="M7 9.5v5M4 10.5v3M17 9.5v5M20 10.5v3M7 12h10"/>',
    leaf: '<path d="M6.5 17.5C6.5 10.5 12 5.5 19 5.5c0 7.5-4.5 12-12.5 12z"/><path d="M6.5 17.5c2.5-4.5 5.5-7.5 9-9.5"/>',
    code: '<path d="M8.5 7L4 12l4.5 5M15.5 7L20 12l-4.5 5"/>',
    music: '<path d="M9 17.5V6.5l10-2.2v10.9"/><circle cx="7" cy="17.8" r="2"/><circle cx="17" cy="15.5" r="2"/>',
    coffee: '<path d="M5 9h11v5.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 14.5V9z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 5.5c0-1 .8-1.2.8-2M11.5 5.5c0-1 .8-1.2.8-2"/>',
    pill: '<path d="M8.8 15.2a4.6 4.6 0 0 1 0-6.5l3.9-3.9a4.6 4.6 0 0 1 6.5 6.5l-3.9 3.9a4.6 4.6 0 0 1-6.5 0z"/><path d="M10.8 7.5l5.7 5.7"/>',
    heart: '<path d="M12 20s-7.2-4.6-9-8.8C1.8 8 3.8 5 6.8 5c2 0 3.7 1.1 5.2 3.2C13.5 6.1 15.2 5 17.2 5c3 0 5 3 3.8 6.2-1.8 4.2-9 8.8-9 8.8z"/>',
    brush: '<path d="M11 8.5l4.5 4.5-6.8 6.8c-1.2 1.2-3.2 1.2-4.4 0s-1.2-3.2 0-4.4L11 8.5z"/><path d="M13.5 6L18 1.5 22.5 6 18 10.5 13.5 6z" transform="translate(-2.5 3.5)"/>',
    money: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M14.6 9.2c-.6-1-4.9-1.4-4.9.9 0 2.6 5 1.3 5 3.8 0 2.4-4.4 2-5 .9"/>',
    apple: '<path d="M12 7.5c-3 0-5.5 2.3-5.5 5.4S9 20 12 20s5.5-4 5.5-7.1S15 7.5 12 7.5z"/><path d="M12 7.5c0-2 1.1-3.2 2.8-3.7"/>',
    zap: '<path d="M13 3L5 13.5h5L10.5 21 19 10.5h-5L13 3z"/>',
    yoga: '<circle cx="12" cy="4.5" r="1.8"/><path d="M12 8v6M12 9.5l-4.5 2M12 9.5l4.5 2M12 14l-3.5 6.5M12 14l3.5 6.5"/>'
  };
  function icon(name, cls) {
    var body = P[name] || P.star;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (cls ? ' class="' + cls + '"' : '') + '>' + body + '</svg>';
  }

  /* ---------------- snackbar ---------------- */
  function toast(msg, opts) {
    opts = opts || {};
    var root = document.getElementById('toasts');
    var el = document.createElement('div');
    el.className = 'snack';
    el.innerHTML = '<span class="snack-msg">' + esc(msg) + '</span>' +
      (opts.action ? '<button class="snack-act" type="button">' + esc(opts.action.label) + '</button>' : '');
    if (opts.action) {
      el.querySelector('.snack-act').addEventListener('click', function () {
        dismiss();
        opts.action.fn();
      });
    }
    root.appendChild(el);
    var timer = setTimeout(dismiss, 3400);
    function dismiss() {
      clearTimeout(timer);
      if (!el.parentNode) return;
      el.classList.add('out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 210);
    }
    // keep at most 2
    while (root.children.length > 2) root.removeChild(root.firstChild);
  }

  /* ---------------- bottom sheet ---------------- */
  var sheetEl = null, backdropEl = null, sheetCloseCb = null;
  function openSheet(html, onReady, onClose) {
    closeSheet(true);
    sheetCloseCb = onClose || null;
    var root = document.getElementById('sheets');
    root.innerHTML =
      '<div class="backdrop" data-action="close-sheet"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true">' +
      '<div class="sheet-handle"></div>' +
      '<div class="sheet-body">' + html + '</div></div>';
    backdropEl = root.querySelector('.backdrop');
    sheetEl = root.querySelector('.sheet');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (backdropEl) backdropEl.classList.add('show');
        if (sheetEl) sheetEl.classList.add('show');
      });
    });
    if (onReady) onReady(sheetEl);
  }
  function closeSheet(instant) {
    var root = document.getElementById('sheets');
    if (!sheetEl) { root.innerHTML = ''; return; }
    var se = sheetEl, be = backdropEl, cb = sheetCloseCb;
    sheetEl = null; backdropEl = null; sheetCloseCb = null;
    if (instant) { root.innerHTML = ''; if (cb) cb(); return; }
    se.classList.remove('show');
    if (be) be.classList.remove('show');
    setTimeout(function () { if (root.contains(se)) root.innerHTML = ''; }, 300);
    if (cb) cb();
  }
  function sheetOpen() { return !!sheetEl; }
  function setSheetBody(html) {
    if (sheetEl) sheetEl.querySelector('.sheet-body').innerHTML = html;
  }

  /* ---------------- modal (confirm) ---------------- */
  function confirm(opts) {
    return new Promise(function (resolve) {
      var root = document.getElementById('modal-root');
      var done = false;
      function finish(v) {
        if (done) return;
        done = true;
        var card = root.querySelector('.modal-card');
        var bd = root.querySelector('.backdrop');
        if (card) card.classList.remove('show');
        if (bd) bd.classList.remove('show');
        setTimeout(function () { root.innerHTML = ''; }, 200);
        resolve(v);
      }
      root.innerHTML =
        '<div class="backdrop show" data-action="modal-no"></div>' +
        '<div class="modal-wrap"><div class="modal-card" role="alertdialog" aria-modal="true">' +
        '<div class="modal-title">' + esc(opts.title) + '</div>' +
        '<div class="modal-msg">' + esc(opts.msg) + '</div>' +
        '<div class="btn-row" style="margin-top:20px">' +
        '<button class="btn btn-tonal" type="button" data-action="modal-no">' + esc(opts.cancelLabel || I18n.t('cancel')) + '</button>' +
        '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" type="button" data-action="modal-yes">' + esc(opts.okLabel || I18n.t('ok')) + '</button>' +
        '</div></div></div>';
      root.querySelector('[data-action="modal-yes"]').addEventListener('click', function () { finish(true); });
      root.querySelectorAll('[data-action="modal-no"]').forEach(function (b) {
        b.addEventListener('click', function () { finish(false); });
      });
      requestAnimationFrame(function () {
        var c = root.querySelector('.modal-card');
        if (c) c.classList.add('show');
      });
    });
  }

  return {
    esc: esc, pct: pct, haptic: haptic, isFileProtocol: isFileProtocol,
    icon: icon,
    toast: toast,
    openSheet: openSheet, closeSheet: closeSheet, sheetOpen: sheetOpen, setSheetBody: setSheetBody,
    confirm: confirm
  };
})();
