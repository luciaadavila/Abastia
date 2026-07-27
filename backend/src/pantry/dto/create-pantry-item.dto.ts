import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { ProductPlace } from '../../products/enums/product-place.enum';

export class CreatePantryItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productoId!: string;

  @IsEnum(ProductPlace)
  @IsOptional()
  lugar?: ProductPlace;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsDateString()
  @IsOptional()
  fechaCaducidad?: string;
}
