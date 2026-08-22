package com.example.offlineassistant

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.content.Context
import android.content.Intent
import android.graphics.Path
import android.media.AudioManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast
import java.util.Locale

class AssistantAccessibilityService : AccessibilityService(), TextToSpeech.OnInitListener {

    private lateinit var tts: TextToSpeech
    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false
    private var currentActivePackage = "home"
    private lateinit var audioManager: AudioManager

    override fun onServiceConnected() {
        super.onServiceConnected()
        // Initialize TTS offline
        tts = TextToSpeech(this, this)
        audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        setupSpeechRecognizer()
        
        Toast.makeText(this, "Offline Assistant Service Connected!", Toast.LENGTH_SHORT).show()
        speak("Assistant service is active and ready")
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.US
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Track the current active app package
        val packageName = event.packageName?.toString() ?: ""
        if (packageName.isNotEmpty() && !packageName.contains("com.example.offlineassistant")) {
            currentActivePackage = packageName
        }
    }

    override fun onInterrupt() {
        if (this::tts.isInitialized) {
            tts.stop()
        }
    }

    // Trigger Speech Recognition on hardware Volume Down key press
    override fun onKeyEvent(event: KeyEvent): Boolean {
        val keyCode = event.keyCode
        val action = event.action

        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN && action == KeyEvent.ACTION_DOWN) {
            if (!isListening) {
                startSpeechListening()
                return true // Consume key press to trigger assistant
            }
        }
        return super.onKeyEvent(event)
    }

    private fun setupSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
            speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    isListening = true
                    Toast.makeText(this@AssistantAccessibilityService, "Listening...", Toast.LENGTH_SHORT).show()
                }

                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {
                    isListening = false
                }

                override fun onError(error: Int) {
                    isListening = false
                    val errorMsg = when (error) {
                        SpeechRecognizer.ERROR_NO_MATCH -> "No speech matched"
                        SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                        else -> "Speech recognition failed locally"
                    }
                    Toast.makeText(this@AssistantAccessibilityService, errorMsg, Toast.LENGTH_SHORT).show()
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        val voiceCommand = matches[0]
                        Toast.makeText(this@AssistantAccessibilityService, "Voice: $voiceCommand", Toast.LENGTH_LONG).show()
                        processVoiceCommand(voiceCommand)
                    }
                }

                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }
    }

    private fun startSpeechListening() {
        if (speechRecognizer == null) {
            setupSpeechRecognizer()
        }
        
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        speechRecognizer?.startListening(intent)
    }

    private fun processVoiceCommand(command: String) {
        val result = CommandParser.parse(command, currentActivePackage)
        speak(result.cleanResponse)

        when (result.action) {
            "VOLUME_UP" -> {
                audioManager.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_RAISE, AudioManager.FLAG_SHOW_UI)
            }
            "VOLUME_DOWN" -> {
                audioManager.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_LOWER, AudioManager.FLAG_SHOW_UI)
            }
            "OPEN_APP" -> {
                launchApp(result.payload)
            }
            "GO_HOME" -> {
                performGlobalAction(GLOBAL_ACTION_HOME)
            }
            "SCROLL_DOWN" -> {
                performScrollDown()
            }
            "YT_SEARCH", "CHROME_SEARCH", "MAPS_SEARCH" -> {
                automateSearchFlow(result.payload)
            }
            "WA_TYPE" -> {
                automateTypeFlow(result.payload)
            }
            "WA_SEND" -> {
                automateSendFlow()
            }
            "YT_PLAY_FIRST", "GALLERY_OPEN_LATEST", "CHROME_OPEN_SITE", "MAPS_NAVIGATE" -> {
                clickFirstVisibleElement()
            }
            "CHROME_BACK" -> {
                performGlobalAction(GLOBAL_ACTION_BACK)
            }
        }
    }

    private fun speak(text: String) {
        if (this::tts.isInitialized) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "OFFLINE_RESPONSE")
        }
    }

    private fun launchApp(packageName: String) {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(launchIntent)
        } else {
            Toast.makeText(this, "App package not installed: $packageName", Toast.LENGTH_SHORT).show()
        }
    }

    // ACCESSIBILITY AUTOMATION ENGINES

    private fun performScrollDown() {
        val rootNode = rootInActiveWindow ?: return
        val scrollableNode = findScrollableNode(rootNode)
        scrollableNode?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)
        scrollableNode?.recycle()
        rootNode.recycle()
    }

    private fun findScrollableNode(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (node.isScrollable) {
            return node
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val found = findScrollableNode(child)
            if (found != null) return found
        }
        return null
    }

    private fun automateSearchFlow(query: String) {
        val rootNode = rootInActiveWindow ?: return
        
        // 1. Search for edit fields / search inputs
        val editNode = findInputNode(rootNode)
        if (editNode != null) {
            val arguments = Bundle()
            arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, query)
            editNode.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
            
            // 2. Perform Search click trigger
            editNode.performAction(AccessibilityNodeInfo.ACTION_FOCUS)
            // Simulates clicking search key
            performSearchClickOnKeyboard()
            editNode.recycle()
        } else {
            Toast.makeText(this, "Search input field not found on screen", Toast.LENGTH_SHORT).show()
        }
        rootNode.recycle()
    }

    private fun findInputNode(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (node.className == "android.widget.EditText" || node.isEditable) {
            return node
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val found = findInputNode(child)
            if (found != null) return found
        }
        return null
    }

    private fun automateTypeFlow(text: String) {
        val rootNode = rootInActiveWindow ?: return
        val editNode = findInputNode(rootNode)
        if (editNode != null) {
            val arguments = Bundle()
            arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
            editNode.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
            editNode.recycle()
        }
        rootNode.recycle()
    }

    private fun automateSendFlow() {
        val rootNode = rootInActiveWindow ?: return
        // Try finding a button with text like "Send" or commonly used Send button view IDs
        val sendNode = findSendButton(rootNode)
        if (sendNode != null) {
            sendNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            sendNode.recycle()
        } else {
            // Fallback gesture click on bottom right (where keyboard send button resides)
            simulateTapGesture(950f, 2100f)
        }
        rootNode.recycle()
    }

    private fun findSendButton(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (node.className == "android.widget.Button" && 
            (node.text?.toString()?.lowercase()?.contains("send") == true || 
             node.contentDescription?.toString()?.lowercase()?.contains("send") == true)) {
            return node
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val found = findSendButton(child)
            if (found != null) return found
        }
        return null
    }

    private fun clickFirstVisibleElement() {
        val rootNode = rootInActiveWindow ?: return
        // Clicks first clickable element on the center screen area
        val clickableNode = findFirstClickableItem(rootNode)
        clickableNode?.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        clickableNode?.recycle()
        rootNode.recycle()
    }

    private fun findFirstClickableItem(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (node.isClickable && node.className != "android.widget.EditText" && node.isVisibleToUser) {
            return node
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val found = findFirstClickableItem(child)
            if (found != null) return found
        }
        return null
    }

    private fun performSearchClickOnKeyboard() {
        // Simulates enter key press gesture
        simulateTapGesture(980f, 2150f)
    }

    private fun simulateTapGesture(x: Float, y: Float) {
        val path = Path().apply { moveTo(x, y) }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 100))
            .build()
        dispatchGesture(gesture, null, null)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (this::tts.isInitialized) {
            tts.shutdown()
        }
        speechRecognizer?.destroy()
    }
}
