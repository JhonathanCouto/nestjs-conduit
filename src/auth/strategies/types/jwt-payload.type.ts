import { User } from 'src/users/entities/user.entity';

export type JwtPayloadType = {
  sub: User['id'];
  iat: number;
  exp: number;
};
