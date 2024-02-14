import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NullableType } from 'src/common/types/nullable.type';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(data: DeepPartial<Tag>): Promise<Tag> {
    return this.tagRepository.save(this.tagRepository.create(data));
  }

  async findOne(options: FindOptionsWhere<Tag>): Promise<NullableType<Tag>> {
    return this.tagRepository.findOne({ where: options });
  }

  async findAllByOptions(options: FindOptionsWhere<Tag>): Promise<Tag[]> {
    return this.tagRepository.find({ where: options });
  }

  async findOrCreate(name: string): Promise<Tag> {
    let tag = await this.tagRepository.findOne({ where: { name } });
    if (!tag) {
      tag = await this.tagRepository.save(this.tagRepository.create({ name }));
    }
    return tag;
  }

  findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }
}
