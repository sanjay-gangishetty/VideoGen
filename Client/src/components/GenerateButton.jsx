import React from 'react';
import './GenerateButton.css';

const GenerateButton = ({ onClick, isLoading, disabled }) => {
  return (
    <div className="generate-section section">
      <button
        className="generate-btn btn btn-primary"
        onClick={onClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Generating...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Generate Video
          </>
        )}
      </button>
      <p className="generate-note">
        {isLoading
          ? 'Your video is being generated. This may take a few moments...'
          : 'Click to start generating your video with the selected options'}
      </p>
    </div>
  );
};

export default GenerateButton;
