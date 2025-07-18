import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título del libro',
    example: 'Cien años de soledad',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción del libro',
    example: 'Una obra maestra del realismo mágico',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'ID del autor',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  authorId: number;

  @ApiProperty({
    description: 'ID de la editorial',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  editorialId: number;

  @ApiProperty({
    description: 'ID del género',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  genreId: number;

  @ApiProperty({
    description: 'Precio del libro',
    example: 25.99,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Disponibilidad del libro',
    example: true,
  })
  @IsBoolean()
  isAvailable: boolean;
}
