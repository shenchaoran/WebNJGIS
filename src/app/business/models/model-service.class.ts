
import { ResourceSrc } from '@models/resource.enum';
import { UDXSchema } from '@models/UDX-schema.class';

export class MS {
    _id: string;
    auth: {
        nodeName: string,
        src: ResourceSrc
    };
    MDL: {
        meta: {
            name: string,
            keywords: string[],
            abstract: string,
            desc?: string,
            wikiMD?: string,
            wikiHTML?: string,
        },
        IO: {
            schemas: UDXSchema[],
            std?: Event[],
            inputs: Event[],
            parameters?: Event[],
            outputs: Event[]
        },
        runtime: any;
    };
    nodeIds: string;
    tag: string;
    topicId: string;
    topicName: string;
    exeName: string;
    subscribed_uids: string[];
}

export class Event {
    id: string;
    name: string;
    description: string;
    schemaId: string;
    // ���ֶ����� ��ȡ�ļ�
    // upload: data id
    // std: index in std
    value?: string;
    // ����Ӽ�������������ع����ˣ���Ϊ true
    cached?: boolean;
    // TODO 
    // isFile?: boolean;
    optional?: number;
    // ���ֶ����� �ļ�����ʱ���ļ��� �� ǰ̨��ʾ label
    fname?: string;
    // ��������
    url?: string;
    ext: string;
}