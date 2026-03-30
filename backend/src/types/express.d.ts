import type { IUser } from "./index.ts";

declare global{
    namespace Express {
        interface User extends IUser{}
        interface Request{
            user?:IUser;
        }
    }
}