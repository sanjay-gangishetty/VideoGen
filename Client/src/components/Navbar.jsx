import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddCreditsModal from './AddCreditsModal';
import './Navbar.css';

const Navbar = () => {
  const { user, loading, isAuthenticated, login, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);

  const features = [
    { name: 'Upload'},
    { name: 'Video Types'},
    { name: 'Customize'},
    { name: 'Generate'}
  ];

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  const handleAddCredits = () => {
    setShowAddCreditsModal(true);
  };

  const handleCloseModal = () => {
    setShowAddCreditsModal(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div className="navbar-brand">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 className="navbar-logo">VideoGen</h1>
          </Link>
        </div>

        <div className="navbar-right">
          <ul className="navbar-menu">
            {features.map((feature, index) => (
              <li key={index} className="navbar-item">
                <span className="navbar-link">
                  <span className="navbar-feature-name">{feature.name}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="navbar-auth">
            {loading ? (
              <div className="navbar-loading">Loading...</div>
            ) : isAuthenticated && user ? (
              <div className="navbar-user">
                <Link to="/wallet" style={{ textDecoration: 'none' }}>
                  <button
                    className="btn btn-wallet"
                    style={{
                      backgroundColor: '#8B5CF6',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginRight: '12px',
                    }}
                  >
                    💼 Wallet
                  </button>
                </Link>
                <button
                  className="btn btn-add-credits"
                  onClick={handleAddCredits}
                  style={{
                    backgroundColor: '#22c55e',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginRight: '16px',
                  }}
                >
                  💳 Add Credits
                </button>
                <div
                  className="user-profile"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img
                    src={user.image || 'https://via.placeholder.com/40'}
                    alt={user.name || 'User'}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <span className="user-name">{user.name || 'User'}</span>
                    <span className="user-credits">
                      💰 {user.wallet?.currentBalance || 0} credits
                    </span>
                  </div>
                  <span className="dropdown-arrow">▼</span>
                </div>

                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-item user-email">
                      {user.email}
                    </div>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item dropdown-logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="btn btn-primary login-btn"
                onClick={login}
              >
                Login with Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Credits Modal */}
      {showAddCreditsModal && (
        <AddCreditsModal
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
        />
      )}
    </nav>
  );
};

export default Navbar;
