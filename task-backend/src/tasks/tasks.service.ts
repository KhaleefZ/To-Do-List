import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema.js';
import { CreateTaskDto } from './dto/create-task.dto.js';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(dto: CreateTaskDto, userId: string) {
    return new this.taskModel({ ...dto, userId }).save();
  }

  async findAll(userId: string, category?: string, sortBy?: string) {
    const filter: any = { userId };
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    const tasks = await this.taskModel.find(filter).exec();
    
    // Advanced sorting algorithm: Priority + Deadline + Time urgency
    const priorityWeights = { High: 3, Medium: 2, Low: 1 };
    const now = new Date().getTime();
    
    return tasks.sort((a, b) => {
      // Calculate urgency score (how close is deadline)
      const deadlineA = new Date(a.deadline).getTime();
      const deadlineB = new Date(b.deadline).getTime();
      const urgencyA = Math.max(0, 1 - (deadlineA - now) / (7 * 24 * 60 * 60 * 1000)); // 0-1 based on 7 days
      const urgencyB = Math.max(0, 1 - (deadlineB - now) / (7 * 24 * 60 * 60 * 1000));
      
      // Combined score: Priority weight * 0.5 + Urgency * 0.3 + Deadline closeness * 0.2
      const scoreA = (priorityWeights[a.priority] / 3) * 0.5 + urgencyA * 0.3 + (1 / (deadlineA - now + 1)) * 0.2;
      const scoreB = (priorityWeights[b.priority] / 3) * 0.5 + urgencyB * 0.3 + (1 / (deadlineB - now + 1)) * 0.2;
      
      // Sort by completion status first (incomplete first), then by score
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      
      return scoreB - scoreA;
    });
  }

  async update(id: string, userId: string, updateData: Partial<CreateTaskDto> & { isCompleted?: boolean }) {
    return this.taskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { returnDocument: 'after' }
    ).exec();
  }

  async remove(id: string, userId: string) {
    return this.taskModel.findOneAndDelete({ _id: id, userId }).exec();
  }
}