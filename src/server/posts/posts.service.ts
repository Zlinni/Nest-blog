import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, ObjectId, Types } from 'mongoose';
import { PostDocument } from '../../db/schema/post';
import {
  GetList,
  ReadPost,
  Post,
  GetLastestPost,
  GetTagList,
  PostType,
  Tree,
} from './posts.interface';
import {
  AddPostDto,
  ModifyPostDto,
  GetCategoriesListDto,
  GetPostDto,
  GetTagListDto,
  ReadPostDto,
  DeletePostDto,
  ImportPostDto,
  OutputPostDto,
} from './posts.dto';
import { readArticle } from '../../utils/readArticle';
import { TagDocument } from 'src/db/schema/tag';
import { CategoryDocument } from 'src/db/schema/category';
import dayjs from 'dayjs';
import * as fs from 'fs';
import { glob } from 'glob';
import * as readline from 'readline';
@Injectable()
export class PostsService {
  tagMap: Map<any, any>;
  categoryMap: Map<any, any>;
  tagIdMap: Map<any, any>;
  categoryIdMap: Map<any, any>;
  catalog: string;
  constructor(
    @InjectModel('Posts') private readonly postModel: Model<PostDocument>,
    @InjectModel('Tags') private readonly tagModel: Model<TagDocument>,
    @InjectModel('Categories')
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.catalog = process.env.BLOG_LOCAL;
    this.tagMap = new Map();
    this.categoryMap = new Map();
    this.tagIdMap = new Map();
    this.categoryIdMap = new Map();
    this.createPost();
  }
  async createPost(): Promise<void> {
    //开始事务
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      this.deleteAll();
      let that = this;
      const files: Array<string> = glob.sync(this.catalog + '/**/*.md');
      // TODO 获取目录 有个问题就是是否需要读出目录的下一级目录
      // const categoryReg = /[\s\S]+\/_posts\/([\s\S]*?)\/[\s\S]+/
      // const categoryName = new Set();
      // for (const file of files) {
        // categoryName.add(file.replace(categoryReg,(p0,p1)=>p1))
      // }
      
      for (let i = 0; i < files.length; i++) {
        (function (file) {
          that.readLineAsync(file, [], 0);
        })(files[i]);
      }
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }

