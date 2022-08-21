export class GetCategoriesDto {
  readonly searchText?: string;
  readonly page?: number;
  readonly pageSize?: number;
}
export class AddCategoriesDto {
  readonly name: string;
  readonly color: string;
}
export class ModifyCategoriesDto {
  readonly _id: string;
  readonly color: string;
}
export class DeleteCategoriesDto {
  readonly _id: string;
}
