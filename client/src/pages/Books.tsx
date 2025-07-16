/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Input, Typography, message, Button, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import Navbar from '../ui/Navbar';
import debounce from 'lodash/debounce';
import { DownloadOutlined } from '@ant-design/icons';
import BookForm from '../ui/BookForm';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import {
  fetchBooks,
  downloadBooksCSV,
  resetError,
} from '../store/slices/booksSlice';
import { fetchAuthors, fetchEditorials, fetchGenres } from '../store/slices/resourcesSlice';
import { type Book } from '../types/book';
import { getBooksColumns } from '../components/BooksColumns';

const { Title } = Typography;

interface QueryParams {
  page: number;
  pageSize: number;
  title: string;
  orderBy: string;
  authorId?: number;
  editorialId?: number;
  genreId?: number;
  isAvailable?: boolean;
}

const Books: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch<AppDispatch>();
  const { books, total, loading, error } = useSelector(
    (state: RootState) => state.books,
  );
  const { authors, editorials, genres } = useSelector(
    (state: RootState) => state.resources
  );
  const [inputTitle, setInputTitle] = useState('');
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 10,
    title: '',
    orderBy: '',
    isAvailable: undefined,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    if (error) {
      messageApi.error(error);
      dispatch(resetError());
    }
  }, [error, messageApi, dispatch]);

  useEffect(() => {
    const debounced = debounce(() => {
      setQueryParams((prev) => ({
        ...prev,
        title: inputTitle,
        page: 1,
      }));
    }, 1000);
    debounced();
    return () => debounced.cancel();
  }, [inputTitle]);

  useEffect(() => {
    dispatch(fetchBooks(queryParams));
  }, [queryParams, dispatch]);

  const handleTableChange = (
    pagination: any,
    filters: {
      author?: string[];
      editorial?: string[];
      genre?: string[];
      isAvailable?: string[];
    },
    sorter: any,
  ) => {
    const { current, pageSize: newPageSize } = pagination;

    const fieldMap: { [key: string]: string } = {
      authorName: 'author.name',
      editorialName: 'editorial.name',
      genreName: 'genre.name',
      title: 'title',
      price: 'price',
    };

    const sorters = Array.isArray(sorter) ? sorter : [sorter];
    const orderByList = sorters
      .filter((s) => s.order)
      .flatMap((s) => {
        const rawField = s.field;
        const field = fieldMap[rawField] || rawField;
        const direction = s.order === 'ascend' ? 'ASC' : 'DESC';
        return [field, direction];
      });

    const orderBy = orderByList.join(',');

    const authorId = filters.author?.length
      ? parseInt(filters.author[0])
      : undefined;
    const editorialId = filters.editorial?.length
      ? parseInt(filters.editorial[0])
      : undefined;
    const genreId = filters.genre?.length
      ? parseInt(filters.genre[0])
      : undefined;
    const isAvailable =
      filters.isAvailable?.length && filters.isAvailable[0] !== undefined
        ? filters.isAvailable[0] === 'true'
        : undefined;

    setQueryParams({
      page: current,
      pageSize: newPageSize,
      title: queryParams.title,
      orderBy,
      authorId,
      editorialId,
      genreId,
      isAvailable,
    });
  };

  const filters = {
    authors: authors.map(author => ({ text: author.name, value: author.id.toString() })),
    editorials: editorials.map(editorial => ({ text: editorial.name, value: editorial.id.toString() })),
    genres: genres.map(genre => ({ text: genre.name, value: genre.id.toString() }))
  };

  useEffect(() => {
    dispatch(fetchAuthors());
    dispatch(fetchEditorials());
    dispatch(fetchGenres());
  }, [dispatch]);

  const columns = getBooksColumns({
    filters,
    setSelectedBook,
    setIsModalVisible,
  });

  const handleDownloadCSV = () => {
    dispatch(downloadBooksCSV()).then((result) => {
      if (downloadBooksCSV.fulfilled.match(result)) {
        messageApi.success('Archivo CSV descargado correctamente.');
      }
    });
  };

  const showCreateBookModal = () => {
    setSelectedBook(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedBook(null);
  };

  return (
    <>
      <Navbar />
      {contextHolder}
      <div
        style={{
          padding: 24,
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <Title level={4}>Listado de libros</Title>
        <div
          style={{
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Input
            placeholder="Buscar por título"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            style={{ marginBottom: 16, maxWidth: 300 }}
            allowClear
          />
          <div>
            <Button
              type="primary"
              onClick={showCreateBookModal}
              style={{ marginRight: 16 }}
            >
              + Nuevo Libro
            </Button>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleDownloadCSV}
            >
              Descargar CSV
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={books}
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: true }}
          style={{ maxWidth: '100%' }}
          onChange={handleTableChange}
          rowKey="id"
        />
      </div>
      <Modal
        title={selectedBook ? 'Editar Libro' : 'Crear Nuevo Libro'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <BookForm
          book={selectedBook ? {
            ...selectedBook,
            price: parseFloat(selectedBook.price)
          } : undefined}
          onSuccess={() => {
            setIsModalVisible(false);
            setSelectedBook(null);
            dispatch(fetchBooks(queryParams));
            messageApi.open({
              type: 'success',
              content: selectedBook
                ? 'Libro actualizado con éxito'
                : 'Libro creado con éxito',
            });
          }}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
};

export default Books;
