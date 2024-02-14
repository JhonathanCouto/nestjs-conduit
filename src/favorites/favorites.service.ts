import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { NullableType } from 'src/common/types/nullable.type';
import { User } from 'src/users/entities/user.entity';
import { Article } from 'src/articles/entities/article.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async create(data: DeepPartial<Favorite>): Promise<Favorite> {
    return this.favoriteRepository.save(this.favoriteRepository.create(data));
  }

  async findOne(
    fields: FindOptionsWhere<Favorite>,
  ): Promise<NullableType<Favorite>> {
    return this.favoriteRepository.findOne({
      where: fields,
      relations: { user: true, article: true },
    });
  }

  async findOneByUserAndArticle(
    user: User,
    article: Article,
  ): Promise<NullableType<Favorite>> {
    return this.favoriteRepository.findOne({
      where: { user, article },
    });
  }

  async remove(favorite: Favorite): Promise<void> {
    await this.favoriteRepository.remove(favorite);
  }

  async countByArticle(article: Article): Promise<number> {
    return this.favoriteRepository.count({ where: { article } });
  }
}
