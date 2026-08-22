import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Play, Send, Sparkles, RefreshCw, Terminal, Volume2, 
  HelpCircle, Trash2, ShieldCheck, Check, Cpu, Info, Smartphone 
} from "lucide-react";
import { parseCommand, cleanSpeechResponse } from "./utils/CommandParser";
import PermissionsScreen from "./components/PermissionsScreen";
import PhoneSimulator from "./components/PhoneSimulator";
import PipelineVisualizer from "./components/PipelineVisualizer";
import MemoryManager from "./components/MemoryManager";

export default function App() {
  // 1. Assistant State Settings & Permissions
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem("offline_assistant_perms");
    return saved ? JSON.parse(saved) : {
      accessibility: true,
      microphone: true,
      notifications: true,
      overlay: true,
      apps: {
        youtube: true,
        chrome: true,
        whatsapp: true,
        gallery: true,
        settings: true,
        maps: true
      }
    };
  });

  // 2. Simulator System States
  const [activeApp, setActiveApp] = useState("home");
  const [volume, setVolume] = useState(0.5);
  const [brightness, setBrightness] = useState(0.85);
  const [systemSettings, setSystemSettings] = useState({ wifi: true, bluetooth: false });
  const [showVolumeOverlay, setShowVolumeOverlay] = useState(false);
  const [showBrightnessOverlay, setShowBrightnessOverlay] = useState(false);

  // App-Specific States
  const [ytQuery, setYtQuery] = useState("");
  const [ytPlaying, setYtPlaying] = useState(false);
  const [chromeQuery, setChromeQuery] = useState("");
  const [chromeSiteOpened, setChromeSiteOpened] = useState(false);
  const [waDraft, setWaDraft] = useState("");
  const [waMessages, setWaMessages] = useState(["Hey, did you get the offline files ready?"]);
  const [galleryLatestOpened, setGalleryLatestOpened] = useState(false);
  const [mapsQuery, setMapsQuery] = useState("");
  const [mapsNavigating, setMapsNavigating] = useState(false);
  const [phoneScrollPosition, setPhoneScrollPosition] = useState(0);

  // 3. Voice & Offline Processing States
  const [commandText, setCommandText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStage, setCurrentStage] = useState("idle");
  const [consoleLogs, setConsoleLogs] = useState([
    { id: 1, type: "system", text: "Offline Assistant Local Engine Initialized." },
    { id: 2, type: "system", text: "SQLite Database loaded with local modules." }
  ]);
  const [memory, setMemory] = useState(() => {
    const saved = localStorage.getItem("offline_assistant_memory");
    return saved ? JSON.parse(saved) : [
      { id: 1, app: "youtube", topic: "Programming", value: "Python tutorials for absolute beginners", timestamp: Date.now() - 3600000 },
      { id: 2, app: "chrome", topic: "Search Query", value: "Vite + React local offline setup", timestamp: Date.now() - 1800000 }
    ];
  });

  // Speech Recognition Instantiation
  const recognitionRef = useRef(null);
  const volumeTimer = useRef(null);
  const brightnessTimer = useRef(null);

  // Save state helpers
  useEffect(() => {
    localStorage.setItem("offline_assistant_perms", JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem("offline_assistant_memory", JSON.stringify(memory));
  }, [memory]);

  // Initializing Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setCurrentStage("input");
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        addLog("input", `Speech Recognized: "${transcript}"`);
        setCommandText(transcript);
        handleExecuteCommand(transcript);
      };

      rec.onerror = (e) => {
        addLog("error", `Voice recognition error: ${e.error}`);
        setIsListening(false);
        setCurrentStage("idle");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [permissions]);

  // Logs addition helper
  const addLog = (type, text) => {
    setConsoleLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, type, text }
    ]);
  };

  // Add memory database record
  const addMemoryRecord = (app, topic, value) => {
    const newRecord = {
      id: `${Date.now()}-${Math.random()}`,
      app,
      topic,
      value,
      timestamp: Date.now()
    };
    setMemory((prev) => [newRecord, ...prev]);
    addLog("db", `Stored DB Record: Topic [${topic}] -> Value [${value}]`);
  };

  // Clear memory functions
  const clearAllMemory = () => {
    setMemory([]);
    addLog("db", "Cleared all on-device memory store.");
  };

  const deleteMemoryItem = (id) => {
    setMemory((prev) => prev.filter(item => item.id !== id));
    addLog("db", `Removed database record id: ${id}`);
  };

  // Voice recognition triggers
  const startVoiceInput = () => {
    if (!permissions.microphone) {
      addLog("error", "Microphone permission is currently disabled.");
      speakResponse("Microphone permission is disabled");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition already running or starting
      }
    } else {
      addLog("error", "Web Speech recognition is not supported in this browser. Please type commands instead.");
      speakResponse("Speech recognition not supported in browser");
    }
  };

  // Simulated Text-to-Speech Output
  const speakResponse = (text) => {
    if ("speechSynthesis" in window) {
      // Clear ongoing speech
      window.speechSynthesis.cancel();
      
      const cleaned = cleanSpeechResponse(text);
      addLog("clean", `Speech output cleaned: "${cleaned}"`);
      setCurrentStage("tts");
      
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentStage("idle");
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentStage("idle");
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      addLog("system", `TTS speak simulated: "${text}"`);
      setCurrentStage("idle");
    }
  };

  // Execute logic from CommandParser results
  const handleExecuteCommand = async (rawText) => {
    setCommandText(rawText);
    setCurrentStage("stt");

    // Micro-delay to simulate Speech recognition pipeline processing
    await new Promise(r => setTimeout(r, 600));

    setCurrentStage("parse");
    await new Promise(r => setTimeout(r, 450));

    const result = parseCommand(rawText, permissions, activeApp);
    addLog("engine", `Parsed Command: ${result.action} for ${result.app}`);

    if (result.action === "PERMISSION_DENIED") {
      setCurrentStage("execute");
      addLog("error", `Action blocked: ${result.response}`);
      speakResponse(result.response);
      return;
    }

    setCurrentStage("execute");
    await new Promise(r => setTimeout(r, 500));

    // Handle parsed actions
    switch (result.action) {
      case "VOLUME_UP":
        setVolume((v) => {
          const next = Math.min(v + 0.15, 1);
          return parseFloat(next.toFixed(2));
        });
        triggerVolumeHUD();
        break;
      case "VOLUME_DOWN":
        setVolume((v) => {
          const next = Math.max(v - 0.15, 0);
          return parseFloat(next.toFixed(2));
        });
        triggerVolumeHUD();
        break;
      case "BRIGHTNESS_UP":
        setBrightness((b) => {
          const next = Math.min(b + 0.15, 1);
          return parseFloat(next.toFixed(2));
        });
        triggerBrightnessHUD();
        break;
      case "BRIGHTNESS_DOWN":
        setBrightness((b) => {
          const next = Math.max(b - 0.15, 0.05);
          return parseFloat(next.toFixed(2));
        });
        triggerBrightnessHUD();
        break;
      case "OPEN_WIFI":
        setActiveApp("settings");
        setSystemSettings((p) => ({ ...p, wifi: true }));
        break;
      case "OPEN_BLUETOOTH":
        setActiveApp("settings");
        setSystemSettings((p) => ({ ...p, bluetooth: true }));
        break;
      case "OPEN_APP":
        setActiveApp(result.app);
        break;
      case "GO_HOME":
        setActiveApp("home");
        break;
      
      // YT commands
      case "YT_SEARCH":
        setActiveApp("youtube");
        setYtQuery(result.payload);
        setYtPlaying(false);
        addMemoryRecord("youtube", "Search Topic", result.payload);
        break;
      case "YT_PLAY_FIRST":
        setActiveApp("youtube");
        setYtPlaying(true);
        addMemoryRecord("youtube", "Played Video", ytQuery || "Python Tutorial");
        break;
      case "YT_PAUSE":
        setYtPlaying(false);
        break;
      case "SCROLL_DOWN":
        setPhoneScrollPosition((p) => p + 180);
        break;

      // Chrome commands
      case "CHROME_SEARCH":
        setActiveApp("chrome");
        setChromeQuery(result.payload);
        setChromeSiteOpened(false);
        addMemoryRecord("chrome", "Web Query", result.payload);
        break;
      case "CHROME_OPEN_SITE":
        setActiveApp("chrome");
        setChromeSiteOpened(true);
        addMemoryRecord("chrome", "Visited Site", "https://python.org/getting-started");
        break;
      case "CHROME_BACK":
        setChromeSiteOpened(false);
        break;

      // WhatsApp commands
      case "WA_OPEN_CHAT":
        setActiveApp("whatsapp");
        setWaDraft("");
        break;
      case "WA_TYPE":
        setActiveApp("whatsapp");
        setWaDraft(result.payload);
        break;
      case "WA_SEND":
        setActiveApp("whatsapp");
        if (waDraft.trim()) {
          setWaMessages((prev) => [...prev, waDraft]);
          addMemoryRecord("whatsapp", "Chat Message Sent", waDraft);
          setWaDraft("");
        }
        break;

      // Gallery commands
      case "GALLERY_OPEN_LATEST":
        setActiveApp("gallery");
        setGalleryLatestOpened(true);
        break;

      // Maps commands
      case "MAPS_SEARCH":
        setActiveApp("maps");
        setMapsQuery(result.payload);
        setMapsNavigating(false);
        addMemoryRecord("maps", "Destination Search", result.payload);
        break;
      case "MAPS_NAVIGATE":
        setActiveApp("maps");
        setMapsNavigating(true);
        addMemoryRecord("maps", "Active Navigation Route", mapsQuery || "Mysore");
        break;
      
      default:
        break;
    }

    addLog("system", `System executed: ${result.response}`);
    speakResponse(result.response);
  };

  // UI helpers for sliders
  const triggerVolumeHUD = () => {
    setShowVolumeOverlay(true);
    if (volumeTimer.current) clearTimeout(volumeTimer.current);
    volumeTimer.current = setTimeout(() => {
      setShowVolumeOverlay(false);
    }, 2000);
  };

  const triggerBrightnessHUD = () => {
    setShowBrightnessOverlay(true);
    if (brightnessTimer.current) clearTimeout(brightnessTimer.current);
    brightnessTimer.current = setTimeout(() => {
      setShowBrightnessOverlay(false);
    }, 2000);
  };

  // Mock application clicks on the phone screen
  const handleAppMockAction = (type) => {
    switch (type) {
      case "youtube":
        setActiveApp("youtube");
        break;
      case "youtube_play":
        setYtPlaying(true);
        addMemoryRecord("youtube", "Played Video", ytQuery || "Python Tutorial");
        break;
      case "youtube_stop":
        setYtPlaying(false);
        break;
      case "chrome":
        setActiveApp("chrome");
        break;
      case "chrome_search_python":
        setChromeQuery("Python");
        setChromeSiteOpened(false);
        break;
      case "chrome_open_site":
        setChromeSiteOpened(true);
        break;
      case "chrome_back":
        setChromeSiteOpened(false);
        break;
      case "whatsapp":
        setActiveApp("whatsapp");
        setWaMessages(["Hey, did you get the offline files ready?"]);
        break;
      case "whatsapp_chat":
        // open mock chat detail
        setWaMessages(["Hey, did you get the offline files ready?"]);
        setWaDraft("");
        break;
      case "whatsapp_send":
        if (waDraft.trim()) {
          setWaMessages((prev) => [...prev, waDraft]);
          addMemoryRecord("whatsapp", "Chat Message Sent", waDraft);
          setWaDraft("");
        }
        break;
      case "gallery":
        setActiveApp("gallery");
        setGalleryLatestOpened(false);
        break;
      case "gallery_photo":
        setGalleryLatestOpened(true);
        break;
      case "maps":
        setActiveApp("maps");
        break;
      case "maps_navigate":
        setMapsNavigating(true);
        addMemoryRecord("maps", "Active Navigation Route", mapsQuery || "Mysore");
        break;
      case "settings":
        setActiveApp("settings");
        break;
      default:
        break;
    }
  };

  const exampleCommands = [
    { title: "Open YouTube", query: "Open YouTube" },
    { title: "Search Python on YT", query: "Search Python tutorial" },
    { title: "Play first video", query: "Play the first video" },
    { title: "Increase Volume", query: "Increase volume" },
    { title: "Open settings", query: "Open settings" },
    { title: "Open Chrome", query: "Open Chrome" },
    { title: "Search Google for Python", query: "Search Google for Python" },
    { title: "Open Website", query: "Open this website" },
    { title: "Open WhatsApp", query: "Open WhatsApp" },
    { title: "Open Chat", query: "Open a chat" },
    { title: "Type hello", query: "Type hello" },
    { title: "Send Message", query: "Send the message" },
    { title: "Open Maps", query: "Open Maps" },
    { title: "Search Mysore", query: "Search Mysore" },
    { title: "Start navigation", query: "Start navigation" }
  ];

  return (
    <main className="app-container">
      {/* Header */}
      <header className="main-header glass-card">
        <div className="logo-wrapper">
          <div className="logo-badge">Offline</div>
          <h1>Phone Assistant Simulator</h1>
        </div>
        <div className="status-indicator">
          <div className="status-dot animate-pulse" />
          <span>Local Engine Active (No Server)</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="main-layout-grid">
        
        {/* Left Panel: Dashboards & Logic visualizers */}
        <section className="left-panel flex flex-col gap-6">
          
          {/* Permissions */}
          <PermissionsScreen 
            permissions={permissions} 
            setPermissions={setPermissions} 
          />

          {/* Pipeline */}
          <PipelineVisualizer currentStage={currentStage} />

          {/* Database Memory DB */}
          <MemoryManager 
            memory={memory} 
            clearAllMemory={clearAllMemory} 
            deleteMemoryItem={deleteMemoryItem} 
          />

          {/* Console / Engine Logs */}
          <div className="glass-card console-card flex-1">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="header-icon text-accent" />
                <h2>Local Console & DB Logs</h2>
              </div>
              <button className="btn btn-muted-text flex items-center gap-1 text-xs" onClick={() => setConsoleLogs([])}>
                <Trash2 size={12} /> Clear
              </button>
            </div>
            <div className="console-wrapper">
              <div className="console-lines">
                {consoleLogs.map((log) => (
                  <div key={log.id} className={`console-line console-${log.type}`}>
                    <span className="console-prompt">&gt;</span>
                    <span className="console-text">{log.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: The Phone simulator & Voice trigger controls */}
        <section className="right-panel flex flex-col items-center gap-6 justify-center">
          
          {/* Phone Frame */}
          <PhoneSimulator 
            activeApp={activeApp}
            setActiveApp={setActiveApp}
            volume={volume}
            brightness={brightness}
            systemSettings={systemSettings}
            setSystemSettings={setSystemSettings}
            ytQuery={ytQuery}
            ytPlaying={ytPlaying}
            chromeQuery={chromeQuery}
            chromeSiteOpened={chromeSiteOpened}
            waDraft={waDraft}
            waMessages={waMessages}
            galleryLatestOpened={galleryLatestOpened}
            mapsQuery={mapsQuery}
            mapsNavigating={mapsNavigating}
            phoneScrollPosition={phoneScrollPosition}
            showVolumeOverlay={showVolumeOverlay}
            showBrightnessOverlay={showBrightnessOverlay}
            onAppClick={handleAppMockAction}
          />

          {/* Speech Control Dashboard */}
          <div className="glass-card speech-controller-card w-full max-w-[380px]">
            {/* Visualizer Waveform */}
            <div className={`voice-waveform-container ${isListening ? "listening" : ""} ${isSpeaking ? "speaking" : ""}`}>
              <div className="wave-bar w-1" />
              <div className="wave-bar w-2" />
              <div className="wave-bar w-3" />
              <div className="wave-bar w-4" />
              <div className="wave-bar w-5" />
              <div className="wave-bar w-4" />
              <div className="wave-bar w-3" />
              <div className="wave-bar w-2" />
              <div className="wave-bar w-1" />
            </div>

            <div className="speech-actions flex flex-col gap-3 items-center mt-4">
              <button 
                className={`voice-mic-btn ${isListening ? "active animate-pulse-glow" : ""}`}
                onClick={startVoiceInput}
                title={isListening ? "Listening..." : "Click to Speak"}
              >
                {isListening ? (
                  <Sparkles size={24} className="text-white animate-spin-slow" />
                ) : (
                  <Mic size={24} className="text-white" />
                )}
              </button>
              
              <div className="speech-status-label text-sm text-center">
                {isListening && <span className="text-accent font-semibold animate-pulse">Assistant is listening...</span>}
                {isSpeaking && <span className="text-green font-semibold">Assistant is speaking (Offline TTS)...</span>}
                {!isListening && !isSpeaking && <span className="text-muted">Click Mic or choose a command below</span>}
              </div>

              {/* Text fallback input */}
              <form 
                className="w-full flex gap-2 mt-2" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (commandText.trim()) {
                    handleExecuteCommand(commandText);
                  }
                }}
              >
                <input 
                  type="text" 
                  className="command-input flex-1"
                  placeholder="Type offline command..." 
                  value={commandText}
                  onChange={(e) => setCommandText(e.target.value)}
                />
                <button type="submit" className="btn btn-accent px-3 py-2 flex items-center justify-center">
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Quick action chips */}
            <div className="quick-actions-chips mt-4">
              <div className="chips-title text-[10px] text-muted font-bold uppercase tracking-wider mb-2">Example Commands</div>
              <div className="chips-scroll">
                {exampleCommands.map((chip, idx) => (
                  <button 
                    key={idx} 
                    className="chip"
                    onClick={() => handleExecuteCommand(chip.query)}
                  >
                    {chip.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
