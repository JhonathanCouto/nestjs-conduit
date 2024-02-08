import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { NullableType } from 'src/common/types/nullable.type';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slug = require('slug');

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
  ) {}

  async create(
    userId: number,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    const user = await this.usersService.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existentArticle = await this.articleRepository.findOne({
      where: { title: createArticleDto.title },
    });

    if (existentArticle) {
      throw new ConflictException('Article already exists');
    }

    const newArticle = this.articleRepository.create({
      ...createArticleDto,
      slug: this.slugify(createArticleDto.title),
      author: user,
    });

    return this.articleRepository.save(newArticle);
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Article>> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .orderBy('article.createdAt', 'DESC');

    return paginate<Article>(queryBuilder, options);
  }

  findOne(fields: FindOptionsWhere<Article>): Promise<NullableType<Article>> {
    return this.articleRepository.findOne({ where: fields });
  }

  update(id: number, payload: DeepPartial<Article>) {
    return this.articleRepository.save(
      this.articleRepository.create({ id, ...payload }),
    );
  }

  remove(id: number) {
    return this.articleRepository.delete(id);
  }

  async favorite(userId: number, slug: string): Promise<Article> {
    const user = await this.usersService.findOne({ id: userId });
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!user || !article) {
      throw new NotFoundException('User or article not found');
    }

    const isNewFavorite = !user.favorites?.some(
      (favorite) => favorite.id === article.id,
    );

    if (isNewFavorite) {
      user.favorites = [...(user.favorites || []), article];
      article.favoriteCount++;
      await Promise.all([
        this.usersService.update(user.id, user),
        this.articleRepository.save(article),
      ]);
    }

    return article;
  }

  async unfavorite(userId: number, slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { slug } });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const user = await this.usersService.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deleteIndex = user.favorites.findIndex(
      (article) => article.id === article.id,
    );

    if (deleteIndex >= 0) {
      user.favorites.splice(deleteIndex, 1);
      article.favoriteCount--;
      await this.usersService.update(user.id, user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async findFeed(userId: number, options: IPaginationOptions) {
    const user = await this.usersService.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.favoritedBy', 'favoritedBy')
      .where('favoritedBy.id = :id', { id: user.id })
      .orderBy('article.createdAt', 'DESC');

    return paginate<Article>(queryBuilder, options);
  }

  async createComment(
    slug: string,
    commentDto: CreateCommentDto,
  ): Promise<Article['comments'][0]> {
    const article = await this.articleRepository.findOne({ where: { slug } });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = await this.commentsService.create(commentDto.body);

    if (!article.comments) {
      article.comments = [];
    }

    article.comments.push(comment);

    await this.articleRepository.manager.transaction(async (entityManager) => {
      await entityManager.save(comment);
      await entityManager.save(article);
    });

    return comment;
  }

  async deleteComment(slug: string, id: number): Promise<void> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['comments'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const commentIndex = article.comments.findIndex(
      (comment) => comment.id === id,
    );

    if (commentIndex === -1) {
      throw new NotFoundException('Comment not found in the article');
    }

    const comment = article.comments[commentIndex];

    article.comments.splice(commentIndex, 1);

    await this.articleRepository.save(article);

    await this.commentsService.remove(comment.id);
  }

  async findComments(slug: string): Promise<Article['comments']> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['comments'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article.comments;
  }

  private slugify(title: string) {
    return (
      slug(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
