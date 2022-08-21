// import { HttpException, Injectable } from '@nestjs/common';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { Connection, Model } from 'mongoose';
// import { PostDocument } from '../../db/schema/post';
// import {
//   GetList,
//   ReadPost,
//   Post,
//   GetLastestPost,
//   GetTagList,
// } from './posts.interface';
// import {
//   GetCategoriesListDto,
//   GetPostDto,
//   GetTagListDto,
//   ReadPostDto,
// } from './posts.dto';
// import { readArticle } from '../../utils/readArticle';
// import { TagDocument } from 'src/db/schema/tag';
// import { CategoryDocument } from 'src/db/schema/category';
// @Injectable()
// export class PostsService {
//   constructor(
//     @InjectModel('Posts') private readonly postModel: Model<PostDocument>,
//     @InjectModel('Tags') private readonly tagModel: Model<TagDocument>,
//     @InjectModel('Categories')
//     private readonly categoryModel: Model<CategoryDocument>,
//     @InjectConnection() private readonly connection:Connection
//   ) {}
//   async createPost():Promise<void>{
//     const session = await this.connection.startSession();
//     session.startTransaction();
//     try {
      
//       await session.commitTransaction();
//     } catch (err) {
//       await session.abortTransaction();
//     } finally{
//       session.endSession();
//     }
//   }  
//   async getList(query: GetPostDto): Promise<GetList> {
//     console.log(query,'getList')
//     let { page = 1, pageSize = 10 } = query;
//     if (pageSize > 20) {
//       pageSize = 20;
//     }
//     const count = await this.postModel.countDocuments({});
//     if (!count) {
//       throw new HttpException('文章数据库没有内容', 401);
//     }
//     const data = await this.postModel
//       .find({})
//       .populate([{
//         path: 'categories',
//         model: this.categoryModel,
//         select: 'name',
//       },{
//         path: 'tags',
//         model: this.tagModel,
//         select: 'name',
//       }])
//       .sort({
//         date: -1,
//       })
//       .skip((page - 1) * pageSize)
//       .limit(pageSize)
//       .select({ toc: 0, url: 0 });
//     return {
//       totalPage: Math.ceil(count / pageSize),
//       count: data.length,
//       data,
//     };
//   }

//   async readPost(query: ReadPostDto): Promise<ReadPost> {
//     const { abbrlink } = query;
//     console.log(abbrlink,'readpost')
//     const reg = /^[0-9]*$/;
//     if (!reg.test(abbrlink)) {
//       throw new HttpException('错误链接', 401);
//     }
//     const data: Post = await this.postModel
//       .findOne({
//         abbrlink: abbrlink,
//       })
//       .populate({
//         path: 'categories',
//         model: this.categoryModel,
//         select: 'name',
//       })
//       .select({ __v: 0, top: 0 });
//     console.log(data);
//     const postMd = await readArticle(data.url);
//     data.url = '';
//     return {
//       data,
//       postMd,
//     };
//   }

//   async getLastestPost(): Promise<GetLastestPost> {
//     const data = await this.postModel
//       .find({})
//       .sort({
//         updateTime: -1,
//       })
//       .limit(6)
//       .select({ _id: 1, title: 1, cover: 1, abbrlink: 1, updateTime: 1 });
//     return {
//       data,
//     };
//   }

//   async getTagsList(query: GetTagListDto): Promise<GetTagList> {
//     let { tagName: name, page = 1, pageSize = 6 } = query;
//     if (pageSize > 20) pageSize = 20;
//     const tagData = await this.tagModel
//       .findOne({ name })
//       .select({ count: 1, _id: 1 });
//     if (tagData.count === 0) {
//       throw new HttpException('该标签分类下无文章', 401);
//     }
//     console.log(tagData,'tagData')
//     const data = await this.postModel
//       .find({
//         tags: {
//           $in: [tagData._id],
//         },
//       })
//       .sort({
//         title: -1,
//       })
//       .skip((page - 1) * pageSize)
//       .limit(pageSize)
//       .select({ toc: 0, url: 0, __v: 0 });
//     return {
//       data,
//       count: tagData.count,
//       totalPage: Math.ceil(tagData.count / pageSize),
//     };
//   }

//   async getCategoriesList(query: GetCategoriesListDto): Promise<GetTagList> {
//     let { categoryName: name, page = 1, pageSize = 6 } = query;
//     if (pageSize > 20) pageSize = 20;
//     const categoryData = await this.categoryModel
//       .findOne({ name })
//       .select({ count: 1, _id: 1 });
//     if (categoryData.count === 0) {
//       throw new HttpException('该目录分类下无文章', 401);
//     }
//     const data = await this.postModel
//       .find({
//         categories: {
//           $in: [categoryData._id],
//         },
//       })
//       .sort({
//         title: -1,
//       })
//       .skip((page - 1) * pageSize)
//       .limit(pageSize)
//       .select({ toc: 0, url: 0, __v: 0 });
//     return {
//       data,
//       count: categoryData.count,
//       totalPage: Math.ceil(categoryData.count / pageSize),
//     };
//   }
// }
