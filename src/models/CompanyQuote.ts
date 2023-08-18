import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '.';

@Entity('company_quote')
class CompanyQuote {
  @PrimaryColumn({ type: 'varchar' })
  market_data_id: string;

  @CreateDateColumn()
  record_time: Date;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'double precision' })
  price: number;

  @Column({ type: 'double precision' })
  changesPercentage: number;

  @Column({ type: 'double precision' })
  change: number;

  @Column({ type: 'double precision' })
  dayLow: number;

  @Column({ type: 'double precision' })
  dayHigh: number;

  @Column({ type: 'double precision' })
  yearHigh: number;

  @Column({ type: 'double precision' })
  yearLow: number;

  @Column({ type: 'double precision' })
  marketCap: number;

  @Column({ type: 'double precision' })
  priceAvg50: number;

  @Column({ type: 'double precision' })
  priceAvg200: number;

  @Column({ type: 'bigint' })
  volume: number;

  @Column({ type: 'bigint' })
  avgVolume: number;

  @Column({ type: 'varchar' })
  exchange: string;

  @Column({ type: 'double precision' })
  open: number;

  @Column({ type: 'double precision' })
  previousClose: number;

  @Column({ type: 'double precision' })
  eps: number;

  @Column({ type: 'double precision' })
  pe: number;

  @Column({ type: 'timestamp with time zone' })
  earningsAnnouncement: Date;

  @Column({ type: 'bigint' })
  sharesOutstanding: number;

  @ManyToOne(() => Company, (company) => company.company_quote)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { CompanyQuote };
