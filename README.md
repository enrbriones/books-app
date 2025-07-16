# CMPC-Libros

## Instalación

1. Instalar Docker
2. Ir a la raíz del proyecto en la terminal y ejecutar los siguientes comandos para buildear el contenedor

```
cp .env.template .env
docker compose up --build
docker compose up (si ya está buildeado y sólo queremos levantar)
```

3. Entrar a la interfaz de usuario desde http://localhost:5173/
4. Ingresar con las siguientes credenciales

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

6. Documentación de la API http://localhost:3000/api

## Guía de uso de la app

**Login/Logout**

![Login](/login.png)

1. Ingresar con correo y contraseña disponibles
2. Una vez logeado se pueden utilizar todas las funcionalidades
3. Arriba a la derecha se puede cerrar sesión haciendo click en el botón respectivo.

**Lista de libros**

![Listado](/listado.png)

1. Se muestra una lista paginada de libros y su información respectiva.
2. Se puede realizar una búsqueda por título escribiendo en la entrada de texto disponible, y de forma automática debería obtener resultados de acuerdo al criterio de búsqueda.
3. También se puede filtrar por autor, editorial, género y disponibilidad.
4. Se puede ordenar por autor, editorial y género de forma ascendente y descendente.
5. Podemos descargar un archivo CSV con todo el catálogo de libros disponible.
6. Al hacer click en "Nuevo Libro" se abrirá un formulario para el ingreso de datos.

**Formulario Crear/Actualizar Libros**

![Formulario](/formulario.png)

1. Título: campo obligatorio
2. Descripción: campo opcional
3. Autor, Editorial y Género: Se pueden seleccionar desde la lista disponiblrespectiva. También se puede agregar un nuevo elemento haciendo click en "Crear nuevo...". Una vez que el elemento fue creado, se puede elegir desde el selector.
4. Precio: campo obligatorio. Debe tener un valor mayor a cero.
5. Disponible. Quitar el check si se desea indicar que no es disponible.
6. Una vez se tenga completo el formulario, click en "Crear/Actualizar Libro". En el caso de una acción exitosa, se cierra el formulario y el nuevo libro podrá ser buscado en la lista paginada.

**Detalle libro**

![Detalle](/detalle.png)

1. Se puede visualizar el detalle de un libro si se hace click en el título del listado.

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

## Arquitectura

**Estructura del proyecto**

