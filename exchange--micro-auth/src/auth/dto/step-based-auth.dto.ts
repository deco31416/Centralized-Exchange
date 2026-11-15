import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, Matches, MaxLength } from 'class-validator';

export class LoginStep1Dto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}

export class LoginStep2Dto {
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsString()
    @IsNotEmpty()
    otpCode: string;
}

export class RegisterStep1Dto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(18)
    @Matches(/^[a-zA-Z0-9._-]{4,18}$/, {
        message: 'username must match ^[a-zA-Z0-9._-]{4,18}$',
    })
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;
}

export class RegisterStep2Dto {
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsString()
    @IsNotEmpty()
    otpCode: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsNotEmpty()
    birthDate: string; // Format: YYYY-MM-DD

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    fcmToken?: string;

    @IsString()
    @IsOptional()
    deviceId?: string;
}

export class ResetPasswordRequestDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordVerifyOtpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    otpCode: string;
}

export class ResetPasswordConfirmDto {
    @IsString()
    @IsNotEmpty()
    resetToken: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string;
}

export class ResendOtpDto {
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsEnum(['login', 'register', 'reset'])
    @IsNotEmpty()
    purpose: 'login' | 'register' | 'reset';
}
