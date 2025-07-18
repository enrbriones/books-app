import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createAuthor,
  createEditorial,
  createGenre,
  fetchAuthors,
  fetchEditorials,
  fetchGenres,
} from '../store/slices/resourcesSlice';
import { getErrorMessage } from '../utils/errorHandler';
import type { FormInstance } from 'antd/lib/form';

export type ResourceType = 'authors' | 'editorials' | 'genres';

interface CreateResourceResult {
  success?: boolean;
  error?: string;
  type?: ResourceType;
}

export interface ResourceNames {
  singular: string;
  plural: string;
  gender: 'masculine' | 'feminine';
}

export const resourceNames: Record<ResourceType, ResourceNames> = {
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

interface UseResourcesReturn {
  loading: boolean;
  modalVisible: boolean;
  modalType: ResourceType;
  modalError?: string;
  newItemName: string;
  options: {
    authors: Array<{ value: number; label: string }>;
    editorials: Array<{ value: number; label: string }>;
    genres: Array<{ value: number; label: string }>;
  };
  resourceNames: Record<ResourceType, ResourceNames>;
  setNewItemName: (value: string) => void;
  setModalError: (error: string | undefined) => void;
  handleCreateResource: () => Promise<CreateResourceResult>;
  openCreateModal: (type: ResourceType) => void;
  closeModal: () => void;
  fetchResources: () => void;
}

export const useResources = (form: FormInstance): UseResourcesReturn => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ResourceType>('authors');
  const [newItemName, setNewItemName] = useState('');
  const [modalError, setModalError] = useState<string>();

  const dispatch = useAppDispatch();
  const { authors, editorials, genres } = useAppSelector((state) => state.resources);

  const options = {
    authors: authors.map((author) => ({
      value: author.id,
      label: author.name,
    })),
    editorials: editorials.map((editorial) => ({
      value: editorial.id,
      label: editorial.name,
    })),
    genres: genres.map((genre) => ({
      value: genre.id,
      label: genre.name,
    })),
  };

  useEffect(() => {
    dispatch(fetchAuthors());
    dispatch(fetchEditorials());
    dispatch(fetchGenres());
  }, [dispatch]);

  const handleCreateResource = async (): Promise<CreateResourceResult> => {
    if (!newItemName.trim()) {
      setModalError('El nombre no puede estar vacío');
      return { error: 'El nombre no puede estar vacío' };
    }

    setModalError(undefined); // Limpiar error al iniciar
    setLoading(true);
    try {
      let result;
      switch (modalType) {
        case 'authors':
          result = await dispatch(createAuthor(newItemName)).unwrap();
          break;
        case 'editorials':
          result = await dispatch(createEditorial(newItemName)).unwrap();
          break;
        case 'genres':
          result = await dispatch(createGenre(newItemName)).unwrap();
          break;
      }

      // Verificamos si el resultado tiene el recurso creado
      // El resultado es directamente el objeto creado con id
      if (result && result.id) {
        const resourceId = result.id;
        
        // Establecer el ID en el formulario
        form.setFieldsValue({
          [`${modalType.slice(0, -1)}Id`]: resourceId
        });
        
        setModalError(undefined); // Limpiar error en éxito
        return { success: true, type: modalType };
      }
      
      const error = 'No se pudo crear el recurso';
      setModalError(error);
      return { error };
    } catch (error: unknown) {
      const resourceType = resourceNames[modalType].singular;
      const errorMessage = getErrorMessage(error, resourceType);
      
      setModalError(errorMessage);
      return { 
        error: errorMessage,
        type: modalType
      };
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (type: ResourceType) => {
    setModalType(type);
    setModalVisible(true);
    setModalError(undefined); // Limpiar error al abrir modal
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewItemName('');
    setLoading(false);
    setModalError(undefined);
    setModalType('authors'); // Resetear al tipo por defecto
  };

  const fetchResources = () => {
    dispatch(fetchAuthors());
    dispatch(fetchEditorials());
    dispatch(fetchGenres());
  };

  return {
    loading,
    modalVisible,
    modalType,
    modalError,
    newItemName,
    options,
    resourceNames,
    setNewItemName,
    setModalError,
    handleCreateResource,
    openCreateModal,
    closeModal,
    fetchResources,
  };
};
