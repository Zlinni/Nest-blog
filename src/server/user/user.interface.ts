import { ObjectId } from 'mongoose';
import { UserDocument } from 'src/db/schema/user';
export type User = Pick<
  UserDocument,
  | 'userName'
  | 'password'
  | 'auth'
  | 'menu'
  | 'status'
  | 'role'
  | 'avater'
  | 'salt'
>;

export interface infoToken {
  info: string;
}

type UserInfoPick = Pick<
  User,
  'auth' | 'menu' | 'role' | 'avater' | 'status' | 'userName'
>;

export interface UserInfo extends UserInfoPick {
  _id: string;
}

export interface info {
  info: string;
  userData: UserInfo;
}
export type UserPayload = Pick<User, 'userName'>;
