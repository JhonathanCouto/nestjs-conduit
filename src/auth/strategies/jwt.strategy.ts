import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayloadType } from './types/jwt-payload.type';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AllConfigType } from 'src/config/config.type';
import { ConfigService } from '@nestjs/config';
import { OrNeverType } from 'src/common/types/or-never.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<AllConfigType>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.secret', { infer: true }),
    });
  }

  public validate(payload: JwtPayloadType): OrNeverType<JwtPayloadType> {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
