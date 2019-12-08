/**
 * Copyright Mat (matkamil.com)
 * All rights reserved.
 *
 * Created: 30/11/2019
 */
import {db, UserModel, UserRoleModel} from './models';

export class Seeder {
    constructor() { }
    async seed(){
        if(!await UserRoleModel.exists({})){
            await UserRoleModel.create([
                {"_id":"5ddd9e2c923bc30914e9c4dc","name":"moderator","access":[]},
                {"_id":"5ddda04fa9f267091491383e","name":"user","access":[]},
                {"_id":"5ddda269a9f267091491383f","name":"admin","access":[]}
            ]);
        }
        if(!await UserModel.exists({})){
            await UserModel.create([
                {
                    "_id":"5de3ddd3405c2f0524815cff",
                    "nick":"RuthOut",
                    "email":"user1@muz.com",
                    "name":"Ruth Outhere",
                    "bio":"The truth is out there",
                    "pass":"$2a$08$nx4POTPAhYDwX/JXII0YAeK1oaBG8WyRmlqn/pmItab3XvtE2oI76",
                    "points":"0",
                    "roles":["5ddda04fa9f267091491383e"],
                    "created":"2019-12-01T15:51:29.472Z"
                },
                {
                    "_id":"5de3e2907a95a20524c6e772",
                    "nick":"great",
                    "email":"user2@muz.com",
                    "name":"Greer Tully",
                    "bio":"A career in telling the truth",
                    "pass":"$2a$08$nx4POTPAhYDwX/JXII0YAeK1oaBG8WyRmlqn/pmItab3XvtE2oI76",
                    "points":"13485",
                    "roles":["5ddda04fa9f267091491383e"],
                    "badges":["edit-message","edit-comment","flag"],
                    "created":"2019-12-01T15:51:29.472Z"
                },
                {
                    "_id":"5de3e3097a95a20524c6e773",
                    "nick":"MuzAdmin",
                    "email":"admin@muz.com",
                    "name":"Muz Admin",
                    "bio":"My auth is your auth",
                    "pass":"$2a$08$nx4POTPAhYDwX/JXII0YAeK1oaBG8WyRmlqn/pmItab3XvtE2oI76",
                    "points":"0",
                    "roles":["5ddda269a9f267091491383f","5ddda04fa9f267091491383e","5ddd9e2c923bc30914e9c4dc"],
                    "created":"2019-12-01T15:51:29.472Z"
                }
            ]);
        }

        return true;
    }
}
module.exports = Seeder;
