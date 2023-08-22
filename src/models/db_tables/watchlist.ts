import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { User, WatchlistToCompany } from '..';

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

  @ManyToOne(() => User, (user) => user.watchlists)
  @JoinColumn({ name: 'user_id' }) // This denotes the foreign key column.
  user: User;
}

export { Watchlist };
