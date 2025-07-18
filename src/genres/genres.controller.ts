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
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('genres')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo género' })
  @ApiCreatedResponse({
    description: 'El género ha sido creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        genre: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Realismo mágico' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiConflictResponse({
    description: 'El género ya existe con ese nombre',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Genre already exists' },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los géneros' })
  @ApiOkResponse({
    description: 'Lista de géneros obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        genres: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Realismo mágico' },
              isActive: { type: 'boolean', example: true },
            },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  findAll() {
    return this.genresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un género por ID' })
  @ApiParam({ name: 'id', description: 'ID del género', type: 'number' })
  @ApiOkResponse({
    description: 'Género encontrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        genre: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Realismo mágico' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Género no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.genresService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un género' })
  @ApiParam({ name: 'id', description: 'ID del género', type: 'number' })
  @ApiOkResponse({
    description: 'Género actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        genre: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Realismo mágico' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Género no encontrado',
  })
  @ApiConflictResponse({
    description: 'Ya existe un género con este nombre',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Already exists genre with this name',
        },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genresService.update(+id, updateGenreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un género' })
  @ApiParam({ name: 'id', description: 'ID del género', type: 'number' })
  @ApiOkResponse({
    description: 'Género eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Genre with id #1 was deleted' },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Género no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.genresService.remove(+id);
  }
}
