import {
    Component,
    OnInit,
    Output,
    Renderer,
    ViewChild,
    ElementRef,
    EventEmitter,
    AfterViewInit
} from '@angular/core';
import { NgUploaderOptions } from 'ngx-uploader';
import { NzNotificationService } from 'ng-zorro-antd';

import { DataInquireService } from '../../../../common/core/services/data.inquire.service';
import { DataListService } from '../../services/data-list.service';
import { SubMenu } from '../../../../common/shared/components/right-click-menu/sub-menu';
import { GeoDataType, GeoData } from './geo-data';

@Component({
    selector: 'app-data-list',
    templateUrl: './data-list.component.html',
    styleUrls: ['./data-list.component.scss']
})
export class DataListComponent implements OnInit, AfterViewInit {
    dataList: Array<GeoData> = [];
    selectedLi;
    menuCfg: Array<SubMenu>;
    uploadProgress: number = 0;
    fileUploaderOptions: NgUploaderOptions;
    @ViewChild('fileUpload') public _fileUpload: ElementRef;
    @Output() onFileUpload = new EventEmitter<any>();
    @Output() onFileUploadCompleted = new EventEmitter<any>();

    constructor(
        private dataListService: DataListService,
        private renderer: Renderer,
        private dataInquireService: DataInquireService,
        private _notification: NzNotificationService
    ) {
        const postDataService = this.dataInquireService.getServiceById(
            'postData'
        );
        this.fileUploaderOptions = {
            url: postDataService.url,
            data: {
                tag: '',
                type: ''
            },
            fieldName: 'geo_data'
        };
    }

    ngOnInit() {
        this.menuCfg = this.dataListService.initContextMenuCfg();

        this.registerContextMenuEvent();

        postal
            .channel('DATA_CHANNEL')
            .subscribe('data.add', (data, envelope) => {
                this.dataList = _.concat(this.dataList, data);
            });
    }

    registerContextMenuEvent() {
        postal
            .channel('MENU_CHANNEL')
            .subscribe('data.add.raw', (data, envelope) => {
                console.log('data.add.raw');
                this.fileUploaderOptions.data.type = GeoDataType.RAW;
                this.uploadProgress = 0;
                this.renderer.invokeElementMethod(
                    this._fileUpload.nativeElement,
                    'click'
                );
            });

        postal
            .channel('MENU_CHANNEL')
            .subscribe('data.add.UDX', (data, envelope) => {
                this.fileUploaderOptions.data.type = GeoDataType.UDX;
                console.log('data.add.UDX');
                this.uploadProgress = 0;
                this.renderer.invokeElementMethod(
                    this._fileUpload.nativeElement,
                    'click'
                );
            });

        postal
            .channel('MENU_CHANNEL')
            .subscribe('menu.hide', (data, envelope) => {
                jQuery('#contextMenu').hide();
            });
    }

    ngAfterViewInit() {}

    showMenu(e: any) {
        if (e.target.id === 'data-list-div') {
            jQuery('#contextMenu')
                .css({
                    top: e.clientY,
                    left: e.clientX
                })
                .show();
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
        }
    }

    beforeFileUpload(uploadingFile) {
        let files = this._fileUpload.nativeElement.files;
        if (files.length) {
            const file = files[0];
        }
        jQuery('#upload-progress').css('display', 'block');
    }

    _onFileUpload(data) {
        if (data['done'] || data['abort'] || data['error']) {
            jQuery('#upload-progress').css('display', 'none');
            this._onFileUploadCompleted(data);
        } else {
            jQuery('#upload-progress').css('display', 'block');
            this.onFileUpload.emit(data);
            this.uploadProgress = data.progress.percent;
        }
    }

    _onFileUploadCompleted(data) {
        this.onFileUploadCompleted.emit(data);

        if (!data.abort && data.done && !data.error) {
            const response = JSON.parse(data.response);
            if (_.startsWith(_.get(response, 'status.code'), '200')) {
                this._notification.create(
                    'success',
                    'Info:',
                    'loading data successed!'
                );
                postal
                    .channel('DATA_CHANNEL')
                    .publish('data.add', response.data);
            } else {
                this._notification.create(
                    'warning',
                    'Warning:',
                    'loading data failed, please retry later!'
                );
            }
        }
    }
}
