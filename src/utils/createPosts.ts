// // import {Moment} from 'moment'
// // var mongoose = require("mongoose");
// // const { connectMongoDB, disconnectMongoDB } = require("../db/connect");
// import dayjs from "dayjs";
// import { InjectModel } from '@nestjs/mongoose';
// import mongoose, { Model } from "mongoose";
// import { TagDocument } from "src/db/schema/tag";
// import { Injectable } from "@nestjs/common";
// @Injectable()
// export class TagService {
//   constructor(
//     @InjectModel('Tags') private readonly tagModel: Model<TagDocument>, // @InjectModel('Posts') private readonly postModel: Model<PostDocument>,
//   ) {}
// }
// // connectMongoDB();
// const { blogs, tags, categories } = require("../db/schema");
// // var moment:Moment = require("moment");
// const fs = require("fs");
// //改为环境变量
// let catalog = "C:/Users/Zlinni/Desktop/blog/source/_posts";
// const readline = require("readline");
// const glob = require("glob");
// const tagMap = new Map();
// const categoryMap = new Map();

// const globRead = ()=> {
//   deleteAll();
//   glob(catalog + "/**/*.md", (err, ctx) => {
//     for (let i = 0; i < ctx.length; i++) {
//       (function (file) {
//         readLineAsync(file, [], 0);
//       })(ctx[i]);
//     }
//   });
// }
// const readLineAsync = (file, tree, treeCount)=> {
//   try {
//     let rl = readline.createInterface({
//       input: fs.createReadStream(file),
//     });
//     let wordCount = 0;
//     let count = 0;
//     const type = {
//       title: "",
//       cover: "",
//       abbrlink: null,
//       date: "",
//       wordCount: null,
//       tags: [],
//       categories: [],
//       top: null,
//       intro: "",
//     };
//     let intro = "";
//     let introCount = 0;
//     const tagOrCateStack = [];
//     let time = "";
//     (function (file) {
//       fs.stat(file, (err, files) => {
//         time = dayjs(files.mtime).format("YYYY-MM-DD hh:mm:ss");
//       });
//     })(file);

//     rl.on("line", (line) => {
//       if (line === "---") {
//         count++;
//       }
//       if (count === 1) {
//         if (line.trim().startsWith("-") && tagOrCateStack.length > 0) {
//           type[tagOrCateStack[tagOrCateStack.length - 1]].push(
//             line.split("-")[1].trim()
//           );
//         } else {
//           for (const key in type) {
//             // type
//             if (line.startsWith(key)) {
//               if (key === "tags" || key === "categories") {
//                 tagOrCateStack.push(key);
//               } else {
//                 type[key] = line.slice(key.length + 1).trim();
//               }
//             }
//           }
//         }
//       }
//       if (count === 2) {
//         wordCount += line.length;
//         let reg = /\p{Unified_Ideograph}/u;

