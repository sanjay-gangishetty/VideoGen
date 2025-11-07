import React, { useState } from 'react';
import './VideoTypeSelector.css';

const VideoTypeSelector = ({ onTypeSelect }) => {
  const [selectedType, setSelectedType] = useState(null);

  const videoTypes = [
    {
      id: 'b-roll',
      name: 'B-Roll',
      description: 'Supplementary footage for storytelling',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
      )
    },
    {
      id: '360-roll',
      name: '360° Roll',
      description: 'Complete circular rotation around image',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 2 12 12 18 12" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
        </svg>
      )
    },
    {
      id: 'zoom-pan',
      name: 'Zoom & Pan',
      description: 'Dynamic zoom and panning effects',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      )
    },
    {
      id: 'slideshow',
      name: 'Slideshow',
      description: 'Sequential image transitions',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <polyline points="8 12 12 8 16 12" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      )
    }
  ];

  const handleSelect = (typeId) => {
    setSelectedType(typeId);
    if (onTypeSelect) {
      onTypeSelect(typeId);
    }
  };

  return (
    <div className="video-type-section section">
      <h2 className="section-title">Video Generation Type</h2>
      <p className="section-subtitle">Choose how you want your video to be generated</p>

      <div className="video-type-grid">
        {videoTypes.map((type) => (
          <div
            key={type.id}
            className={`video-type-card card card-selectable ${
              selectedType === type.id ? 'selected' : ''
            }`}
            onClick={() => handleSelect(type.id)}
          >
            <div className="video-type-icon">{type.icon}</div>
            <h3 className="video-type-name">{type.name}</h3>
            <p className="video-type-description">{type.description}</p>
            {selectedType === type.id && (
              <div className="selected-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoTypeSelector;
