import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Article } from './entities/article.entity';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryArticleDto } from './dto/query-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() request, @Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(request.user.sub, createArticleDto);
  }

  @ApiOperation({ summary: 'Get all articles' })
  @Get('')
  async findArticles(
    @Query() query: QueryArticleDto,
  ): Promise<Pagination<Article>> {
    const page = query?.page ?? 1;
    const limit = query?.limit > 100 ? 100 : query?.limit;
    return this.articlesService.findArticles(query, {
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
    return this.articlesService.favorite(request.user.sub, slug);
  }

  @Delete(':slug/favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  unfavorite(@Request() request, @Param('id') slug: string) {
    return this.articlesService.unfavorite(request.user.sub, slug);
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
