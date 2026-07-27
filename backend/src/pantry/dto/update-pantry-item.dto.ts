import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ProductPlace } from '../../products/enums/product-place.enum';

export class UpdatePantryItemDto {
  @IsOptional()
  @IsEnum(ProductPlace)
  lugar?: ProductPlace;

  @IsOptional()
  @IsDateString()
  fechaCaducidad?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;
}
