import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Watchlist, Company } from '.';

@Entity('watchlist_to_company')
class WatchlistToCompany {
  @PrimaryColumn()
  watchlist_id: string;

  @PrimaryColumn()
  company_id: string;

  @Column({ type: 'int' })
  order: number;

  @ManyToOne(() => Watchlist, (watchlist) => watchlist.companyConnection)
  @JoinColumn({ name: 'watchlist_id' })
  watchlist: Watchlist;

  @ManyToOne(() => Company, (company) => company.watchlistConnection)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { WatchlistToCompany };
