export interface Book {
  id: number;
  title: string;
  author: { id: number; name: string };
  editorial: { id: number; name: string };
  genre: { id: number; name: string };
  price: string;
  isAvailable: boolean;
  description?: string;
}

export interface ApiResponse {
  total: number;
  data: Book[];
  currentPage: number;
  totalPages: number;
}