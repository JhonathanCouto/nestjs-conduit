import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Article } from './entities/article.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() request, @Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(request.user.id, createArticleDto);
  }

  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page',
  })
  @ApiOperation({ summary: 'Get all articles' })
  @Get('')
  async index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<Article>> {
    limit = limit > 100 ? 100 : limit;
    return this.articlesService.paginate({
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne({ id: +id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }

  @Post(':slug/favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  favorite(@Request() request, @Param('slug') slug: string) {
    return this.articlesService.favorite(request.user.id, slug);
  }

  @Delete(':slug/favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  unfavorite(@Request() request, @Param('id') slug: string) {
    return this.articlesService.unfavorite(request.user.id, slug);
  }

  @Get(':slug/comments')
  async findComments(@Param('slug') slug: string) {
    return this.articlesService.findComments(slug);
  }

  @Post(':slug/comments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.articlesService.createComment(slug, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':slug/comments/:id')
  async deleteComment(@Param('slug') slug: string, @Param('id') id: number) {
    return this.articlesService.deleteComment(slug, id);
  }
}
