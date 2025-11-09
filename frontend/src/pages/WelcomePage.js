import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', transition: 'all 0.3s ease-in-out' }}>
      
      <h1
        style={{
          color: hovered ? '#0078D4' : '#333',
          transition: 'color 0.3s ease-in-out',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Welcome to the Data Visualization Platform
      </h1>
      <p style={{ fontSize: '1.1em', margin: '20px auto', maxWidth: '600px' }}>
        Your simple, no-code solution for creating beautiful data visualizations.
      </p>
      <div style={{ marginTop: '30px' }}>
        <Link
          to="/login"
          style={{
            marginRight: '20px',
            fontSize: '1.2em',
            padding: '10px 20px',
            backgroundColor: '#0078D4',
            color: '#fff',
            borderRadius: '5px',
            textDecoration: 'none',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#005A9E')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#0078D4')}
        >
          Login
        </Link>
        <Link
          to="/register"
          style={{
            fontSize: '1.2em',
            padding: '10px 20px',
            backgroundColor: '#28A745',
            color: '#fff',
            borderRadius: '5px',
            textDecoration: 'none',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#218838')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#28A745')}
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;
