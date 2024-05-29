import { BaseTable } from 'src/base';
import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends BaseTable {
  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  firstName: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 60, unique: true, nullable: true })
  email: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  password: string;
}
