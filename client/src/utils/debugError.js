/**
 * Función de prueba para validar el manejo de errores
 * Ejecuta este archivo en la consola del navegador para debuggear
 */

// Paso 1: Probar crear un autor duplicado
console.log('=== DEBUGGING: Manejo de errores 409 ===');

// Simular el error que debería venir del servidor
const mockServerError = {
  name: 'RejectWithValue',
  payload: {
    status: 409,
    data: {
      message: 'Author already exists',
      statusCode: 409
    }
  }
};

console.log('1. Error simulado del servidor:', mockServerError);

// Simular la lógica del hook useResources
const processError = (error, modalType) => {
  console.log('2. Procesando error en useResources...');
  
  const resourceNames = {
    authors: { singular: 'autor' },
    genres: { singular: 'género' },
    editorials: { singular: 'editorial' }
  };
  
  const resourceType = resourceNames[modalType].singular;
  let errorMessage = `Error al crear ${resourceType}`;
  
  if (error.name === 'RejectWithValue' && error.payload) {
    const { status, data } = error.payload;
    console.log('3. Status detectado:', status, 'Data:', data);
    
    if (status === 409 || data?.statusCode === 409) {
      const capitalizedType = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
      errorMessage = `${capitalizedType} ya existe`;
      console.log('4. Detectado error 409, mensaje:', errorMessage);
    } else if (data?.message) {
      errorMessage = data.message;
      console.log('4. Usando mensaje del servidor:', errorMessage);
    }
  }
  
  return errorMessage;
};

// Probar
const result = processError(mockServerError, 'authors');
console.log('5. Resultado final:', result);
console.log('6. ¿Es correcto?', result === 'Autor ya existe');

// Instrucciones para debugging real
console.log(`
=== INSTRUCCIONES PARA DEBUGGING ===
1. Abre las Developer Tools (F12)
2. Ve a la pestaña Network
3. Intenta crear un autor duplicado
4. Observa la respuesta del servidor
5. Revisa los logs en la consola
6. Compara con el resultado esperado: "${result}"
`);
