import { User } from './../../users/entities/user.entity';
export type ProfileResponseType = Readonly<
  Pick<User, 'username' | 'bio' | 'image'>
>;
