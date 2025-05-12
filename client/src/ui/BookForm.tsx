/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Modal,
  message,
  Checkbox,
  InputNumber,
} from 'antd';
import axios from 'axios';

const { TextArea } = Input;

interface OptionType {
  value: number;
  label: string;
}

interface Book {
  id: number;
  title: string;
  author: { id: number; name: string };
  editorial: { id: number; name: string };
  genre: { id: number; name: string };
  price: string;
  isAvailable: boolean;
  description?: string;
}

interface BookFormProps {
  book?: Book | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ book, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [authors, setAuthors] = useState<OptionType[]>([]);
  const [editorials, setEditorials] = useState<OptionType[]>([]);
  const [genres, setGenres] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<
    'authors' | 'editorials' | 'genres'
  >('authors');
  const [newItemName, setNewItemName] = useState<string>('');

  const token = localStorage.getItem('authToken');

  const fetchAuthors = useCallback(async () => {
    const response = await fetch('/api/authors', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setAuthors(
      data.authors.map((author: any) => ({
        value: author.id,
        label: author.name,
      })),
    );
  }, [token]);

  const fetchEditorials = useCallback(async () => {
    const response = await fetch('/api/editorials', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setEditorials(
      data.editorials.map((editorial: any) => ({
        value: editorial.id,
        label: editorial.name,
      })),
    );
  }, [token]);

  const fetchGenres = useCallback(async () => {
    const response = await fetch('/api/genres', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setGenres(
      data.genres.map((genre: any) => ({
        value: genre.id,
        label: genre.name,
      })),
    );
  }, [token]);

  useEffect(() => {
    fetchAuthors();
    fetchEditorials();
    fetchGenres();
  }, [fetchAuthors, fetchEditorials, fetchGenres]);

  useEffect(() => {
    if (book) {
      form.setFieldsValue({
        title: book.title,
        description: book.description || '',
        authorId: book.author.id,
        editorialId: book.editorial.id,
        genreId: book.genre.id,
        price: parseFloat(book.price),
        isAvailable: book.isAvailable,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isAvailable: true });
    }
  }, [book, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('No se encontró el token de autenticación. Por favor, inicia sesión.');
        return;
      }

      if (book) {
        await axios.patch(
          `/api/books/${book.id}`,
          {
            title: values.title,
            description: values.description || '',
            authorId: values.authorId,
            editorialId: values.editorialId,
            genreId: values.genreId,
            price: values.price,
            isAvailable: values.isAvailable,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        message.success('Libro actualizado con éxito');
      } else {
        await axios.post(
          '/api/books/',
          {
            title: values.title,
            description: values.description || '',
            authorId: values.authorId,
            editorialId: values.editorialId,
            genreId: values.genreId,
            price: values.price,
            isAvailable: values.isAvailable,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        message.success('Libro creado con éxito');
      }
      onSuccess();
    } catch (error) {
      message.error(book ? 'Error al actualizar el libro' : 'Error al crear el libro');
      console.error(book ? 'Error updating book:' : 'Error creating book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewItem = async () => {
    if (!newItemName.trim()) {
      message.error('El nombre no puede estar vacío');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('No se encontró el token de autenticación');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `/api/${modalType}`,
        { name: newItemName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      message.success(
        `${modalType.slice(0, 1).toUpperCase() + modalType.slice(1)} creado exitosamente`,
      );
      fetchAuthors();
      fetchEditorials();
      fetchGenres();
      setModalVisible(false);
      setNewItemName('');
    } catch (error) {
      message.error(`Error al crear ${modalType}`);
      console.error(`Error al crear ${modalType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (type: 'authors' | 'editorials' | 'genres') => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isAvailable: true,
        }}
      >
        <Form.Item
          label="Título"
          name="title"
          rules={[
            {
              required: true,
              message: 'Por favor ingresa el título del libro',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Descripción" name="description">
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Autor"
          name="authorId"
          rules={[{ required: true, message: 'Por favor selecciona un autor' }]}
        >
          <Select
            options={authors}
            showSearch
            allowClear
            placeholder="Selecciona un autor"
            popupRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  onClick={() => openCreateModal('authors')}
                  style={{ padding: '8px 16px', textAlign: 'center' }}
                >
                  Crear nuevo autor
                </Button>
              </>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Editorial"
          name="editorialId"
          rules={[
            { required: true, message: 'Por favor selecciona una editorial' },
          ]}
        >
          <Select
            options={editorials}
            showSearch
            allowClear
            placeholder="Selecciona una editorial"
            popupRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  onClick={() => openCreateModal('editorials')}
                  style={{ padding: '8px 16px', textAlign: 'center' }}
                >
                  Crear nueva editorial
                </Button>
              </>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Género"
          name="genreId"
          rules={[
            { required: true, message: 'Por favor selecciona un género' },
          ]}
        >
          <Select
            options={genres}
            showSearch
            allowClear
            placeholder="Selecciona un género"
            popupRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  onClick={() => openCreateModal('genres')}
                  style={{ padding: '8px 16px', textAlign: 'center' }}
                >
                  Crear nuevo género
                </Button>
              </>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Precio"
          name="price"
          rules={[
            {
              required: true,
              message: 'Por favor ingresa el precio del libro',
            },
            {
              type: 'number',
              min: 1,
              message: 'El precio debe ser mayor a cero',
            },
          ]}
        >
          <InputNumber type="number" min={1} step="1" precision={0} />
        </Form.Item>

        <Form.Item name="isAvailable" valuePropName="checked">
          <Checkbox>Disponible</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {book ? 'Actualizar Libro' : 'Crear Libro'}
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title={`Crear nuevo ${modalType}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setNewItemName('');
        }}
        onOk={handleCreateNewItem}
        confirmLoading={loading}
      >
        <Input
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={`Nombre del ${modalType}`}
        />
      </Modal>
    </>
  );
};

export default BookForm;
