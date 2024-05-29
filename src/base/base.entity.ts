import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const defaultTimestamp = () => 'CURRENT_TIMESTAMP';
export abstract class BaseTable {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({
    type: 'time without time zone',
    default: defaultTimestamp,
  })
  @CreateDateColumn({ type: 'timestamp' })
  public created_at?: Date;

  @Column({
    type: 'time without time zone',
    default: defaultTimestamp,
  })
  @CreateDateColumn({ type: 'timestamp' })
  public updated_at?: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
