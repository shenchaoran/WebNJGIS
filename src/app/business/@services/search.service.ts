import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Resolve } from '@angular/router';
import { _HttpClient } from '@core/services/http.client';

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    constructor(private http: _HttpClient) { }

    search(options: {[key: string]: any}): Observable<any> {
        return this.http.get('/search', options);
    }
}
