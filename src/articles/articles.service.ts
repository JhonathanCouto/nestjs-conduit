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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slug = require('slug');

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private readonly usersService: UsersService,
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

  private slugify(title: string) {
    return (
      slug(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
