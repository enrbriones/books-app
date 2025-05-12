/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsArray,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FindByDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  pageSize?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  genreId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  editorialId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  orderBy?: string[]; // format: ['price,DESC', 'title,ASC']
}
