# Manejo de Errores en el Frontend

## Actualización para Status Code 409 (Conflict)

### Cambios Realizados

1. **Backend API**:

   - ✅ Cambiado de `HttpStatus.FOUND` (302) a `HttpStatus.CONFLICT` (409) para recursos duplicados
   - ✅ Actualizada la documentación Swagger con ejemplos de respuesta para error 409
   - ✅ **NUEVO**: Agregados ejemplos de respuesta exitosa para todos los métodos GET, PATCH y DELETE

2. **Frontend React**:
   - ✅ Actualizado el hook `useResources` para manejar errores 409
   - ✅ Mejorado el manejo de errores en `BookForm.tsx`
   - ✅ Creada utilidad `errorHandler.ts` para manejo consistente de errores

### Documentación Swagger Completa

#### Ejemplos de Respuesta Agregados:

**Autores (Authors)**:

- `GET /authors` → Lista de autores con estructura `{authors: [...], ok: true}`
- `GET /authors/:id` → Autor individual con estructura `{author: {...}, ok: true}`
- `PATCH /authors/:id` → Autor actualizado con estructura `{author: {...}, ok: true}`
- `DELETE /authors/:id` → Mensaje de confirmación `{message: "Author with id #1 was deleted", ok: true}`

**Géneros (Genres)**:

- `GET /genres` → Lista de géneros con estructura `{genres: [...], ok: true}`
- `GET /genres/:id` → Género individual con estructura `{genre: {...}, ok: true}`
- `PATCH /genres/:id` → Género actualizado con estructura `{genre: {...}, ok: true}`
- `DELETE /genres/:id` → Mensaje de confirmación `{message: "Genre with id #1 was deleted", ok: true}`

**Editoriales (Editorials)**:

- `GET /editorials` → Lista de editoriales con estructura `{editorials: [...], ok: true}`
- `GET /editorials/:id` → Editorial individual con estructura `{editorial: {...}, ok: true}`
- `PATCH /editorials/:id` → Editorial actualizada con estructura `{editorial: {...}, ok: true}`
- `DELETE /editorials/:id` → Mensaje de confirmación `{message: "Editorial with id #1 was deleted", ok: true}`

### Utilidad de Manejo de Errores

La nueva utilidad `utils/errorHandler.ts` proporciona:

- **`handleApiError(error)`**: Extrae información estructurada de errores de Axios y Redux
- **`getErrorMessage(error, resourceType)`**: Genera mensajes de error localizados basados en el status code

### Status Codes Manejados

- **409 Conflict**: "Ya existe [recurso] con este nombre"
- **404 Not Found**: "[Recurso] no encontrado"
- **400 Bad Request**: "Datos inválidos"
- **401 Unauthorized**: "No autorizado"
- **403 Forbidden**: "Acceso denegado"
- **500 Internal Server Error**: "Error interno del servidor"

### Componentes Actualizados

1. **`hooks/useResources.ts`**:

   - Maneja errores 409 para recursos duplicados (autores, editoriales, géneros)
   - Utiliza la nueva utilidad de manejo de errores

2. **`ui/BookForm.tsx`**:
   - Maneja errores 409 para libros duplicados
   - Muestra mensajes de error más específicos

### Mensajes de Error Mejorados

Antes:

- "Error al crear autor"
- "Error al crear libro"
- "Error interno del servidor"

Después:

- "Ya existe autor con este nombre" (409)
- "Ya existe libro con este título" (409)
- "Datos inválidos" (400)
- "Autor no encontrado" (404)

### Ejemplos de Uso

```typescript
import { getErrorMessage } from '../utils/errorHandler';

try {
  await api.post('/authors', { name: 'Autor' });
} catch (error) {
  const errorMessage = getErrorMessage(error, 'autor');
  message.error(errorMessage);
}
```

### Documentación Swagger Accesible

Accede a la documentación completa en: `http://localhost:3000/api`

- **Autenticación JWT**: Configurada y documentada
- **Ejemplos de respuesta**: Todos los endpoints tienen ejemplos detallados
- **Códigos de estado**: Documentados correctamente (200, 201, 400, 404, 409, 500)
- **Esquemas de datos**: Estructuras de respuesta completas

### Consistencia

Todos los componentes ahora manejan errores de manera consistente:

- Mensajes localizados en español
- Diferentes mensajes según el tipo de error
- Logs detallados para debugging
- UX mejorada con mensajes específicos
- Documentación API completa con ejemplos
