/* ============================================================
   HabitFlow — bootstrap
   ============================================================ */
(function () {
  'use strict';

  Store.load();

  // language / theme
  var s = Store.settings();
  I18n.init(s.lang || null);
  document.documentElement.dataset.theme = s.theme || 'dark';

  // persist language once detected (first run)
  if (!s.lang) Store.setSetting('lang', I18n.get());

  Views.init();

  // apply stored handler → re-render on data change unless a sheet is editing
  var renderQueued = false;
  Store.onChange(function () {
    if (renderQueued) return;
    renderQueued = true;
    setTimeout(function () {
      renderQueued = false;
      if (!UI.sheetOpen()) Views.render();
    }, 30);
  });

  // sheet-level action router (editor buttons etc.)
  document.getElementById('sheets').addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el || el.disabled) return;
    var a = el.dataset.action;
    if (a === 'close-sheet') { UI.closeSheet(); return; }
    if (a.indexOf('ed-') === 0 || a === 'tpl-pick') { Sheets.handle(a, el); return; }
    // actions inside sheets that belong to main router (e.g. none currently)
    Views.handle(a, el);
  });
  document.getElementById('modal-root').addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el || el.disabled) return;
    var a = el.dataset.action;
    if (a.indexOf('ed-') === 0) Sheets.handle(a, el);
  });

  // Android hardware back button bridge
  window.__nativeBack = function () {
    if (UI.sheetOpen()) { UI.closeSheet(); return 'true'; }
    var mr = document.getElementById('modal-root');
    if (mr && mr.childElementCount) {
      var no = mr.querySelector('[data-action="modal-no"]');
      if (no) no.click();
      return 'true';
    }
    var st = Views.state();
    if (st.screen !== 'home') { st.screen = 'home'; Views.render(); return 'true'; }
    if (st.screen === 'home' && st.tab !== 'today') { st.tab = 'today'; Views.render(); return 'true'; }
    return 'false';
  };

  // first render
  Views.render();
})();
