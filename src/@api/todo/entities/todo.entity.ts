import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({
  name: 'todolist'
})
export class TodoEntity extends BaseEntity {
  @PrimaryGeneratedColumn() id: number
  @Column('varchar', { nullable: true, length: 125 }) name: string
  @Column('text', { nullable: true, default: 'hello' }) task: string
  @Column('boolean', { default: false }) isCompleted: boolean
  @Column('date', { default: () => Date.now() }) createdAt: Date
  @Column('date', { default: () => Date.now() }) updatedAt: Date
}
