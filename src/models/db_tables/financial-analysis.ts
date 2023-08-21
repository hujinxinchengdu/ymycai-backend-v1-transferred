import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '..';

@Entity('financial_analyses')
class FinancialAnalysis {
  @PrimaryColumn({ type: 'varchar' })
  fin_analyze_id: string;

  @Column({ type: 'json' })
  analyses_data: any;

  @Column({ type: 'varchar' })
  company_id: string;

  @Column({ type: 'varchar' })
  type: string;

  @CreateDateColumn()
  publish_time: Date;

  @UpdateDateColumn()
  update_time: Date;

  @ManyToOne(() => Company, (company) => company.financial_analyses)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
export { FinancialAnalysis };
