import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  ValidationPipe,
  Param,
  Put,
} from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-categories.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './interfaces/category.interface';
import { CategoriesService } from './categories.service';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  async searchCategories(): Promise<Array<Category>> {
    return await this.categoriesService.searchAllCategories();
  }

  @Get('/:category')
  async searchCategoryToId(
    @Param('category') category: string,
  ): Promise<Array<Category>> {
    return await this.categoriesService.searchCategoryToId(category);
  }

  @Put('/:category')
  @UsePipes(ValidationPipe)
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('category') category: string,
  ): Promise<void> {
    await this.categoriesService.updateCategory(category, updateCategoryDto);
  }

  @Post('/:category/players/:idPlayer')
  async assignCategoryPlayer(@Param() params: string[]): Promise<void> {
    return await this.categoriesService.assignCategoryPlayer(params);
  }
}
