import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { DeepPartial, FindOptionsWhere, In, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { NullableType } from 'src/common/types/nullable.type';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Tag } from 'src/tags/entities/tag.entity';
import { TagsService } from 'src/tags/tags.service';
import { FavoritesService } from 'src/favorites/favorites.service';
import { QueryArticleDto } from './dto/query-article.dto';
import { FollowersService } from 'src/followers/followers.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slug = require('slug');

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private readonly tagsService: TagsService,
    private readonly favoritesService: FavoritesService,
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
    private readonly followersService: FollowersService,
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

    const tags: Tag[] = [];

    if (createArticleDto.tagList) {
      const tagEntities = await this.tagsService.findAllByOptions({
        name: In(createArticleDto.tagList),
      });

      const existingTagNames = tagEntities.map((tag) => tag.name);
      const newTagNames = createArticleDto.tagList.filter(
        (name) => !existingTagNames.includes(name),
      );

      const newTags = await Promise.all(
        newTagNames.map((name) => this.tagsService.findOrCreate(name)),
      );

      tags.push(...tagEntities, ...newTags);
    }

    const newArticle = this.articleRepository.create({
      ...createArticleDto,
      tags,
      slug: this.slugify(createArticleDto.title),
      author: user,
    });

    return this.articleRepository.save(newArticle);
  }

  async findArticles(
    query: QueryArticleDto,
    options: IPaginationOptions,
  ): Promise<Pagination<Article>> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.favorites', 'favorite');

    if (query.tag) {
      queryBuilder.andWhere('tag.name = :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.usersService.findOne({
        username: query.author,
      });

      if (author) {
        queryBuilder.andWhere('author.id = :id', { id: author.id });
      }
    }

    if (query.favoritedBy) {
      queryBuilder.innerJoin(
        'article.favorites',
        'favorite',
        'favorite.user.username = :favoritedBy',
        { favoritedBy: query.favoritedBy },
      );
    }

    queryBuilder.orderBy('article.createdAt', 'DESC');

    return paginate<Article>(queryBuilder, options);
  }

  async findFeedArticles(
    userId: number,
    options: IPaginationOptions,
  ): Promise<Pagination<Article>> {
    const user = await this.usersService.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const following = await this.followersService.findByFollowing(user);

    if (following.length === 0) {
      return new Pagination<Article>([], {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 0,
        currentPage: 0,
      });
    }

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.favorites', 'favorite')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('author.id IN (:...ids)', {
        ids: following.map((user) => user.id),
      })
      .orderBy('article.createdAt', 'DESC');

    return paginate<Article>(queryBuilder, options);
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
    const article = await this.articleRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const user = await this.usersService.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingFavorite = await this.favoritesService.findOne({
      article,
      user,
    });

    if (!existingFavorite) {
      await this.favoritesService.create({ article, user });
      article.favoritesCount++;
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

    const favorite = await this.favoritesService.findOne({
      user,
      article,
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    article.favoritesCount--;
    await this.favoritesService.remove(favorite);

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
