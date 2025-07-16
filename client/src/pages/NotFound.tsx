import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBackHome = () => {
    // Si el usuario está autenticado, ir a /books, si no a /login
    const path = isAuthenticated() ? '/books' : '/login';
    navigate(path);
  };

  return (
    <Result
      status="404"
      title="404"
      subTitle="Lo sentimos, la página que estás buscando no existe."
      extra={
        <Button type="primary" onClick={handleBackHome}>
          Volver al inicio
        </Button>
      }
    />
  );
};

export default NotFound;
