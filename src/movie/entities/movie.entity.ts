import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique(['title'])
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @Column('int')
  duration: number;

  @Column('float')
  rating: number;  

  @Column('int')
  releaseYear: number;

  // @CreateDateColumn()
  // created_at: Date;

  // @UpdateDateColumn()
  // updated_at: Date;
}
