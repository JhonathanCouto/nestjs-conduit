import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryArticleDto {
  @ApiProperty({ required: false })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  page: number;

  @ApiProperty({ required: false })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit: number;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  favoritedBy?: string;
}
