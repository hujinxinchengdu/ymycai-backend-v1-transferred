import { Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm';
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
