/**
 * Offline Command Parser Utility
 * Parses spoken or typed commands into structured actions that the simulator can execute.
 * It also returns the clean verbal response that will be spoken via offline Text-to-Speech (TTS).
 */

// Helper to match app open intents (e.g. "open youtube", "open the youtube", "launch youtube")
const isAppOpenIntent = (input, appName) => {
  const keywords = ["open", "launch", "start", "run", "go to", "show"];
  const hasKeyword = keywords.some(kw => input.includes(kw));
  if (!hasKeyword) return false;

  switch (appName) {
    case "youtube":
      return input.includes("youtube") || input.includes("yt");
    case "chrome":
      return input.includes("chrome") || input.includes("browser");
    case "whatsapp":
      return input.includes("whatsapp");
    case "gallery":
      return input.includes("gallery") || input.includes("photo") || input.includes("image");
    case "maps":
      return input.includes("maps") || input.includes("map");
    case "settings":
      return input.includes("settings") || input.includes("setting");
    default:
      return input.includes(appName);
  }
};

export const parseCommand = (rawText, permissions, activeApp) => {
  // Normalize spoken/typed app names with spacing variations
  const text = rawText.toLowerCase().trim()
    .replace(/\byou\s+tube\b/g, "youtube")
    .replace(/\bwhats\s+app\b/g, "whatsapp")
    .replace(/\bwhat\s+app\b/g, "whatsapp")
    .replace(/\bwi\s+fi\b/g, "wifi")
    .replace(/\bwi-\s*fi\b/g, "wifi")
    .replace(/\bblue\s+tooth\b/g, "bluetooth")
    .replace(/\bgoogle\s+maps\b/g, "maps")
    .replace(/\bgoogle\s+chrome\b/g, "chrome");

  // Helper to check if an app has permission
  const checkPermission = (appName) => {
    if (!permissions.accessibility) {
      return {
        error: true,
        response: "I need Accessibility permission enabled to control apps."
      };
    }
    if (!permissions.apps[appName]) {
      return {
        error: true,
        response: `Control for ${appName} is disabled in your assistant permissions.`
      };
    }
    return { error: false };
  };

  // 1. SYSTEM CONTROLS (Always available if global settings allow, or mic permission enabled)
  if (text.includes("increase volume") || text.includes("volume up")) {
    return {
      action: "VOLUME_UP",
      app: "system",
      response: "Volume increased",
      speechText: "Volume increased"
    };
  }

  if (text.includes("decrease volume") || text.includes("volume down")) {
    return {
      action: "VOLUME_DOWN",
      app: "system",
      response: "Volume decreased",
      speechText: "Volume decreased"
    };
  }

  if (text.includes("increase brightness") || text.includes("brightness up")) {
    return {
      action: "BRIGHTNESS_UP",
      app: "system",
      response: "Brightness increased",
      speechText: "Brightness increased"
    };
  }

  if (text.includes("decrease brightness") || text.includes("brightness down")) {
    return {
      action: "BRIGHTNESS_DOWN",
      app: "system",
      response: "Brightness decreased",
      speechText: "Brightness decreased"
    };
  }

  if (text === "open wifi settings" || text.includes("wifi settings")) {
    const perm = checkPermission("settings");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };
    return {
      action: "OPEN_WIFI",
      app: "settings",
      response: "Opening Wi-Fi settings",
      speechText: "Opening Wi-Fi settings"
    };
  }

  if (text === "open bluetooth settings" || text.includes("bluetooth settings")) {
    const perm = checkPermission("settings");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };
    return {
      action: "OPEN_BLUETOOTH",
      app: "settings",
      response: "Opening Bluetooth settings",
      speechText: "Opening Bluetooth settings"
    };
  }

  if (isAppOpenIntent(text, "settings")) {
    const perm = checkPermission("settings");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };
    return {
      action: "OPEN_APP",
      app: "settings",
      response: "Settings is open",
      speechText: "Settings is open"
    };
  }

  // 2. APP LAUNCHERS
  if (isAppOpenIntent(text, "youtube")) {
    const perm = checkPermission("youtube");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };
    return {
      action: "OPEN_APP",
      app: "youtube",
      response: "YouTube is open",
      speechText: "YouTube is open"
    };
  }

  if (isAppOpenIntent(text, "chrome")) {
    const perm = checkPermission("chrome");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };
    return {
      action: "OPEN_APP",
      app: "chrome",
      response: "Chrome is open",
      speechText: "Chrome is open"
    };
  }

  if (isAppOpenIntent(text, "whatsapp")) {
    const perm = checkPermission("whatsapp");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };
    return {
      action: "OPEN_APP",
      app: "whatsapp",
      response: "WhatsApp is open",
      speechText: "WhatsApp is open"
    };
  }

  if (isAppOpenIntent(text, "gallery")) {
    const perm = checkPermission("gallery");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };
    return {
      action: "OPEN_APP",
      app: "gallery",
      response: "Gallery is open",
      speechText: "Gallery is open"
    };
  }

  if (isAppOpenIntent(text, "maps")) {
    const perm = checkPermission("maps");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };
    return {
      action: "OPEN_APP",
      app: "maps",
      response: "Maps is open",
      speechText: "Maps is open"
    };
  }

  // 3. APP SPECIFIC ACTIONS (Accessibility triggers)
  
  // YOUTUBE
  if (activeApp === "youtube" || text.includes("youtube")) {
    const perm = checkPermission("youtube");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };

    if (text.startsWith("search ")) {
      const query = rawText.substring(7).trim(); // Extract query case-sensitively
      return {
        action: "YT_SEARCH",
        app: "youtube",
        payload: query,
        response: `Searching YouTube for "${query}"`,
        speechText: `Searching YouTube for ${query}`
      };
    }
    if (text.includes("play the first video") || text.includes("play video")) {
      return {
        action: "YT_PLAY_FIRST",
        app: "youtube",
        response: "Playing the first video",
        speechText: "Playing the first video"
      };
    }
    if (text === "pause" || text === "pause video" || text === "stop video") {
      return {
        action: "YT_PAUSE",
        app: "youtube",
        response: "Video paused",
        speechText: "Video paused"
      };
    }
    if (text === "scroll down") {
      return {
        action: "SCROLL_DOWN",
        app: "youtube",
        response: "Scrolling down",
        speechText: "Scrolling down"
      };
    }
  }

  // CHROME
  if (activeApp === "chrome" || text.includes("chrome")) {
    const perm = checkPermission("chrome");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };

    if (text.startsWith("search google for ")) {
      const query = rawText.substring(18).trim();
      return {
        action: "CHROME_SEARCH",
        app: "chrome",
        payload: query,
        response: `Searching Google for "${query}"`,
        speechText: `Searching Google for ${query}`
      };
    }
    if (text.includes("open this website") || text.includes("open website")) {
      return {
        action: "CHROME_OPEN_SITE",
        app: "chrome",
        response: "Opening the website",
        speechText: "Opening the website"
      };
    }
    if (text === "go back" || text === "back") {
      return {
        action: "CHROME_BACK",
        app: "chrome",
        response: "Going back",
        speechText: "Going back"
      };
    }
  }

  // WHATSAPP
  if (activeApp === "whatsapp" || text.includes("whatsapp")) {
    const perm = checkPermission("whatsapp");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };

    if (text.includes("open a chat") || text.includes("open chat")) {
      return {
        action: "WA_OPEN_CHAT",
        app: "whatsapp",
        response: "Opening chat with John",
        speechText: "Opening chat with John"
      };
    }
    if (text.startsWith("type ")) {
      const msg = rawText.substring(5).trim();
      return {
        action: "WA_TYPE",
        app: "whatsapp",
        payload: msg,
        response: `Typed "${msg}"`,
        speechText: `Typed ${msg}`
      };
    }
    if (text === "send the message" || text === "send message" || text === "send") {
      return {
        action: "WA_SEND",
        app: "whatsapp",
        response: "Message sent",
        speechText: "Message sent"
      };
    }
  }

  // GALLERY
  if (activeApp === "gallery" || text.includes("gallery")) {
    const perm = checkPermission("gallery");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };

    if (text.includes("open the latest photo") || text.includes("open latest photo") || text.includes("open photo")) {
      return {
        action: "GALLERY_OPEN_LATEST",
        app: "gallery",
        response: "Opening latest photo",
        speechText: "Opening latest photo"
      };
    }
    if (text === "scroll down") {
      return {
        action: "SCROLL_DOWN",
        app: "gallery",
        response: "Scrolling down Gallery",
        speechText: "Scrolling down Gallery"
      };
    }
  }

  // MAPS
  if (activeApp === "maps" || text.includes("maps")) {
    const perm = checkPermission("maps");
    if (perm.error) return { action: "PERMISSION_DENIED", app: "system", ...perm };

    if (text.startsWith("search ")) {
      const destination = rawText.substring(7).trim();
      return {
        action: "MAPS_SEARCH",
        app: "maps",
        payload: destination,
        response: `Searching for "${destination}" on Maps`,
        speechText: `Searching for ${destination} on Maps`
      };
    }
    if (text.includes("start navigation") || text.includes("navigate")) {
      return {
        action: "MAPS_NAVIGATE",
        app: "maps",
        response: "Starting navigation",
        speechText: "Starting navigation"
      };
    }
  }

  // HOME SCREEN (Go back to home)
  if (text === "go home" || text === "open home" || text === "close app") {
    return {
      action: "GO_HOME",
      app: "home",
      response: "Returned to Home screen",
      speechText: "Returned to Home screen"
    };
  }

  // Default / Command not understood
  return {
    action: "UNKNOWN",
    app: "system",
    response: "I didn't quite catch that. Try saying 'Open YouTube' or 'Increase volume'.",
    speechText: "I didn't quite catch that"
  };
};

/**
 * Clean voice output text for Speech Synthesis.
 * Strips punctuation to optimize raw text speech flow as requested:
 * e.g., "Done! Volume increased." -> "Done Volume increased"
 */
export const cleanSpeechResponse = (text) => {
  if (!text) return "";
  return text
    .replace(/[!,./;:?]/g, "") // remove punctuation
    .replace(/\s+/g, " ")       // normalize spacing
    .trim();
};
