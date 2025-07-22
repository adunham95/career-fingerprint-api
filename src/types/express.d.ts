import { UserEntity } from '../users/entities/user.entity'; // adjust path as needed

interface UserModule extends UserEntity {
  planLevel: number;
}

declare module 'express' {
  export interface Request {
    user?: UserModule;
  }
}