  async readLineAsync(file: string, tree: Tree[], treeCount: number) {
    try {
      let rl = readline.createInterface({
        input: fs.createReadStream(file),
      });
      let wordCount: number = 0;
      let count: number = 0;
      let intro: string = '';
      let introCount: number = 0;
      let time: string = '';
      const tagOrCateStack: Array<any> = [];
      const type: PostType = {
        title: '',
        cover: '',
        abbrlink: null,
        date: '',
        wordCount: null,
        // tags: [],
        // categories: [],
        top: null,
        intro: '',
        url: '',
        updateTime: '',
        toc: null,
      };
      // 读取文件更新时间
      (function (file: string) {
        fs.stat(file, (err, files) => {
          time = dayjs(files.mtime).format('YYYY-MM-DD hh:mm:ss');
        });
      })(file);

      rl.on('line', (line: string) => {
        if (line === '---') {
          count++;
        }
        if (count === 1) {
          if (line.trim().startsWith('-') && tagOrCateStack.length > 0) {
            type[tagOrCateStack[tagOrCateStack.length - 1]].push(
              line.split('-')[1].trim(),
            );
          } else {
            for (const key in type) {
              // type
              if (line.startsWith(key)) {
                if (key === 'tags' || key === 'categories') {
                  // tagOrCateStack.push(key);
                } else {
                  type[key] = line.slice(key.length + 1).trim();
                }
              }
            }
          }
        }
        if (count === 2) {
          wordCount += line.length;
          let reg = /\p{Unified_Ideograph}/u;

          if (introCount < 100) {
            if (reg.test(line)) {
              introCount += line.length;
              intro += line;
            }
          }
          // 处理层级关系 同级 不同级
          if (line.startsWith('#')) {
            let mark: string = line.split(' ')[0];
            if (
              mark === '#' ||
              mark === '##' ||
              mark === '###' ||
              mark === '####' ||
              mark === '#####'
            ) {
              let level: number = mark.length;
              let data: string = line.slice(level).trim();
              this.treeInsert(data, level, tree, treeCount++);
            }
          }
        }
      });
      rl.on('close', () => {
        type.wordCount = wordCount;
        type.url = file;
        type.abbrlink = +type.abbrlink;
        type.updateTime = time;
        type.toc = JSON.stringify(tree);
        // 去掉开头的# 前言
        intro = intro.slice(2);
        type.intro = intro;
        if (tree === undefined || (Array.isArray(tree) && tree.length === 0)) {
          console.log('注意最高级标题以#开头', file);
        }
        this.saveAll(type);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async treeInsert(
    data: string,
    level: number,
    tree: Tree[],
    treeCount: number,
  ) {
    let stack: Tree[] = tree?.[tree?.length - 1]?.children || [];
    let h2Stack: Tree[] = stack?.[stack?.length - 1]?.children || [];
    let h3Stack: Tree[] = h2Stack?.[h2Stack?.length - 1]?.children || [];
    let h4Stack: Tree[] = h3Stack?.[h3Stack?.length - 1]?.children || [];
    try {
      if (level === 1) {
        tree.push({
          id: treeCount,
          root: data,
          children: [],
        });
      } else if (level === 2) {
        stack.push({
          id: treeCount,
          root: data,
          children: [],
        });
      } else if (level === 3) {
        // let stacks = h2Stack[h2Stack.length - 1];
        // stacks.children.push({
        h2Stack.push({
          id: treeCount,
          root: data,
          children: [],
        });
      } else if (level === 4) {
        // let stacks = h3Stack[h3Stack.length - 1];
        // stacks.children.push({
        h3Stack.push({
          id: treeCount,
          root: data,
          children: [],
        });
      } else if (level === 5) {
        // let stacks = h4Stack[h4Stack.length - 1];
        // stacks.children.push({
        h4Stack.push({
          id: treeCount,
          root: data,
          children: [],
        });
      }
    } catch (error) {
      console.log(error);
      console.log(tree);
    }
  }
  async saveAll(obj: PostType) {
    // let tagIdArr = [];
    // let categoryIdArr = [];
    // for (const item of obj.tags) {
    //   if (!this.tagMap.has(item)) {
    //     this.tagMap.set(item, 1);
    //   } else {
    //     this.tagMap.set(item, this.tagMap.get(item) + 1);
    //   }
    //   let _id = null;
    //   if (!this.tagIdMap.has(item)) {
    //     _id = new Types.ObjectId();
    //     this.tagIdMap.set(item, _id);
    //   } else {
    //     _id = this.tagIdMap.get(item);
    //   }
    //   tagIdArr.push(_id);
    //   let datas = {
    //     _id,
    //     name: item,
    //     color: '#3f51b5',
    //     count: this.tagMap.get(item),
    //     createTime: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss'),
    //   };
    //   this.tagModel
    //     .findOneAndUpdate({ name: item }, { $set: datas }, { upsert: true })
    //     .exec((err, data) => {
    //       if (err) console.log(err);
    //     });
    // }
    // for (const item of obj.categories) {
    //   if (!this.categoryMap.has(item)) {
    //     this.categoryMap.set(item, 1);
    //   } else {
    //     this.categoryMap.set(item, this.categoryMap.get(item) + 1);
    //   }
    //   let _id = null;
    //   if (!this.categoryIdMap.has(item)) {
    //     _id = new Types.ObjectId();
    //     this.categoryIdMap.set(item, _id);
    //   } else {
    //     _id = this.categoryIdMap.get(item);
    //   }
    //   categoryIdArr.push(_id);
    //   let datas = {
    //     _id,
    //     name: item,
    //     color: '#3f51b5',
    //     count: this.categoryMap.get(item),
    //     createTime: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss'),
    //   };
    //   this.categoryModel
    //     .findOneAndUpdate({ name: item }, { $set: datas }, { upsert: true })
    //     .exec((err, data) => {
    //       if (err) console.log(err);
    //     });
    // }
    let datas = {
      ...obj,
      // tags: [...tagIdArr],
      // categories: [...categoryIdArr],
    };
    this.postModel
      .findOneAndUpdate(
        { title: obj.title },
        {
          $set: datas,
        },
        {
          upsert: true,
        },
      )
      .exec((err, data) => {
        if (err) console.log(err);
      });
  }

  async deleteAll() {
    this.postModel.deleteMany({}, (err) => {
      if (err) {
        console.log(err);
      }
    });
    // this.tagModel.deleteMany({}, (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // });
    // this.categoryModel.deleteMany({}, (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // });
  }

  async getList(query: GetPostDto): Promise<GetList> {
    let { page = 1, pageSize = 10, postName, categoryName, tagName, range } = query;
    let startTime: string, endTime: string;
    interface Selection {
      $or?: any;
      $and?: any
      tags?: ObjectId;
      categories?: ObjectId;
    }
    if (range) {
      [startTime, endTime] = range.split(',');
    } 
    let selection: Selection = {
      tags: null,
      categories: null,
      $and: [{
        title: { $regex: new RegExp(postName, 'i') },
      }, { date: { $gt: startTime } }, { date: { $lt: endTime } }]
    };
    type tagData = TagDocument[] | [];
    if(!range){
      selection.$and.pop()
      selection.$and.pop()
    }

    if (pageSize > 40) {
      pageSize = 40;
    }
    let tagData: tagData = [];
    if (tagName) {
      tagData = await this.tagModel.find({
        name: tagName,
      });
      if (tagData && tagData.length > 0) {
        selection.tags = tagData?.[0]?._id;
      }
    } else {
      delete selection.tags;
    }
    type cateData = CategoryDocument[] | [];
    let cateData: cateData = [];
    if (categoryName) {
      cateData = await this.categoryModel.find({
        name: categoryName,
      });
      if (cateData && cateData.length > 0) {
        selection.categories = cateData?.[0]?._id;
      }
    } else {
      delete selection.categories;
    }
    const count: number = await this.postModel.countDocuments(selection);
    if (!count) {
      throw new HttpException('文章数据库没有内容', 401);
    }
    const data = await this.postModel
      .find(selection)
      .populate([
        {
          path: 'categories',
          model: this.categoryModel,
          select: 'name',
        },
        {
          path: 'tags',
          model: this.tagModel,
          select: 'name',
        },
      ])
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select({ toc: 0, url: 0, __v: 0 });
    return {
      totalPage: Math.ceil(count / pageSize),
      count: data.length,
      data,
    };
  }
  async readPost(query: ReadPostDto): Promise<ReadPost> {
    const { _id } = query;
    // console.log(_id, 'readpost');
    // const reg = /^[0-9]*$/;
    // if (!reg.test(abbrlink)) {
    //   throw new HttpException('错误链接', 401);
    // }
    const data: Post = await this.postModel
      .findOne({
        _id,
      })
      .populate({
        path: 'categories',
        model: this.categoryModel,
        select: 'name',
      })
      .select({ __v: 0, top: 0 });
    console.log(data);
    // TODO 设置可选项 后面考虑是否需要byteMd作为文章编辑器
    const postMd = await readArticle(data.url, false);
    data.url = '';
    return {
      data,
      postMd,
    };
  }

  async getLastestPost(): Promise<GetLastestPost> {
    const data = await this.postModel
      .find({})
      .sort({
        updateTime: -1,
      })
      .limit(6)
      .select({ _id: 1, title: 1, cover: 1, abbrlink: 1, updateTime: 1 });
    return {
      data,
    };
  }

  async getTagsList(query: GetTagListDto): Promise<GetTagList> {
    let { tagName: name, page = 1, pageSize = 6 } = query;
    if (pageSize > 20) pageSize = 20;
    const tagData = await this.tagModel
      .findOne({ name })
      .select({ count: 1, _id: 1 });
    if (tagData.count === 0) {
      throw new HttpException('该标签分类下无文章', 401);
    }
    const data = await this.postModel
      .find({
        tags: {
          $in: [tagData._id],
        },
      })
      .sort({
        title: -1,
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select({ toc: 0, url: 0, __v: 0 });
    return {
      data,
      count: tagData.count,
      totalPage: Math.ceil(tagData.count / pageSize),
    };
  }

  async getCategoriesList(query: GetCategoriesListDto): Promise<GetTagList> {
    let { categoryName: name, page = 1, pageSize = 6 } = query;
    if (pageSize > 20) pageSize = 20;
    const categoryData = await this.categoryModel
      .findOne({ name })
      .select({ count: 1, _id: 1 });
    if (categoryData.count === 0) {
      throw new HttpException('该目录分类下无文章', 401);
    }
    const data = await this.postModel
      .find({
        categories: {
          $in: [categoryData._id],
        },
      })
      .sort({
        title: -1,
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select({ toc: 0, url: 0, __v: 0 });
    return {
      data,
      count: categoryData.count,
      totalPage: Math.ceil(categoryData.count / pageSize),
    };
  }

  async addPost(Body: AddPostDto): Promise<any> {
    let { textValue, textTitle, categories } = Body;
    if (!textValue) {
      throw new HttpException('请输入文章内容', 401);
    }
    if (!textTitle) {
      throw new HttpException('请输入文章标题', 401);
    }
    // TODO 这里按理来说要做成只取一级目录的
    if (categories && categories.includes(',')) {
      categories = categories.replace(/,/, '/');
    }
    const fileName = this.catalog + '/' + categories + '/' + textTitle + '.md';
    // 千万注意每次创建文件流之后要关闭它 避免无法删除文件的情况产生
    const fd = fs.openSync(fileName, 'wx');
    fs.writeFileSync(fileName, textValue);
    fs.closeSync(fd);
    await this.createPost();
    return {
      msg: '创建成功',
    };
  }
  // 修改文章
  async modifyPost(Body: ModifyPostDto): Promise<any> {
    // 修改的方法有两种
    // 一先找到数据库中对应文件的url并删除本地的文件，然后把数据库对应文件删除，之后重新全量读写，
    // 二是对比目录是否需要删除，如果目录不变就更新具体的值，如果目录变了就改变目录。但是还要改变本地文件的路径，所以操作起来更麻烦
    // 选择一方法
    let { textValue, textTitle, _id } = Body;
    if (!textValue) {
      throw new HttpException('请输入文章内容', 401);
    }
    if (!textTitle) {
      throw new HttpException('请输入文章标题', 401);
    }
    await this.deletePost({ _id });
    await this.addPost(Body);
    return {
      msg: '更新成功',
    };
  }
  // 删除文章
  async deletePost(Body: DeletePostDto): Promise<any> {
    const { _id } = Body;
    const sqlCatelogData = await this.postModel
      .find({
        _id,
      })
      .select({
        url: 1,
      });
    if (sqlCatelogData && sqlCatelogData.length > 0) {
      const fileName = sqlCatelogData[0].url;
      try {
        // 删除本地对应文件
        if (fs.existsSync(fileName)) {
          // 千万注意每次创建文件流之后要关闭它 避免无法删除文件的情况产生
          const tempFile = fs.openSync(fileName, 'r');
          fs.closeSync(tempFile);
          fs.unlinkSync(fileName);
          // 并删除sql中的
          await this.postModel.deleteOne({ _id });
        } else {
          console.log('inexistence path：', fileName);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      throw new HttpException('数据库没有此文章', 401);
    }
    return {
      msg: '删除成功',
    };
  }
  // 导入文章并解析
  async importPost(
    Body: ImportPostDto,
    UploadedFiles: Array<Express.Multer.File>,
  ): Promise<any> {
    // 思路是导入有两种选择 一种是带format的,一种是不带的
    // 带format的直接解析,根据目录路径导入到具体的地址
    // 不带format的需要先设置好参数,然后生成format并根据参数导入到具体地址
  }
  // 导出文章并解析
  async outputPost(query: OutputPostDto): Promise<any> {
    const { _id } = query;
    const postData = await this.postModel
      .find({
        _id,
      })
      .select({ url: 1,title:1 });
    if(!postData||postData.length===0){
      throw new BadRequestException('无此文章');
    }
    const {url,title} = postData[0]
    return {
      filePath:url,
      fileName:title
    };
  }
}
