import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGenreDto {
  @ApiProperty({
    description: 'Nombre del género',
    example: 'Realismo mágico',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
