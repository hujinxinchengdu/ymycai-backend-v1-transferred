import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '.';

@Entity('longterm_signals')
class LongtermSignal {
  @PrimaryColumn({ type: 'varchar' })
  signal_id: string;

  @Column({ type: 'varchar' })
  company_id: string;

  @Column({ type: 'json' })
  data: any;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => Company, (company) => company.longterm_signals)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { LongtermSignal };
