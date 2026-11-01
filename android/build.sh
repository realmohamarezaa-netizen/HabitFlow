#!/usr/bin/env bash
# ============================================================
# HabitFlow — APK build script (no Gradle needed)
# aapt2 → javac → d8 → pack → zipalign → apksigner
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$ROOT")"                 # repo root (contains web/, android/, release/)
SDK="${ANDROID_SDK:-$HOME/android-sdk}"
JDK="${ANDROID_JDK:-$HOME/jdk}"

if [ -x "$JDK/bin/javac" ]; then
  export JAVA_HOME="$JDK"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

BT="$(ls -d "$SDK"/build-tools/* | sort -V | tail -1)"
PLATFORM="$(ls "$SDK"/platforms/android-*/android.jar | sort -V | tail -1)"
echo ">> build-tools: $BT"
echo ">> platform:    $PLATFORM"

OUT="$ROOT/out"
rm -rf "$OUT"
mkdir -p "$OUT/gen" "$OUT/classes"

echo ">> [0/8] copying web assets"
rm -rf "$ROOT/assets"
mkdir -p "$ROOT/assets" "$REPO/release"
cp -r "$REPO/web" "$ROOT/assets/www"

echo ">> [1/8] aapt2 compile"
"$BT/aapt2" compile --dir "$ROOT/res" -o "$OUT/res.zip"

echo ">> [2/8] aapt2 link"
"$BT/aapt2" link -o "$OUT/base.apk" -I "$PLATFORM" \
  --manifest "$ROOT/AndroidManifest.xml" \
  -R "$OUT/res.zip" \
  --java "$OUT/gen" \
  --auto-add-overlay

echo ">> [3/8] javac"
find "$OUT/gen" "$ROOT/java" -name '*.java' > "$OUT/sources.txt"
javac --release 11 -classpath "$PLATFORM" -d "$OUT/classes" @"$OUT/sources.txt"

echo ">> [4/8] d8 (dex)"
"$JAVA_HOME/bin/jar" cf "$OUT/classes.jar" -C "$OUT/classes" .
# build-tools 34.0.0 d8 (R8 8.2.2-dev) crashes on JDK 21 — use newer R8 jar if available
D8_JAR="$SDK/r8.jar"
if [ -f "$D8_JAR" ]; then
  java -cp "$D8_JAR" com.android.tools.r8.D8 --release --lib "$PLATFORM" --min-api 24 \
    --output "$OUT" "$OUT/classes.jar"
else
  "$BT/d8" --release --lib "$PLATFORM" --min-api 24 --output "$OUT" "$OUT/classes.jar"
fi

echo ">> [5/8] pack assets + dex"
python3 "$ROOT/pack.py" "$OUT/base.apk" "$OUT/classes.dex" "$ROOT/assets" "$OUT/unsigned.apk"

echo ">> [6/8] zipalign"
"$BT/zipalign" -f 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

# Release keystore is intentionally NOT stored in version control.
# Keep habitflow.keystore next to this script (or point HABITFLOW_KEYSTORE at it);
# a fresh one is generated automatically if none exists.
KS="${HABITFLOW_KEYSTORE:-$ROOT/habitflow.keystore}"
if [ ! -f "$KS" ]; then
  echo ">> generating signing key"
  keytool -genkeypair -keystore "$KS" -storepass habitflow -keypass habitflow \
    -alias habitflow -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=HabitFlow,O=HabitFlow,C=US"
fi

echo ">> [7/8] apksigner sign"
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:habitflow --key-pass pass:habitflow \
  --out "$REPO/release/HabitFlow.apk" "$OUT/aligned.apk"

echo ">> [8/8] verify"
"$BT/apksigner" verify --print-certs "$REPO/release/HabitFlow.apk" | head -6
cp "$REPO/release/HabitFlow.apk" "$REPO/release/HabitFlow-1.0.0.apk"

echo ""
echo "=============================================="
echo " APK READY: $REPO/release/HabitFlow-1.0.0.apk"
echo " size: $(du -h "$REPO/release/HabitFlow-1.0.0.apk" | cut -f1)"
echo "=============================================="
