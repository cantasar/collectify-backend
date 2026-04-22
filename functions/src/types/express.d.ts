export interface AuthenticatedUser {
  uid: string;
  email: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}
