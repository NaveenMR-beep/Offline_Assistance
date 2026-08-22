package com.example.offlineassistant

data class CommandResult(
    val action: String,
    val targetApp: String,
    val payload: String = "",
    val response: String,
    val cleanResponse: String
)

object CommandParser {
    
    private fun isAppOpenIntent(input: String, appName: String): Boolean {
        val keywords = listOf("open", "launch", "start", "run", "go to", "show")
        val hasKeyword = keywords.any { input.contains(it) }
        if (!hasKeyword) return false
        
        return when (appName) {
            "youtube" -> input.contains("youtube") || input.contains("yt")
            "chrome" -> input.contains("chrome") || input.contains("browser") || input.contains("internet")
            "whatsapp" -> input.contains("whatsapp")
            "gallery" -> input.contains("gallery") || input.contains("photo") || input.contains("image") || input.contains("photos")
            "maps" -> input.contains("maps") || input.contains("map")
            "settings" -> input.contains("settings") || input.contains("setting")
            else -> input.contains(appName)
        }
    }

    fun parse(rawText: String, activeApp: String): CommandResult {
        // Normalize spacing variations
        val text = rawText.lowercase().trim()
            .replace(Regex("you\\s+tube"), "youtube")
            .replace(Regex("whats\\s+app"), "whatsapp")
            .replace(Regex("what\\s+app"), "whatsapp")
            .replace(Regex("wi\\s+fi"), "wifi")
            .replace(Regex("wi-\\s*fi"), "wifi")
            .replace(Regex("blue\\s+tooth"), "bluetooth")
            .replace(Regex("google\\s+maps"), "maps")
            .replace(Regex("google\\s+chrome"), "chrome")

        // 1. SYSTEM CONTROLS
        if (text.contains("increase volume") || text.contains("volume up")) {
            return CommandResult("VOLUME_UP", "system", "", "Volume increased", "Volume increased")
        }
        if (text.contains("decrease volume") || text.contains("volume down")) {
            return CommandResult("VOLUME_DOWN", "system", "", "Volume decreased", "Volume decreased")
        }
        if (text.contains("increase brightness") || text.contains("brightness up")) {
            return CommandResult("BRIGHTNESS_UP", "system", "", "Brightness increased", "Brightness increased")
        }
        if (text.contains("decrease brightness") || text.contains("brightness down")) {
            return CommandResult("BRIGHTNESS_DOWN", "system", "", "Brightness decreased", "Brightness decreased")
        }
        if (text == "open wifi settings" || text.contains("wifi settings")) {
            return CommandResult("OPEN_WIFI", "settings", "", "Opening Wi-Fi settings", "Opening Wi-Fi settings")
        }
        if (text == "open bluetooth settings" || text.contains("bluetooth settings")) {
            return CommandResult("OPEN_BLUETOOTH", "settings", "", "Opening Bluetooth settings", "Opening Bluetooth settings")
        }

        // 2. APP LAUNCHERS
        if (isAppOpenIntent(text, "youtube")) {
            return CommandResult("OPEN_APP", "youtube", "com.google.android.youtube", "YouTube is open", "YouTube is open")
        }
        if (isAppOpenIntent(text, "chrome")) {
            return CommandResult("OPEN_APP", "chrome", "com.android.chrome", "Chrome is open", "Chrome is open")
        }
        if (isAppOpenIntent(text, "whatsapp")) {
            return CommandResult("OPEN_APP", "whatsapp", "com.whatsapp", "WhatsApp is open", "WhatsApp is open")
        }
        if (isAppOpenIntent(text, "gallery")) {
            return CommandResult("OPEN_APP", "gallery", "com.google.android.apps.photos", "Gallery is open", "Gallery is open")
        }
        if (isAppOpenIntent(text, "maps")) {
            return CommandResult("OPEN_APP", "maps", "com.google.android.apps.maps", "Maps is open", "Maps is open")
        }
        if (isAppOpenIntent(text, "settings")) {
            return CommandResult("OPEN_APP", "settings", "com.android.settings", "Settings is open", "Settings is open")
        }

        // 3. APP SPECIFIC ACTIONS

        // YOUTUBE
        if (activeApp.contains("youtube") || text.contains("youtube")) {
            if (text.startsWith("search ")) {
                val query = rawText.substring(7).trim()
                return CommandResult("YT_SEARCH", "youtube", query, "Searching YouTube for $query", "Searching YouTube for $query")
            }
            if (text.contains("play the first video") || text.contains("play video") || text.contains("play first")) {
                return CommandResult("YT_PLAY_FIRST", "youtube", "", "Playing the first video", "Playing the first video")
            }
            if (text == "pause" || text == "pause video" || text == "stop video" || text == "play") {
                return CommandResult("YT_PAUSE", "youtube", "", "Done", "Done")
            }
            if (text == "scroll down") {
                return CommandResult("SCROLL_DOWN", "youtube", "", "Scrolling down", "Scrolling down")
            }
        }

        // CHROME
        if (activeApp.contains("chrome") || text.contains("chrome")) {
            if (text.startsWith("search google for ")) {
                val query = rawText.substring(18).trim()
                return CommandResult("CHROME_SEARCH", "chrome", query, "Searching Google for $query", "Searching Google for $query")
            }
            if (text.contains("open this website") || text.contains("open website")) {
                return CommandResult("CHROME_OPEN_SITE", "chrome", "", "Opening the website", "Opening the website")
            }
            if (text == "go back" || text == "back") {
                return CommandResult("CHROME_BACK", "chrome", "", "Going back", "Going back")
            }
        }

        // WHATSAPP
        if (activeApp.contains("whatsapp") || text.contains("whatsapp")) {
            if (text.contains("open a chat") || text.contains("open chat")) {
                return CommandResult("WA_OPEN_CHAT", "whatsapp", "", "Opening chat", "Opening chat")
            }
            if (text.startsWith("type ")) {
                val msg = rawText.substring(5).trim()
                return CommandResult("WA_TYPE", "whatsapp", msg, "Typed $msg", "Typed $msg")
            }
            if (text == "send the message" || text == "send message" || text == "send") {
                return CommandResult("WA_SEND", "whatsapp", "", "Message sent", "Message sent")
            }
        }

        // GALLERY
        if (activeApp.contains("gallery") || activeApp.contains("photos") || text.contains("gallery")) {
            if (text.contains("open the latest photo") || text.contains("open latest photo") || text.contains("open photo")) {
                return CommandResult("GALLERY_OPEN_LATEST", "gallery", "", "Opening latest photo", "Opening latest photo")
            }
            if (text == "scroll down") {
                return CommandResult("SCROLL_DOWN", "gallery", "", "Scrolling down", "Scrolling down")
            }
        }

        // MAPS
        if (activeApp.contains("maps") || text.contains("maps")) {
            if (text.startsWith("search ")) {
                val dest = rawText.substring(7).trim()
                return CommandResult("MAPS_SEARCH", "maps", dest, "Searching for $dest on Maps", "Searching for $dest on Maps")
            }
            if (text.contains("start navigation") || text.contains("navigate")) {
                return CommandResult("MAPS_NAVIGATE", "maps", "", "Starting navigation", "Starting navigation")
            }
        }

        if (text == "go home" || text == "open home" || text == "close app") {
            return CommandResult("GO_HOME", "home", "", "Returned to Home screen", "Returned to Home screen")
        }

        return CommandResult("UNKNOWN", "system", "", "I didn't quite catch that", "I didnt quite catch that")
    }
}
