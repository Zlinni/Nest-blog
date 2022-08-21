// user.service.ts
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { encryptPassword, makeSalt } from 'src/utils/cryptogram';
import { UserDTO, DeleteUserDto, EditUserDTO } from './user.dto';
import { info, infoToken, User, UserInfo, UserPayload } from './user.interface';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel('Users') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 查找所有用户
  async findAll(): Promise<User[]> {
    const users = await this.userModel.find();
    return users;
  }

  // 查找单个用户
  async findOne(_id: string): Promise<User> {
    return await this.userModel.findById(_id);
  }

  // 添加单个用户
  async register(body: UserDTO): Promise<void | infoToken> {
    console.log(body);
    // 校验
    let { userName, password } = body;
    // 名字 长度2-6
    const regObj = {
      userName: /^[\u4e00-\u9fa5a-zA-Z0-9]{6,10}$/,
      password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$/,
    };
    let flag = [false, false];
    if (regObj.userName.test(userName)) {
      let isUserNameExist = await this.userModel.findOne({ userName });
      if (isUserNameExist) {
        throw new HttpException('用户名已存在',200);
      } else {
        flag[0] = true;
      }
    } else {
      throw new HttpException('用户名不合法',200);
    }
    if (regObj.password.test(password)) {
      flag[1] = true;
    } else {
      throw new HttpException('密码不合法',200);
    }
    if (flag[0] && flag[1]) {
      const salt = makeSalt();
      const hashPassword = encryptPassword(password, salt);
      let initUser = {
        password: hashPassword,
        auth: 'read',
        menu: ['/normal'],
        status: 1,
        role: 'guest',
        avater: './img/normal.jpg',
        salt,
      };
      await this.userModel.create(
        Object.assign({ userName, password }, initUser),
      );
      return await this.login({ userName, password });
    }
  }

  // 编辑单个用户
  async editUser(body: EditUserDTO): Promise<void> {
    const { _id, userName, password, auth, menu, status, role, avater } = body;
    await this.userModel.findByIdAndUpdate(_id, {
      userName,
      password,
      auth,
      menu,
      status,
      role,
      avater,
    });
  }

  // 删除单个用户
  async deleteUser(body: DeleteUserDto): Promise<void> {
    const { _id } = body;
    await this.userModel.findByIdAndDelete(_id);
  }

  async checkLoginForm(body: UserDTO): Promise<UserInfo> {
    const { userName, password } = body;
    console.log(userName, password)
    let userData = await this.userModel.findOne({ userName });
    if (!userData) {
      throw new HttpException('不存在该用户',200);
    }
    const { password: dbPassword, salt } = userData;
    const currentHashPassword = encryptPassword(password, salt);
    if (currentHashPassword !== dbPassword) {
      throw new HttpException('密码错误',200);
    }
    const { auth, menu, status, role, avater } = userData;
    return {
      _id:userData._id as unknown as string,
      userName,
      auth,
      menu,
      status,
      role,
      avater,
    };
  }

  // 生成 token
  async certificate(userData: UserPayload): Promise<string> {
    const payload = {
      userName: userData.userName,
    };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async login(body: UserDTO): Promise<info> {
    const userData = await this.checkLoginForm(body);
    const token = await this.certificate(userData);
    return {
      info: token,
      userData,
    };
  }
}
