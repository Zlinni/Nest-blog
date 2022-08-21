import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryDocument } from 'src/db/schema/category';
import {
  AddCategoriesDto,
  DeleteCategoriesDto,
  GetCategoriesDto,
  ModifyCategoriesDto,
} from './category.dto';
import { GetCategories } from './category.interface';
import moment from 'moment';
@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Categories') private readonly categoryModel: Model<CategoryDocument>, // @InjectModel('Posts') private readonly postModel: Model<PostDocument>,
  ) {}

  async getCategories(query: GetCategoriesDto): Promise<GetCategories> {
    let { searchText, page = 1, pageSize = 30 } = query;
    let selection = {};
    if (searchText) {
      const reg = new RegExp(searchText, 'i');
      selection = {
        $or: [
          //多条件，数组
          { name: { $regex: reg } },
        ],
      };
    }
    const count = await this.categoryModel.countDocuments(selection);
    if (!count && count !== 0) {
      throw new HttpException('无目录数据', 401);
    }
    const data = await this.categoryModel
      .find(selection)
      .sort({ count: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select({ __v: 0 });
    return {
      data,
      totalPage: Math.ceil(count / pageSize),
    };
  }

  async addCategories(Body: AddCategoriesDto): Promise<void> {
    const { name } = Body;
    const datas = {
      ...Body,
      count: 0,
      createTime: moment(new Date()).format('YYYY-MM-DD hh:mm:ss'),
    };
    const data = await this.categoryModel.find({ name });
    if (data.length > 0) {
      throw new HttpException('有重复数据', 401);
    } else {
      await this.categoryModel.create(datas);
    }
  }

  async modifyCategories(Body: ModifyCategoriesDto): Promise<void> {
    const { _id, color } = Body;
    let datas = {
      color,
    };
    await this.categoryModel.findByIdAndUpdate(_id, {
      $set: datas,
    });
  }

  async deleteCategories(Body: DeleteCategoriesDto): Promise<void> {
    const { _id } = Body;
    const data = await this.categoryModel.findOne({ _id });
    if (data.count > 0) {
      throw new HttpException('不能删除文章数大于1的目录', 401);
    }
    await this.categoryModel.findByIdAndDelete(_id);
  }
}
