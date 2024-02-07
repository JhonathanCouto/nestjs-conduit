import { User } from 'src/users/entities/user.entity';

export type JwtRefreshPayloadType = {
  sub: User['id'];
  iat: number;
  exp: number;
};
