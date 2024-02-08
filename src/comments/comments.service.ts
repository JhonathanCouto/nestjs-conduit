import { Injectable } from '@nestjs/common';

import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { NullableType } from 'src/common/types/nullable.type';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(body: string): Promise<Comment> {
    return await this.commentRepository.save(
      this.commentRepository.create({ body }),
    );
  }

  async findOne(
    options: FindOptionsWhere<Comment>,
  ): Promise<NullableType<Comment>> {
    return await this.commentRepository.findOne({ where: options });
  }

  async remove(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
