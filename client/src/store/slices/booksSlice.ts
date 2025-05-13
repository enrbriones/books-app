/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { type Book, type ApiResponse } from '../../types/book';

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

interface BooksState {
  books: Book[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: {
    authors: { text: string; value: string }[];
    editorials: { text: string; value: string }[];
    genres: { text: string; value: string }[];
  };
}

const initialState: BooksState = {
  books: [],
  total: 0,
  loading: false,
  error: null,
  filters: { authors: [], editorials: [], genres: [] },
};

export const fetchBooks = createAsyncThunk<
  ApiResponse,
  QueryParams,
  { rejectValue: string }
>('books/fetchBooks', async (params, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return rejectWithValue('No se encontró el token de autenticación.');
    }

    const response = await axios.get<ApiResponse>('/api/books/search', {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        title: params.title || undefined,
        authorId: params.authorId,
        editorialId: params.editorialId,
        genreId: params.genreId,
        orderBy: params.orderBy || undefined,
        isAvailable: params.isAvailable,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return rejectWithValue(
        'Sesión expirada. Por favor, inicia sesión nuevamente.',
      );
    }
    return rejectWithValue('Error al cargar los libros.');
  }
});

export const downloadBooksCSV = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('books/downloadBooksCSV', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return rejectWithValue('No se encontró el token de autenticación.');
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
  } catch (error: any) {
    console.error(error);
    return rejectWithValue('Error al descargar el archivo CSV.');
  }
});

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.data.map((book) => ({
          ...book,
          authorName: book.author.name,
          editorialName: book.editorial.name,
          genreName: book.genre.name,
        }));
        state.total = action.payload.total;

        const uniqueAuthors = Array.from(
          new Map(
            action.payload.data.map((book) => [
              book.author.id,
              { text: book.author.name, value: book.author.id.toString() },
            ]),
          ).values(),
        );
        const uniqueEditorials = Array.from(
          new Map(
            action.payload.data.map((book) => [
              book.editorial.id,
              {
                text: book.editorial.name,
                value: book.editorial.id.toString(),
              },
            ]),
          ).values(),
        );
        const uniqueGenres = Array.from(
          new Map(
            action.payload.data.map((book) => [
              book.genre.id,
              { text: book.genre.name, value: book.genre.id.toString() },
            ]),
          ).values(),
        );

        state.filters = {
          authors: uniqueAuthors,
          editorials: uniqueEditorials,
          genres: uniqueGenres,
        };
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido';
      });

    builder
      .addCase(downloadBooksCSV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadBooksCSV.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadBooksCSV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido';
      });
  },
});

export const { resetError } = booksSlice.actions;
export default booksSlice.reducer;
