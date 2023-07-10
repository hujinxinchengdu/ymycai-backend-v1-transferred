import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../models';

@Entity('technical_indicators')
class TechnicalIndicator {
  @PrimaryColumn({ type: 'varchar' })
  technical_indicator_id: string;

  @CreateDateColumn()
  record_time: Date;

  @Column({ type: 'varchar' })
  company_id: string;

  @Column({ type: 'json' })
  data: any;

  @ManyToOne(() => Company, (company) => company.technical_indicators)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { TechnicalIndicator };
