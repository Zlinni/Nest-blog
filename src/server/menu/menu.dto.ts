export class findMenuDto {
  readonly userId: string;
}
export class createMenuDto {
  readonly userId: string;
  readonly menuName: string;
  readonly menuUrl: string;
  readonly source: string;
  readonly icon: string;
  readonly title: string;
}
export class editMenuDto {
  readonly _id: string;
  readonly userId: string;
  readonly menuName: string;
  readonly menuUrl: string;
  readonly source: string;
  readonly icon: string;
  readonly title: string;
}
export class deleteMenuDto {
  readonly userId: string;
  readonly _id: string;
}
