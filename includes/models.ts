/**
 * Copyright Mat (matkamil.com)
 * All rights reserved.
 *
 * Created: 30/11/2019
 */
import {Schema, Document} from "mongoose";
import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";

export const db = mongoose.createConnection('mongodb://db:27017/muzmatch', {useNewUrlParser: true,useUnifiedTopology: true});

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
    editMessage = "edit-messages",
    editComment = "edit-comments",
    flagMessage = "flag-messages",
    flagComment = "flag-comments",
    addPoints = "add-points",
}

export interface LoginData {
    email: string,
    password: string,
}

export const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const isoDateRegex = /^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))T(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])\.[0-9]{3}Z$/;
export const imageRegex = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i;



const UserRoleSchema: Schema = new Schema({
    name: { type: String, required: true },
    access: { type: [String], enum: Object.values(AccessType) },
});

export interface UserRole extends Document {
    name: string,
    access: string[],
}
export const UserRoleModel = db.model<UserRole>('UserRole', UserRoleSchema, 'roles');


export interface User extends Document {
    nick: string,
    email: string,
    name: string,
    img: string,
    bio: string,
    pass: string,
    points?: number,
    roles?: UserRole[],
    access?: string[],
    created?: string,
}

export interface FrontendUser {
    id: string,
    name: string,
    nick: string,
    email: string,
    access: string[],
    img: string,
    points: number,
}

export let UserSchema: Schema = new Schema({
    nick: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, match: emailRegex },
    name: { type: String, required: true },
    img: { type: String, match: imageRegex, required: true },
    bio: { type: String, required: true },
    pass: { type: String, required: true },
    points: { type: Number },
    roles: { type: [Schema.Types.ObjectId], ref:'UserRole', required: true },
    access: { type: [String] },
    created: { type: String, match: isoDateRegex, default: (new Date()).toISOString() },
});
UserSchema.statics.login = async function(login: LoginData) {
    if(login.email && login.email.match(emailRegex)) {
        let user = await this.findOne({email:login.email});
        if(user && bcrypt.compareSync(login.password, user.pass)){
            return user;
        }
    }
    return false;
};
//TODO: access
UserSchema.statics.getAccess = async function(user) {
    console.log(user.roles);
    if(user.roles){
        UserRoleModel.$where(() => this._id)
    }
    return [];
};
export const UserModel = db.model<User>('User', UserSchema, 'users');


export interface Message extends Document {
    title: string,
    content: string,
    views: number,
    comments: number,
    votes: number,
    tags: string[],
    created?: string,
    createdBy?: string,
    modified?: string,
    modifiedBy?: string,
    status?: Status,
}

const MessageSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    tags: { type: [String], default: 0 },
    created: { type: String, match: isoDateRegex, default: (new Date()).toISOString() },
    createdBy: { type: Schema.Types.ObjectId, ref:'User', required: true },
    modified: { type: String, match: isoDateRegex, default: null },
    modifiedBy: { type: Schema.Types.ObjectId, ref:'User' },
    status: { type: String, enum: Object.values(Status), default: Status.active },
});
MessageSchema.statics.all = async function() {
    return await this.find();
};
export const MessageModel = db.model<Message>('Message', MessageSchema, 'messages');



export interface Comment extends Document {
    content: string,
    lft: number,
    rgt: number,
    message: string,
    root?: string,
    parent?: string,
    created?: string,
    createdBy?: string,
    modified?: string,
    modifiedBy?: string,
    children?: string,
    status?: string,
}

const CommentSchema: Schema = new Schema({
    content: { type: String, required: true },
    lft: { type: Number },
    rgt: { type: Number },
    message: { type: Schema.Types.ObjectId, ref:'Message', required: true },
    root: { type: Schema.Types.ObjectId, ref:'Comment'},
    parent: { type: Schema.Types.ObjectId, ref:'Comment' },
    created: { type: String, match: isoDateRegex, default: (new Date()).toISOString() },
    createdBy: { type: Schema.Types.ObjectId, ref:'User', required: true },
    modified: { type: String, match: isoDateRegex },
    modifiedBy: { type: Schema.Types.ObjectId, ref:'User' },
    status: { type: String, enum: Object.values(Status), default: Status.active },
});
CommentSchema.statics.shiftNode = async function(min, delta, root) {
    //assign right
    this.find({ root:root }).filter(e=>{ e.lft >= min }).each(e => e.lft += delta).save();
    this.find({ root:root }).filter(e=>{ e.rgt >= min }).each(e => e.rgt += delta).save();
};
CommentSchema.statics.getByMessage = async function(id: string) {
    if(id) {
        return await this.find({ message:id });
    }
    return false;
};
export const CommentModel = db.model<Comment>('Comment', CommentSchema, 'comments');


/** NOT USED **/
export interface Reaction extends Document {
    type: ReactionType,
    score?: number,
    attachedTo: string,
    created?: string,
    createdBy?: string,
}
const ReactionSchema: Schema = new Schema({
    type: { type: String, required: true, enum: Object.values(ReactionType) },
    score: { type: Number },
    attachedTo: { type: Schema.Types.ObjectId, required: true },
    created: { type: String, match: isoDateRegex, default: (new Date()).toISOString() },
    createdBy: { type: Schema.Types.ObjectId, ref:'User', required: true }
});
export const ReactionModel = db.model<Reaction>('Reaction', ReactionSchema, 'reactions');


/** NOT USED **/
export interface Tag extends Document {
    name: string,
}
const TagSchema: Schema = new Schema({
    name: { type: String, required: true },
});
export const Tag = db.model<Tag>('Tag', TagSchema, 'tags');


/** NOT USED **/
export interface TagAttach extends Document {
    tag: string,
    attachedTo: string,
}
const TagAttachSchema: Schema = new Schema({
    tag: { type: Schema.Types.ObjectId, required: true },
    attachedTo: { type: Schema.Types.ObjectId, required: true },
});
export const TagAttach = db.model<TagAttach>('TagAttach', TagAttachSchema, 'tagsAttach');
