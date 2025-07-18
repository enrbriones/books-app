import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('authors')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo autor' })
  @ApiCreatedResponse({
    description: 'El autor ha sido creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Gabriel García Márquez' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiConflictResponse({
    description: 'El autor ya existe con ese nombre',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Author already exists' },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los autores' })
  @ApiOkResponse({
    description: 'Lista de autores obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        authors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Gabriel García Márquez' },
              isActive: { type: 'boolean', example: true },
            },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un autor por ID' })
  @ApiParam({ name: 'id', description: 'ID del autor', type: 'number' })
  @ApiOkResponse({
    description: 'Autor encontrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Gabriel García Márquez' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Autor no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un autor' })
  @ApiParam({ name: 'id', description: 'ID del autor', type: 'number' })
  @ApiOkResponse({
    description: 'Autor actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Gabriel García Márquez' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Autor no encontrado',
  })
  @ApiConflictResponse({
    description: 'Ya existe un autor con este nombre',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Already exists author with this name',
        },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorsService.update(+id, updateAuthorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un autor' })
  @ApiParam({ name: 'id', description: 'ID del autor', type: 'number' })
  @ApiOkResponse({
    description: 'Autor eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Author with id #1 was deleted' },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Autor no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.authorsService.remove(+id);
  }
}
