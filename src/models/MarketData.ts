import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '.';

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

  @Column({ type: 'double precision' })
  dividend_amount: number;

  @Column({ type: 'double precision' })
  split_coefficient: number;

  @Column({ type: 'varchar' })
  type: string;

  @UpdateDateColumn()
  last_refreshed: Date;

  @ManyToOne(() => Company, (company) => company.market_data)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { MarketData };
