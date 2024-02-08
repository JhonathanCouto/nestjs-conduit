import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { NullableType } from 'src/common/types/nullable.type';

import { ProfileService } from './profile.service';
import { ProfileResponseType } from './types/profile-response.type';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiParam({ name: 'username', type: String, example: 'John Doe' })
  @Get(':username')
  findOne(
    @Param('username') username: string,
  ): Promise<NullableType<ProfileResponseType>> {
    return this.profileService.findOne(username);
  }

  @Post(':username/follow')
  follow(
    id: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseType> {
    return this.profileService.follow(id, username);
  }

  @Delete(':username/follow')
  unfollow(
    id: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseType> {
    return this.profileService.unfollow(id, username);
  }
}
