import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { User } from '../db/user';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    isActive: true,
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signJWT', () => {
    it('should sign a JWT token', async () => {
      const payload = { id: 1, email: 'john@example.com', name: 'John Doe' };
      const expectedToken = 'signed-jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.signJWT(payload);

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = 'valid-jwt-token';
      const decodedPayload = {
        sub: 1,
        iat: 1640995200,
        exp: 1640998800,
        email: 'john@example.com',
        name: 'John Doe',
      };

      mockJwtService.verify.mockReturnValue(decodedPayload);
      mockJwtService.sign.mockReturnValue('signed-jwt-token');

      const result = await service.verifyToken(token);

      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      });
      expect(result).toEqual({
        user: {
          email: 'john@example.com',
          name: 'John Doe',
        },
        token: 'signed-jwt-token',
      });
    });

    it('should throw unauthorized exception for invalid token', async () => {
      const token = 'invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken(token)).rejects.toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      const loginDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compareSync as jest.Mock).mockReturnValue(true);
      mockJwtService.sign.mockReturnValue('signed-jwt-token');

      const result = await service.loginUser(loginDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email, isActive: true },
        raw: true,
      });
      expect(mockedBcrypt.compareSync).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(result).toEqual({
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          isActive: true,
        },
        token: 'signed-jwt-token',
      });
    });

    it('should throw unauthorized exception with invalid credentials', async () => {
      const loginDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('Error', 500),
      );
    });

    it('should throw unauthorized exception when user not found', async () => {
      const loginDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('Error', 500),
      );
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(null);
      (mockedBcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      mockUserModel.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.registerUser(registerDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockedBcrypt.hashSync).toHaveBeenCalledWith(
        registerDto.password,
        10,
      );
      expect(mockUserModel.create).toHaveBeenCalledWith({
        name: registerDto.name,
        email: registerDto.email,
        password: 'hashedPassword',
        isActive: true,
      });
      expect(result).toEqual({
        user: {
          name: mockUser.name,
          email: mockUser.email,
        },
        token: 'jwt-token',
      });
    });

    it('should throw conflict exception when user already exists', async () => {
      const registerDto: RegisterUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.registerUser(registerDto)).rejects.toThrow(
        new HttpException('Email already exists', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
