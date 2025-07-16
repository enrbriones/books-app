import { type FC, useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, InputNumber, Modal } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchAuthors, 
  fetchEditorials, 
  fetchGenres,
  createAuthor,
  createEditorial,
  createGenre
} from '../store/slices/resourcesSlice';
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

interface ResourceNames {
  singular: string;
  plural: string;
  gender: 'masculine' | 'feminine';
}

const resourceNames: Record<'authors' | 'editorials' | 'genres', ResourceNames> = {
  authors: {
    singular: 'autor',
    plural: 'autores',
    gender: 'masculine',
  },
  editorials: {
    singular: 'editorial',
    plural: 'editoriales',
    gender: 'feminine',
  },
  genres: {
    singular: 'género',
    plural: 'géneros',
    gender: 'masculine',
  },
};

const BookForm: FC<BookFormProps> = ({ book, onSuccess, onCancel }) => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'authors' | 'editorials' | 'genres'>('authors');
  const [newItemName, setNewItemName] = useState('');

  const dispatch = useAppDispatch();
  const { authors, editorials, genres } = useAppSelector((state) => state.resources);

  const authorOptions = authors.map((author) => ({
    value: author.id,
    label: author.name,
  }));

  const editorialOptions = editorials.map((editorial) => ({
    value: editorial.id,
    label: editorial.name,
  }));

  const genreOptions = genres.map((genre) => ({
    value: genre.id,
    label: genre.name,
  }));

  useEffect(() => {
    dispatch(fetchAuthors());
    dispatch(fetchEditorials());
    dispatch(fetchGenres());
  }, [dispatch]);

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

  const handleCreateNewItem = async () => {
    if (!newItemName.trim()) {
      message.error('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      switch (modalType) {
        case 'authors': {
          const newAuthor = await dispatch(createAuthor(newItemName)).unwrap();
          if (!newAuthor) {
            throw new Error('No se pudo crear el autor');
          }
          await dispatch(fetchAuthors());
          form.setFieldsValue({ authorId: newAuthor.id });
          setModalVisible(false);
          setNewItemName('');
          break;
        }
        case 'editorials': {
          const newEditorial = await dispatch(createEditorial(newItemName)).unwrap();
          if (!newEditorial) {
            throw new Error('No se pudo crear la editorial');
          }
          await dispatch(fetchEditorials());
          form.setFieldsValue({ editorialId: newEditorial.id });
          setModalVisible(false);
          setNewItemName('');
          break;
        }
        case 'genres': {
          const newGenre = await dispatch(createGenre(newItemName)).unwrap();
          if (!newGenre) {
            throw new Error('No se pudo crear el género');
          }
          await dispatch(fetchGenres());
          form.setFieldsValue({ genreId: newGenre.id });
          setModalVisible(false);
          setNewItemName('');
          break;
        }
      }

      const resource = resourceNames[modalType];
      message.success(
        `${resource.singular.charAt(0).toUpperCase() + resource.singular.slice(1)} ${
          resource.gender === 'masculine' ? 'creado' : 'creada'
        } exitosamente`,
      );

      setModalVisible(false);
      setNewItemName('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al crear ${resourceNames[modalType].singular}`;
      message.error(errorMessage);
      console.error(`Error creating ${modalType}:`, error);
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
            options={authorOptions}
            showSearch
            allowClear
            placeholder="Selecciona un autor"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
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
                  + Crear nuevo {resourceNames.authors.singular}
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
            options={editorialOptions}
            showSearch
            allowClear
            placeholder="Selecciona una editorial"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  onClick={() => openCreateModal('editorials')}
                  style={{ padding: '8px 16px', width: '100%', textAlign: 'left' }}
                >
                  + Crear nueva {resourceNames.editorials.singular}
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
            options={genreOptions}
            showSearch
            allowClear
            placeholder="Selecciona un género"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  onClick={() => openCreateModal('genres')}
                  style={{ padding: '8px 16px', width: '100%', textAlign: 'left' }}
                >
                  + Crear nuevo {resourceNames.genres.singular}
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

      <Modal
        title={`Crear ${resourceNames[modalType].singular}`}
        open={modalVisible}
        onOk={handleCreateNewItem}
        onCancel={() => {
          setModalVisible(false);
          setNewItemName('');
        }}
        confirmLoading={loading}
      >
        <Form layout="vertical">
          <Form.Item
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
          >
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Ingresa el nombre del ${resourceNames[modalType].singular}`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BookForm;
