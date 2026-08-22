import React, { useState } from "react";
import { Database, Trash2, Search, Calendar, Folder } from "lucide-react";

export default function MemoryManager({ memory, clearAllMemory, deleteMemoryItem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics" },
    { id: "youtube", name: "YouTube History" },
    { id: "chrome", name: "Chrome Searches" },
    { id: "whatsapp", name: "WhatsApp Chats" },
    { id: "maps", name: "Maps Navigation" },
  ];

  // Filter memory list by search and category
  const filteredMemory = memory.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.app === activeCategory;
    const matchesSearch = 
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString();
    } catch (e) {
      return "Just now";
    }
  };

  return (
    <div className="glass-card memory-card">
      <div className="card-header justify-between">
        <div className="flex items-center gap-2">
          <Database className="header-icon text-accent" />
          <h2>Local Offline Memory DB</h2>
        </div>
        {memory.length > 0 && (
          <button className="btn btn-danger-text flex items-center gap-1 text-sm" onClick={clearAllMemory}>
            <Trash2 size={16} />
            <span>Clear DB</span>
          </button>
        )}
      </div>
      <p className="card-subtitle">
        On-device key-value store simulating SQLite/Room database partitioned by topics.
      </p>

      {/* Controls */}
      <div className="memory-controls mt-4">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search local memory..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="category-tabs mt-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Memory items list */}
      <div className="memory-list-container mt-4">
        {filteredMemory.length === 0 ? (
          <div className="empty-state py-8 text-center text-muted">
            <Folder size={32} className="mx-auto opacity-50 mb-2" />
            <p>{searchTerm ? "No matching records found." : "No local memory stored yet. Try running some actions!"}</p>
          </div>
        ) : (
          <div className="memory-list">
            {filteredMemory.map((item) => (
              <div key={item.id} className="memory-item">
                <div className="memory-meta">
                  <span className={`app-tag app-${item.app}`}>{item.app}</span>
                  <span className="memory-time flex items-center gap-1 text-xs text-muted">
                    <Calendar size={12} />
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                <div className="memory-body mt-2 flex justify-between items-start">
                  <div>
                    <div className="memory-topic text-accent text-sm font-semibold capitalize">Topic: {item.topic}</div>
                    <div className="memory-value text-white mt-1 text-sm font-medium">{item.value}</div>
                  </div>
                  <button 
                    className="delete-item-btn text-muted hover:text-danger p-1"
                    onClick={() => deleteMemoryItem(item.id)}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
