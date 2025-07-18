import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEditorialDto {
  @ApiProperty({
    description: 'Nombre de la editorial',
    example: 'Planeta',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
