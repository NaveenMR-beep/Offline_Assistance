import React, { useEffect, useRef } from "react";
import { 
  Wifi, Battery, Search, Play, Pause, ChevronLeft, ArrowLeft, Send, MapPin, 
  Settings as SettingsIcon, Volume2, Sun, WifiOff, VolumeX, Smartphone, MessageSquare
} from "lucide-react";

export default function PhoneSimulator({ 
  activeApp, 
  setActiveApp, 
  volume, 
  brightness, 
  systemSettings, 
  setSystemSettings, 
  ytQuery, 
  ytPlaying, 
  chromeQuery, 
  chromeSiteOpened, 
  waDraft, 
  waMessages, 
  galleryLatestOpened, 
  mapsQuery, 
  mapsNavigating, 
  phoneScrollPosition,
  showVolumeOverlay,
  showBrightnessOverlay,
  onAppClick
}) {
  const scrollRef = useRef(null);

  // Auto-scroll apps when scroll commands run
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: phoneScrollPosition,
        behavior: "smooth"
      });
    }
  }, [phoneScrollPosition]);

  const renderStatusBar = () => (
    <div className="phone-status-bar">
      <span className="phone-time">10:42 PM</span>
      <span className="phone-offline-badge">Local Mode</span>
      <div className="phone-status-icons">
        {systemSettings.wifi ? <Wifi size={14} /> : <WifiOff size={14} className="text-muted" />}
        <Battery size={14} />
        <span className="battery-pct">87%</span>
      </div>
    </div>
  );

  const renderNavBar = () => (
    <div className="phone-nav-bar">
      <button className="nav-btn" onClick={() => {
        if (activeApp === "youtube" && ytPlaying) {
          onAppClick("youtube_stop");
        } else if (activeApp === "chrome" && chromeSiteOpened) {
          onAppClick("chrome_back");
        } else if (activeApp !== "home") {
          setActiveApp("home");
        }
      }} title="Back">
        <ArrowLeft size={16} />
      </button>
      <button className="nav-btn nav-btn-home" onClick={() => setActiveApp("home")} title="Home">
        <div className="home-indicator" />
      </button>
      <button className="nav-btn" onClick={() => setActiveApp("settings")} title="Settings">
        <SettingsIcon size={16} />
      </button>
    </div>
  );

  // App 1: Home Screen
  const renderHomeScreen = () => (
    <div className="phone-screen-content home-screen">
      <div className="digital-clock">
        <div className="time-display">22:42</div>
        <div className="date-display">Saturday, August 22</div>
      </div>

      <div className="search-bar-widget">
        <Search size={16} className="text-muted" />
        <span>"Open YouTube"</span>
      </div>

      <div className="apps-grid-sim">
        <div className="app-icon-item" onClick={() => onAppClick("youtube")}>
          <div className="app-icon yt-icon">
            <Play size={20} fill="white" stroke="none" />
          </div>
          <span className="app-label">YouTube</span>
        </div>

        <div className="app-icon-item" onClick={() => onAppClick("chrome")}>
          <div className="app-icon chrome-icon">
            <div className="chrome-inner" />
          </div>
          <span className="app-label">Chrome</span>
        </div>

        <div className="app-icon-item" onClick={() => onAppClick("whatsapp")}>
          <div className="app-icon wa-icon">
            <MessageSquare size={20} fill="white" stroke="none" />
          </div>
          <span className="app-label">WhatsApp</span>
        </div>

        <div className="app-icon-item" onClick={() => onAppClick("gallery")}>
          <div className="app-icon gallery-icon">
            <span className="gallery-inner" />
          </div>
          <span className="app-label">Gallery</span>
        </div>

        <div className="app-icon-item" onClick={() => onAppClick("maps")}>
          <div className="app-icon maps-icon">
            <MapPin size={20} fill="white" stroke="none" />
          </div>
          <span className="app-label">Maps</span>
        </div>

        <div className="app-icon-item" onClick={() => onAppClick("settings")}>
          <div className="app-icon settings-icon">
            <SettingsIcon size={20} className="text-white animate-spin-slow" />
          </div>
          <span className="app-label">Settings</span>
        </div>
      </div>
    </div>
  );

  // App 2: YouTube
  const renderYouTube = () => (
    <div className="phone-screen-content youtube-app" ref={scrollRef}>
      <div className="app-bar yt-app-bar">
        <span className="yt-logo">YouTube</span>
        <div className="yt-search-pill">
          <Search size={12} className="text-muted" />
          <span className="truncate text-xs">{ytQuery || "Search Python..."}</span>
        </div>
      </div>

      {ytPlaying ? (
        <div className="yt-player">
          <div className="yt-video-aspect">
            <div className="yt-video-visuals">
              <div className="yt-wave-line" />
              <div className="yt-play-state-overlay">
                <Play size={32} className="text-white opacity-80 animate-ping" />
              </div>
            </div>
            <div className="yt-controls-overlay">
              <Pause size={14} className="text-white" />
              <div className="yt-progress-track">
                <div className="yt-progress-fill" style={{ width: "35%" }} />
              </div>
              <span className="yt-time-text">04:12 / 12:45</span>
            </div>
          </div>
          <div className="yt-video-info p-3">
            <h4 className="text-sm font-semibold text-white">Python Tutorial for Beginners (Offline Stream)</h4>
            <p className="text-xs text-muted mt-1">1.2M views • 2 days ago</p>
          </div>
        </div>
      ) : (
        <div className="yt-feed p-2">
          {ytQuery ? (
            <div className="yt-search-results">
              <div className="text-xs text-muted mb-2 font-medium">Search results for "{ytQuery}"</div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="yt-card mb-3" onClick={() => onAppClick("youtube_play")}>
                  <div className="yt-thumbnail flex items-center justify-center text-xs text-muted">
                    <Play size={16} className="mr-1" /> Thumbnail
                  </div>
                  <div className="yt-card-desc py-1">
                    <div className="text-xs text-white font-medium truncate">
                      {i === 1 ? `[1st Video] Complete Python Tutorial for beginners` : `Python course session #${i}`}
                    </div>
                    <div className="text-[10px] text-muted">Learn Programming • Offline Channel</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="yt-home-feed">
              <div className="yt-banner-ads">
                <div className="text-xs font-semibold">Premium Ad-free (Offline Mode)</div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="yt-card mb-3">
                  <div className="yt-thumbnail flex items-center justify-center text-xs text-muted">
                    Recommended Video
                  </div>
                  <div className="yt-card-desc py-1">
                    <div className="text-xs text-white font-medium truncate">Stunning Travel Guide to Mysore</div>
                    <div className="text-[10px] text-muted">Explorer Channel • 5M views</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // App 3: Chrome
  const renderChrome = () => (
    <div className="phone-screen-content chrome-app">
      <div className="chrome-address-bar">
        <ChevronLeft size={16} className="text-muted" onClick={() => onAppClick("chrome_back")} />
        <div className="chrome-url truncate">
          {chromeSiteOpened ? "https://python.org/getting-started" : "https://google.com"}
        </div>
      </div>

      <div className="chrome-body p-3" ref={scrollRef}>
        {chromeSiteOpened ? (
          <div className="chrome-website-view animate-fade-in">
            <h3 className="text-sm font-semibold text-accent">Welcome to Python.org</h3>
            <p className="text-xs text-light mt-2 leading-relaxed">
              Python is a programming language that lets you work quickly and integrate systems more effectively.
            </p>
            <div className="btn btn-sm btn-accent-outline mt-3 text-xs w-full text-center">
              Download Python 3.12 (Offline Cache)
            </div>
            <div className="divider my-3" />
            <h4 className="text-xs font-medium text-white">Getting Started</h4>
            <p className="text-[11px] text-muted mt-1">
              First-time programmers can inspect standard documentation offline or open tutorials.
            </p>
          </div>
        ) : chromeQuery ? (
          <div className="chrome-search-results">
            <div className="text-xs text-muted mb-2">Search results for "{chromeQuery}"</div>
            <div className="chrome-serp-card mb-3" onClick={() => onAppClick("chrome_open_site")}>
              <div className="serp-site-link">python.org</div>
              <h4 className="serp-title">Python Source Code and Documentation</h4>
              <p className="serp-snippet">
                The official home of the Python Programming Language. Download Python and access documentation...
              </p>
            </div>
            <div className="chrome-serp-card mb-3">
              <div className="serp-site-link">w3schools.com</div>
              <h4 className="serp-title">Python Tutorial - Learn Python programming</h4>
              <p className="serp-snippet">
                Python is a popular programming language. Python can be used on a server to create web applications...
              </p>
            </div>
          </div>
        ) : (
          <div className="chrome-home text-center py-6">
            <div className="chrome-logo-text mb-4">Google</div>
            <div className="chrome-search-box-sim mb-4">
              <Search size={14} className="text-muted mr-2" />
              <span className="text-xs text-muted">Search or type URL</span>
            </div>
            <div className="flex gap-2 justify-center">
              <span className="chip text-[10px]" onClick={() => onAppClick("chrome_search_python")}>Search "Python"</span>
              <span className="chip text-[10px]">News</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // App 4: WhatsApp
  const renderWhatsApp = () => {
    const chatActive = waMessages !== null;

    return (
      <div className="phone-screen-content whatsapp-app">
        <div className="wa-header">
          <span className="wa-logo-text">WhatsApp</span>
          <div className="flex gap-3 text-white">
            <Search size={14} />
          </div>
        </div>

        {chatActive ? (
          <div className="wa-chat-container">
            <div className="wa-chat-header">
              <ChevronLeft size={16} className="text-white mr-1 cursor-pointer" onClick={() => onAppClick("whatsapp")} />
              <div className="wa-avatar-mini">J</div>
              <div className="wa-chat-info">
                <div className="wa-contact-name">John</div>
                <div className="wa-contact-status">online</div>
              </div>
            </div>
            
            <div className="wa-messages-list p-2" ref={scrollRef}>
              <div className="wa-bubble wa-bubble-received">
                Hey, did you get the offline files ready?
                <span className="bubble-time">10:30 PM</span>
              </div>
              
              {waMessages.map((msg, index) => (
                <div key={index} className="wa-bubble wa-bubble-sent animate-slide-up">
                  {msg}
                  <span className="bubble-time">10:41 PM</span>
                </div>
              ))}
            </div>

            <div className="wa-input-area">
              <input 
                type="text" 
                placeholder="Type message" 
                value={waDraft}
                readOnly
                className="wa-message-input"
              />
              <button 
                className="wa-send-btn" 
                onClick={() => onAppClick("whatsapp_send")}
              >
                <Send size={14} fill="white" stroke="none" />
              </button>
            </div>
          </div>
        ) : (
          <div className="wa-chats-list">
            <div className="wa-chat-item" onClick={() => onAppClick("whatsapp_chat")}>
              <div className="wa-avatar">J</div>
              <div className="wa-chat-meta">
                <div className="flex justify-between items-center">
                  <span className="wa-name">John</span>
                  <span className="wa-date text-[10px] text-muted">10:30 PM</span>
                </div>
                <div className="wa-last-msg text-xs text-muted truncate">Hey, did you get the offline files...</div>
              </div>
            </div>

            <div className="wa-chat-item">
              <div className="wa-avatar">S</div>
              <div className="wa-chat-meta">
                <div className="flex justify-between items-center">
                  <span className="wa-name">Sarah</span>
                  <span className="wa-date text-[10px] text-muted">Yesterday</span>
                </div>
                <div className="wa-last-msg text-xs text-muted truncate">Awesome prototype! Works offline!</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // App 5: Gallery
  const renderGallery = () => (
    <div className="phone-screen-content gallery-app" ref={scrollRef}>
      <div className="app-bar gallery-bar">
        <h2>Photos</h2>
      </div>

      {galleryLatestOpened ? (
        <div className="gallery-detail-view animate-zoom-in">
          <div className="gallery-detail-header p-2">
            <ChevronLeft size={16} className="text-white cursor-pointer" onClick={() => onAppClick("gallery")} />
            <span className="text-xs text-white">IMG_2026_08_22.png</span>
          </div>
          <div className="gallery-photo-fullscreen flex items-center justify-center">
            {/* Simulated beautiful gradient photo */}
            <div className="simulated-photo-full" />
          </div>
          <div className="gallery-detail-footer p-3 text-center text-xs text-muted">
            Taken on device • Offline Assistant Mockup
          </div>
        </div>
      ) : (
        <div className="gallery-grid p-2">
          <div className="text-xs text-muted mb-2 font-medium">Camera Roll</div>
          <div className="grid grid-cols-3 gap-1">
            <div className="gallery-thumb latest-thumb" onClick={() => onAppClick("gallery_photo")}>
              <div className="gallery-gradient-thumb-1 w-full h-full flex items-end p-1">
                <span className="badge-mini">Latest</span>
              </div>
            </div>
            {[2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="gallery-thumb">
                <div className={`gallery-gradient-thumb-${(i % 3) + 1} w-full h-full`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // App 6: Settings
  const renderSettings = () => (
    <div className="phone-screen-content settings-app" ref={scrollRef}>
      <div className="app-bar settings-bar">
        <h2>Settings</h2>
      </div>
      
      <div className="settings-body p-3">
        <div className="settings-section">
          <h3>Connections</h3>
          <div className="settings-item flex justify-between items-center">
            <span>Wi-Fi Connection</span>
            <button 
              className={`pill-switch ${systemSettings.wifi ? "on" : "off"}`}
              onClick={() => setSystemSettings(p => ({ ...p, wifi: !p.wifi }))}
            >
              {systemSettings.wifi ? "Connected" : "Disconnected"}
            </button>
          </div>
          <div className="settings-item flex justify-between items-center">
            <span>Bluetooth</span>
            <button 
              className={`pill-switch ${systemSettings.bluetooth ? "on" : "off"}`}
              onClick={() => setSystemSettings(p => ({ ...p, bluetooth: !p.bluetooth }))}
            >
              {systemSettings.bluetooth ? "On" : "Off"}
            </button>
          </div>
        </div>

        <div className="settings-section mt-4">
          <h3>System Indicators</h3>
          <div className="settings-item-slider">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span className="flex items-center gap-1"><Volume2 size={12} /> Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <div className="sim-slider-track">
              <div className="sim-slider-fill" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>

          <div className="settings-item-slider mt-3">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span className="flex items-center gap-1"><Sun size={12} /> Brightness</span>
              <span>{Math.round(brightness * 100)}%</span>
            </div>
            <div className="sim-slider-track">
              <div className="sim-slider-fill" style={{ width: `${brightness * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="settings-section mt-4">
          <h3>System Information</h3>
          <div className="text-[10px] text-muted p-2 bg-dark-dim rounded">
            <strong>OS version:</strong> Android 17 (Simulated)<br />
            <strong>Voice Assistant:</strong> Antigravity Local Engine 2.0<br />
            <strong>API Status:</strong> Offline Only (No keys required)
          </div>
        </div>
      </div>
    </div>
  );

  // App 7: Maps
  const renderMaps = () => (
    <div className="phone-screen-content maps-app">
      <div className="maps-search-bar">
        <Search size={14} className="text-muted mr-1" />
        <span className="text-xs text-white truncate">{mapsQuery ? `Mysore, Karnataka` : "Search destination..."}</span>
      </div>

      <div className="maps-canvas">
        {mapsQuery ? (
          <div className="simulated-map-view Mysore-active">
            {/* Draw a simulated map representation */}
            <div className="map-route-layer">
              {mapsNavigating && <div className="route-draw-path" />}
            </div>
            
            <div className="mysore-marker animate-bounce">
              <MapPin size={24} fill="#ff3366" stroke="white" strokeWidth={2} />
              <div className="marker-label">Mysore</div>
            </div>

            {mapsNavigating && (
              <div className="maps-navigation-hud">
                <div className="text-xs font-semibold text-white">Navigating to Mysore</div>
                <div className="text-[10px] text-accent">140 km • 2 hrs 15 mins</div>
              </div>
            )}
            
            {!mapsNavigating && (
              <button 
                className="btn btn-sm btn-accent absolute bottom-4 right-4 text-xs font-semibold flex items-center gap-1"
                onClick={() => onAppClick("maps_navigate")}
              >
                <MapPin size={12} /> Start Navigation
              </button>
            )}
          </div>
        ) : (
          <div className="simulated-map-view grid-bg">
            <div className="pulse-location-dot" />
            <div className="maps-empty-hint text-center text-xs text-muted px-4 py-8">
              Try: <em>"Search Mysore"</em> on Maps
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderActiveScreen = () => {
    switch (activeApp) {
      case "youtube": return renderYouTube();
      case "chrome": return renderChrome();
      case "whatsapp": return renderWhatsApp();
      case "gallery": return renderGallery();
      case "maps": return renderMaps();
      case "settings": return renderSettings();
      case "home":
      default:
        return renderHomeScreen();
    }
  };

  return (
    <div className="phone-simulator-frame">
      <div className="phone-earpiece" />
      <div className="phone-screen" style={{ overflow: "hidden" }}>
        
        {/* Status Bar */}
        {renderStatusBar()}

        {/* Dynamic App Area */}
        <div className="phone-app-viewport">
          {renderActiveScreen()}
        </div>

        {/* Volume Overlay Display */}
        {showVolumeOverlay && (
          <div className="phone-volume-overlay-hud animate-fade-in">
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <div className="overlay-volume-track">
              <div className="overlay-volume-fill" style={{ height: `${volume * 100}%` }} />
            </div>
            <span className="text-[9px] font-bold mt-1">{Math.round(volume * 100)}</span>
          </div>
        )}

        {/* Brightness Dimming Overlay */}
        {showBrightnessOverlay && (
          <div 
            className="phone-brightness-dimmer-layer" 
            style={{ opacity: 1 - brightness }} 
          />
        )}

        {/* OS Navigation Bar */}
        {renderNavBar()}
      </div>
      <div className="phone-home-button" onClick={() => setActiveApp("home")} />
    </div>
  );
}
