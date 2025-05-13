import { type ColumnsType } from 'antd/es/table';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { type Book } from '../types/book';
import { type Dispatch, type SetStateAction } from 'react';

interface BooksColumnsProps {
  filters: {
    authors: { text: string; value: string }[];
    editorials: { text: string; value: string }[];
    genres: { text: string; value: string }[];
  };
  setSelectedBook: Dispatch<SetStateAction<Book | null>>;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
}

export const getBooksColumns = ({
  filters,
  setSelectedBook,
  setIsModalVisible,
}: BooksColumnsProps): ColumnsType<Book> => [
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