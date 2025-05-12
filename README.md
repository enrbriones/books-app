# CMPC-Libros

## Instalación

1. Instalar Docker
2. Ir a la raíz del proyecto en la terminal y ejecutar los siguientes comandos para buildear el contenedor

```
cp .env.template .env
docker compose up --build
```

3. Entrar a la interfaz de usuario desde http://localhost:5173/
4. Entrar con las siguientes credenciales

```
admin@gmail.com
test1234
```

5. Si por algún motivo se requiere un nuevo usuario, se puede utilizar el siguiente endpoint de registro:

```
path: http://localhost:3000/api/auth/register
tipo: POST
json:

{
    "name": "Usuario nuevo",
    "email": "usuario@correo.com",
    "password": "mipassword"
}
```

## Guía de uso de la app

**Login/Logout**

1. Ingresar con correo y contraseña disponibles
2. Una vez logeado se pueden utilizar todas las funcionalidades
3. Arriba a la derecha se puede cerrar sesión haciendo click en el botón respectivo.

**Lista de libros**

1. Se muestra una lista paginada de libros y su información respectiva.
2. Se puede realizar una búsqueda por título escribiendo en la entrada de texto disponible, y de forma automática debería obtener resultados de acuerdo al criterio de búsqueda.
3. También se puede filtrar por autor, editorial, género y disponibilidad.
4. Se puede ordenar por autor, editorial y género de forma ascendente y descendente.
5. Podemos descargar un archivo CSV con todo el catálogo de libros disponible.
6. Al hacer click en "Nuevo Libro" se abrirá un formulario para el ingreso de datos.

**Formulario Libros**

1. Título: campo obligatorio
2. Descripción: campo opcional
3. Autor, Editorial y Género: Se pueden seleccionar desde la lista disponiblrespectiva. También se puede agregar un nuevo elemento haciendo click en "Crear nuevo...". Una vez que el elemento fue creado, se puede elegir desde el selector.
4. Precio: campo obligatorio. Debe tener un valor mayor a cero.
5. Disponible. Quitar el check si se desea indicar que no es disponible.
6. Una vez se tenga completo el formulario, click en "Crear Libro". En el caso de una creación exitosa, se cierra el formulario y el nuevo libro podrá ser buscado en la lista paginada.

## Modelo DB

![Modelo DB](/modelo-db-cmpc-libros-enrique-briones.png)

**Esquema https://dbdiagram.io/**

```
Table Users {
  id integer [primary key]
  name varchar [not null]
  email varchar [unique, not null]
  password varchar [not null]
  isActive varchar [not null, default: true]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table Books {
  id integer [primary key]
  title varchar [not null]
  description varchar
  authorId integer [not null]
  editorialId integer [not null]
  genreId integer [not null]
  isAvailable bool [not null, default: true]
  isActive bool [not null, default: true]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table Authors {
  id integer [primary key]
  name varchar [unique, not null]
  isActive bool [not null, default: true]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table Editorials {
  id integer [primary key]
  name varchar [unique, not null]
  isActive bool [not null, default: true]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table Genres {
  id integer [primary key]
  name varchar [unique, not null]
  isActive bool [not null, default: true]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Ref: "Authors"."id" < "Books"."authorId"

Ref: "Editorials"."id" < "Books"."editorialId"

Ref: "Genres"."id" < "Books"."genreId"
```

**Notas**

1. Se asumió que cada libro sólo tendría un autor, una editorial y un tipo de género.
2. Se decide dejar el precio con valor decimal ya que es la forma estándar de representar cantidades financieras.
3. Cada tabla tiene un campo "IsActive" para manejar los "soft deletes" y conservar la integridad de los datos.
4. En el caso de autores, editoriales y géneros se decide dejar el nombre como valor único para evitar duplicidad de datos. Esto no se puede aplicar a los títulos de los libros, ya que es muy probable que existan coincidencias de nombre, aunque de diferentes autores o editoriales.
