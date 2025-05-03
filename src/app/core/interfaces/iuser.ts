export interface IUser {
    userId: number;
    name: string;
    email: string;
    profilePhoto: string | null;
    isAdmin: boolean;
    createdAt: string;
    gender: string;
  }
  export interface IUserCreate {
    name: string;
    email: string;
    password: string;
    gender: string;
    phone: string;
    profilePhoto: string | null;
  }
  
  