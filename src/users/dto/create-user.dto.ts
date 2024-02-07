import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user123' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'test1@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'This is a bio' })
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  image?: string;
}
