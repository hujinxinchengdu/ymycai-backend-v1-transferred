import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '..';

/**
    Symbol — company’s symbol.
    TransactionDate — the date when a transaction was made.
    ReportingCik — the CIK of the report that was filled by an insider.
    TransactionType — Sale, Purchase, Gift, and other types.
    SecuritiesOwned — how many securities are owned by the insider.
    CompanyCik — company’s CIK.
    ReportingName — the name of the insider who made the transaction.
    AcquisitionOrDisproportion — increasing or reducing the number of insider’s securities.
    FormType — 3, 4 or 5 SEC Form was filled to define this transaction.
    SecuritiesTransacted — how many securities were transacted.
    Security Name — the name of securities that was transacted, ex. "Common Stock".
    Link — the link to the original report in SEC archives.
 */
@Index('index_on_company_symbol', ['symbol'])
@Entity('insider_trading_transactions')
class InsiderTradingTransaction {
  @PrimaryColumn({ type: 'varchar' })
  transaction_id: string;

  @Column({ type: 'varchar' })
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
  @JoinColumn({ name: 'symbol', referencedColumnName: 'company_symbol' }) // Assuming that the company entity has a company_id as its primary key.
  company: Company;
}

export { InsiderTradingTransaction };
