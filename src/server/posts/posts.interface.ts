import { ObjectId } from 'mongoose';
import { PostDocument } from 'src/db/schema/post';
export type Post = Pick<
  PostDocument,
  | '_id'
  | 'title'
  | 'abbrlink'
  | 'categories'
  | 'cover'
  | 'date'
  | 'tags'
  | 'top'
  | 'updateTime'
  | 'wordCount'
  | 'url'
  | 'toc'
>;
export type postNoUrlAndToc = Omit<Post, 'url' | 'toc'>;
export interface GetList {
  data: postNoUrlAndToc[];
  totalPage: number;
  count: number;
}
export interface ReadPost {
  data: Omit<Post, 'url'>;
  postMd: string;
}
export interface GetLastestPost {
  data: Pick<Post, '_id' | 'title' | 'cover' | 'abbrlink' | 'updateTime'>[];
}
export interface GetTagList {
  data: postNoUrlAndToc[];
  count: number;
  totalPage: number;
}

export interface PostType {
  title: string;
  cover: string;
  abbrlink: number;
  date: string;
  wordCount: number;
  tags:Array<any>;
  categories: Array<any>;
  top: number;
  intro: string;
  url: string;
  updateTime: string;
  toc: any;
}

export interface Tree{
  id: number,
  root: string,
  children?: Tree[],
}
