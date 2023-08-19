import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Company } from '..';

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

  @ManyToOne(() => Company, (company) => company.earningsCalendar)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { EarningsCalendar };
