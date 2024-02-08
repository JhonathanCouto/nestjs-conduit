import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  create(createTagDto: CreateTagDto): Promise<Tag> {
    return this.tagRepository.save(this.tagRepository.create(createTagDto));
  }

  findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }
}
