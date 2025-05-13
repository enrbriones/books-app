/* eslint-disable @typescript-eslint/no-explicit-any */

import { Table, Input, Typography, message, Button, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../ui/Navbar';
import debounce from 'lodash/debounce';
import { DownloadOutlined, EditOutlined } from '@ant-design/icons';
import BookForm from '../ui/BookForm';

const { Title } = Typography;

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

interface ApiResponse {
  total: number;
  data: Book[];
  currentPage: number;
  totalPages: number;
}

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
  const [inputTitle, setInputTitle] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 10,
    title: '',
    orderBy: '',
    isAvailable: undefined,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    authors: { text: string; value: string }[];
    editorials: { text: string; value: string }[];
    genres: { text: string; value: string }[];
  }>({ authors: [], editorials: [], genres: [] });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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
    let isCurrent = true;
    fetchBooks(
      queryParams.page,
      queryParams.pageSize,
      queryParams.title,
      queryParams.orderBy,
      queryParams.authorId,
      queryParams.editorialId,
      queryParams.genreId,
      queryParams.isAvailable,
    ).then(() => {
      if (!isCurrent) return;
    });
    return () => {
      isCurrent = false;
    };
  }, [queryParams]);

  const fetchBooks = async (
    page: number,
    size: number,
    title: string,
    orderBy: string,
    authorId?: number,
    editorialId?: number,
    genreId?: number,
    isAvailable?: boolean,
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('No se encontró el token de autenticación. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      const response = await axios.get<ApiResponse>('/api/books/search', {
        params: {
          page,
          pageSize: size,
          title: title || undefined,
          authorId,
          editorialId,
          genreId,
          orderBy: orderBy || undefined,
          isAvailable: isAvailable,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mappedBooks = response.data.data.map((book) => ({
        ...book,
        authorName: book.author.name,
        editorialName: book.editorial.name,
        genreName: book.genre.name,
      }));

      setBooks(mappedBooks);
      setTotal(response.data.total);

      const uniqueAuthors = Array.from(
        new Map(
          response.data.data.map((book) => [
            book.author.id,
            { text: book.author.name, value: book.author.id.toString() },
          ]),
        ).values(),
      );
      const uniqueEditorials = Array.from(
        new Map(
          response.data.data.map((book) => [
            book.editorial.id,
            { text: book.editorial.name, value: book.editorial.id.toString() },
          ]),
        ).values(),
      );
      const uniqueGenres = Array.from(
        new Map(
          response.data.data.map((book) => [
            book.genre.id,
            { text: book.genre.name, value: book.genre.id.toString() },
          ]),
        ).values(),
      );

      setFilters({
        authors: uniqueAuthors,
        editorials: uniqueEditorials,
        genres: uniqueGenres,
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else {
        message.error('Error al cargar los libros');
      }
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const columns: ColumnsType<Book> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
      render: (title: string, record: Book) => (
        <Link to={`/books/${record.id}`}>{title}</Link>
      ),
    },
    {
      title: 'Autor',
      dataIndex: 'authorName',
      key: 'author',
      width: 150,
      ellipsis: true,
      filters: filters.authors,
      filterMultiple: false,
      onFilter: (value, record) => record.author.id.toString() === value,
      sorter: true,
    },
    {
      title: 'Editorial',
      dataIndex: 'editorialName',
      key: 'editorial',
      width: 150,
      ellipsis: true,
      filters: filters.editorials,
      filterMultiple: false,
      onFilter: (value, record) => record.editorial.id.toString() === value,
      sorter: true,
    },
    {
      title: 'Género',
      dataIndex: 'genreName',
      key: 'genre',
      width: 150,
      ellipsis: true,
      filters: filters.genres,
      filterMultiple: false,
      onFilter: (value, record) => record.genre.id.toString() === value,
      sorter: true,
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: string) => `$${parseFloat(price).toFixed(2)}`,
    },
    {
      title: 'Disponible',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      width: 100,
      render: (isAvailable: boolean) => (isAvailable ? 'Sí' : 'No'),
      filterMultiple: false,
      filters: [
        { text: 'Sí', value: 'true' },
        { text: 'No', value: 'false' },
      ],
      onFilter: (value, record) => record.isAvailable.toString() === value,
    },
    {
      title: 'Acción',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedBook(record);
            setIsModalVisible(true);
          }}
        >
          Editar
        </Button>
      ),
    },
  ];

  const handleDownloadCSV = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('No se encontró el token de autenticación. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/books/csv', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'libros.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('Archivo CSV descargado correctamente.');
    } catch (error: any) {
      message.error('Error al descargar el archivo CSV.');
      console.error('Error downloading CSV:', error);
    } finally {
      setLoading(false);
    }
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
          book={selectedBook}
          onSuccess={() => {
            setIsModalVisible(false);
            setSelectedBook(null);
            fetchBooks(
              queryParams.page,
              queryParams.pageSize,
              queryParams.title,
              queryParams.orderBy,
              queryParams.authorId,
              queryParams.editorialId,
              queryParams.genreId,
              queryParams.isAvailable,
            );
            messageApi.open({
              type: 'success',
              content: selectedBook ? 'Libro actualizado con éxito' : 'Libro creado con éxito',
            });
          }}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
};

export default Books;