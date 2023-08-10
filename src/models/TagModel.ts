import { Entity, Column, ManyToMany, PrimaryColumn } from 'typeorm';
import { Company } from './CompanyModel';

@Entity('tags')
class Tag {
  @PrimaryColumn({ type: 'varchar' })
  tag_id: string;

  @Column({ type: 'varchar', unique: true })
  tag_cn: string;

  @Column({ type: 'varchar', unique: true })
  tag_en: string;

  @ManyToMany(() => Company, (company) => company.tags)
  companies: Company[];
}

export { Tag };
