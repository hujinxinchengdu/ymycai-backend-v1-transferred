import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Company } from '..';

@Entity('recommendations')
class Recommendation {
  @PrimaryColumn({ type: 'varchar' })
  recommendation_id: string;

  @Column({ type: 'varchar' })
  algorithm: string;

  @Column({ type: 'varchar' })
  company_id: string;

  @CreateDateColumn()
  publish_time: Date;

  @ManyToOne(() => Company, (company) => company.recommendations)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { Recommendation };
