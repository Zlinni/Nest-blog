import { CategoryDocument } from "src/db/schema/Category";
export type Category = Pick<
CategoryDocument,
| "name"
| "color"
| "count"
| "createTime"
>

export interface GetCategories {
    data:Category[],
    totalPage:number
}
