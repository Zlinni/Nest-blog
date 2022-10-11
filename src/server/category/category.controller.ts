import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddCategoriesDto, DeleteCategoriesDto, GetCategoriesDto, ModifyCategoriesDto } from './category.dto';
import { GetCategories } from './category.interface';
import { CategoryService } from './category.service';
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get('getCategories')
  async getCategories(@Query() query: GetCategoriesDto): Promise<GetCategories> {
    return await this.categoryService.getCategories(query);
  }
  // @UseGuards(AuthGuard('jwt'))
  @Post('addCategories')
  async addCategories(@Body() body: AddCategoriesDto): Promise<void> {
    return await this.categoryService.addCategories(body);
  }
  // @UseGuards(AuthGuard('jwt'))
  @Post('modifyCategories')
  async modifyCategories(@Body() body: ModifyCategoriesDto): Promise<void> {
    return await this.categoryService.modifyCategories(body);
  }
  // @UseGuards(AuthGuard('jwt'))
  @Post('deleteCategories')
  async deleteCategories(@Body() body: DeleteCategoriesDto): Promise<void> {
    return await this.categoryService.deleteCategories(body);
  }
}
