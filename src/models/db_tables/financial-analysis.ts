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

@Index('index_on_company_id', ['company_id'])
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
