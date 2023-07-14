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

import { NewsToCompanies, Topic } from '../models';

@Entity('news')
class News {
  @PrimaryColumn({ type: 'varchar' })
  news_id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  url: string;

  @CreateDateColumn()
  published_time: Date;

  @Column({ type: 'varchar' })
  banner_image: string;

  @Column({ type: 'double precision' })
  source: number;

  @Column({ type: 'double precision' })
  overall_sentiment_score: number;

  @Column({ type: 'double precision' })
  overall_sentiment_label: number;

  @CreateDateColumn()
  ai_summery_time: Date;

  @Column({ type: 'text' })
  ai_summery_en: string;

  @Column({ type: 'text' })
  ai_summery_cn: string;

  @OneToMany(() => NewsToCompanies, (newsToCompanies) => newsToCompanies.news)
  companyConnection: NewsToCompanies[];

  @ManyToMany(() => Topic, (topic) => topic.news)
  @JoinTable({
    name: 'topics_to_news',
    joinColumn: { name: 'news_id', referencedColumnName: 'news_id' },
    inverseJoinColumn: { name: 'topic_id', referencedColumnName: 'topic_id' },
  })
  topics: Topic[];
}

export { News };
