import { User } from './user.class';
/**
 * 计算任务
 * 这个表算是一个中间产物，其实存在cmp-task的calcuTasks中也行，但是多表查询很麻烦
 */

import { ResourceSrc } from './resource.enum';
import * as ObjectID from 'objectid';
import { cloneDeep, map } from 'lodash';


export class CalcuTask {
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
    ms: any;
    topic: string;
    cmpTaskId: string;
    node: any;
    IO: {
        dataSrc: 'STD' | 'UPLOAD',
        schemas: any[],
        data: any[],
        std: any[]
    };
    std: any;
    state: CalcuTaskState;
    progress: number;
    subscribed_uids: string[];
    // [key: string]: any;

    constructor(user: User, ms?) {
        if (ms) {
            this.ms = ms;
            this.topic = ms.topic;
            this.IO = cloneDeep(ms.MDL.IO);
            this.IO.dataSrc = 'STD';
            let appendSchema = (type, schema) => {
                map(this.IO[type] as any[], event => {
                    if (event.schemaId === schema.id) {
                        event.schema = schema;
                    }
                });
            }
            map(this.IO.schemas as any[], schema => {
                appendSchema('inputs', schema);
                appendSchema('std', schema);
                appendSchema('parameters', schema);
                appendSchema('outputs', schema);
            });
        }
        
        this._id = ObjectID().toString();
        this.meta = {
            name: undefined,
            desc: undefined,
            time: new Date().getTime()
        };
        this.subscribed_uids = [];
        this.state = CalcuTaskState.INIT;
        if(user) {
            this.auth = {
                userId: user._id,
                userName: user.username,
                src: ResourceSrc.PUBLIC
            };
        }
        else {
            this.auth = {
                userId: undefined,
                userName: undefined,
                src: undefined
            };
        }
    }
}

export enum CalcuTaskState {
    INIT = 'INIT',
    COULD_START = 'COULD_START',
    START_PENDING = 'START_PENDING',
    START_FAILED = 'START_FAILED',
    RUNNING = 'RUNNING',
    FINISHED_FAILED = 'FINISHED_FAILED',
    FINISHED_SUCCEED = 'FINISHED_SUCCEED'
};