import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../models';

@Entity('trading_notes')
class TradingNote {
  @PrimaryColumn({ type: 'varchar' })
  trading_note_id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'json' })
  content: any;

  @CreateDateColumn()
  create_time: Date;

  @UpdateDateColumn()
  update_time: Date;

  // Assuming TradingNote to User is a one-to-many relationship
  @ManyToOne(() => User, (user) => user.tradingNotes)
  user: User;
}
export { TradingNote };
