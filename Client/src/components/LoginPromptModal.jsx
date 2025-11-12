import React from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPromptModal Component
 *
 * Shows a modal prompting users to log in with Google
 * Used when unauthenticated users try to perform actions that require authentication
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 */
const LoginPromptModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();

  const handleLoginClick = () => {
    login(); // Redirect to Google OAuth
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <div className="login-prompt">
        {/* Icon */}
        <div className="login-prompt-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="login-prompt-title">Login Required</h2>

        {/* Message */}
        <p className="login-prompt-message">
          Please log in with Google to generate videos and access all features.
        </p>

        {/* Action Buttons */}
        <div className="login-prompt-actions">
          <button
            className="btn btn-primary w-full"
            onClick={handleLoginClick}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login with Google
          </button>

          {onClose && (
            <button
              className="btn btn-outline w-full"
              onClick={onClose}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <style>{`
        .login-prompt {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .login-prompt-icon {
          width: 64px;
          height: 64px;
          background: var(--color-purple-soft);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-purple-primary);
        }

        .login-prompt-title {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-black-primary);
          margin: 0;
        }

        .login-prompt-message {
          font-size: var(--font-size-base);
          color: var(--color-black-light);
          margin: 0;
          max-width: 400px;
          line-height: 1.6;
        }

        .login-prompt-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-top: var(--spacing-sm);
        }

        @media (max-width: 768px) {
          .login-prompt-icon {
            width: 48px;
            height: 48px;
          }

          .login-prompt-icon svg {
            width: 48px;
            height: 48px;
          }

          .login-prompt-title {
            font-size: var(--font-size-xl);
          }

          .login-prompt-message {
            font-size: var(--font-size-sm);
          }
        }
      `}</style>
    </Modal>
  );
};

export default LoginPromptModal;
