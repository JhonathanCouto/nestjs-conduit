import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follower } from './entities/follower.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Follower])],
  providers: [FollowersService],
  exports: [FollowersService],
})
export class FollowersModule {}
