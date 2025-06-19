import { UserEntity } from '../users/entities/user.entity'; // adjust path as needed

declare module 'express' {
  export interface Request {
    user?: UserEntity;
  }
}
