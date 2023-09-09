import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { TradingNote, Watchlist } from '..';

@Entity('users')
class User {
  @PrimaryColumn({ type: 'varchar', unique: true })
  user_id: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  first_name: string;

  @Column({ type: 'varchar' })
  last_name: string;

  @Column({ type: 'boolean' })
  emailVerified: boolean;

  @Column({ type: 'varchar' })
  auth0Id: string;

  @Column({ type: 'timestamp' })
  signup_time: Date;

  @UpdateDateColumn()
  update_time: Date;

  @Column({ type: 'varchar' })
  password_token: string;

  @Column({ type: 'varchar', nullable: true })
  time_zone: string;

  // Assuming User to TradingNote is a one-to-many relationship
  @OneToMany(() => TradingNote, (note) => note.user)
  tradingNotes: TradingNote[];

  // Assuming User to Watchlist is a one-to-many relationship
  @OneToMany(() => Watchlist, (watchlist) => watchlist.user)
  watchlists: Watchlist[];
}

export { User };
