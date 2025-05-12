import React from 'react';
import Title from 'antd/es/typography/Title';
import Typography from 'antd/es/typography/Typography';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Title level={1}>404</Title>
      <Typography>Página no encontrada</Typography>
    </div>
  );
};

export default NotFound;
