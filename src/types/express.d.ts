import { UserEntity } from '../users/entities/user.entity'; // adjust path as needed

interface UserModule extends UserEntity {
  planLevel: number;
  mode: 'user' | 'org';
  permissionList: string[];
}

declare module 'express' {
  export interface Request {
    user?: UserModule;
  }
}
