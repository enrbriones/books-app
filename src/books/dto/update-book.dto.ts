import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  authorId: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  editorialId: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  genreId: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isAvailable?: boolean;
}
