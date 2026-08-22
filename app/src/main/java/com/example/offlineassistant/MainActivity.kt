package com.example.offlineassistant

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.Settings
import android.text.TextUtils
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private val RECORD_AUDIO_REQUEST_CODE = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnMic = findViewById<Button>(R.id.btn_mic_permission)
        val btnAccessibility = findViewById<Button>(R.id.btn_accessibility_permission)

        // Mic permission handler
        btnMic.setOnClickListener {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.RECORD_AUDIO),
                    RECORD_AUDIO_REQUEST_CODE
                )
            } else {
                Toast.makeText(this, "Microphone permission already granted!", Toast.LENGTH_SHORT).show()
            }
        }

        // Accessibility service redirect handler
        btnAccessibility.setOnClickListener {
            if (!isAccessibilityServiceEnabled()) {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                startActivity(intent)
                Toast.makeText(this, "Find 'Offline Assistant Service' and turn it ON", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(this, "Accessibility Service is already running!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        updateButtonStates()
    }

    private fun updateButtonStates() {
        val btnMic = findViewById<Button>(R.id.btn_mic_permission)
        val btnAccessibility = findViewById<Button>(R.id.btn_accessibility_permission)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            btnMic.text = "Mic Permission: GRANTED"
            btnMic.isEnabled = false
        } else {
            btnMic.text = "Grant Mic Permission"
            btnMic.isEnabled = true
        }

        if (isAccessibilityServiceEnabled()) {
            btnAccessibility.text = "Service: ACTIVE"
            btnAccessibility.isEnabled = false
        } else {
            btnAccessibility.text = "Enable Accessibility Service"
            btnAccessibility.isEnabled = true
        }
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        val expectedComponentName = ComponentName(this, AssistantAccessibilityService::class.java)
        val enabledServicesSetting = Settings.Secure.getString(
            contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        
        val colonSplitter = TextUtils.SimpleStringSplitter(':')
        colonSplitter.setString(enabledServicesSetting)
        while (colonSplitter.hasNext()) {
            val componentNameString = colonSplitter.next()
            val enabledService = ComponentName.unflattenFromString(componentNameString)
            if (enabledService != null && enabledService == expectedComponentName) {
                return true
            }
        }
        return false
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == RECORD_AUDIO_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "Microphone Access Granted!", Toast.LENGTH_SHORT).show()
                updateButtonStates()
            } else {
                Toast.makeText(this, "Microphone Access Denied. Voice activation will not work.", Toast.LENGTH_LONG).show()
            }
        }
    }
}
