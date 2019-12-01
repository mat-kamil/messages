/**
 * Copyright Mat (matkamil.com)
 * All rights reserved.
 *
 * Created: 30/11/2019
 */
import {emailRegex, loginData, User, UserModel} from "../models";
import * as bcrypt from 'bcryptjs';

export class UserController {
    user: User;
    constructor() { }

    messages(){}
    comments(){}

    hashPassword(pass: string) {
        pass = bcrypt.hashSync(pass, this.user.email);
    }
}
