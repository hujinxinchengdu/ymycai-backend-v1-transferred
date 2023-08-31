import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '..';

@Entity('company_quote')
class CompanyQuote {
  @PrimaryColumn({ type: 'varchar' })
  market_data_id: string;

  @CreateDateColumn()
  record_time: Date;

  @Column({ type: 'varchar', default: 0 })
  symbol: string;

  @Column({ type: 'varchar', default: 0 })
  name: string;

  @Column({ type: 'double precision', default: 0 })
  price: number;

  @Column({ type: 'double precision', default: 0 })
  changesPercentage: number;

  @Column({ type: 'double precision', default: 0 })
  change: number;

  @Column({ type: 'double precision', default: 0 })
  dayLow: number;

  @Column({ type: 'double precision', default: 0 })
  dayHigh: number;

  @Column({ type: 'double precision', default: 0 })
  yearHigh: number;

  @Column({ type: 'double precision', default: 0 })
  yearLow: number;

  @Column({ type: 'double precision', default: 0 })
  marketCap: number;

  @Column({ type: 'double precision', default: 0 })
  priceAvg50: number;

  @Column({ type: 'double precision', default: 0 })
  priceAvg200: number;

  @Column({ type: 'bigint', default: 0 })
  volume: number;

  @Column({ type: 'bigint', default: 0 })
  avgVolume: number;

  @Column({ type: 'varchar', default: 0 })
  exchange: string;

  @Column({ type: 'double precision', default: 0 })
  open: number;

  @Column({ type: 'double precision', default: 0 })
  previousClose: number;

  @Column({ type: 'double precision', default: 0 })
  eps: number;

  @Column({ type: 'double precision', default: 0 })
  pe: number;

  @Column({ type: 'timestamp with time zone', default: new Date(0) })
  earningsAnnouncement: Date;

  @Column({ type: 'bigint', default: 0 })
  sharesOutstanding: number;

  @Column({ type: 'varchar', default: 0 })
  company_id: string;

  @ManyToOne(() => Company, (company) => company.company_quote)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { CompanyQuote };
