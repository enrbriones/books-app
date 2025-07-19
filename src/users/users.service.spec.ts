import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { User } from '../db/user';
import { AuthService } from '../auth/auth.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    count: jest.fn(),
  };

  const mockAuthService = {
    registerUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should not seed users if users already exist', async () => {
      mockUserModel.count.mockResolvedValue(5);

      await service.onModuleInit();

      expect(mockUserModel.count).toHaveBeenCalled();
      expect(mockAuthService.registerUser).not.toHaveBeenCalled();
    });

    it('should seed users if no users exist', async () => {
      mockUserModel.count.mockResolvedValue(0);
      mockAuthService.registerUser.mockResolvedValue({
        user: { id: 1, name: 'Test', email: 'test@test.com' },
        token: 'token',
      });

      await service.onModuleInit();

      expect(mockUserModel.count).toHaveBeenCalled();
      expect(mockAuthService.registerUser).toHaveBeenCalled();
    });
  });
});
