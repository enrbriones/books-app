import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  authorId: number;

  @IsNumber()
  @IsPositive()
  editorialId: number;

  @IsNumber()
  @IsPositive()
  genreId: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsBoolean()
  isAvailable: boolean;
}
