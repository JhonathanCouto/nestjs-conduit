import { Comment } from 'src/comments/entities/comment.entity';
import { EntityHelper } from 'src/common/entity-helper';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Article extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  body: string;

  @Column('simple-array')
  tagList: string[];

  @OneToMany(() => Comment, (comment) => comment.article, { eager: true })
  @JoinColumn()
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (author) => author.articles)
  author: User;

  @Column({ default: 0 })
  favoriteCount: number;
}
