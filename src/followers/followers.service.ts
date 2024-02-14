import { Injectable } from '@nestjs/common';
import { Follower } from './entities/follower.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follower)
    private followerRepository: Repository<Follower>,
  ) {}

  async findByFollowing(user: User): Promise<Follower[]> {
    return this.followerRepository.find({
      relations: ['following'],
      where: { following: user },
    });
  }
}
