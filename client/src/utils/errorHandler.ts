import { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

export const handleApiError = (error: unknown, defaultMessage = 'Error desconocido'): ApiError => {
  // Manejo de errores de Axios
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || defaultMessage;
    
    return {
      status,
      message,
      data: error.response?.data
    };
  }
  
  // Manejo de errores de Redux createAsyncThunk
  if (typeof error === 'object' && error !== null) {
    const rejectError = error as {
      status?: number;
      data?: {
        message?: string;
        statusCode?: number;
      };
      payload?: {
        status?: number;
        data?: {
          message?: string;
          statusCode?: number;
        };
      };
      response?: {
        status?: number;
        data?: {
          message?: string;
        };
      };
    };
    
    // Error directo con status y data (como viene del slice)
    if (rejectError.status && rejectError.data) {
      const status = rejectError.status;
      const message = rejectError.data.message || defaultMessage;
      
      return {
        status,
        message,
        data: rejectError.data
      };
    }
    
    // Error con payload de rejectWithValue
    if (rejectError.payload) {
      const status = rejectError.payload.status || 500;
      const message = rejectError.payload.data?.message || defaultMessage;
      
      return {
        status,
        message,
        data: rejectError.payload.data
      };
    }
    
    // Error con estructura de response
    if (rejectError.response) {
      const status = rejectError.response.status || 500;
      const message = rejectError.response.data?.message || defaultMessage;
      
      return {
        status,
        message,
        data: rejectError.response.data
      };
    }
  }
  
  return {
    status: 500,
    message: defaultMessage
  };
};

export const getErrorMessage = (error: unknown, resourceType?: string): string => {
  const apiError = handleApiError(error);
  
  switch (apiError.status) {
    case 409:
      return resourceType 
        ? `Ya existe ${resourceType} con este nombre`
        : 'El recurso ya existe';
    case 404:
      return resourceType 
        ? `${resourceType} no encontrado`
        : 'Recurso no encontrado';
    case 400:
      return 'Datos inválidos';
    case 401:
      return 'No autorizado';
    case 403:
      return 'Acceso denegado';
    case 500:
      return 'Error interno del servidor';
    default:
      return apiError.message || 'Error desconocido';
  }
};
