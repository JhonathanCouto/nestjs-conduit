import { User } from './../../users/entities/user.entity';
export type ProfileResponseType = Readonly<
  Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'>
>;
