import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { Company } from '..';

@Index('index_on_company_id', ['company_id'])
@Entity('earnings_calendar')
class EarningsCalendar {
  @PrimaryColumn({ type: 'varchar' })
  earnings_calendar_id: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({ type: 'double precision' })
  eps: number;

  @Column({ type: 'double precision' })
  eps_estimated: number;

  @Column({ type: 'double precision' })
  revenue: number;

  @Column({ type: 'double precision' })
  revenue_estimated: number;

  @Column({ type: 'timestamp' })
  fiscal_date_ending: Date;

  @Column({ type: 'timestamp' })
  publish_date: Date;

  @Column({ type: 'varchar' })
  company_id: string;

  @ManyToOne(() => Company, (company) => company.earningsCalendar)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { EarningsCalendar };
