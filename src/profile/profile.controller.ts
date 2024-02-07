import { ProfileService } from './profile.service';
import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfileResponseType } from './types/profile-response.type';
import { NullableType } from 'src/common/types/nullable.type';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(
    @Param('username') username: string,
  ): Promise<NullableType<ProfileResponseDto>> {
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
