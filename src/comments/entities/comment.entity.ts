import { Article } from 'src/articles/entities/article.entity';
import { EntityHelper } from 'src/common/entity-helper';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @ManyToOne(() => Article, (article) => article.comments)
  article: Article;
}
