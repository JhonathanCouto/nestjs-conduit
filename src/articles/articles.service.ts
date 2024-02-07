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
import * as slug from 'slug';

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

    return this.articleRepository.save(
      this.articleRepository.create({
        ...createArticleDto,
        slug: this.slugify(createArticleDto.title),
        author: user,
      }),
    );
  }

  findAll(): Promise<Article[]> {
    return this.articleRepository.find();
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Article>> {
    return paginate<Article>(this.articleRepository, options, {
      relations: ['author'],
    });
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

  private slugify(title: string) {
    return (
      slug(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
