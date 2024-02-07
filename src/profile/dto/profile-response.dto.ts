import { Expose } from 'class-transformer';

export class ProfileResponseDto {
  @Expose()
  username: string;

  @Expose()
  bio?: string;

  @Expose()
  image?: string;

  constructor(partial: Partial<ProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
