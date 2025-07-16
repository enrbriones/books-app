export interface QueryParams {
  page: number;
  pageSize: number;
  title?: string;
  orderBy?: string;
  authorId?: number;
  editorialId?: number;
  genreId?: number;
  isAvailable?: boolean;
}

export interface FilterOption {
  text: string;
  value: string;
}

export interface BooksFilters {
  authors: FilterOption[];
  editorials: FilterOption[];
  genres: FilterOption[];
}

import type { Book } from './book';

export interface BooksState {
  books: Book[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: BooksFilters;
}
