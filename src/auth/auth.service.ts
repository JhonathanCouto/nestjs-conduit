import { UsersService } from './../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AllConfigType } from 'src/config/config.type';
import { User } from 'src/users/entities/user.entity';
import ms from 'ms';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { LoginResponseType } from './types/login-response.type';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { NullableType } from 'src/common/types/nullable.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async validateLogin(loginDto: AuthLoginDto): Promise<LoginResponseType> {
    const user = await this.usersService.findOne({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException();
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterDto): Promise<void> {
    await this.usersService.create(dto);
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sub'>,
  ): Promise<Omit<LoginResponseType, 'user'>> {
    const user = await this.usersService.findOne({ id: data.sub });

    if (!user) {
      throw new UnauthorizedException();
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findOne({ id: userJwtPayload.sub });
  }

  private async getTokensData(data: { id: User['id'] }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          sub: data.id,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sub: data.id,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
