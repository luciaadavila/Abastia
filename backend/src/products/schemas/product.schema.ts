import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProductPlace } from '../enums/product-place.enum';

@Schema({ _id: false })
export class Almacenamiento {
  @Prop({
    type: String,
    required: true,
    enum: Object.values(ProductPlace),
  })
  lugar!: string;

  @Prop({
    type: Number,
    required: true,
  })
  diasCaducidadEstimados!: number;
}

const AlmacenamientoSchema = SchemaFactory.createForClass(Almacenamiento);

@Schema({ timestamps: true })
export class Product {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  nombre!: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  marca?: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  categoria!: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
    match: /^https?:\/\/.+/,
  })
  imagen?: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  unidadMedida?: string;

  @Prop({
    type: [AlmacenamientoSchema],
    required: false,
  })
  lugaresAlmacenamiento?: Almacenamiento[];

  @Prop({
    type: String,
    enum: Object.values(ProductPlace),
    required: false,
    trim: true,
  })
  lugarPorDefecto?: string;

  @Prop({
    type: Boolean,
    required: false,
  })
  enDespensa?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
