import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../models';

@Entity('financial_reports')
class FinancialReport {
  @PrimaryColumn({ type: 'varchar' })
  fin_report_id: string;

  @Column({ type: 'timestamp' })
  publish_time: Date;

  @Column({ type: 'json' })
  balancesheet: any;

  @Column({ type: 'json' })
  cashflow: any;

  @Column({ type: 'json' })
  income_statement: any;

  @Column({ type: 'json' })
  forecast_list: any;

  @Column({ type: 'varchar' })
  company_id: string;

  @ManyToOne(() => Company, (company) => company.financial_reports)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { FinancialReport };
