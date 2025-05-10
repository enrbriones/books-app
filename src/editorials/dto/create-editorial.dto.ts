import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEditorialDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
