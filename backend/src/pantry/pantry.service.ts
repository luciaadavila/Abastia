import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ProductsService } from '../products/products.service';

import { ProductPlace } from '../products/enums/product-place.enum';
import { ChangeItemQuantityDto } from './dto/change-item-quantity.dto';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { PantryItem } from './schemas/pantry-item.schema';

@Injectable()
export class PantryService {
  constructor(
    @InjectModel(PantryItem.name)
    private readonly pantryItemModel: Model<PantryItem>,

    private readonly productsService: ProductsService,
  ) {}

  async create(usuarioId: string, createPantryItemDto: CreatePantryItemDto) {
    this.comprobarObjectId(usuarioId, 'usuario');
    this.comprobarObjectId(createPantryItemDto.productoId, 'producto');

    const producto = await this.productsService.findById(
      createPantryItemDto.productoId,
    );

    const lugar = createPantryItemDto.lugar ?? producto.lugarPorDefecto;

    if (!lugar) {
      throw new BadRequestException(
        'Debes indicar un lugar o configurar un lugar por defecto en el producto.',
      );
    }

    this.comprobarLugar(lugar);

    const fechaCaducidad = createPantryItemDto.fechaCaducidad
      ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        this.normalizarFecha(createPantryItemDto.fechaCaducidad!)
      : this.calcularFechaCaducidad(producto, lugar);

    const usuarioObjectId = new Types.ObjectId(usuarioId);
    const productoObjectId = new Types.ObjectId(createPantryItemDto.productoId);

    const pantryItem = await this.pantryItemModel
      .findOneAndUpdate(
        {
          usuario: usuarioObjectId,
          producto: productoObjectId,
          lugar,
          fechaCaducidad,
        },
        {
          $inc: {
            cantidad: createPantryItemDto.cantidad,
          },

          $setOnInsert: {
            usuario: usuarioObjectId,
            producto: productoObjectId,
            lugar,
            fechaCaducidad,
          },
        },

        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      )
      .populate('producto')
      .exec();

    return pantryItem;
  }

  async changeQuantity(usuarioId: string, changeDto: ChangeItemQuantityDto) {
    this.comprobarObjectId(usuarioId, 'usuario');
    this.comprobarObjectId(changeDto.productoId, 'producto');

    this.comprobarLugar(changeDto.lugar);

    if (changeDto.variacion === 1) {
      return this.sumarUnidad(usuarioId, changeDto);
    }

    if (changeDto.variacion === -1) {
      return this.restarUnidad(usuarioId, changeDto);
    }
  }

  private async sumarUnidad(
    usuarioId: string,
    changeDto: ChangeItemQuantityDto,
  ) {
    const pantryItem = await this.create(usuarioId, {
      productoId: changeDto.productoId,
      cantidad: 1,
      lugar: changeDto.lugar,
    });

    return {
      accion: 'unidad_añadida',
      pantryItem,
    };
  }

  private async restarUnidad(
    usuarioId: string,
    changeDto: ChangeItemQuantityDto,
  ) {
    const pantryItem = await this.pantryItemModel
      .findOne({
        usuario: new Types.ObjectId(usuarioId),
        producto: new Types.ObjectId(changeDto.productoId),
        lugar: changeDto.lugar,
      })
      .sort({
        fechaCaducidad: 1,
        createdAt: 1,
      })
      .exec();

    if (!pantryItem) {
      throw new NotFoundException(
        'No tienes unidades de este producto en este lugar',
      );
    }

    if (pantryItem.cantidad > 1) {
      pantryItem.cantidad -= 1;
      await pantryItem.save();
      await pantryItem.populate('producto');
      return {
        accion: 'unidad_retirada',
        pantryItem,
      };
    }

    await this.pantryItemModel
      .deleteOne({
        _id: pantryItem._id,
        usuario: new Types.ObjectId(usuarioId),
      })
      .exec();

    return {
      accion: 'entrada_eliminada',
      pantryItemId: pantryItem._id.toString(),
    };
  }

  async findAll(usuarioId: string) {
    this.comprobarObjectId(usuarioId, 'usuario');

    return this.pantryItemModel
      .find({
        usuario: new Types.ObjectId(usuarioId),
      })
      .populate('producto')
      .sort({
        lugar: 1,
        fechaCaducidad: 1,
      })
      .exec();
  }

