import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '..';

@Index('index_on_company_id_and_record_time', ['company_id', 'record_time'])
@Entity('market_data')
class MarketData {
  @PrimaryColumn({ type: 'varchar' })
  market_data_id: string;

  @CreateDateColumn()
  record_time: Date;

  @Column({ type: 'double precision' })
  open: number;

  @Column({ type: 'double precision' })
  high: number;

  @Column({ type: 'double precision' })
  low: number;

  @Column({ type: 'double precision' })
  close: number;

  @Column({ type: 'double precision' })
  adj_close: number;

  @Column({ type: 'bigint' })
  volume: number;

  @Column({ type: 'varchar' })
  company_id: string;

  @Column({ type: 'double precision', default: 0 })
  dividend_amount: number;

  @Column({ type: 'double precision', default: 0 })
  split_coefficient: number;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'bigint' })
  unadjustedVolume: number;

  @Column({ type: 'double precision' })
  change: number;

  @Column({ type: 'double precision' })
  changePercent: number;

  @Column({ type: 'double precision', default: 0 })
  vwap: number;

  @Column({ type: 'varchar' })
  label: string;

  @Column({ type: 'double precision' })
  changeOverTime: number;

  @UpdateDateColumn()
  last_refreshed: Date;

  @ManyToOne(() => Company, (company) => company.market_data)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { MarketData };
