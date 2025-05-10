import { PartialType } from '@nestjs/mapped-types';
import { CreateEditorialDto } from './create-editorial.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEditorialDto extends PartialType(CreateEditorialDto) {
  @IsString()
  @IsNotEmpty()
  name: string;
}
