import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  AddTagsDto,
  DeleteTagsDto,
  GetTagsDto,
  ModifyTagsDto,
} from './tag.dto';
import { GetTags } from './tag.interface';
import { TagService } from './tag.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}
  @Get('getTags')
  async getTags(@Query() query: GetTagsDto): Promise<GetTags> {
    return await this.tagService.getTags(query);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('addTags')
  async addTags(@Body() body: AddTagsDto): Promise<void> {
    return await this.tagService.addTags(body);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('modifyTags')
  async modifyTags(@Body() body: ModifyTagsDto): Promise<void> {
    return await this.tagService.modifyTags(body);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('deleteTags')
  async deleteTags(@Body() body: DeleteTagsDto): Promise<void> {
    return await this.tagService.deleteTags(body);
  }
}
