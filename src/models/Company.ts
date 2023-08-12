import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import {
  Tag,
  WatchlistToCompany,
  FinancialReport,
  FinancialAnalysis,
  MarketData,
  TechnicalIndicator,
  LongtermSignal,
  NewsToCompanies,
  Recommendation,
} from '.';

@Entity('companies')
class Company {
  @PrimaryColumn({ type: 'varchar' })
  company_id: string;

  @Column({ type: 'varchar' })
  company_name: string;

  @Column({ type: 'varchar', unique: true })
  company_symbol: string;

  @Column({ type: 'varchar' })
  company_industry: string;

  @Column({ type: 'text' })
  company_information: string;

  @Column({ type: 'text' })
  industry_position: string;

  @Column({ type: 'timestamp' })
  established_time: Date;

  @CreateDateColumn()
  info_create_time: Date;

  @UpdateDateColumn()
  info_update_time: Date;

  @ManyToMany(() => Tag, (tag) => tag.companies)
  @JoinTable({
    name: 'company_to_tags',
    joinColumn: {
      name: 'company_id',
      referencedColumnName: 'company_id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'tag_id',
    },
  })
  tags: Tag[];

  @OneToMany(
    () => WatchlistToCompany,
    (watchlistToCompany) => watchlistToCompany.company,
  )
  watchlistConnection: WatchlistToCompany[];

  @OneToMany(
    () => FinancialReport,
    (financialReport) => financialReport.company,
  )
  financial_reports: FinancialReport[];

  @OneToMany(
    () => FinancialAnalysis,
    (financialAnalysis) => financialAnalysis.company,
  )
  financial_analyses: FinancialAnalysis[];

  @OneToMany(() => MarketData, (marketData) => marketData.company)
  market_data: MarketData[];

  @OneToMany(
    () => TechnicalIndicator,
    (technicalIndicator) => technicalIndicator.company,
  )
  technical_indicators: TechnicalIndicator[];

  @OneToMany(() => LongtermSignal, (longtermSignal) => longtermSignal.company)
  longterm_signals: LongtermSignal[];

  @OneToMany(
    () => NewsToCompanies,
    (newsToCompanies) => newsToCompanies.company,
  )
  newsConnection: NewsToCompanies[];

  @OneToMany(() => Recommendation, (recommendation) => recommendation.company)
  recommendations: Recommendation[];
}

export { Company };
