import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404</h1>
      <p>Página no encontrada</p>
      <Link to="/login" style={{ color: 'blue' }}>
        Volver al Login
      </Link>
    </div>
  );
};

export default NotFound;
