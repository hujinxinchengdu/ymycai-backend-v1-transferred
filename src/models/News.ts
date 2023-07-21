import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  newsId: number;

  @Column({ length: 100 })
  title: string;

  @Column()
  url: string;

  @Column({ type: 'timestamp' })
  publishedTime: Date | undefined;

  @Column()
  bannerImage: string;

  @Column('decimal', { precision: 10, scale: 5 })
  overallSentimentScore: number;

  @Column()
  overallSentimentLable: string;

  @Column({ type: 'timestamp' })
  aiSummeryTime: Date | undefined;

  @Column()
  importantSource: string;
}
