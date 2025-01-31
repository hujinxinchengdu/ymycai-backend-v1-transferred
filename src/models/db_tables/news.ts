import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { NewsToCompanies, Topic } from '..';

@Entity('news')
class News {
  @PrimaryColumn({ type: 'varchar' })
  news_id: string;

  @Column({ type: 'varchar', unique: true })
  title: string;

  @Column({ type: 'varchar', unique: true })
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

  @Column({ type: 'text', default: 'n/a' })
  ai_summary_en: string;

  @Column({ type: 'text', default: 'n/a' })
  ai_summary_ch: string;

  @Column({ type: 'boolean', default: false })
  is_generate: boolean;

  @Column({ type: 'boolean', default: false })
  is_scrap: boolean;

  @Column({ type: 'text', default: 'n/a' })
  original_content: string;

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
