/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, message, Descriptions, Spin } from 'antd';
import axios from 'axios';
import Navbar from '../ui/Navbar';

const { Title } = Typography;

interface Book {
  id: number;
  title: string;
  description?: string;
  authorId: number;
  editorialId: number;
  genreId: number;
  price: string;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author: { id: number; name: string };
  editorial: { id: number; name: string };
  genre: { id: number; name: string };
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          message.error('No se encontró el token de autenticación. Por favor, inicia sesión.');
          navigate('/login');
          return;
        }

        const response = await axios.get<{ book: Book; ok: boolean }>(`/api/books/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBook(response.data.book);
      } catch (error: any) {
        if (error.response?.status === 401) {
          message.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          localStorage.removeItem('authToken');
          navigate('/login');
        } else if (error.response?.status === 404) {
          message.error('Libro no encontrado');
          navigate('/books');
        } else {
          message.error('Error al cargar los detalles del libro');
        }
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 24, maxWidth: '800px', margin: '0 auto' }}>
        <Title level={3}>Detalles del Libro</Title>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="ID">{book.id}</Descriptions.Item>
          <Descriptions.Item label="Título">{book.title}</Descriptions.Item>
          <Descriptions.Item label="Autor">{book.author.name}</Descriptions.Item>
          <Descriptions.Item label="Editorial">{book.editorial.name}</Descriptions.Item>
          <Descriptions.Item label="Género">{book.genre.name}</Descriptions.Item>
          <Descriptions.Item label="Precio">
            ${Math.floor(parseFloat(book.price))}
          </Descriptions.Item>
          <Descriptions.Item label="Disponible">
            {book.isAvailable ? 'Sí' : 'No'}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">
            {book.description || 'Sin descripción'}
          </Descriptions.Item>
          <Descriptions.Item label="Creado">
            {new Date(book.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Actualizado">
            {new Date(book.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
        <Button
          type="primary"
          onClick={() => navigate('/books')}
          style={{ marginTop: 16 }}
        >
          Volver a la lista
        </Button>
      </div>
    </>
  );
};

export default BookDetails;