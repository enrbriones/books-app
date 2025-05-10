import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../db/user';
import { userSeed } from 'src/seeds/user.seed';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.count();
    if (count === 0) {
      await this.userModel.bulkCreate(userSeed);
    }
  }
}
