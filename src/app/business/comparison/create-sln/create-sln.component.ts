import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { CmpSolution, ResourceSrc } from '@models';
import { SlnService } from '../../services/sln.service';
import { MSService } from '../../services/ms.service';
import { NzNotificationService, NzModalService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import * as uuidv1 from 'uuid/v1';
import { CmpMethodService } from '../../services/cmp-method.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'ogms-create-sln',
    templateUrl: './create-sln.component.html',
    styleUrls: ['./create-sln.component.scss']
})
export class CreateSlnComponent implements OnInit {

    cmpMethods;
    slnFG: FormGroup;
    msList: any[];
    cmpSln: CmpSolution = new CmpSolution();
    get cmpObjs() {
        return this.slnFG.get('cmpObjs') as FormArray;
    }
    get participants() {
        return this.slnFG.get('participants');
    }
    get participantsNum() {
        let num = _.get(this.slnFG.get('participants'), 'value.length');
        return num ? num : 0;
    }

    constructor(
        private fb: FormBuilder,
        private cdRef: ChangeDetectorRef,
        private service: SlnService,
        private msService: MSService,
        private _notice: NzNotificationService,
        private router: Router,
        private route: ActivatedRoute,
        private cmpMethodService: CmpMethodService,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.slnFG = this.fb.group({
            name: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
            desc: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(140)]],
            auth: [ResourceSrc.PUBLIC, [Validators.required]],
            participants: [null, [Validators.required]],
            cmpObjs: this.fb.array([])
        });
        this.slnFG.statusChanges
            .subscribe(state => {
                // if (state === 'VALID') {
                    let v = this.slnFG.value;
                    this.cmpSln.meta.name = v.name;
                    this.cmpSln.meta.desc = v.desc;
                    this.cmpSln.auth.src = v.auth;
                    this.cmpSln.participants = v.participants;
                    this.cmpSln.cmpObjs = _.map(v.cmpObjs, cmpObj => {
                        return {
                            ...cmpObj,
                            dataRefers: _.map(cmpObj.dataRefers, dataRefer => {
                                return {
                                    msId: dataRefer.msId,
                                    msName: dataRefer.msName,
                                    eventId: dataRefer.selected[1].id,
                                    eventName: dataRefer.selected[1].name,
                                    schemaId: dataRefer.selected[1].schemaId,
                                    field: dataRefer.selected[2]
                                };
                            }),
                            methods: _.map(cmpObj.methods, method => {
                                return {
                                    id: method._id,
                                    name: method.meta.name
                                }
                            })
                        }
                    });
                    // console.log(JSON.stringify(this.cmpSln));
                // }
            })

        this.fetchData();
    }

    onParticipantsChange() {
        this.cmpObjs;
        this.slnFG.setControl('cmpObjs', this.fb.array([]));
    }

    fetchData() {
        this.msService.findAll({
            pageSize: 100
        })
            .subscribe(response => {
                if (!response.error) {
                    this.msList = response.data.docs;
                }
            });

        this.cmpMethodService.findAll({})
            .subscribe(response => {
                if (!response.error) {
                    this.cmpMethods = response.data.docs
                }
            })
    }

    addCmpObj() {
        this.cmpObjs.push(new FormControl({
            id: uuidv1()
        }));
        // this.cmpObjs.markAsDirty();
        this.cmpObjs.updateValueAndValidity();
    }

    removeCmpObj(index) {
        this.cmpObjs.removeAt(index);
        this.cmpObjs.updateValueAndValidity();
    }

    submitSln() {
        this.service.insert(this.cmpSln)
            .subscribe(response => {
                if (!response.error) {
                    this._notice.success('Success', 'create comparison solution succeed!');
                    this.cmpSln._id = response.data._id;
                    
                    this.dialog.open(SlnConfirmDialog)
                        .afterClosed()
                        .subscribe(result => {
                            if(result === 'outline') {
                                this.router.navigate(['..', this.cmpSln._id,], {
                                    relativeTo: this.route
                                });
                            }
                            else if(result === 'configure') {
                                this.router.navigate(['/comparison/solutions', this.cmpSln._id, 'invoke']);
                            }
                        });
                }
            });
    }
}

@Component({
    selector: 'ogms-sln-confirm-dialog',
    template: `
        <h2 mat-dialog-title>Configure this solution right now?</h2>
        <mat-dialog-content></mat-dialog-content>
        <mat-dialog-actions align='end'>
            <div>
                <button mat-button [mat-dialog-close]='"outline"'>Later</button>
                <button mat-button [mat-dialog-close]='"configure"' cdkFocusInitial>Configure</button>
            </div>
        </mat-dialog-actions>
    `
})
export class SlnConfirmDialog {}