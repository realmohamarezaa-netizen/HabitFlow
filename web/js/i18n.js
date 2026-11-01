/* ============================================================
   HabitFlow — i18n: English + Persian (فارسی) with RTL support
   Week starts Monday (ISO-8601) for EN, Saturday for FA.
   ============================================================ */
window.I18n = (function () {
  'use strict';

  var lang = 'en';

  var D = {
    en: {
      appName: 'HabitFlow',
      habits: 'Habits',
      today: 'Today', weekly: 'Weekly', overall: 'Overall',
      completed: '{n} completed', allDoneToday: 'All done for today 🎉',
      home: 'Home', stats: 'Stats', more: 'More',
      dashboard: 'Dashboard', analytics: 'Analytics',

      addHabit: 'New habit', editHabit: 'Edit habit', details: 'Details',
      name: 'Name', namePh: 'e.g. Drink water',
      description: 'Description', descPh: 'Optional note…',
      color: 'Color', icon: 'Icon', repeatOn: 'Repeat on',
      everyday: 'Everyday', custom: 'Custom',
      save: 'Save', cancel: 'Cancel', del: 'Delete', edit: 'Edit', close: 'Close',
      done: 'Done', skipped: 'Skipped', skip: 'Skip',
      thisWeek: 'This week', todayBtn: 'Today',

      todayProgress: 'Today’s progress',
      currentStreak: 'Current streak', bestStreak: 'Best streak',
      totalDone: 'Total completed', completionRate: 'Completion rate',
      last14: 'Last 14 days', weeklyActivity: 'Daily activity',
      perHabit: 'Per habit', allTime: 'All time',
      thisWeekRate: 'This week', lastWeekRate: 'Last week',
      trackedDays: 'Tracked days', activeHabits: 'Active habits',
      skipRate: 'Skip rate', bestDay: 'Best weekday',
      dayStreaks: '{n} day streak',
      noData: 'No data yet — start checking off habits!',

      swipeDone: 'Swipe left to complete', swipeSkip: 'Swipe right to skip',
      pendingToday: 'pending',
      perfectDays: 'Perfect days',
      avg: 'Avg',
      consistency: 'Consistency', last12Weeks: 'Last 12 weeks', less: 'Less',
      weeklyTrend: 'Weekly trend', last8Weeks: 'Last 8 weeks',
      completionQuality: 'Completion quality', missed: 'Missed',
      records: 'Records', longestStreak: 'Longest streak',
      mostDone: 'Most completed', mostSkipped: 'Most skipped',
      toughest: 'Toughest weekday',

      appearance: 'Appearance', theme: 'Theme', dark: 'Dark', light: 'Light',
      language: 'Language',
      dataSection: 'Data',
      exportData: 'Export data', exportSub: 'Download a JSON backup',
      importData: 'Import data', importSub: 'Restore from a JSON backup',
      sampleData: 'Load sample data', sampleSub: 'Try HabitFlow with demo habits',
      clearData: 'Delete all data', clearSub: 'Remove every habit & record',
      about: 'About', version: 'Version',
      tagline: 'Build better days, one habit at a time.',
      downloadApk: 'Download Android app', downloadSub: 'Install HabitFlow APK on your phone',
      quickAdd: 'Quick add', quickAddSub: 'Start from a template',

      emptyTodayTitle: 'Nothing scheduled today',
      emptyTodaySub: 'Enjoy your rest day, or add a new habit.',
      emptyAllTitle: 'Build your first habit',
      emptyAllSub: 'Small daily actions lead to big results.',
      addFirst: 'Add habit', trySample: 'Try sample data',

      saved: 'Habit saved', deleted: 'Habit deleted',
      markedDone: '{name} completed', markedSkip: '{name} skipped',
      undone: 'Undone', nameRequired: 'Please give your habit a name',
      dayRequired: 'Pick at least one day',
      imported: 'Data imported', importFailed: 'Import failed — invalid file',
      cleared: 'All data cleared', exported: 'Backup downloaded',
      sampleLoaded: 'Sample data loaded',

      clearConfirmTitle: 'Delete all data?',
      clearConfirmMsg: 'Every habit and completion record will be permanently removed. This cannot be undone.',
      deleteHabitTitle: 'Delete habit?',
      deleteHabitMsg: '“{name}” and all of its records will be permanently removed.',
      sampleConfirmTitle: 'Load sample data?',
      sampleConfirmMsg: 'Your current habits will be replaced by the demo set.',
      importConfirmTitle: 'Import data?',
      importConfirmMsg: 'Your current data will be replaced by the backup file.',
      yes: 'Delete', replace: 'Replace', ok: 'OK',

      doneSection: 'Done today',
      rate30: '30-day rate',
      langFa: 'فارسی', langEn: 'English',
      schedEveryday: 'Everyday', schedDays: 'Per schedule',
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },

    fa: {
      appName: 'HabitFlow',
      habits: 'عادت‌ها',
      today: 'امروز', weekly: 'هفتگی', overall: 'کلی',
      completed: '{n} انجام شد', allDoneToday: 'امروز همه انجام شد! 🎉',
      home: 'خانه', stats: 'آمار', more: 'بیشتر',
      dashboard: 'داشبورد', analytics: 'تحلیل',

      addHabit: 'عادت جدید', editHabit: 'ویرایش عادت', details: 'جزئیات',
      name: 'نام', namePh: 'مثلاً نوشیدن آب',
      description: 'توضیحات', descPh: 'یادداشت اختیاری…',
      color: 'رنگ', icon: 'نماد', repeatOn: 'تکرار در روزها',
      everyday: 'هر روز', custom: 'سفارشی',
      save: 'ذخیره', cancel: 'انصراف', del: 'حذف', edit: 'ویرایش', close: 'بستن',
      done: 'انجام شد', skipped: 'رد شد', skip: 'رد کردن',
      thisWeek: 'این هفته', todayBtn: 'امروز',

      todayProgress: 'پیشرفت امروز',
      currentStreak: 'زنجیره فعلی', bestStreak: 'بهترین زنجیره',
      totalDone: 'کل انجام‌شده', completionRate: 'نرخ انجام',
      last14: '۱۴ روز گذشته', weeklyActivity: 'فعالیت روزانه',
      perHabit: 'به تفکیک عادت', allTime: 'کل',
      thisWeekRate: 'این هفته', lastWeekRate: 'هفته گذشته',
      trackedDays: 'روزهای ردیابی', activeHabits: 'عادت‌های فعال',
      skipRate: 'نرخ رد کردن', bestDay: 'بهترین روز هفته',
      dayStreaks: 'زنجیره {n} روزه',
      noData: 'هنوز داده‌ای نیست — از امروز شروع کن!',

      swipeDone: 'برای انجام به چپ بکش', swipeSkip: 'برای رد کردن به راست بکش',
      pendingToday: 'باقی‌مانده',
      perfectDays: 'روزهای بی‌نقص',
      avg: 'میانگین',
      consistency: 'ثبات', last12Weeks: '۱۲ هفته اخیر', less: 'کمتر',
      weeklyTrend: 'روند هفتگی', last8Weeks: '۸ هفته اخیر',
      completionQuality: 'کیفیت انجام', missed: 'انجام‌نشده',
      records: 'رکوردها', longestStreak: 'طولانی‌ترین زنجیره',
      mostDone: 'بیشترین انجام‌شده', mostSkipped: 'بیشترین ردشده',
      toughest: 'سخت‌ترین روز هفته',

      appearance: 'ظاهر', theme: 'پوسته', dark: 'تاریک', light: 'روشن',
      language: 'زبان',
      dataSection: 'داده‌ها',
      exportData: 'خروجی داده‌ها', exportSub: 'دانلود نسخه پشتیبان JSON',
      importData: 'ورود داده‌ها', importSub: 'بازیابی از فایل پشتیبان JSON',
      sampleData: 'بارگذاری داده نمونه', sampleSub: 'امتحان HabitFlow با عادت‌های نمونه',
      clearData: 'حذف همه داده‌ها', clearSub: 'پاک کردن تمام عادت‌ها و سوابق',
      about: 'درباره', version: 'نسخه',
      tagline: 'روزهای بهتر بساز، یک عادت در هر بار.',
      downloadApk: 'دانلود اپلیکیشن اندروید', downloadSub: 'نصب فایل APK روی گوشی شما',
      quickAdd: 'افزودن سریع', quickAddSub: 'شروع از یک الگو',

      emptyTodayTitle: 'امروز عادتی برنامه‌ریزی نشده',
      emptyTodaySub: 'از روز استراحتت لذت ببر، یا یک عادت تازه اضافه کن.',
      emptyAllTitle: 'اولین عادتت را بساز',
      emptyAllSub: 'کارهای کوچک روزانه، نتایج بزرگ می‌سازند.',
      addFirst: 'افزودن عادت', trySample: 'دیدن داده نمونه',

      saved: 'عادت ذخیره شد', deleted: 'عادت حذف شد',
      markedDone: '{name} انجام شد', markedSkip: '{name} رد شد',
      undone: 'برگشت', nameRequired: 'لطفاً یک نام انتخاب کن',
      dayRequired: 'حداقل یک روز را انتخاب کن',
      imported: 'داده‌ها وارد شد', importFailed: 'ورود ناموفق — فایل نامعتبر است',
      cleared: 'همه داده‌ها پاک شد', exported: 'نسخه پشتیبان دانلود شد',
      sampleLoaded: 'داده نمونه بارگذاری شد',

      clearConfirmTitle: 'همه داده‌ها حذف شود؟',
      clearConfirmMsg: 'تمام عادت‌ها و سوابق برای همیشه حذف می‌شوند. این کار قابل بازگشت نیست.',
      deleteHabitTitle: 'عادت حذف شود؟',
      deleteHabitMsg: '«{name}» و همه سوابق آن برای همیشه حذف می‌شوند.',
      sampleConfirmTitle: 'داده نمونه بارگذاری شود؟',
      sampleConfirmMsg: 'عادت‌های فعلی تو با مجموعه نمونه جایگزین می‌شوند.',
      importConfirmTitle: 'داده‌ها وارد شود؟',
      importConfirmMsg: 'داده‌های فعلی تو با فایل پشتیبان جایگزین می‌شوند.',
      yes: 'حذف', replace: 'جایگزین', ok: 'باشه',

      doneSection: 'انجام‌شده امروز',
      rate30: 'نرخ ۳۰ روز',
      langFa: 'فارسی', langEn: 'English',
      schedEveryday: 'هر روز', schedDays: 'طبق برنامه',
      monthsShort: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر']
    }
  };

  // Short day names, ordered from the locale's week start.
  // EN week starts Monday, FA week starts Saturday.
  var DAYS_SHORT = {
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    fa: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
  };
  var DAYS_FULL = {
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    fa: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
  };
  var WEEK_START = { en: 1, fa: 6 }; // JS getDay(): 0=Sun..6=Sat

  function detect() {
    try {
      if ((navigator.language || '').toLowerCase().indexOf('fa') === 0) return 'fa';
    } catch (e) { /* noop */ }
    return 'en';
  }

  function apply() {
    var de = document.documentElement;
    de.lang = lang;
    de.dir = (lang === 'fa') ? 'rtl' : 'ltr';
  }

  return {
    init: function (saved) { lang = saved || detect(); apply(); },
    get: function () { return lang; },
    setLang: function (l) { lang = l; apply(); },
    t: function (key, vars) {
      var s = (D[lang] && D[lang][key] !== undefined) ? D[lang][key] : D.en[key];
      if (s === undefined) s = key;
      if (vars) {
        Object.keys(vars).forEach(function (v) {
          s = String(s).split('{' + v + '}').join(vars[v]);
        });
      }
      return s;
    },
    weekStart: function () { return WEEK_START[lang] || 1; },
    daysShort: function () { return DAYS_SHORT[lang]; },
    daysFull: function () { return DAYS_FULL[lang]; },
    /** name for a JS day-of-week (0=Sun..6=Sat) in current locale order */
    dayName: function (jsDow, short) {
      var arr = short ? DAYS_SHORT[lang] : DAYS_FULL[lang];
      var pos = (jsDow - (WEEK_START[lang] || 1) + 7) % 7;
      return arr[pos];
    },
    isRTL: function () { return lang === 'fa'; }
  };
})();
