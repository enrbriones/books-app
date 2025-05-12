import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../db/user';
import { userSeed } from 'src/seeds/user.seed';
import { AuthService } from 'src/auth/auth.service';
import { RegisterUserDto } from 'src/auth/dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private readonly authService: AuthService,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.count();
    if (count === 0) {
      for (const user of userSeed) {
        await this.authService.registerUser({
          name: user.name,
          email: user.email,
          password: user.password,
        } as RegisterUserDto);
      }
    }
  }
}
