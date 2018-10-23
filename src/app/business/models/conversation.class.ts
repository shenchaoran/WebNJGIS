import * as ObjectID from 'objectid';
import { User } from './user.class';
import { UserService } from '../services/user.service';
import { ConversationService } from '../services/conversation.service';

export class Conversation {
    _id?: any;
    pid: string;
    // 点赞
    like_uids: string[];
    // 收藏
    love_uids: string[];
    tags: (string | 'TOP' | 'HOT')[];
    comments: (string | Comment)[];
    participants: string[];
    
    constructor(user: User, pid: string) {
        this._id = ObjectID().toString();
        this.pid = pid;
        this.like_uids = [];
        this.love_uids = [];
        this.tags = [];
        this.participants = [];
        this.comments = [];

        // if(user) {
        //     this.participants.push(user._id);
        //     this.comments.push(new Comment(user, this._id, CommentType.MAIN));
        // }
    }
}

export class Comment {
    _id?: any;
    // 编辑的历史
    content: {
        time: number,
        value: string,
        state: CommentState
    }[];
    // 版本号
    svid: number;
    from_uid: string;
    anonymous: boolean;
    // 可以为空，表示不是回复评论
    to_uid?: string;
    // @ 的用户
    notified_uids?: string[];
    cid: string;
    type: CommentType;
    hideReason?: string;
    // emoji react
    reactions?: {
        name: string,
        count: number
    }[];

    constructor(user: User, cid: string, type: CommentType, to_uid?: string, state: CommentState = CommentState.WRITE) {
        this._id = ObjectID().toString();
        this.content = [{
            time: new Date().getTime(),
            value: '',
            state: state
        }];
        this.svid = 0;
        this.reactions = [];
        this.to_uid = to_uid;
        if(user) {
            this.from_uid = user._id;
            this.anonymous = false;
            this.cid = cid;
            this.type = type;
        }
    }
}

export enum CommentType {
    MAIN = 'MAIN',
    REPLY = 'REPLY',
    HIDE = 'HIDE'
};

export enum CommentState {
    WRITE = 'WRITE',
    READ = 'READ'
}