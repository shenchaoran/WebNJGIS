import { Component, OnInit, OnDestroy } from '@angular/core';
import { ListBaseService } from '../../services';
import { ActivatedRoute, Params } from "@angular/router";
import { NzNotificationService, NzModalService } from "ng-zorro-antd";
import { DynamicTitleService } from '@core/services/dynamic-title.service';
import { Observable } from 'rxjs/Observable';
import { OgmsBaseComponent } from '../ogms-base/ogms-base.component';

/**
 * doc 详情页的基类，能够处理数据请求
 * 
 * @export
 * @class DocBaseComponent
 * @implements {OnInit}
 */
@Component({
    selector: 'ogms-doc-base',
    templateUrl: './doc-base.component.html',
    styleUrls: ['./doc-base.component.scss']
})
export class DocBaseComponent extends OgmsBaseComponent implements OnInit, OnDestroy {
    public _isLoading = true;
    public doc: Observable<any>;

    constructor(
        public route: ActivatedRoute,
        public service: ListBaseService,
//private _notice: NzNotificationService,
        public title: DynamicTitleService
    ) { 
        super();
    }

    ngOnInit() {
        this.doc = Observable.create(observer => {
            this._subscriptions.push(this.route.params.subscribe((params: Params) => {
                const docId = params['id'];
                this.service.findOne(docId)
                    .subscribe(response => {
                        if (!response.error) {
                            this._isLoading = false;
                            observer.next(response.data);
                            observer.complete();
                        }
                    });
            }));
        });
        this._isLoading = true;
    }
}