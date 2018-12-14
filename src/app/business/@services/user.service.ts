import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { _HttpClient } from '@core/services/http.client';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

var counter = 1;
@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _jwt;
    private baseUrl;
    // TODO 改成一旦有订阅，立即发布当前状态
    public logined$: BehaviorSubject<boolean>;

    constructor(
        private http?: _HttpClient,
        private route?: ActivatedRoute,
        private router?: Router,
        private location?: Location,
    ) {
        console.log('******** UserService constructor', counter++);
        this.baseUrl = '/api/user';
        var jwt = localStorage.getItem('jwt');
        if (jwt) {
            jwt = JSON.parse(jwt);
            this._jwt = jwt;
            if (this.isLogined) {
                this.logined$ = new BehaviorSubject<boolean>(true);
                return;
            }

        }
        this.logined$ = new BehaviorSubject<boolean>(false);
    }

    public set jwt(jwt) {
        this._jwt = jwt;
        console.log('current login state: ' + this.logined$.value);
        if (jwt) {
            localStorage.setItem('jwt', JSON.stringify(jwt));
            let url = this.route.snapshot.queryParams['redirect'];
            this.logined$.next(true);
            if (!url || url.indexOf('#/user/sign') !== -1) {
                this.router.navigate(['/home']);
            }
            else {
                this.router.navigate([url]);
            }
        }
        else {
            localStorage.removeItem('jwt');
            this.logined$.next(false);
        }
    }

    public get jwt() {
        return this._jwt;
    }

    public get user() {
        if (this.isLogined) {
            return this.jwt.user;
        }
        else {
            return null;
        }
    }

    public get token() {
        if (this.isLogined) {
            return this.jwt.token;
        }
        else {
            return null;
        }
    }

    public get redirect() {
        var url = this.location.path();
        var index = url.indexOf('?');
        if (index !== -1)
            url = url.substring(0, index);
        return (url === '/user/sign-in' || url === '/user/sign-up') ? '' : url;
    }

    public get isLogined(): boolean {
        return this.jwt && this.jwt.expires > Date.now();
    }

    signIn(user): Observable<any> {
        return this.http.post(`${this.baseUrl}/sign-in`, user)
            .pipe(
                map(res => {
                    if (res.error) {
                        console.error('error in user.service: ', `${res.error.code} - ${res.error.desc}`);
                        return res;
                    }
                    else {
                        res.data.user.rememberAccount = user.rememberAccount;
                        this.jwt = res.data;
                        this.http.resetHeaders();
                        return res;
                    }
                })
            );
    }

    signOut() {
        this.jwt = null;
    }

    signUp(user): Observable<any> {
        return this.http.post(`${this.baseUrl}/sign-up`, user)
            .pipe(
                map(res => {
                    if (res.error) {
                        console.error('error in user.service: ', `${res.error.code} - ${res.error.desc}`);
                        return res;
                    }
                    else {
                        res.data.user.rememberAccount = user.rememberAccount;
                        this.jwt = res.data;
                        return res;
                    }
                })
            )
    }

    setUp(user): Observable<any> {
        return this.http.post(`${this.baseUrl}/set-up`, user)
            .pipe(
                map(res => {
                    if (res.error) {
                        console.error('error in user.service: ', `${res.error.code} - ${res.error.desc}`);
                        return res;
                    }
                    else {
                        this.jwt.user.url = res.data.user.url;
                        this.jwt.user.group = res.data.user.group;
                        this.jwt.user.location = res.data.user.location;
                        this.jwt.user.avator = res.data.user.avator;
                        localStorage.setItem('jwt', JSON.stringify(this.jwt));
                        this.router.navigate(['/user/'+this.jwt.user.username]);
                        return res;
                    }
                })
            )
    }

    getUserInfo(userName): Observable<any> { 
        return this.http.get('/api/user'+`/${userName}`).pipe(
            map(res => {
                if (res.error) {
                    console.error('error in user.service: ', `${res.error.code} - ${res.error.desc}`);
                    return res;
                }
                return res;
            })
        )
    }

    passwordReset(user): Observable<any> {
        return this.http.post(`${this.baseUrl}/password-reset`, user);
    }

    /**
     * 检查是否登录，如果没有登录，则先重定向到登录页面
     */
    redirectIfNotLogined() {
        if (!this.isLogined) {
            this.router.navigate(['/user/sign-in'], {
            // this.router.navigate(['../..', 'login'], {
                relativeTo: this.route,
                queryParams: {
                    redirect: this.redirect
                }
            });
            return false;
        }
        return true;
    }

    /**
     * 订阅/取消订阅
     *
     * @param {*} pType
     * @param {*} ac
     * @param {*} pid
     * @returns Promise<res>
     * @memberof UserService
     */
    toggleSubscribe(pType, ac, pid) {
        return this.http.patch(`${this.baseUrl}/${this.user._id}`, {
            ac,
            pType,
            pid
        });
    }
}
