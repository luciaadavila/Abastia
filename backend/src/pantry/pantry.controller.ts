import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { ChangeItemQuantityDto } from './dto/change-item-quantity.dto';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { PantryService } from './pantry.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('pantry/items')
@UseGuards(JwtAuthGuard)
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createPantryItemDto: CreatePantryItemDto,
  ) {
    return this.pantryService.create(
      this.obtenerUsuarioId(request),
      createPantryItemDto,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.pantryService.findAll(this.obtenerUsuarioId(request));
  }

  @Get(':pantryItemId')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('pantryItemId') pantryItemId: string,
  ) {
    return this.pantryService.findOne(
      pantryItemId,
      this.obtenerUsuarioId(request),
    );
  }

  @Patch(':pantryItemId')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('pantryItemId') pantryItemId: string,
    @Body() updatePantryItemDto: UpdatePantryItemDto,
  ) {
    return this.pantryService.update(
      this.obtenerUsuarioId(request),
      pantryItemId,
      updatePantryItemDto,
    );
  }

  @Patch('cantidad')
  changeQuantity(
    @Req() request: AuthenticatedRequest,
    @Body() changeDto: ChangeItemQuantityDto,
  ) {
    return this.pantryService.changeQuantity(
      this.obtenerUsuarioId(request),
      changeDto,
    );
  }

  @Delete(':pantryItemId')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('pantryItemId') pantryItemId: string,
  ) {
    return this.pantryService.remove(
      this.obtenerUsuarioId(request),
      pantryItemId,
    );
  }

  private obtenerUsuarioId(request: AuthenticatedRequest): string {
    const usuarioId = request.user?.userId;
    if (!usuarioId) {
      throw new UnauthorizedException(
        'No se ha podido identificar al usuario autenticado',
      );
    }

    return usuarioId;
  }
}
