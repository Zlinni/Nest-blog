import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  AddPostDto,
  DeletePostDto,
  GetCategoriesListDto,
  GetPostDto,
  GetTagListDto,
  ModifyPostDto,
  OutputPostDto,
  ReadPostDto,
} from './posts.dto';
import {
  GetList,
  ReadPost,
  GetLastestPost,
  GetTagList,
} from './posts.interface';
import { Response } from 'express';
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

  @Post('addPost')
  async addPost(@Body() body: AddPostDto): Promise<any> {
    return await this.postService.addPost(body);
  }

  @Post('modifyPost')
  async modifyPost(@Body() body: ModifyPostDto): Promise<any> {
    return await this.postService.modifyPost(body);
  }

  @Post('deletePost')
  async deletePost(@Body() body: DeletePostDto): Promise<any> {
    return await this.postService.deletePost(body);
  }

  @Get('outputPost')
  async outputPost(
    @Query() query: OutputPostDto,
    @Res() res: Response,
  ): Promise<any> {
    const { filePath,fileName } = await this.postService.outputPost(query);
    // 这个头中带编码的文件名
    res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(fileName)}`);
    // 让上述的头暴露出去
    res.setHeader('Access-Control-Expose-Headers', "Content-Disposition");
    res.setHeader('Content-Type', 'application/octet-stream;charset=utf8');
    // express的方法默认暴露了一些头出去
    res.download(filePath)
    return res;
  }
}
