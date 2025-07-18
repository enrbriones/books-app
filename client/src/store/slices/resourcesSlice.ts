import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { AxiosError } from 'axios';

interface Author {
  id: number;
  name: string;
}

interface Editorial {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface ResourcesState {
  authors: Author[];
  editorials: Editorial[];
  genres: Genre[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  authors: [],
  editorials: [],
  genres: [],
  loading: false,
  error: null,
};

export const fetchAuthors = createAsyncThunk('resources/fetchAuthors', async () => {
  const { data } = await api.get('/authors');
  return data.authors;
});

export const fetchEditorials = createAsyncThunk('resources/fetchEditorials', async () => {
  const { data } = await api.get('/editorials');
  return data.editorials;
});

export const fetchGenres = createAsyncThunk('resources/fetchGenres', async () => {
  const { data } = await api.get('/genres');
  return data.genres;
});

export const createAuthor = createAsyncThunk(
  'resources/createAuthor',
  async (name: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/authors', { name });
      if (!data || !data.author || !data.author.id) {
        return rejectWithValue({
          status: 500,
          data: { message: 'La respuesta del servidor no tiene el formato esperado' }
        });
      }
      return data.author;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue({
        status: axiosError.response?.status,
        data: axiosError.response?.data
      });
    }
  }
);

export const createEditorial = createAsyncThunk(
  'resources/createEditorial',
  async (name: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/editorials', { name });
      if (!data || !data.editorial || !data.editorial.id) {
        return rejectWithValue({
          status: 500,
          data: { message: 'La respuesta del servidor no tiene el formato esperado' }
        });
      }
      return data.editorial;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue({
        status: axiosError.response?.status,
        data: axiosError.response?.data
      });
    }
  }
);

export const createGenre = createAsyncThunk(
  'resources/createGenre',
  async (name: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/genres', { name });
      if (!data || !data.genre || !data.genre.id) {
        return rejectWithValue({
          status: 500,
          data: { message: 'La respuesta del servidor no tiene el formato esperado' }
        });
      }
      return data.genre;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue({
        status: axiosError.response?.status,
        data: axiosError.response?.data
      });
    }
  }
);

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.authors = action.payload;
        state.loading = false;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.error = action.error.message || 'Error al cargar autores';
        state.loading = false;
      })
      .addCase(fetchEditorials.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEditorials.fulfilled, (state, action) => {
        state.editorials = action.payload;
        state.loading = false;
      })
      .addCase(fetchEditorials.rejected, (state, action) => {
        state.error = action.error.message || 'Error al cargar editoriales';
        state.loading = false;
      })
      .addCase(fetchGenres.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.genres = action.payload;
        state.loading = false;
      })
      .addCase(fetchGenres.rejected, (state, action) => {
        state.error = action.error.message || 'Error al cargar géneros';
        state.loading = false;
      })
      .addCase(createAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.authors.push(action.payload);
      })
      .addCase(createAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear autor';
      })
      .addCase(createEditorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEditorial.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.editorials.push(action.payload);
      })
      .addCase(createEditorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear editorial';
      })
      .addCase(createGenre.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGenre.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.genres.push(action.payload);
      })
      .addCase(createGenre.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear género';
      });
  },
});

export default resourcesSlice.reducer;
