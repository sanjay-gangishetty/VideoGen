import React from 'react';
import './Navbar.css';

const Navbar = () => {
  const features = [
    { name: 'Upload'},
    { name: 'Video Types'},
    { name: 'Customize'},
    { name: 'Generate'}
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div className="navbar-brand">
          <h1 className="navbar-logo">VideoGen</h1>
        </div>
        <ul className="navbar-menu">
          {features.map((feature, index) => (
            <li key={index} className="navbar-item">
              <span className="navbar-link">
                <span className="navbar-feature-name">{feature.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
