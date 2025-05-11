/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      // Solicitar al backend las credenciales
      const response = await axios.post('/api/auth/login', values);

      // Si la respuesta es exitosa, guardar el token en el localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token); // Guardar el token
        navigate('/books'); // Redirigir a la página de libros
      }
    } catch (err: any) {
      console.log('err', err);
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <Title level={2}>Iniciar sesión</Title>
      <Form name="login" layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Por favor ingresa tu email' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Contraseña"
          name="password"
          rules={[
            { required: true, message: 'Por favor ingresa tu contraseña' },
          ]}
        >
          <Input.Password />
        </Form.Item>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Iniciar sesión
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
