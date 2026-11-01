#!/usr/bin/env bash
# One-time helper: installs a JDK 21 and the Android SDK pieces needed by
# android/build.sh (platforms;android-34 + build-tools;34.0.0).
set -euo pipefail
SDK="${ANDROID_SDK:-$HOME/android-sdk}"
JDK="${ANDROID_JDK:-$HOME/jdk}"
mkdir -p "$SDK"

# ---------- 1. JDK (tarball already at /tmp/jdk.tar.gz) ----------
if ! command -v javac >/dev/null 2>&1; then
  if [ ! -x "$JDK/bin/javac" ]; then
    mkdir -p "$JDK"
    if [ -s /tmp/jdk.tar.gz ]; then
      tar -xzf /tmp/jdk.tar.gz -C "$JDK" --strip-components=1
    else
      curl -fL --retry 3 --connect-timeout 20 -o /tmp/jdk.tar.gz \
        "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.5%2B11/OpenJDK21U-jdk_x64_linux_hotspot_21.0.5_11.tar.gz"
      tar -xzf /tmp/jdk.tar.gz -C "$JDK" --strip-components=1
    fi
  fi
  export JAVA_HOME="$JDK"
  export PATH="$JAVA_HOME/bin:$PATH"
fi
javac -version || { echo "JAVAC FAILED"; exit 1; }

# ---------- 2. Android cmdline-tools ----------
if [ ! -d "$SDK/cmdline-tools/latest" ]; then
  echo "=== downloading cmdline-tools ==="
  curl -fL --retry 3 --connect-timeout 20 -o /tmp/clt.zip \
    https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  mkdir -p "$SDK/cmdline-tools"
  unzip -q -o /tmp/clt.zip -d "$SDK/cmdline-tools"
  mv "$SDK/cmdline-tools/cmdline-tools" "$SDK/cmdline-tools/latest"
fi
export ANDROID_HOME="$SDK"

# ---------- 3. Licenses + packages ----------
yes | "$SDK/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1 || true
"$SDK/cmdline-tools/latest/bin/sdkmanager" "platforms;android-34" "build-tools;34.0.0"

echo "=== VERIFY ==="
ls -la "$SDK/platforms/android-34/android.jar"
ls "$SDK/build-tools/34.0.0/" | head -30
"$SDK/build-tools/34.0.0/aapt2" version
echo "ALL DONE"