```
books-api/
├─ src/
│  ├─ auth/ <-- módulo de autenticación
│  │  ├─ decorators/
│  │  │  ├─ index.ts
│  │  │  ├─ token.decorator.ts
│  │  │  └─ user.decorator.ts
│  │  ├─ dto/
│  │  │  ├─ index.ts
│  │  │  ├─ login-user.dto.ts
│  │  │  └─ register-user.dto.ts
│  │  ├─ guards/
│  │  │  └─ auth.guard.ts
│  │  ├─ interfaces/
│  │  │  ├─ current-user.interface.ts
│  │  │  └─ jwt-payload.interface.ts
│  │  ├─ auth.controller.spec.ts
│  │  ├─ auth.controller.ts
│  │  ├─ auth.module.ts
│  │  ├─ auth.service.spec.ts
│  │  └─ auth.service.ts
│  ├─ authors/ <-- módulo de autores
│  │  ├─ dto/
│  │  │  ├─ create-author.dto.ts
│  │  │  └─ update-author.dto.ts
│  │  ├─ entities/
│  │  │  └─ author.entity.ts
│  │  ├─ authors.controller.spec.ts
│  │  ├─ authors.controller.ts
│  │  ├─ authors.module.ts
│  │  ├─ authors.service.spec.ts
│  │  └─ authors.service.ts
│  ├─ books/ <-- módulo de libros
│  │  ├─ dto/
│  │  │  ├─ create-book.dto.ts
│  │  │  ├─ findby-dto.ts
│  │  │  └─ update-book.dto.ts
│  │  ├─ entities/
│  │  │  └─ book.entity.ts
│  │  ├─ books.controller.spec.ts
│  │  ├─ books.controller.ts
│  │  ├─ books.module.ts
│  │  ├─ books.service.spec.ts
│  │  └─ books.service.ts
│  ├─ config/
│  │  ├─ envs.ts
│  │  └─ index.ts
│  ├─ db/ <-- modelo de datos
│  │  ├─ author.ts
│  │  ├─ book.ts
│  │  ├─ editorial.ts
│  │  ├─ genre.ts
│  │  └─ user.ts
│  ├─ editorials/ <-- módulo de editoriales
│  │  ├─ dto/
│  │  │  ├─ create-editorial.dto.ts
│  │  │  └─ update-editorial.dto.ts
│  │  ├─ entities/
│  │  │  └─ editorial.entity.ts
│  │  ├─ editorials.controller.spec.ts
│  │  ├─ editorials.controller.ts
│  │  ├─ editorials.module.ts
│  │  ├─ editorials.service.spec.ts
│  │  └─ editorials.service.ts
│  ├─ genres/ <-- módulo de géneros
│  │  ├─ dto/
│  │  │  ├─ create-genre.dto.ts
│  │  │  └─ update-genre.dto.ts
│  │  ├─ entities/
│  │  │  └─ genre.entity.ts
│  │  ├─ genres.controller.spec.ts
│  │  ├─ genres.controller.ts
│  │  ├─ genres.module.ts
│  │  ├─ genres.service.spec.ts
│  │  └─ genres.service.ts
│  ├─ interceptors/
│  │  ├─ audit.interceptor.ts <-- registra acciones POST, PATCH y DELETE
│  │  └─ timeout.interceptors.ts <-- maneja el timeout de las request en 30 seg.
│  ├─ seeds/ <-- para poblar la bd
│  │  ├─ author.seed.ts
│  │  ├─ book.seed.ts
│  │  ├─ editorial.seed.ts
│  │  ├─ genre.seed.ts
│  │  └─ user.seed.ts
│  ├─ users/ <-- insertamos usuarios iniciales.
│  │  ├─ users.service.spec.ts
│  │  └─ users.service.ts
│  ├─ app.controller.spec.ts
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  └─ main.ts
├─ test/
│  ├─ app.e2e-spec.ts
│  └─ jest-e2e.json
├─ .dockerignore
├─ .env
├─ .env.template
├─ .gitignore
├─ .prettierrc
├─ docker-compose.yml
├─ dockerfile
├─ eslint.config.mjs
├─ modelo-db-cmpc-libros-enrique-briones.png
├─ nest-cli.json
├─ package-lock.json
├─ package.json
├─ README.md
├─ tsconfig.build.json
├─ tsconfig.json
└─ users.sql

```

**Diagrama Arquitectura**

![Diagrama-arquitectura](/Diagrama-CMPC-Libros.jpg)

**Notas**

1. Se decidió utilizar Vite en el front al ser la alternativa con mejor performance en la actualidad.
2. Se utilizó Ant Design ya que es una librería UI muy completa y sus componentes cubrían a cabalidad algunos requerimientos, por ejemplo los filtros y ordenamiento de tablas paginadas, también la creación de nuevos elementos en selectores, ideal para el caso de agregar elementos en tiempo real en el formulario de nuevo libro, así mejoramos la usabilidad, al no necesitar ir a otra pantalla previamente.
3. Para este caso, se decidió ubicar el webclient dentro de la api de Nest, para facilitar el proceso de construcción del contenedor en Docker.
4. Las variables de entorno están en e archivo .env.template para facilitar la construcción del proyecto.
5. Se utilizó interceptors para manejar el timeout de los endpoints y también la auditoría de operaciones críticas en la app.
6. Salvo el registro y login de usuario, los demás endpoints están protegidos con autenticación JWT.
7. A pesar de ser una app de gestión, se implementó un endpoint de registro, con fines de testeo. Las contraseñas están hasheadas con la librería bcrypt.
8. El buscador cuenta con un debounce de 1 segundo, tiempo prudente para permitir escribir un título de forma coherente, y a su vez mantener un número bajo de peticiones al servidor.
