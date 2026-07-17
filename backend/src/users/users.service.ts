import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { isValidObjectId, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const createdUser = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });

      const userWithoutPassword = await this.userModel
        .findById(createdUser._id)
        .select('-password')
        .exec();

      if (!userWithoutPassword) {
        throw new NotFoundException('No se pudo recuperar el usuario creado');
      }
      return userWithoutPassword;
    } catch (error) {
      const mongoError = error as {
        code?: number;
        message?: string;
      };

      if (mongoError.code === 11000) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      throw error;
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
    return users;
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .exec();
    return user;
  }
}
