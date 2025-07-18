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
import { EditorialsService } from './editorials.service';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('editorials')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('editorials')
export class EditorialsController {
  constructor(private readonly editorialsService: EditorialsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva editorial' })
  @ApiCreatedResponse({
    description: 'La editorial ha sido creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        editorial: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Editorial Planeta' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiConflictResponse({
    description: 'La editorial ya existe con ese nombre',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Editorial already exists' },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  create(@Body() createEditorialDto: CreateEditorialDto) {
    return this.editorialsService.create(createEditorialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las editoriales' })
  @ApiOkResponse({
    description: 'Lista de editoriales obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        editorials: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Editorial Planeta' },
              isActive: { type: 'boolean', example: true },
            },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  findAll() {
    return this.editorialsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una editorial por ID' })
  @ApiParam({ name: 'id', description: 'ID de la editorial', type: 'number' })
  @ApiOkResponse({
    description: 'Editorial encontrada exitosamente',
    schema: {
      type: 'object',
      properties: {
        editorial: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Editorial Planeta' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Editorial no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.editorialsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una editorial' })
  @ApiParam({ name: 'id', description: 'ID de la editorial', type: 'number' })
  @ApiOkResponse({
    description: 'Editorial actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        editorial: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Editorial Planeta' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Editorial no encontrada',
  })
  @ApiConflictResponse({
    description: 'Ya existe una editorial con este nombre',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Already exists editorial with this name',
        },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateEditorialDto: UpdateEditorialDto,
  ) {
    return this.editorialsService.update(+id, updateEditorialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una editorial' })
  @ApiParam({ name: 'id', description: 'ID de la editorial', type: 'number' })
  @ApiOkResponse({
    description: 'Editorial eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Editorial with id #1 was deleted',
        },
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Editorial no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.editorialsService.remove(+id);
  }
}
