import React from "react";
import { ShieldCheck, Eye, Mic, Bell, Layers, ToggleLeft, ToggleRight, CheckSquare, Square } from "lucide-react";

export default function PermissionsScreen({ permissions, setPermissions }) {
  const toggleSystem = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleApp = (app) => {
    setPermissions((prev) => ({
      ...prev,
      apps: {
        ...prev.apps,
        [app]: !prev.apps[app],
      },
    }));
  };

  return (
    <div className="glass-card permissions-card">
      <div className="card-header">
        <ShieldCheck className="header-icon text-accent" />
        <h2>Assistant Permissions</h2>
      </div>
      <p className="card-subtitle">
        Configure what the local, offline assistant is allowed to control on this device.
      </p>

      <div className="permissions-group">
        <h3>System Access</h3>
        
        <div className="permission-item">
          <div className="perm-info">
            <Eye className="perm-icon" />
            <div>
              <div className="perm-title">Accessibility Service</div>
              <div className="perm-desc">Required to control UI elements in other apps</div>
            </div>
          </div>
          <button 
            className={`toggle-btn ${permissions.accessibility ? "active" : ""}`}
            onClick={() => toggleSystem("accessibility")}
          >
            {permissions.accessibility ? <ToggleRight size={32} className="text-active" /> : <ToggleLeft size={32} className="text-inactive" />}
          </button>
        </div>

        <div className="permission-item">
          <div className="perm-info">
            <Mic className="perm-icon" />
            <div>
              <div className="perm-title">Microphone Access</div>
              <div className="perm-desc">Required for voice recognition triggers</div>
            </div>
          </div>
          <button 
            className={`toggle-btn ${permissions.microphone ? "active" : ""}`}
            onClick={() => toggleSystem("microphone")}
          >
            {permissions.microphone ? <ToggleRight size={32} className="text-active" /> : <ToggleLeft size={32} className="text-inactive" />}
          </button>
        </div>

        <div className="permission-item">
          <div className="perm-info">
            <Bell className="perm-icon" />
            <div>
              <div className="perm-title">Notifications</div>
              <div className="perm-desc">Allows assistant alerts in status bar</div>
            </div>
          </div>
          <button 
            className={`toggle-btn ${permissions.notifications ? "active" : ""}`}
            onClick={() => toggleSystem("notifications")}
          >
            {permissions.notifications ? <ToggleRight size={32} className="text-active" /> : <ToggleLeft size={32} className="text-inactive" />}
          </button>
        </div>

        <div className="permission-item">
          <div className="perm-info">
            <Layers className="perm-icon" />
            <div>
              <div className="perm-title">Display Overlay</div>
              <div className="perm-desc">Draw assistant overlay interface over other apps</div>
            </div>
          </div>
          <button 
            className={`toggle-btn ${permissions.overlay ? "active" : ""}`}
            onClick={() => toggleSystem("overlay")}
          >
            {permissions.overlay ? <ToggleRight size={32} className="text-active" /> : <ToggleLeft size={32} className="text-inactive" />}
          </button>
        </div>
      </div>

      <div className="permissions-group mt-6">
        <h3>App Automation Control</h3>
        <div className="apps-grid">
          {Object.keys(permissions.apps).map((appKey) => (
            <div 
              key={appKey} 
              className={`app-checkbox-item ${permissions.apps[appKey] ? "checked" : ""}`}
              onClick={() => toggleApp(appKey)}
            >
              <div className="app-checkbox-label">
                <span className="app-avatar-mini">{appKey.substring(0, 1).toUpperCase()}</span>
                <span className="capitalize">{appKey}</span>
              </div>
              <div className="checkbox-icon">
                {permissions.apps[appKey] ? (
                  <CheckSquare size={20} className="text-accent" />
                ) : (
                  <Square size={20} className="text-muted" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
