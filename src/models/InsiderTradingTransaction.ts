import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '.';

@Entity('transactions')
class InsiderTradingTransaction {
  @PrimaryColumn({ type: 'varchar' })
  reportingCik: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @CreateDateColumn()
  filingDate: Date;

  @CreateDateColumn()
  transactionDate: Date;

  @Column({ type: 'varchar' })
  transactionType: string;

  @Column({ type: 'int' })
  securitiesOwned: number;

  @Column({ type: 'varchar' })
  companyCik: string;

  @Column({ type: 'varchar' })
  reportingName: string;

  @Column({ type: 'varchar' })
  typeOfOwner: string;

  @Column({ type: 'char', length: 1 })
  acquistionOrDisposition: string;

  @Column({ type: 'varchar' })
  formType: string;

  @Column({ type: 'float' })
  securitiesTransacted: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'varchar' })
  securityName: string;

  @Column({ type: 'varchar' })
  link: string;

  @ManyToOne(() => Company, (company) => company.insiderTradingTransaction)
  @JoinColumn({ name: 'companyCik', referencedColumnName: 'company_id' }) // Assuming that the company entity has a company_id as its primary key.
  company: Company;
}

export { InsiderTradingTransaction };
