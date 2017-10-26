import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgxSharedModule } from '../ngx-shared/ngx-shared.module';
import { SharedModule } from '../../common/shared/shared.module';

import { SiderMenuLayoutComponent } from "./sider-menu-layout/sider-menu-layout.component";
import { HeaderMenuLayoutComponent } from "./header-menu-layout/header-menu-layout.component";

const COMPONENTS = [
    SiderMenuLayoutComponent,
    HeaderMenuLayoutComponent,
];

@NgModule({
    imports: [
        NgxSharedModule,
        RouterModule,
        SharedModule,
    ],
    providers: [],
    declarations: [
        ...COMPONENTS
    ],
    exports: [
        ...COMPONENTS
    ]
})
export class LayoutModule { }