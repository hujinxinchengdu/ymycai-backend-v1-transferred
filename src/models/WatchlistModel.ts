import { Entity, Column, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Company, User, WatchlistToCompany } from '.';

@Entity('watchlists')
class Watchlist {
  @PrimaryColumn({ type: 'varchar' })
  watchlist_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @OneToMany(
    () => WatchlistToCompany,
    (watchlistToCompany) => watchlistToCompany.watchlist,
  )
  companyConnection: WatchlistToCompany[];

  // Assuming User to Watchlist is a one-to-many relationship
  @OneToMany(() => User, (user) => user.watchlists)
  user: User;
}

export { Watchlist };