  async findOne(pantryItemId: string, usuarioId: string) {
    this.comprobarObjectId(pantryItemId, 'PantryItem');
    this.comprobarObjectId(usuarioId, 'usuario');

    const pantryItem = await this.pantryItemModel
      .findOne({
        _id: new Types.ObjectId(pantryItemId),
        usuario: new Types.ObjectId(usuarioId),
      })
      .populate('producto')
      .exec();

    if (!pantryItem) {
      throw new NotFoundException(
        'No se ha encontrado la entrada en la despensa',
      );
    }

    return pantryItem;
  }

  async update(
    usuarioId: string,
    pantryItemId: string,
    updatePantryItemDto: UpdatePantryItemDto,
  ) {
    this.comprobarObjectId(pantryItemId, 'PantryItem');
    this.comprobarObjectId(usuarioId, 'usuario');

    const pantryItem = await this.pantryItemModel
      .findOne({
        _id: new Types.ObjectId(pantryItemId),
        usuario: new Types.ObjectId(usuarioId),
      })
      .exec();

    if (!pantryItem) {
      throw new NotFoundException(
        'No se ha encontrado la entrada en tu despensa',
      );
    }

    if (updatePantryItemDto.cantidad !== undefined) {
      pantryItem.cantidad = updatePantryItemDto.cantidad;
    }

    if (updatePantryItemDto.lugar !== undefined) {
      pantryItem.lugar = updatePantryItemDto.lugar;
    }

    if (updatePantryItemDto.fechaCaducidad !== undefined) {
      pantryItem.fechaCaducidad = this.normalizarFecha(
        updatePantryItemDto.fechaCaducidad,
      );
    }

    await pantryItem.save();

    return this.pantryItemModel
      .findById(pantryItem._id)
      .populate('producto')
      .exec();
  }

  async remove(usuarioId: string, pantryItemId: string) {
    this.comprobarObjectId(pantryItemId, 'PantryItem');
    this.comprobarObjectId(usuarioId, 'usuario');

    const pantryItemEliminado = await this.pantryItemModel
      .findOneAndDelete({
        _id: new Types.ObjectId(pantryItemId),
        usuario: new Types.ObjectId(usuarioId),
      })
      .exec();

    if (!pantryItemEliminado) {
      throw new NotFoundException(
        'No se ha encontrado el artículo en tu despensa',
      );
    }

    return {
      message: 'Unidad eliminada correctamente.',
      pantryItemId,
    };
  }

  private calcularFechaCaducidad(
    producto: {
      lugaresAlmacenamiento?: Array<{
        lugar: string;
        diasCaducidadEstimados: number;
      }>;
    },
    lugar: string,
  ): Date {
    const configuracion = producto.lugaresAlmacenamiento?.find(
      (almacenamiento) => almacenamiento.lugar === lugar,
    );

    if (!configuracion) {
      throw new BadRequestException(
        `El producto no tiene configurada una caducidad para el lugar "${lugar}".`,
      );
    }

    const diasCaducidad = configuracion.diasCaducidadEstimados;

    if (
      diasCaducidad === undefined ||
      diasCaducidad === null ||
      diasCaducidad < 0
    ) {
      throw new BadRequestException(
        'Los días de caducidad estimados no son válidos.',
      );
    }

    const fechaCaducidad = new Date();

    fechaCaducidad.setUTCDate(fechaCaducidad.getUTCDate() + diasCaducidad);
    fechaCaducidad.setUTCHours(0, 0, 0, 0);

    return fechaCaducidad;
  }

  private normalizarFecha(fecha: string): Date {
    const fechaNormalizada = new Date(fecha);

    if (Number.isNaN(fechaNormalizada.getTime())) {
      throw new BadRequestException('La fecha de caducidad no es válida.');
    }

    fechaNormalizada.setUTCHours(0, 0, 0, 0);

    return fechaNormalizada;
  }

  private comprobarLugar(lugar: string): asserts lugar is ProductPlace {
    const lugaresPermitidos = Object.values(ProductPlace) as string[];

    if (!lugaresPermitidos.includes(lugar)) {
      throw new BadRequestException(`El lugar "${lugar}" no es válido.`);
    }
  }

  private comprobarObjectId(id: string, nombreCampo: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        `El identificador de ${nombreCampo} no es válido.`,
      );
    }
  }
}
