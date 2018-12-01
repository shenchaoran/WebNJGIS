import { User } from './user.class';
/**
 * 比较方案只是比较对象的集合
 */
import { UserService } from '@services/user.service';
import { ResourceSrc } from '@models/resource.enum';
import * as ObjectID from 'objectid';
import { UDXSchema } from '@models/UDX-schema.class';

export class Solution {
    _id?: any;
    meta: {
        name: string,
        desc?: string,
        wikiMD?: string,
        wikiHTML?: string,
        time: number
    };
    auth: {
        userId: string,
        userName: string,
        src: ResourceSrc
    };
    topicIds?: string[];
    msIds?: string[];
    cmpObjs: CmpObj[];
    cid: string;
    subscribed_uids: string[];
    [key: string]: any;

    constructor(user: User) {
        this._id = ObjectID().toString();
        this.meta = {
            name: '',
            desc: '',
            time: new Date().getTime()
        };
        this.cmpObjs = [];
        this.subscribed_uids = [];
        this.msIds = [];
        if(user) {
            this.auth = {
                userId: user._id,
                userName: user.username,
                src: ResourceSrc.PUBLIC
            };
        }
        else {
            this.auth = {
                userId: null,
                userName: null,
                src: null
            };
        }
    }
}

export class CmpObj {
    id: string;
    name: string;
    desc: string;
    // 此处的数据参考是比较对象的数据参考，可能是输入，但绝大多数都是输出
    // TODO 对于日期的处理，暂时理解为时间区域内只有一个输出
    dataRefers: Array<DataRefer>;
    schemaId?: string;
    methods: {
        id: string,
        name: string,
        // 保存结果文件路径
        result: string
    }[];
    // 先放这里，其实应该放在最外层，所有的 cmpObj 共用同一套 sub-regions
    regions?: [][]
    progress?: number;

    constructor() {
        this.id = ObjectID().toString();
        this.methods = [];
        this.dataRefers = [];
        this.progress = 0;
    }
}

export class DataRefer {
    msId: string;
    msName: string;
    eventType: 'inputs' | 'outputs';
    eventId: string;
    eventName: string;
    schemaId: string;
    msrName?: string;
    msrId?: string;
    value?: string;
    field?: string;
}