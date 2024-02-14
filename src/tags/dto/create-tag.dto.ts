import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'tag' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
