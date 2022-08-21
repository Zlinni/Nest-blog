// user.dto.ts
export class UserDTO {
  readonly userName: string;
  readonly password: string;
}

export class EditUserDTO {
  readonly _id: string;
  readonly userName: string;
  readonly password: string;
  readonly auth: 'read' | 'write';
  readonly menu: string[];
  readonly status: string;
  readonly role: 'guest' | 'admin';
  readonly avater: string;
}

export class DeleteUserDto {
  readonly _id: string;
}
