import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProductPlace } from '../../products/enums/product-place.enum';
import { Product } from '../../products/schemas/product.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({
  timestamps: true,
})
export class PantryItem {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  usuario!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Product.name,
    required: true,
    index: true,
  })
  producto!: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  cantidad!: number;

  @Prop({
    type: String,
    enum: Object.values(ProductPlace),
    required: true,
    index: true,
  })
  lugar!: ProductPlace;

  @Prop({
    type: Date,
    required: true,
    index: true,
  })
  fechaCaducidad!: Date;
}

export const PantryItemSchema = SchemaFactory.createForClass(PantryItem);

PantryItemSchema.index(
  {
    usuario: 1,
    lugar: 1,
    producto: 1,
    fechaCaducidad: 1,
  },
  {
    unique: true,
  },
);
