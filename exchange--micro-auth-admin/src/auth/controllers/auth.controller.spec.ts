import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let sessionService: SessionService;
  let tokenService: TokenService;

  const mockRequest = {
    headers: { 'user-agent': 'test-agent' },
    connection: { remoteAddress: '127.0.0.1' },
    user: { sub: 'user123', sid: 'session123' },
    cookies: {},
    params: {},
  } as unknown as Request;

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
            logoutAll: jest.fn(),
            verifyEmail: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            getUserSessions: jest.fn(),
            getUserDevices: jest.fn(),
            revokeSession: jest.fn(),
            revokeDeviceSessions: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            sendMagicLink: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserPrimaryEmail: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    sessionService = module.get<SessionService>(SessionService);
    tokenService = module.get<TokenService>(TokenService);
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      // Act
      const result = authController.getHealth();

      // Assert
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should register a new user', async () => {
      // Arrange
      const expectedResult = {
        success: true,
        message: 'Registration successful',
      };
      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

      // Act
      const result = await authController.register(registerDto, mockRequest);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Registration successful',
      });
      expect(authService.register).toHaveBeenCalledWith(
        registerDto,
        '127.0.0.1',
        'test-agent',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login user and set cookie', async () => {
      // Arrange
      const expectedResult = {
        access_token: 'access123',
        refresh_token: 'refresh123',
        token_type: 'Bearer',
        expires_in: 600,
        user: { id: 'user123', email: 'test@example.com' },
      };
      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult as any);

      // Act
      const result = await authController.login(
        loginDto,
        mockRequest,
        mockResponse,
      );

      // Assert
      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
        'test-agent',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh123',
        expect.any(Object),
      );
    });
  });

  describe('refresh', () => {
    const refreshTokenDto = { refresh_token: 'refresh123' };

    it('should refresh token', async () => {
      // Arrange
      const expectedResult = {
        access_token: 'newaccess123',
        refresh_token: 'newrefresh123',
        token_type: 'Bearer',
        expires_in: 600,
        user: { id: 'user123', email: 'test@example.com' },
      };
      jest
        .spyOn(authService, 'refreshToken')
        .mockResolvedValue(expectedResult as any);

      // Act
      const result = await authController.refresh(
        refreshTokenDto,
        mockRequest,
        mockResponse,
      );

      // Assert
      expect(result).toEqual(expectedResult);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        'refresh123',
        '127.0.0.1',
        'test-agent',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'newrefresh123',
        expect.any(Object),
      );
    });

    it('should use refresh token from cookie if not in body', async () => {
      // Arrange
      const requestWithCookie = {
        ...mockRequest,
        cookies: { refresh_token: 'cookietoken123' },
      } as unknown as Request;
      const refreshTokenDtoEmpty = { refresh_token: '' };
      const expectedResult = {
        access_token: 'newaccess123',
        refresh_token: 'newrefresh123',
        token_type: 'Bearer',
        expires_in: 600,
        user: { id: 'user123', email: 'test@example.com' },
      };
      jest
        .spyOn(authService, 'refreshToken')
        .mockResolvedValue(expectedResult as any);

      // Act
      const result = await authController.refresh(
        refreshTokenDtoEmpty,
        requestWithCookie,
        mockResponse,
      );

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith(
        'cookietoken123',
        '127.0.0.1',
        'test-agent',
      );
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookie', async () => {
      // Arrange
      jest.spyOn(authService, 'logout').mockResolvedValue({ success: true });

      // Act
      const result = await authController.logout(mockRequest, mockResponse);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
      expect(authService.logout).toHaveBeenCalledWith(
        'session123',
        'user123',
        '127.0.0.1',
        'test-agent',
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(Object),
      );
    });
  });

  describe('getSessions', () => {
    it('should return user sessions with current session marked', async () => {
      // Arrange
      const mockSessions = [
        { id: 'session123', device_name: 'Device 1', is_current: false },
        { id: 'session456', device_name: 'Device 2', is_current: false },
      ];
      jest
        .spyOn(sessionService, 'getUserSessions')
        .mockResolvedValue(mockSessions as any);

      // Act
      const result = await authController.getSessions(mockRequest);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].is_current).toBe(true); // session123 should be marked as current
      expect(result[1].is_current).toBe(false);
      expect(sessionService.getUserSessions).toHaveBeenCalledWith('user123');
    });
  });

  describe('sendMagicLink', () => {
    it('should send magic link', async () => {
      // Arrange
      const body = { email: 'test@example.com' };
      jest.spyOn(tokenService, 'sendMagicLink').mockResolvedValue(undefined);

      // Act
      const result = await authController.sendMagicLink(body);

      // Assert
      expect(result).toEqual({
        success: true,
        message:
          'If an account with that email exists, you will receive a magic link.',
      });
      expect(tokenService.sendMagicLink).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });

  describe('getTest', () => {
    it('should return test message', () => {
      // Act
      const result = authController.getTest();

      // Assert
      expect(result.message).toBe('Auth service is running');
      expect(result.timestamp).toBeDefined();
    });
  });
});
