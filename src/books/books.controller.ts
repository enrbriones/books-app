import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FindByDto } from './dto/findby-dto';
import { Response } from 'express';

@ApiTags('books')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo libro' })
  @ApiCreatedResponse({
    description: 'El libro ha sido creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Cien años de soledad' },
        description: {
          type: 'string',
          example: 'Una obra maestra del realismo mágico',
        },
        price: { type: 'string', example: '25.99' },
        isAvailable: { type: 'boolean', example: true },
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Gabriel García Márquez' },
          },
        },
        editorial: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Editorial Planeta' },
          },
        },
        genre: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Realismo mágico' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los libros' })
  @ApiOkResponse({
    description: 'Lista de libros obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        books: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              title: { type: 'string', example: 'Cien años de soledad' },
              description: {
                type: 'string',
                example: 'Una obra maestra del realismo mágico',
              },
              price: { type: 'string', example: '25.99' },
              isAvailable: { type: 'boolean', example: true },
              createdAt: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
              },
              updatedAt: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
              },
              author: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Gabriel García Márquez' },
                },
              },
              editorial: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Editorial Planeta' },
                },
              },
              genre: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Realismo mágico' },
                },
              },
            },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  findAll() {
    return this.booksService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar libros con filtros' })
  @ApiQuery({ name: 'title', required: false, description: 'Título del libro' })
  @ApiQuery({ name: 'authorId', required: false, description: 'ID del autor' })
  @ApiQuery({
    name: 'editorialId',
    required: false,
    description: 'ID de la editorial',
  })
  @ApiQuery({ name: 'genreId', required: false, description: 'ID del género' })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    description: 'Disponibilidad del libro',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Campo para ordenar',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Tamaño de página',
  })
  @ApiOkResponse({
    description: 'Libros encontrados exitosamente',
    schema: {
      type: 'object',
      properties: {
        books: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              title: { type: 'string', example: 'Cien años de soledad' },
              description: {
                type: 'string',
                example: 'Una obra maestra del realismo mágico',
              },
              price: { type: 'string', example: '25.99' },
              isAvailable: { type: 'boolean', example: true },
              author: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Gabriel García Márquez' },
                },
              },
              editorial: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Editorial Planeta' },
                },
              },
              genre: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Realismo mágico' },
                },
              },
            },
          },
        },
        total: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 1 },
        currentPage: { type: 'number', example: 1 },
        pageSize: { type: 'number', example: 10 },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  findBy(@Query() findByDto: FindByDto) {
    return this.booksService.findBy(findByDto);
  }

  @Get('csv')
  @ApiOperation({ summary: 'Descargar libros en formato CSV' })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'text/csv; charset=utf-8',
      },
      'Content-Disposition': {
        description: 'attachment; filename=libros.csv',
      },
    },
  })
  async downloadCsv(@Res() res: Response) {
    const csv = await this.booksService.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=libros.csv');
    res.send(csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un libro por ID' })
  @ApiParam({ name: 'id', description: 'ID del libro', type: 'number' })
  @ApiOkResponse({
    description: 'Libro encontrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Cien años de soledad' },
        description: {
          type: 'string',
          example: 'Una obra maestra del realismo mágico',
        },
        price: { type: 'string', example: '25.99' },
        isAvailable: { type: 'boolean', example: true },
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Gabriel García Márquez' },
          },
        },
        editorial: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Editorial Planeta' },
          },
        },
        genre: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Realismo mágico' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Libro no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un libro' })
  @ApiParam({ name: 'id', description: 'ID del libro', type: 'number' })
  @ApiOkResponse({
    description: 'Libro actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Cien años de soledad' },
        description: {
          type: 'string',
          example: 'Una obra maestra del realismo mágico',
        },
        price: { type: 'string', example: '25.99' },
        isAvailable: { type: 'boolean', example: true },
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Gabriel García Márquez' },
          },
        },
        editorial: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Editorial Planeta' },
          },
        },
        genre: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Realismo mágico' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Libro no encontrado',
  })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un libro' })
  @ApiParam({ name: 'id', description: 'ID del libro', type: 'number' })
  @ApiOkResponse({
    description: 'Libro eliminado exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Libro no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
