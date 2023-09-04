import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '..';

@Index('index_on_company_id', ['company_id'])
@Entity('financial_reports')
class FinancialReport {
  @PrimaryColumn({ type: 'varchar' })
  fin_report_id: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'timestamp' })
  publish_time: Date;

  @Column({ type: 'json' })
  balancesheet: any;

  @Column({ type: 'json' })
  cashflow: any;

  @Column({ type: 'json' })
  income_statement: any;

  @Column({ type: 'varchar' })
  company_id: string;

  @ManyToOne(() => Company, (company) => company.financial_reports)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { FinancialReport };
