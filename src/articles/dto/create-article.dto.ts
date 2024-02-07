import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'Title' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Description' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Body' })
  @IsNotEmpty()
  body: string;

  @ApiProperty({ example: ['tag1', 'tag2'] })
  @IsOptional()
  tagList: string[];
}
