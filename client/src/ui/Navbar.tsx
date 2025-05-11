import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav
      style={{
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        padding: '16px 24px',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Title
        level={4}
        style={{ color: 'rgba(255, 255, 255, 0.87)', margin: 0 }}
      >
        CMPC-Libros
      </Title>

      <Button type="link" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </nav>
  );
};

export default Navbar;
