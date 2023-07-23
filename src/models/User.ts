import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { TradingNote, Watchlist } from '../models';

@Entity('users')
class User {
  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'timestamp' })
  signup_time: Date;

  @UpdateDateColumn()
  update_time: Date;

  @Column({ type: 'varchar' })
  password_token: string;

  @Column({ type: 'varchar' })
  time_zone: string;

  // Assuming User to TradingNote is a one-to-many relationship
  @OneToMany(() => TradingNote, (note) => note.user)
  tradingNotes: TradingNote[];

  // Assuming User to Watchlist is a one-to-many relationship
  @OneToMany(() => Watchlist, (watchlist) => watchlist.user)
  watchlists: Watchlist[];
}

export { User };
