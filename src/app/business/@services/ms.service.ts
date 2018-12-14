import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@core/services/http.client';
import { ListBaseService } from './list-base.service';
import { UserService } from './user.service';
import { SolutionService } from './sln.service';
import { ConversationService } from './conversation.service';
import { Topic, Solution, Conversation, Comment, User, MS } from '../@models';

@Injectable({
    providedIn: 'root'
})
export class MSService extends ListBaseService {
    public get conversation() { return this.conversationService.conversation; }

    constructor(
        protected http: _HttpClient,
        private userService: UserService,
        private conversationService: ConversationService,
    ) { 
        super(http);
        this.baseUrl = `${this.http.api.backend}/model-service`;
    }

    invoke(msId, msInstance): Observable<any> {
        return this.http.post(`${this.baseUrl}/${msId}/invoke`, { msInstance });
    }

    getLog(msrId) {
        return this.http.get(`/calculation/log/${msrId}`)
    }
}
