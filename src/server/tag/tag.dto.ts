export class GetTagsDto {
  readonly searchText?: string;
  readonly page?: number;
  readonly pageSize?: number;
}
export class AddTagsDto {
  readonly name: string;
  readonly color: string;
}
export class ModifyTagsDto {
  readonly _id: string;
  readonly color: string;
}
export class DeleteTagsDto {
  readonly _id: string;
}

