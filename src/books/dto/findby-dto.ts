/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsArray,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindByDto {
  @ApiProperty({
    description: 'Título del libro para buscar',
    example: 'Cien años',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Número de página',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiProperty({
    description: 'Tamaño de página',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  pageSize?: number = 10;

  @ApiProperty({
    description: 'ID del género',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  genreId?: number;

  @ApiProperty({
    description: 'ID de la editorial',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  editorialId?: number;

  @ApiProperty({
    description: 'ID del autor',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @ApiProperty({
    description: 'Disponibilidad del libro',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Campos para ordenar (formato: campo,dirección)',
    example: ['price,DESC', 'title,ASC'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  orderBy?: string[]; // format: ['price,DESC', 'title,ASC']
}
