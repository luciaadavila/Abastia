import { IsEnum, IsIn, IsMongoId } from 'class-validator';
import { ProductPlace } from '../../products/enums/product-place.enum';

export class ChangeItemQuantityDto {
  @IsMongoId()
  productoId!: string;

  @IsEnum(ProductPlace)
  lugar!: ProductPlace;

  @IsIn([-1, 1])
  variacion!: -1 | 1;
}
