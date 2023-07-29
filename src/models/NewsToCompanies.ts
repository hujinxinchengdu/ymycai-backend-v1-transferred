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

import { Company, News } from '../models';

@Entity('news_to_companies')
class NewsToCompanies {
  @PrimaryColumn({ type: 'varchar' })
  news_id: string;

  @PrimaryColumn({ type: 'varchar' })
  company_id: string;

  @Column({ type: 'double precision' })
  relevance_score: number;

  @Column({ type: 'double precision' })
  ticker_sentiment_score: number;

  @Column({ type: 'varchar' })
  ticker_sentiment_label: string;

  @ManyToOne(() => News, (news) => news.companyConnection)
  @JoinColumn({ name: 'news_id' })
  news: News;

  @ManyToOne(() => Company, (company) => company.newsConnection)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { NewsToCompanies };
