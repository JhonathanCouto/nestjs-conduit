import { Injectable, NotFoundException } from '@nestjs/common';
import { NullableType } from 'src/common/types/nullable.type';

import { UsersService } from './../users/users.service';
import { ProfileResponseType } from './types/profile-response.type';

@Injectable()
export class ProfileService {
  constructor(private readonly usersService: UsersService) {}

  async findOne(username: string): Promise<NullableType<ProfileResponseType>> {
    return await this.usersService.findOne({ username });
  }

  async follow(
    followerId: number,
    username: string,
  ): Promise<ProfileResponseType> {
    const userToFollow = await this.usersService.findOne({ username });
    const follower = await this.usersService.findOne({ id: followerId });

    if (!userToFollow || !follower) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.update(followerId, {
      following: follower.following,
    });

    await this.usersService.update(userToFollow.id, {
      followers: userToFollow.followers,
    });

    return userToFollow;
  }

  async unfollow(
    followerId: number,
    username: string,
  ): Promise<ProfileResponseType> {
    const userToUnfollow = await this.usersService.findOne({ username });
    const follower = await this.usersService.findOne({ id: followerId });

    if (!userToUnfollow || !follower) {
      throw new NotFoundException('User not found');
    }

    follower.following = follower.following.filter(
      (user) => user.id !== userToUnfollow.id,
    );

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (user) => user.id !== follower.id,
    );

    await this.usersService.update(followerId, {
      following: follower.following,
    });

    await this.usersService.update(userToUnfollow.id, {
      followers: userToUnfollow.followers,
    });

    return userToUnfollow;
  }
}
