import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '../products/products.module';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { PantryItem, PantryItemSchema } from './schemas/pantry-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PantryItem.name, schema: PantryItemSchema },
    ]),
    ProductsModule,
  ],
  providers: [PantryService],
  controllers: [PantryController],
})
export class PantryModule {}
