import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite])],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
