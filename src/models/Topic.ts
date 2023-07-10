import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { News } from '../models';

@Entity('topics')
class Topic {
  @PrimaryColumn({ type: 'varchar' })
  topic_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @ManyToMany(() => News, (news) => news.topics)
  news: News[];
}

export { Topic };
