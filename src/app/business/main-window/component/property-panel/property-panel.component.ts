import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { HotRegisterer } from 'angular-handsontable';

import { ModelToolService } from '../../services/model-tool.service';
import { GeoData } from '../data-list/geo-data';
import { ModelInput } from './modelInput';
import { PropertyPanelShowType } from './property-panel-show-type';
import { UDXType } from './UDX-type.enum';

@Component({
    selector: 'app-property-panel',
    templateUrl: './property-panel.component.html',
    styleUrls: ['./property-panel.component.scss']
})
export class PropertyPanelComponent implements OnInit, AfterViewInit {
    @Input() panelData: {
        type: PropertyPanelShowType
        data:ModelInput
    };
    selectedEvent = null;
    dataOptions: Array<GeoData> = [];
    disabledExecuteBtn = true;
    loadingExecuteBtn = false;
    msrid: string = null;

    hotTableIsLoading: boolean = true;
    hotTableColumns: Array<{
        data: string;
        title: string;
        type?: string;
    }> = null;
    hotTableData: Array<any> = null;
    hotTableSettings: object = {
        afterLoadData: (firstLoad) => {
            if(!firstLoad) {
              this.hotTableIsLoading = false;
            }
          },
    };
    hotInstance: string = null;
    hotContextMenu: any = null;

    constructor(
        private modelToolService: ModelToolService,
        private _notification: NzNotificationService,
        private hotRegisterer: HotRegisterer
    ) {
        const self = this;
        // this.hotContextMenu = {
        //     items: {
        //         'copy': {},
        //         'chart': {
        //             name: 'chart',
        //             callback: function(key, options) {
        //                 // console.log(key, options);
        //                 const hot = self.hotRegisterer.getInstance(self.hotInstance);
        //                 const range = hot.getSelected();
        //                 console.log(hot.getData(range[0], range[1], range[2], range[3]));
        //             }
        //         }
        //     }
        // };
    }

    ngOnInit() {
        postal
            .channel('DATA_CHANNEL')
            .subscribe('data.add', (data, envelope) => {
                this.dataOptions = _.concat(this.dataOptions, data);
                // this.dataOptions.push(data);
                // console.log(this.dataOptions);
            });

        postal
            .channel('MODEL_TOOL_CHANNEL')    
            .subscribe('invokeModelTool', (data, envelope) => {
                if (data.succeed) {
                    this.msrid = data.result.msrid;
                    const params = {
                        id: this.msrid
                    };
                    const query = undefined;
                    const body = undefined;
                    this.modelToolService.getInvokeRecord(params, query, body);
                } else {
                    this._notification.create(
                        'warning',
                        'Warning:',
                        `invoke model ${this.panelData.data.msname} failed, please retry later!`
                    );
                }
            });

        postal
            .channel('MODEL_TOOL_CHANNEL')
            .subscribe('getInvokeRecord', (data, envelope) => {
                if (data.succeed) {
                    const msr = data.result;
                    if (msr.msr_time === 0) {
                        setTimeout(() => {
                            const params = {
                                id: this.msrid
                            };
                            const query = undefined;
                            const body = undefined;
                            this.modelToolService.getInvokeRecord(
                                params,
                                query,
                                body
                            );
                        }, 5000);
                    }
                    else {
                        this._notification.create(
                            'success',
                            'Info:',
                            `model ${this.panelData.data.msname} run succeed!`
                        );
                        // add msr output to data options
                        let newdatas = [];
                        const outputs = msr.msr_output;
                        _.map(outputs, output => {
                            newdatas.push({
                                gdid: output.DataId,
                                filename: output.Tag,
                                tag: output.Tag,
                                path: '',
                                type: null
                            });
                        });
                        postal
                            .channel('DATA_CHANNEL')
                            .publish('data.add', newdatas);
                        this.disabledExecuteBtn = false;
                        this.loadingExecuteBtn = false;
                    }
                } else {
                    this._notification.create(
                        'warning',
                        'Warning:',
                        'get invoke record failed, please retry later!'
                    );
                }
            });

        postal
            .channel('DATA_CHANNEL')
            .subscribe('propertity-panel.data.bind', (data,envelope) => {
                if(data.type === UDXType.TABLE) {
                    this.hotTableColumns = data.parsed.columns;
                    this.hotTableData = data.parsed.data;

                    this.hotInstance = data.gdid;
                    this.hotTableIsLoading = false;
                }
                
            });
    }

    ngAfterViewInit() {
        jQuery('.ant-spin-container').css('height', '100%');
    }

    checkExecBtn() {
        let disabled = false;
        _.map(this.panelData.data.states, state => {
            _.map(state.inputs, input => {
                if (input.geodata === undefined || input.geodata === null) {
                    disabled = true;
                }
            });

            _.map(state.outputs, output => {
                if (
                    output.filename === undefined ||
                    output.filename === null ||
                    output.filename === ''
                ) {
                    disabled = true;
                }
            });
        });
        this.disabledExecuteBtn = disabled;
    }

    execute() {
        let inputdata = [];
        let outputdata = [];
        _.chain(this.panelData.data.states)
            .map(state => {
                _.chain(state.inputs)
                    .map(input => {
                        inputdata.push({
                            DataId: input.geodata.gdid,
                            Destroyed: false,
                            Event: input.name,
                            Optional: input.optional,
                            StateDes: state.$.description,
                            StateId: state.$.id,
                            StateName: state.$.name,
                            Tag: input.geodata.filename
                        });
                    })
                    .value();
                _.chain(state.outputs)
                    .map(output => {
                        outputdata.push({
                            Destroyed: false,
                            Event: output.name,
                            StateDes: state.$.description,
                            StateId: state.$.id,
                            StateName: state.$.name,
                            Tag: output.filename
                        });
                    })
                    .value();
            })
            .value();

        const query = {
            ac: 'run',
            auth: '',
            inputdata: JSON.stringify(inputdata),
            outputdata: JSON.stringify(outputdata)
        };
        const params = {
            id: this.panelData.data.msid
        };
        const body = undefined;
        this.modelToolService.invokeModelTool(params, query, body);
        // this.disabledExecuteBtn = true;
        this.loadingExecuteBtn = true;
    }

    // hotAfterSelectionEnd(e) {
    //     const hot = this.hotRegisterer.getInstance(this.hotInstance);
    //     const range = hot.getSelected();
    //     hot.getData(range[0], range[1], range[2], range[3]);
    // }

    // hotSetMenu(e) {
    //     console.log(e);

    // }
}
