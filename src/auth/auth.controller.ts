import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { LoginResponseType } from './types/login-response.type';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { NullableType } from 'src/common/types/nullable.type';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: AuthLoginDto): Promise<LoginResponseType> {
    return this.authService.validateLogin(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() createUserDto: AuthRegisterDto): Promise<void> {
    return this.authService.register(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Request() request,
  ): Promise<Omit<LoginResponseType, 'user'>> {
    return this.authService.refreshToken(request.user);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  public me(@Request() request): Promise<NullableType<User>> {
    return this.authService.me(request.user);
  }
}
