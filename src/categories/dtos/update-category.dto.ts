import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';
import { Events } from '../interfaces/category.interface';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  events: Array<Events>;
}
