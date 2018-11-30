import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Component } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Routes, RouterModule, } from '@angular/router';
import { CoreModule } from '@core';
import { NgxSharedModule } from '@shared';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
    selector: 'ogms-app',
    template: `
        <router-outlet></router-outlet>
        <ng2-slim-loading-bar color='#e0631a' height='4px'></ng2-slim-loading-bar>
    `
})
export class AppComponent { }

/********************************************************************** */
const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadChildren: './business/home/index#HomeModule'
    },
    {
        path: 'user',
        loadChildren: './business/user/index#UserModule'
    },
    {
        path: 'datasets',
        loadChildren: './business/datasets/index#DatasetsModule'
    },
    {
        path: 'models',
        loadChildren: './business/ms/index#ModelsModule'
    },
    {
        path: 'cmp-methods',
        loadChildren: './business/cmp-methods/index#CmpMethodsModule'
    },
    {
        path: 'comparison',
        loadChildren: './business/comparison/index#ComparisonModule'
    },
    {
        path: 'results',
        loadChildren: './business/results/index#ResultsModule'
    },
    {
        path: 'search',
        loadChildren: './business/search/index#SearchModule'
    },
    {
        path: 'test',
        loadChildren: './business/test/index#TestModule'
    },
    {
        path: 'topics',
        loadChildren: './business/topic/index#TopicModule'
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true })
    ],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule { }

/********************************************************************** */
@NgModule({
    bootstrap: [AppComponent],
    declarations: [AppComponent],
    imports: [
        OverlayModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        SlimLoadingBarModule,
        CoreModule.forRoot(),
        NgxSharedModule,
    ],
    providers: [
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy
        }
    ]
})
export class AppModule { }