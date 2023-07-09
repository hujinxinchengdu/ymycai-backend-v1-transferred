import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampTransformer } from 'typeorm-timestamp-transformer';
@Entity()
export class News {
  @PrimaryGeneratedColumn()
  newsId: number;

  @Column({ length: 100 })
  title: string;

  @Column()
  url: string;

  @Column({ type: 'timestamp', transformer: new TimestampTransformer() })
  publishedTime: Date | undefined;

  @Column()
  bannerImage: string;

  @Column('decimal', { precision: 10, scale: 5 })
  overallSentimentScore: number;

  @Column()
  overallSentimentLable: string;

  @Column({ type: 'timestamp', transformer: new TimestampTransformer() })
  aiSummeryTime: Date | undefined;

  @Column()
  importantSource: string;
}
