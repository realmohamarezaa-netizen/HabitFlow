# Changelog

All notable changes to **HabitFlow** are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2025-11-01

### Added
- Habit tracking with **Today**, **Weekly** and **Overall** views.
- Directional **swipe actions**: swipe left to complete (green check), swipe right to skip.
- Colorful habit cards with per-weekday completion circles.
- **Overall** view with per-habit contribution-style heatmap (last ~100 days).
- **Stats → Dashboard**: today's progress ring, current/best streak, total completions,
  perfect days, daily activity bar chart and weekly completion percentage.
- **Stats → Analytics**: 8-week trend line chart, this-week vs last-week comparison,
  per-habit completion rates with progress bars.
- **Dark / Light** theme with system-aware color design.
- **English & فارسی (RTL)** full localization.
- **JSON export & import** for backups, plus sample data loader and "delete all data".
- Offline-first: every record stays in on-device storage (no network permission).
- Modern adaptive launcher icon (teal→emerald gradient, progress ring + check mark).
- Custom no-Gradle build pipeline: `aapt2 → javac → d8 → pack → zipalign → apksigner`.

### Security
- Minimal permission model — only `android.permission.VIBRATE`.
- `allowBackup=false`, `usesCleartextTraffic=false`.
- WebView hardened: `allowFileAccess=false`, `allowContentAccess=false`.
- APK signed with a 2048-bit RSA key, zipaligned and verified.

[1.0.0]: https://github.com/realmohamarezaa-netizen/HabitFlow/releases/tag/v1.0.0
