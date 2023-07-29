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

  @Column({ type: 'varchar' })
  source: string;

  @Column({ type: 'double precision' })
  overall_sentiment_score: number;

  @Column({ type: 'varchar' })
  overall_sentiment_label: string;

  @CreateDateColumn()
  ai_summary_time: Date;

  @Column({ type: 'varchar' })
  ai_summary_en: string;

  @Column({ type: 'varchar' })
  ai_summary_ch: string;

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
