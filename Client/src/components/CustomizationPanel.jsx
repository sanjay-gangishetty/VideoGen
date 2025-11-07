import React, { useState } from 'react';
import './CustomizationPanel.css';

const CustomizationPanel = ({ onCustomizationChange }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    cameraAngle: '',
    shotType: '',
    movement: '',
    lighting: ''
  });

  const customizationOptions = {
    cameraAngle: [
      { value: '', label: 'Select Camera Angle' },
      { value: 'eye-level', label: 'Eye Level' },
      { value: 'high-angle', label: 'High Angle' },
      { value: 'low-angle', label: 'Low Angle' },
      { value: 'birds-eye', label: 'Bird\'s Eye View' },
      { value: 'dutch-angle', label: 'Dutch Angle' }
    ],
    shotType: [
      { value: '', label: 'Select Shot Type' },
      { value: 'close-up', label: 'Close-up' },
      { value: 'medium-shot', label: 'Medium Shot' },
      { value: 'wide-shot', label: 'Wide Shot' },
      { value: 'extreme-close-up', label: 'Extreme Close-up' },
      { value: 'establishing', label: 'Establishing Shot' }
    ],
    movement: [
      { value: '', label: 'Select Camera Movement' },
      { value: 'static', label: 'Static' },
      { value: 'pan', label: 'Pan' },
      { value: 'tilt', label: 'Tilt' },
      { value: 'dolly', label: 'Dolly' },
      { value: 'zoom', label: 'Zoom' },
      { value: 'tracking', label: 'Tracking' }
    ],
    lighting: [
      { value: '', label: 'Select Lighting Style' },
      { value: 'natural', label: 'Natural' },
      { value: 'dramatic', label: 'Dramatic' },
      { value: 'soft', label: 'Soft' },
      { value: 'backlit', label: 'Backlit' },
      { value: 'golden-hour', label: 'Golden Hour' }
    ]
  };

  const handleChange = (category, value) => {
    const updated = {
      ...selectedOptions,
      [category]: value
    };
    setSelectedOptions(updated);

    if (onCustomizationChange) {
      onCustomizationChange(updated);
    }
  };

  return (
    <div className="customization-section section">
      <h2 className="section-title">Customization</h2>
      <p className="section-subtitle">Customize camera angles and shooting style for your video</p>

      <div className="customization-grid">
        <div className="customization-field">
          <label htmlFor="cameraAngle" className="field-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Camera Angle
          </label>
          <select
            id="cameraAngle"
            className="select"
            value={selectedOptions.cameraAngle}
            onChange={(e) => handleChange('cameraAngle', e.target.value)}
          >
            {customizationOptions.cameraAngle.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="customization-field">
          <label htmlFor="shotType" className="field-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
            </svg>
            Shot Type
          </label>
          <select
            id="shotType"
            className="select"
            value={selectedOptions.shotType}
            onChange={(e) => handleChange('shotType', e.target.value)}
          >
            {customizationOptions.shotType.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="customization-field">
          <label htmlFor="movement" className="field-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Camera Movement
          </label>
          <select
            id="movement"
            className="select"
            value={selectedOptions.movement}
            onChange={(e) => handleChange('movement', e.target.value)}
          >
            {customizationOptions.movement.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="customization-field">
          <label htmlFor="lighting" className="field-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            Lighting Style
          </label>
          <select
            id="lighting"
            className="select"
            value={selectedOptions.lighting}
            onChange={(e) => handleChange('lighting', e.target.value)}
          >
            {customizationOptions.lighting.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
