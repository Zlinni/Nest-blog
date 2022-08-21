import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  GetCategoriesListDto,
  GetPostDto,
  GetTagListDto,
  ReadPostDto,
} from './posts.dto';
import {
  GetList,
  ReadPost,
  GetLastestPost,
  GetTagList,
} from './posts.interface';
@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}
  @Get('getList')
  async getList(@Query() query: GetPostDto): Promise<GetList> {
    return await this.postService.getList(query);
  }
  @Get('readPost')
  async readPost(@Query() query: ReadPostDto): Promise<ReadPost> {
    return await this.postService.readPost(query);
  }
  @Get('getLastestPost')
  async GetLastestPost(): Promise<GetLastestPost> {
    return await this.postService.getLastestPost();
  }

  @Get('getTagsList')
  async getTagsList(@Query() query: GetTagListDto): Promise<GetTagList> {
    return await this.postService.getTagsList(query);
  }

  @Get('getCategoriesList')
  async getCategoriesList(
    @Query() query: GetCategoriesListDto,
  ): Promise<GetTagList> {
    return await this.postService.getCategoriesList(query);
  }
}
