import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsISO8601, 
  IsOptional, 
  MinLength,
  IsArray
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a new Task.
 * This ensures that the React Native app sends all required fields
 * in the correct format before the database is even touched.
 */
export class CreateTaskDto {
  
  @ApiProperty({ example: 'Complete project report', description: 'Task title (min 3 chars)' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiPropertyOptional({ example: 'Write the final section of the report', description: 'Optional task description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-02-20T10:00:00.000Z', description: 'Task date/time in ISO8601 format' })
  @IsNotEmpty({ message: 'Date and Time are required' })
  @IsISO8601({}, { message: 'dateTime must be a valid ISO8601 date string' })
  dateTime: string;

  @ApiProperty({ example: '2026-02-25T23:59:59.000Z', description: 'Deadline in ISO8601 format' })
  @IsNotEmpty({ message: 'Deadline is required' })
  @IsISO8601({}, { message: 'deadline must be a valid ISO8601 date string' })
  deadline: string;

  @ApiProperty({ example: 'High', enum: ['High', 'Medium', 'Low'], description: 'Task priority level' })
  @IsNotEmpty({ message: 'Priority is required' })
  @IsEnum(['High', 'Medium', 'Low'], {
    message: 'Priority must be either High, Medium, or Low',
  })
  priority: 'High' | 'Medium' | 'Low';

  @ApiPropertyOptional({ example: ['urgent', 'important'], description: 'Tags for the task', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'Work', enum: ['Work', 'Personal', 'Shopping', 'Health', 'Study', 'Other'], description: 'Task category' })
  @IsOptional()
  @IsEnum(['Work', 'Personal', 'Shopping', 'Health', 'Study', 'Other'], {
    message: 'Category must be Work, Personal, Shopping, Health, Study, or Other',
  })
  category?: 'Work' | 'Personal' | 'Shopping' | 'Health' | 'Study' | 'Other';
}