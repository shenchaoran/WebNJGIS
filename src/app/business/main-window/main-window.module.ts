import { NgModule } from '@angular/core';
import { NgUploaderModule } from 'ngx-uploader';

import { DataInquireService } from "../../common/core/services/data.inquire.service";
import { MainWindowRoutingRoutes } from './main-window-routing.module';
import { NgxSharedModule } from '../../common/ngx-shared/ngx-shared.module';
import { SharedModule } from '../../common/shared/shared.module';

import {
    MainWindowComponent,
    ManagerPanelComponent,
    ModelToolLibTreeComponent,
    ModelToolLibListComponent,
    DataToolLibListComponent,
    PropertyPanelComponent,
    DataListComponent
} from './index';

import {
    ModelToolService,
    DataToolService,
    DataListService
} from './services/index';

const COMPONENTS = [
    MainWindowComponent,
    ManagerPanelComponent,
    ModelToolLibTreeComponent,
    ModelToolLibListComponent,
    DataToolLibListComponent,
    PropertyPanelComponent,
    DataListComponent
];

const SERVICES = [
    // DataInquireService,
    ModelToolService,
    DataToolService,
    DataListService
];

@NgModule({
    imports: [
        NgxSharedModule,
        SharedModule,
        MainWindowRoutingRoutes,
        NgUploaderModule
    ],
    declarations: [...COMPONENTS],
    providers: [...SERVICES]
})
export class MainWindowModule {}