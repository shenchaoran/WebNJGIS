import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SiderNavComponent } from './sider-nav/sider-nav.component';
import { HeaderMenuLayoutComponent } from '@shared';
import { TestComponent } from './test.component';
import { ReactiveFormComponent } from './reactive-form/reactive-form.component';
import { FileUploaderTestComponent } from './file-uploader-test/file-uploader-test.component';

const routes: Routes = [
    {
        path: '',
        component: HeaderMenuLayoutComponent,
        children: [
            {
                path: '',
                component: TestComponent,
                children: [
                    {
                        path: 'sider-nav',
                        component: SiderNavComponent
                    }, 
                    {
                        path: 'reactive-form',
                        component: ReactiveFormComponent
                    },
                    {
                        path: 'file-uploader',
                        component: FileUploaderTestComponent
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TestRoutingModule {}
