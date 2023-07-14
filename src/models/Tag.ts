import { Entity, Column, ManyToMany, PrimaryColumn } from 'typeorm';
import { Company } from './Company';

@Entity('tags')
class Tag {
  @PrimaryColumn({ type: 'varchar' })
  tag_id: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  industry_cn: string;

  @Column({ type: 'varchar' })
  industry_en: string;

  @Column({ type: 'varchar' })
  code: string;

  @ManyToMany(() => Company, (company) => company.tags)
  companies: Company[];
}

export { Tag };
