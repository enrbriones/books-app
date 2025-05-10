/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/db/user';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';
import { RegisterUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly jwtService: JwtService,
  ) {}

  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        token: await this.signJWT(user as JwtPayload),
      };
    } catch (error) {
      console.log('error', error);
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;
    try {
      const user = await this.userModel.findOne({
        where: { email: email },
      });

      if (user) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      const newUser = await this.userModel.create({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        isActive: true,
      });
      const { password: __, isActive: _, id: unusedId, ...rest } = newUser;
      return {
        user: rest,
        token: await this.signJWT({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }),
      };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error.response, error.status);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.userModel.findOne({
        where: { email: email, isActive: true },
        raw: true,
      });
      console.log('password', password);
      console.log('user password', user?.password);
      console.log('user', user);
      if (!user)
        throw new HttpException(
          'User/Password not valid',
          HttpStatus.NOT_FOUND,
        );
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      console.log('isPasswordValid', isPasswordValid);
      if (!isPasswordValid) {
        throw new HttpException(
          'User/Password not validddd',
          HttpStatus.NOT_FOUND,
        );
      }

      const { password: __, ...rest } = user;
      const jwtObject: JwtPayload = {
        id: rest.id as number,
        name: rest.name,
        email: rest.email,
      };

      return {
        user: rest,
        token: await this.signJWT(jwtObject),
      };
    } catch (error) {
      console.log('error', error);
      throw new HttpException('Error', 500);
    }
  }
}
