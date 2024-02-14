import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { UsersModule } from 'src/users/users.module';
import { CommentsModule } from 'src/comments/comments.module';
import { TagsModule } from 'src/tags/tags.module';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { FollowersModule } from 'src/followers/followers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    FollowersModule,
    UsersModule,
    CommentsModule,
    TagsModule,
    FavoritesModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
