import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductPlace } from '../enums/product-place.enum';

export class AlmacenamientoDto {
  @IsEnum(ProductPlace, {
    message: 'El lugar debe ser nevera, congelador o despensa',
  })
  @IsNotEmpty()
  lugar!: ProductPlace;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  diasCaducidadEstimados!: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsNotEmpty()
  categoria!: string;

  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @IsOptional()
  imagen?: string;

  @IsString()
  @IsOptional()
  unidadMedida?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlmacenamientoDto)
  @IsOptional()
  lugaresAlmacenamiento?: AlmacenamientoDto[];

  @IsEnum(ProductPlace)
  @IsOptional()
  lugarPorDefecto?: ProductPlace;

  @IsBoolean()
  @IsOptional()
  enDespensa?: boolean;
}
