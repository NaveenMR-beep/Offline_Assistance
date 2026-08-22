import React from "react";
import { Cpu, ArrowRight, Volume2, Mic, Settings, FileText, Smartphone } from "lucide-react";

export default function PipelineVisualizer({ currentStage }) {
  const stages = [
    { id: "input", name: "User Input", desc: "Voice / Text trigger", icon: Mic },
    { id: "stt", name: "Local Speech Recog.", desc: "Local STT (Web Speech)", icon: FileText },
    { id: "parse", name: "Command Engine", desc: "Regex Match & Parsing", icon: Cpu },
    { id: "execute", name: "Action Dispatch", desc: "Accessibility Service / OS", icon: Smartphone },
    { id: "clean", name: "Speech Formatter", desc: "Strip punctuation", icon: Settings },
    { id: "tts", name: "Offline TTS", desc: "Local Speech Synth", icon: Volume2 },
  ];

  return (
    <div className="glass-card pipeline-card">
      <div className="card-header">
        <Cpu className="header-icon text-accent" />
        <h2>Offline Pipeline Visualizer</h2>
      </div>
      <p className="card-subtitle">
        See the real-time local processing steps. No cloud API or keys used.
      </p>

      <div className="pipeline-flow">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = currentStage === stage.id;
          const isCompleted = stages.findIndex(s => s.id === currentStage) > index && currentStage !== "idle";

          return (
            <React.Fragment key={stage.id}>
              <div 
                className={`pipeline-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                id={`pipeline-${stage.id}`}
              >
                <div className="node-icon-wrapper">
                  <Icon size={20} className="node-icon" />
                </div>
                <div className="node-info">
                  <div className="node-name">{stage.name}</div>
                  <div className="node-desc">{stage.desc}</div>
                </div>
                {isActive && <div className="pulse-gloriole" />}
              </div>
              
              {index < stages.length - 1 && (
                <div className={`pipeline-arrow-container ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
                  <ArrowRight size={18} className="pipeline-arrow" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
