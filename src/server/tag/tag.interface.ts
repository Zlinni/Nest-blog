import { TagDocument } from "src/db/schema/tag";
export type Tag = Pick<
TagDocument,
| "name"
| "color"
| "count"
| "createTime"
>

export interface GetTags {
    data:Tag[],
    totalPage:number
}
