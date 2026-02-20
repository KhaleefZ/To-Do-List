import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the logged-in user (sorted by smart algorithm)' })
  @ApiResponse({ status: 200, description: 'Returns array of tasks' })
  @ApiQuery({ name: 'category', required: false, enum: ['All', 'Work', 'Personal', 'Shopping', 'Health', 'Study', 'Other'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['priority', 'deadline', 'smart'] })
  findAll(@Request() req, @Query('category') category?: string, @Query('sortBy') sortBy?: string) {
    return this.tasksService.findAll(req.user.userId, category, sortBy);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateTaskDto> & { isCompleted?: boolean }, @Request() req) {
    return this.tasksService.update(id, req.user.userId, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.userId);
  }
}