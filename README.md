# Offline Phone Assistant

A native Android application written in Kotlin that runs **100% offline**, requires **no API keys**, and controls your physical apps (like YouTube, Chrome, WhatsApp, Maps, and system settings) via an Android **Accessibility Service**.

---

## 🛠️ CLI Build & Install Commands (Create APK)

If you have the Java JDK 17 installed and Android SDK configured, you can build and install the APK directly from your command line without opening Android Studio.

### 1. Build the APK (Assemble Debug)

Run the Gradle build command in the root folder of this project:

**On Windows (PowerShell/CMD):**
```powershell
.\gradlew assembleDebug
```

**On macOS/Linux:**
```bash
chmod +x gradlew
./gradlew assembleDebug
```

> *Note: If the gradle wrapper (`gradlew`) is not yet initialized, running `gradle assembleDebug` (if Gradle is installed on your path) or opening the project once in Android Studio will auto-generate it.*

### 2. Locate the Generated APK

Once the build finishes successfully, the APK will be created at:
📂 **`app/build/outputs/apk/debug/app-debug.apk`**

### 3. Install the APK via Command Line (ADB)

Connect your phone with USB Debugging enabled, and run the Android Debug Bridge (ADB) install command:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Features

1. **Physical Key Trigger**: Press the **Volume Down** key to start local listening.
2. **Local Speech-to-Text**: Uses Android's native `SpeechRecognizer` offline engine.
3. **Local Intent Parser**: Matches queries like *"open YouTube"*, *"search Mysore on Maps"*, *"volume up"*, or *"type Hello"* completely on-device.
4. **Accessibility Control**: Scans screen elements, clicks search bars, inputs text, and submits entries on behalf of the user.
5. **Local Text-to-Speech**: Talks back offline using Android's native `TextToSpeech` engine.
