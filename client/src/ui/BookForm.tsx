import { type FC, useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, InputNumber } from 'antd';
import { useResources, resourceNames } from '../hooks/useResources';
import { CreateResourceModal } from '../components/CreateResourceModal';
import api from '../utils/api';

const { TextArea } = Input;

// Resource types are now imported from types/book.ts

import { type Book as BookType } from '../types/book';

type Book = Omit<BookType, 'price'> & {
  price: number;
};

interface FormValues {
  title: string;
  description: string;
  authorId: number;
  editorialId: number;
  genreId: number;
  price: number;
  isAvailable: boolean;
}

interface BookFormProps {
  book?: Book;
  onSuccess: () => void;
  onCancel: () => void;
}

// Las interfaces y constantes de recursos se movieron a useResources.ts

const BookForm: FC<BookFormProps> = ({ book, onSuccess, onCancel }) => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const {
    modalVisible,
    modalType,
    modalError,
    newItemName,
    options,
    loading: resourceLoading,
    handleCreateResource,
    openCreateModal,
    closeModal,
    setNewItemName,
  } = useResources(form);

  const handleCreateItem = async () => {
    try {
      const result = await handleCreateResource();
      
      if (result.success) {
        const resourceType = resourceNames[modalType].singular;
        const capitalizedType = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
        message.success(`${capitalizedType} creado exitosamente`);
        return true;
      } 
      return false;
    } catch (err) {
      console.error('Error en handleCreateItem:', err);
      return false;
    }
  };

  useEffect(() => {
    if (book) {
      form.setFieldsValue({
        title: book.title,
        description: book.description,
        authorId: book.author.id,
        editorialId: book.editorial.id,
        genreId: book.genre.id,
        price: book.price,
        isAvailable: book.isAvailable,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isAvailable: true });
    }
  }, [book, form]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const bookData = {
        title: values.title.trim(),
        description: values.description?.trim() || '',
        authorId: Number(values.authorId),
        editorialId: Number(values.editorialId),
        genreId: Number(values.genreId),
        price: Number(values.price),
        isAvailable: Boolean(values.isAvailable)
      };
      
      if (book) {
        const response = await api.patch(`/books/${book.id}`, bookData);
        if (response.status === 200) {
          message.success('Libro actualizado con éxito');
          onSuccess();
        }
      } else {
        const response = await api.post('/books', bookData);
        if (response.status === 201) {
          message.success('Libro creado con éxito');
          onSuccess();
        }
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Error al procesar la operación';
      message.error(book ? `Error al actualizar el libro: ${errorMessage}` : `Error al crear el libro: ${errorMessage}`);          console.error('Error:', axiosError.response || error);
          setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Las funciones de manejo de recursos se movieron a useResources

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ isAvailable: true }}
      >
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: 'Por favor ingresa el título del libro' }]}
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
            options={options.authors}
            showSearch
            allowClear
            placeholder="Selecciona un autor"
            filterOption={(input, option) =>
              ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={null}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  onClick={() => openCreateModal('authors')}
                  style={{ padding: '8px 16px', width: '100%', textAlign: 'left' }}
                >
                  + Crear nuevo autor
                </Button>
              </>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Editorial"
          name="editorialId"
          rules={[{ required: true, message: 'Por favor selecciona una editorial' }]}
        >
          <Select
            options={options.editorials}
            showSearch
            allowClear
            placeholder="Selecciona una editorial"
            filterOption={(input, option) =>
              ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={null}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  onClick={() => openCreateModal('editorials')}
                  style={{ padding: '8px 16px', width: '100%', textAlign: 'left' }}
                >
                  + Crear nueva editorial
                </Button>
              </>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Género"
          name="genreId"
          rules={[{ required: true, message: 'Por favor selecciona un género' }]}
        >
          <Select
            options={options.genres}
            showSearch
            allowClear
            placeholder="Selecciona un género"
            filterOption={(input, option) =>
              ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={null}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  onClick={() => openCreateModal('genres')}
                  style={{ padding: '8px 16px', width: '100%', textAlign: 'left' }}
                >
                  + Crear nuevo género
                </Button>
              </>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Precio"
          name="price"
          rules={[{ required: true, message: 'Por favor ingresa el precio' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            prefix="$"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Disponible"
          name="isAvailable"
        >
          <Select
            options={[
              { value: true, label: 'Disponible' },
              { value: false, label: 'No disponible' },
            ]}
            defaultValue={true}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {book ? 'Actualizar' : 'Crear'} Libro
          </Button>
          <Button onClick={onCancel} style={{ marginLeft: 8 }}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>

      <CreateResourceModal
        visible={modalVisible}
        type={modalType}
        loading={resourceLoading}
        error={modalError}
        value={newItemName}
        onChange={setNewItemName}
        onOk={async () => {
          const success = await handleCreateItem();
          if (success) {
            closeModal();
          }
        }}
        onCancel={closeModal}
      />
    </>
  );
};

export default BookForm;
