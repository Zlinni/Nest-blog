// import { Document } from 'mongoose';
import { IsOptional, IsPositive } from 'class-validator';
export class GetPostDto {
  readonly postName:string;
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
  readonly abbrlink: string;
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
