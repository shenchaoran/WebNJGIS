import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { findIndex, get, pull, indexOf, includes } from 'lodash';
import {
    TopicService,
    ConversationService,
    UserService,
    SolutionService,
} from '../../services';
import {
    Topic,
    Conversation,
    Comment,
    Solution,
} from '../../models';
import { Simplemde } from 'ng2-simplemde';

@Component({
    selector: 'ogms-topic-detail',
    templateUrl: './topic-detail.component.html',
    styleUrls: ['./topic-detail.component.scss'],
    providers: [ConversationService]
})
export class TopicDetailComponent implements OnInit {
    editMode: 'READ' | 'WRITE';
    _originTitle: string;
    _originDesc: string;
    slnFilter: string = '';
    hadTriggeredConversation: boolean;

    mdeOption = { placeholder: 'Topic description...' };
    @ViewChild(Simplemde) simpleMDE: any;

    topic: Topic;
    solutionList: Solution[];
    solutionCount: number;

    get couldEdit(): boolean { return this.user && this.topic && this.topic.auth.userId === this.user._id; }
    get user() { return this.userService.user; }
    get users() { return this.conversationService.users; }
    get conversation(): Conversation { return this.conversationService.conversation; }
    get selectedSolutions(): Solution[] { return this.solutionList.filter(v => includes(v.topicIds,this.topic._id)); }
    get includeUser() { return findIndex(get(this, 'topic.subscribed_uids'), v => v === this.user._id) !== -1;}

    constructor(
        private topicService: TopicService,
        private conversationService: ConversationService,
        private userService: UserService,
        private solutionService: SolutionService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngOnInit() {
        const topicId = this.route.snapshot.paramMap.get('id');
        this.editMode = 'READ';
        this.topicService.findOne(topicId).subscribe(res => {
            if (!res.error) {
                this.topic = res.data.topic;
                this.solutionList = res.data.solutions;
                this.solutionCount = res.data.solutionCount;
                
                if (this.couldEdit && !this.topic.meta.wikiMD) {
                    this.editMode = 'WRITE';
                    this.snackBar.open('please improve the wiki documentation as soon as possible!', null, {
                        duration: 2000,
                        verticalPosition: 'top',
                        horizontalPosition: 'end',
                    });
                }
            }
        });
    }

    onAttachSolution(sln) {
        // let ac = sln.topicId === this.topic._id ? 'removeSolution' : 'addSolution';
        let ac = includes(sln.topicIds,this.topic._id)? 'removeSolution' : 'addSolution';
        this.topicService.patch(this.topic._id, {
            ac,
            solutionId: sln._id,
        }).subscribe(res => {
            if (!res.error) {
                if (ac === 'removeSolution') {
                    pull(sln.topicIds, this.topic._id)
                }
                else {
                    if(indexOf(sln.topicIds, this.topic._id) === -1) {
                        !sln.topicIds && (sln.topicIds = [])
                        sln.topicIds.push(this.topic._id)
                    }
                }
            }
        })
    }

    onSlnFilterChange(filter) {

    }

    onEditSave() {
        this.topic.meta.wikiHTML = this.simpleMDE.simplemde.markdown(this.topic.meta.wikiMD);
        this.topicService.patch(this.topic._id, { topic: this.topic }).subscribe(res => {
            if (!res.error) {
                this.editMode = 'READ';
            }
        });
    }

    onEditCancel() {
        this.topic.meta.name = this._originTitle;
        this.topic.meta.wikiMD = this._originDesc;
        this.editMode = 'READ';
    }

    onEditClick() {
        this.editMode = "WRITE";
        this._originTitle = this.topic.meta.name;
        this._originDesc = this.topic.meta.wikiMD;
    }

    onSubscribeToggle() {
        let ac = this.includeUser ? 'unsubscribe' : 'subscribe';
        this.userService.toggleSubscribe('topic', ac, this.topic._id).subscribe(res => {
            if (!res.error) {
                let i = this.topic.subscribed_uids.findIndex(v => v === this.user._id);
                if (ac === 'subscribe')
                    i === -1 && this.topic.subscribed_uids.push(this.user._id);
                else
                    i !== -1 && this.topic.subscribed_uids.splice(i, 1);
            }
        });
    }

    onTabChange(index) {
        if (index === 1 && !this.hadTriggeredConversation) {
            this.conversationService.findOneByWhere({
                pid: this.topic._id
            }).subscribe(res => {
                if (!res.error) {
                    this.hadTriggeredConversation = true;
                    this.conversationService.import(
                        res.data.conversation,
                        res.data.users,
                        res.data.commentCount,
                        this.topic.auth.userId,
                        this.topic._id,
                        'topic'
                    );
                }
            })
        }
    }

    ceateTopic(){
        if(this.userService.isLogined){
            this.router.navigate(['/topics/create']);
        }else{
            this.userService.redirectIfNotLogined();
        }
    }

    createSolution(){
        if(this.userService.isLogined){
            this.router.navigate(['/comparison/solutions/create']);
        }else{
            this.userService.redirectIfNotLogined();
        }
    }
}
