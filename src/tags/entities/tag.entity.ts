import { Exclude } from 'class-transformer';
import { EntityHelper } from 'src/common/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag extends EntityHelper {
  @PrimaryGeneratedColumn()
  @Exclude({ toPlainOnly: true })
  id: number;

  @Column()
  tag: string;
}
