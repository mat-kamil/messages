/**
 * Copyright Mat (matkamil.com)
 * All rights reserved.
 *
 * Created: 30/11/2019
 */
import {db, MessageModel, UserModel, UserRoleModel} from './models';

export class Seeder {
    constructor() {
    }
    
    async seed() {
        if (!await UserRoleModel.exists({})) {
            await UserRoleModel.create([
                {"_id": "5ddd9e2c923bc30914e9c4dc", "name": "moderator", "access": []},
                {"_id": "5ddda04fa9f267091491383e", "name": "user", "access": []},
                {"_id": "5ddda269a9f267091491383f", "name": "admin", "access": []}
            ]);
        }
        if (!await UserModel.exists({})) {
            await UserModel.create([
                {
                    "_id": "5de3ddd3405c2f0524815cff",
                    "nick": "RuthOut",
                    "email": "user1@muz.com",
                    "img": "/assets/user-1.png",
                    "name": "Ruth Outhere",
                    "bio": "The truth is out there",
                    "pass": "$2a$08$nx4POTPAhYDwX/JXII0YAeK1oaBG8WyRmlqn/pmItab3XvtE2oI76",
                    "points": "15",
                    "roles": ["5ddda04fa9f267091491383e"],
                    "created": "2019-12-01T15:51:29.472Z"
                },
                {
                    "_id": "5de3e2907a95a20524c6e772",
                    "nick": "greatul",
                    "email": "user2@muz.com",
                    "img": "/assets/user-2.png",
                    "name": "Greer Tully",
                    "bio": "A career in telling the truth",
                    "pass": "$2a$08$nx4POTPAhYDwX/JXII0YAeK1oaBG8WyRmlqn/pmItab3XvtE2oI76",
                    "points": "13485",
                    "roles": ["5ddda04fa9f267091491383e"],
                    "badges": ["edit-message", "edit-comment", "flag"],
                    "created": "2019-12-01T15:51:29.472Z"
                },
                {
                    "_id": "5de3e3097a95a20524c6e773",
                    "nick": "MuzAdmin",
                    "email": "admin@muz.com",
                    "img": "/assets/user-3.png",
                    "name": "Muz Admin",
                    "bio": "My auth is your auth",
                    "pass": "$2a$08$nx4POTPAhYDwX/JXII0YAeK1oaBG8WyRmlqn/pmItab3XvtE2oI76",
                    "points": "0",
                    "roles": ["5ddda269a9f267091491383f", "5ddda04fa9f267091491383e", "5ddd9e2c923bc30914e9c4dc"],
                    "created": "2019-12-01T15:51:29.472Z"
                }
            ]);
        }
        
        if (!await MessageModel.exists({})) {
            await MessageModel.create([
                {
                    "_id": "5deec8eec13791001f5ad86b",
                    "views": 5,
                    "comments": 0,
                    "votes": 0,
                    "tags": ["salah", "al-sunnah-wal-jamaah", "salah-times"],
                    "modified": null,
                    "status": "active",
                    "title": "Message One",
                    "content": "Content One",
                    "created": "2019-12-01T15:51:29.472Z",
                    "createdBy": "5de3ddd3405c2f0524815cff"
                },
                {
                    "_id": "5deec8eec13791001f5ad86c",
                    "views": 0,
                    "comments": 0,
                    "votes": 0,
                    "tags": ["salah", "al-sunnah-wal-jamaah", "salah-times"],
                    "modified": null,
                    "status": "active",
                    "title": "Message Two",
                    "content": "Content Two",
                    "created": "2019-12-01T15:51:29.472Z",
                    "createdBy": "5de3ddd3405c2f0524815cff"
                },
                {
                    "_id": "5deec8eec13791001f5ad86d",
                    "views": 20,
                    "comments": 0,
                    "votes": 0,
                    "tags": ["salah", "al-sunnah-wal-jamaah", "salah-times"],
                    "modified": null,
                    "status": "active",
                    "title": "Message Three",
                    "content": "Content Three",
                    "created": "2019-12-01T15:51:29.472Z",
                    "createdBy": "5de3ddd3405c2f0524815cff"
                },
                {
                    "_id": "5deec8eec13791001f5ad86e",
                    "views": 5,
                    "comments": 0,
                    "votes": 0,
                    "tags": ["salah", "al-sunnah-wal-jamaah", "salah-times"],
                    "modified": null,
                    "status": "active",
                    "title": "Message Four",
                    "content": "Content Four",
                    "created": "2019-12-01T15:51:29.472Z",
                    "createdBy": "5de3ddd3405c2f0524815cff"
                },
                {
                    "_id": "5deec8eec13791001f5ad86f",
                    "views": 3,
                    "comments": 0,
                    "votes": 0,
                    "tags": ["salah", "al-sunnah-wal-jamaah", "salah-times"],
                    "status": "active",
                    "title": "Message Five",
                    "content": "Content Five",
                    "created": "2019-12-01T15:51:29.472Z",
                    "modified": "2019-12-01T16:51:29.472Z",
                    "createdBy": "5de3ddd3405c2f0524815cff",
                    "modifiedBy": "5de3ddd3405c2f0524815cff"
                }
            ]);
        }
        
        return true;
    }
}

module.exports = Seeder;