//         if (introCount < 100) {
//           if (reg.test(line)) {
//             introCount += line.length;
//             intro += line;
//           }
//         }
//         // 处理层级关系 同级 不同级
//         if (line.startsWith("#")) {
//           let mark = line.split(" ")[0];
//           if (
//             mark === "#" ||
//             mark === "##" ||
//             mark === "###" ||
//             mark === "####" ||
//             mark === "#####"
//           ) {
//             let type = mark.length;
//             let data = line.slice(type).trim();
//             treeInsert(data, type, tree, treeCount++);
//           }
//         }
//       }
//     });
//     rl.on("close", () => {
//       type.wordCount = wordCount;
//       type.url = file;
//       type.abbrlink = +type.abbrlink;
//       type.updateTime = time;
//       type.toc = JSON.stringify(tree);
//       // 去掉开头的# 前言
//       intro = intro.slice(2);
//       type.intro = intro;
//       if (tree === undefined || tree === []) {
//         console.log("注意最高级标题以#开头", file);
//       }
//       saveAll(type);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }
// let tagIdMap = new Map();
// let categoryIdMap = new Map();
// function saveAll(obj) {
//   let tagIdArr = [];
//   let categoryIdArr = [];
//   for (const item of obj.tags) {
//     if (!tagMap.has(item)) {
//       tagMap.set(item, 1);
//     } else {
//       tagMap.set(item, tagMap.get(item) + 1);
//     }
//     let _id = null;
//     if (!tagIdMap.has(item)) {
//       _id = new mongoose.Types.ObjectId();
//       tagIdMap.set(item, _id);
//     } else {
//       _id = tagIdMap.get(item);
//     }
//     tagIdArr.push(_id);
//     let datas = {
//       _id,
//       name: item,
//       color: "#3f51b5",
//       count: tagMap.get(item),
//       createTime: dayjs(new Date()).format("YYYY-MM-DD hh:mm:ss"),
//     };
//     tags
//       .findOneAndUpdate({ name: item }, { $set: datas }, { upsert: true })
//       .exec((err, data) => {
//         if (err) console.log(err);
//       });
//   }
//   for (const item of obj.categories) {
//     if (!categoryMap.has(item)) {
//       categoryMap.set(item, 1);
//     } else {
//       categoryMap.set(item, categoryMap.get(item) + 1);
//     }
//     let _id = null;
//     if (!categoryIdMap.has(item)) {
//       _id = new mongoose.Types.ObjectId();
//       categoryIdMap.set(item, _id);
//     } else {
//       _id = categoryIdMap.get(item);
//     }
//     categoryIdArr.push(_id);
//     let datas = {
//       _id,
//       name: item,
//       color: "#3f51b5",
//       count: categoryMap.get(item),
//       createTime: dayjs(new Date()).format("YYYY-MM-DD hh:mm:ss"),
//     };
//     categories
//       .findOneAndUpdate({ name: item }, { $set: datas }, { upsert: true })
//       .exec((err, data) => {
//         if (err) console.log(err);
//       });
//   }
//   let datas = {
//     ...obj,
//     tags: [...tagIdArr],
//     categories: [...categoryIdArr],
//   };
//   blogs
//     .findOneAndUpdate(
//       { title: obj.title },
//       {
//         $set: datas,
//       },
//       {
//         upsert: true,
//       }
//     )
//     .exec((err, data) => {
//       if (err) console.log(err);
//     });
// }
// // function modifyAll(obj){
// //   let [tag1,tag2] = [...obj.tag];
// // }
// function deleteAll() {
//   blogs.deleteMany({}, (err) => {
//     if (err) {
//       console.log(err);
//     }
//   });
//   tags.deleteMany({}, (err) => {
//     if (err) {
//       console.log(err);
//     }
//   });
//   categories.deleteMany({}, (err) => {
//     if (err) {
//       console.log(err);
//     }
//   });
// }
// function treeInsert(data, type, tree, treeCount) {
//   let stack = tree?.[tree?.length - 1] || [];
//   let h2Stack = tree?.[tree?.length - 1]?.children || [];
//   let h3Stack = h2Stack?.[h2Stack?.length - 1]?.children || [];
//   let h4Stack = h3Stack?.[h3Stack?.length - 1]?.children || [];

//   try {
//     if (type === 1) {
//       tree.push({
//         id: treeCount,
//         root: data,
//         children: [],
//       });
//     } else if (type === 2) {
//       stack.children.push({
//         id: treeCount,
//         root: data,
//         children: [],
//       });
//     } else if (type === 3) {
//       let stacks = h2Stack[h2Stack.length - 1];
//       stacks.children.push({
//         id: treeCount,
//         root: data,
//         children: [],
//       });
//     } else if (type === 4) {
//       let stacks = h3Stack[h3Stack.length - 1];
//       stacks.children.push({
//         id: treeCount,
//         root: data,
//         children: [],
//       });
//     } else if (type === 5) {
//       let stacks = h4Stack[h4Stack.length - 1];
//       stacks.children.push({
//         id: treeCount,
//         root: data,
//         children: [],
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     console.log(tree);
//   }
// }
// globRead();
// // module.exports = {
// //   globRead
// // }
