import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TagDocument } from 'src/db/schema/tag';
import {
  AddTagsDto,
  DeleteTagsDto,
  GetTagsDto,
  ModifyTagsDto,
} from './tag.dto';
import { GetTags } from './tag.interface';
import moment from 'moment';
@Injectable()
export class TagService {
  constructor(
    @InjectModel('Tags') private readonly tagModel: Model<TagDocument>, // @InjectModel('Posts') private readonly postModel: Model<PostDocument>,
  ) {}

  async getTags(query: GetTagsDto): Promise<GetTags> {
    let { searchText, page = 1, pageSize } = query;
    let selection = {};
    if (searchText) {
      const reg = new RegExp(searchText, 'i');
      selection = {
        $or: [{ name: { $regex: reg } }],
      };
    }
    const count = await this.tagModel.countDocuments(selection);
    if (!count && count !== 0) {
      throw new HttpException('无标签数据', 401);
    }
    let data;
    if (!pageSize) {
      data = await this.tagModel
        .find(selection)
        .sort({ count: -1 })
        .select({ __v: 0 });
    } else {
      data = await this.tagModel
        .find(selection)
        .sort({ count: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select({ __v: 0 });
    }
    return {
      data,
      totalPage: pageSize?Math.ceil(count / pageSize):1,
    };
  }

  async addTags(Body: AddTagsDto): Promise<void> {
    const { name } = Body;
    const datas = {
      ...Body,
      count: 0,
      createTime: moment(new Date()).format('YYYY-MM-DD hh:mm:ss'),
    };
    const data = await this.tagModel.find({ name });
    if (data.length > 0) {
      throw new HttpException('有重复数据', 401);
    } else {
      await this.tagModel.create(datas);
    }
  }

  async modifyTags(Body: ModifyTagsDto): Promise<void> {
    const { _id, color } = Body;
    let datas = {
      color,
    };
    await this.tagModel.findByIdAndUpdate(_id, {
      $set: datas,
    });
  }

  async deleteTags(Body: DeleteTagsDto): Promise<void> {
    const { _id } = Body;
    const data = await this.tagModel.findOne({ _id });
    if (data.count > 0) {
      throw new HttpException('不能删除文章数大于1的标签', 401);
    }
    await this.tagModel.findByIdAndDelete(_id);
  }
}
