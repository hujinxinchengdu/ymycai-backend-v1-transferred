import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '..';

@Index('index_on_company_symbol', ['company_symbol'])
@Entity('peer_stocks')
class PeerStock {
  @PrimaryColumn({ type: 'varchar' })
  id: string; // A unique ID for each record

  @Column({ type: 'varchar' })
  company_symbol: string;

  @Column('text', { array: true })
  peer_symbols: string[];

  @CreateDateColumn()
  info_create_time: Date;

  @UpdateDateColumn()
  info_update_time: Date;

  // If you want a direct relation to Company entity
  @OneToOne(() => Company)
  @JoinColumn({
    name: 'company_symbol',
    referencedColumnName: 'company_symbol',
  })
  company: Company;
}

export { PeerStock };
