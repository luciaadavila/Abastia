import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterItemsDto {
  @IsOptional()
  @IsDateString()
  fechaCaducidad?: string;

  @IsOptional()
  @IsString()
  categoria?: string;
}
