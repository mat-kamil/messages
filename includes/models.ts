/**
 * Copyright Mat (matkamil.com)
 * All rights reserved.
 *
 * Created: 30/11/2019
 */
import {Schema, Document} from "mongoose";
import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";

export const db = mongoose.createConnection('mongodb://localhost:27017');

export function handleErrors(req, res, err) {
    return res.jsonp({
        success: false,
        message: err,
        data: null
    })
}

export enum ReactionType {
    love = 'love',
    like = 'like',
    dislike = 'dislike',
    hate = 'hate',
}

export enum Status {
    blocked = 'blocked',
    active = 'active',
    deleted = 'deleted',
}

export enum AccessType {
    addMessage = "add-message",
    addComment = "add-comment",
    editMessage = "edit-message",
    editComment = "edit-comment",
    flagMessage = "flag-message",
    flagComment = "flag-comment",
    addPoints = "add-points",
}

export interface loginData {
    email: string,
    password: string,
}

export const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const isoDateRegex = /(((2000|2400|2800|((19|2[0-9])(0[48]|[2468][048]|[13579][26])))-02-29)|(((19|2[0-9])[0-9]{2})-02-(0[1-9]|1[0-9]|2[0-8]))|(((19|2[0-9])[0-9]{2})-(0[13578]|10|12)-(0[1-9]|[12][0-9]|3[01]))|(((19|2[0-9])[0-9]{2})-(0[469]|11)-(0[1-9]|[12][0-9]|30)))T([01][0-9]|[2][0-3]):[0-5][0-9]:[0-5][0-9]\.[0-9]{3}Z/;
export const imageRegex = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i;



export interface User extends Document {
    email: string,
    name: string,
    image: string,
    bio: string,
    pass: string,
    points?: number,
    roles: UserRole[],
    created?: string
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true, match: emailRegex },
    image: { type: String, required: true, match: imageRegex },
    bio: { type: String, required: true },
    pass: { type: String, required: true },
    points: { type: Number },
    roles: { type: [Schema.Types.ObjectId], required: true },
    created: { type: String, match: isoDateRegex, default: (new Date()).toISOString() },
});
UserSchema.statics.login = async function(login: loginData) {
    if(login.email && login.email.match(emailRegex)) {
        let user = await this.findOne({ email: login.email });
        if(bcrypt.compareSync(login.password, this.user.pass)){
            return user;
        }
    }
    throw new Error('Failed to login. Please try again');
};
export const UserModel = db.model<User>('User', UserSchema, 'users');


const UserRoleSchema: Schema = new Schema({
    name: { type: String, required: true },
    access: { type: [String], enum: AccessType },
});

export interface UserRole extends Document {
    name: string,
    access: string[],
}
export const UserRoleModel = db.model<UserRole>('UserRole', UserRoleSchema, 'roles');



export interface Message extends Document {
    title: string,
    content: string,
    created?: string,
    createdBy?: string,
    modified?: string,
    modifiedBy?: string,
    status?: string,
}

const MessageSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    views: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    created: { type: String, match: isoDateRegex, default: (new Date()).toISOString() },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    modified: { type: String, match: isoDateRegex },
    modifiedBy: { type: Schema.Types.ObjectId },
    status: { type: String, enum: Status, default: Status.active },
});
export const MessageModel = db.model<Message>('Message', MessageSchema, 'messages');



export interface Comment extends Document {
    content: string,
    lft: number,
    rgt: number,
    root?: string,
    parent?: string,
    created?: string,
    createdBy?: string,
    modified?: string,
    modifiedBy?: string,
    status: string,
}

const CommentSchema: Schema = new Schema({
    content: { type: String, required: true },
    lft: { type: Number, required: true },
    rgt: { type: Number, required: true },
    root: { type: Schema.Types.ObjectId },
    parent: { type: Schema.Types.ObjectId },
    created: { type: String, match: isoDateRegex, default: (new Date()).toISOString() },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    modified: { type: String, match: isoDateRegex },
    modifiedBy: { type: Schema.Types.ObjectId },
    status: { type: String, enum: Status, default: Status.active },
});
export const CommentModel = db.model<Comment>('Comment', CommentSchema, 'comments');



export interface Reaction extends Document {
    type: ReactionType,
    score?: number,
    attachedTo: string,
    created?: string,
    createdBy?: string,
}

const ReactionSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ReactionType },
    score: { type: Number },
    attachedTo: { type: Schema.Types.ObjectId, required: true },
    created: { type: String, match: isoDateRegex, default: (new Date()).toISOString() },
    createdBy: { type: Schema.Types.ObjectId, required: true }
});
export const ReactionModel = db.model<Reaction>('Reaction', ReactionSchema, 'reactions');



export interface Tag extends Document {
    name: string,
}

const TagSchema: Schema = new Schema({
    name: { type: String, required: true },
});
export const Tag = db.model<Tag>('Tag', TagSchema, 'tags');



export interface TagAttach extends Document {
    tag: string,
    attachedTo: string,
}

const TagAttachSchema: Schema = new Schema({
    tag: { type: Schema.Types.ObjectId, required: true },
    attachedTo: { type: Schema.Types.ObjectId, required: true },
});
export const TagAttach = db.model<TagAttach>('TagAttach', TagAttachSchema, 'tagsAttach');
