// Script de prueba para el manejo de errores
// Puedes ejecutar esto en la consola del navegador

console.log('=== Prueba del manejo de errores ===');

// Simular error 409 de Redux
const testError409 = {
  name: 'RejectWithValue',
  payload: {
    status: 409,
    data: {
      message: 'Author already exists',
      statusCode: 409
    }
  }
};

console.log('Test error 409:', testError409);

// Simular la función getErrorMessage
const getErrorMessage = (error, resourceType) => {
  console.log('getErrorMessage - Error recibido:', error);
  
  // Simular handleApiError
  let status = 500;
  let message = 'Error desconocido';
  
  if (error && error.payload) {
    status = error.payload.status || 500;
    message = error.payload.data?.message || 'Error desconocido';
  }
  
  console.log('Status detectado:', status);
  
  switch (status) {
    case 409:
      return resourceType 
        ? `Ya existe ${resourceType} con este nombre`
        : 'El recurso ya existe';
    case 500:
      return 'Error interno del servidor';
    default:
      return message || 'Error desconocido';
  }
};

// Probar
const result = getErrorMessage(testError409, 'autor');
console.log('Resultado:', result);
console.log('¿Es correcto?', result === 'Ya existe autor con este nombre');
