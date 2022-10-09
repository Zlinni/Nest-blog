// import { Document } from 'mongoose';
import { IsOptional, IsPositive } from 'class-validator';
import { ObjectId } from 'mongoose';
export class GetPostDto {
  readonly postName: string;
  readonly tagName: string;
  readonly categoryName: string;
  @IsOptional()
  @IsPositive()
  page: number;
  @IsOptional()
  @IsPositive()
  pageSize: number;
}

export class ReadPostDto {
  readonly _id: ObjectId;
}

export class GetTagListDto {
  readonly tagName: string;
  @IsOptional()
  @IsPositive()
  page: number;
  @IsOptional()
  @IsPositive()
  pageSize: number;
}

export class GetCategoriesListDto {
  readonly categoryName: string;
  @IsOptional()
  @IsPositive()
  page: number;
  @IsOptional()
  @IsPositive()
  pageSize: number;
}

export class AddPostDto {
  readonly textValue: string;
  readonly textTitle: string;
  readonly categories: string;

}

export class ModifyPostDto{
  readonly _id:string;
  readonly textValue: string;
  readonly textTitle: string;
  readonly categories: string;
}

export class DeletePostDto{
  readonly _id:string;
}

export class ImportPostDto{

}

export class OutputPostDto{
  readonly _id:string;
}