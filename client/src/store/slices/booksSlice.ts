import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { Book, ApiResponse } from '../../types/book';
import api, { handleApiError } from '../../services/api';
import type { RootState } from '..';

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

// Selectores memorizados
export const selectBooks = (state: RootState) => state.books.books;
export const selectTotal = (state: RootState) => state.books.total;
export const selectLoading = (state: RootState) => state.books.loading;
export const selectError = (state: RootState) => state.books.error;

export const selectFilters = createSelector(
  (state: RootState) => state.books.filters,
  (filters) => filters
);

export const selectFilteredBooks = createSelector(
  [selectBooks, (_state: RootState, filter: string) => filter],
  (books, filter) => {
    if (!filter) return books;
    const searchTerm = filter.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.name.toLowerCase().includes(searchTerm)
    );
  }
);

// Tipos para los errores
interface ApiError {
  response?: {
    status: number;
    data?: {
      message: string;
    };
  };
  message: string;
}

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

    const response = await api.get<ApiResponse>('/books/search', {
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
    });

    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return rejectWithValue(
        'Sesión expirada. Por favor, inicia sesión nuevamente.',
      );
    }
    return rejectWithValue(handleApiError(error));
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

    const response = await api.get('/books/csv', {
      responseType: 'blob',
    });

    // Crear y descargar el archivo
    const downloadFile = (blob: Blob, filename: string) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    };

    downloadFile(new Blob([response.data]), 'libros.csv');
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al descargar CSV:', apiError);
    return rejectWithValue(handleApiError(error));
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
