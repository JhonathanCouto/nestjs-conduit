import { Expose, Transform } from 'class-transformer';

export class ProfileResponseDto {
  @Expose()
  @Transform((value) => value.toString())
  username: string;

  @Expose()
  @Transform((value) => value || '')
  bio?: string;

  @Expose()
  @Transform((value) => value || '')
  image?: string;

  constructor(partial: Partial<ProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
