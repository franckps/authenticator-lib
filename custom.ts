import { UserModel } from "./src/models/userModel";

declare global {
  export namespace Express {
    export interface Request {
      user?: UserModel;
    }
  }
}
