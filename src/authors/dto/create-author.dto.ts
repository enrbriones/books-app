import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Nombre del autor',
    example: 'Gabriel García Márquez',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
