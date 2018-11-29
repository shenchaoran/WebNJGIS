import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener, Inject } from '@angular/core';
import * as uuidv1 from 'uuid/v1';
import { API } from '@config';
import { OlService } from '../services/ol.service';
import { defaults as defaultControls } from 'ol/control/util';
import ScaleLine from 'ol/control/ScaleLine';
import FullScreen from 'ol/control/FullScreen';
import Map from 'ol/Map';
import View from 'ol/View';
import Group from 'ol/layer/Group';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';

@Component({
    selector: 'ogms-global-site',
    templateUrl: './global-site.component.html',
    styleUrls: ['./global-site.component.scss']
})
export class GlobalSiteComponent implements OnInit, AfterViewInit {
    @Input() dataset;
    @Output() onSiteSelected = new EventEmitter<any>();

    targetId;
    map;
    baseLayerGroup;
    siteLayer;
    siteSource;

    constructor(
        private olService: OlService,
        @Inject('LAYERS') private layers,
    ) {
        this.targetId = uuidv1();
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.buildMap();
        }, 0);
    }

    buildMap() {
        this.baseLayerGroup = new Group({
            layers: [
                new Tile({
                    title: 'OSM',
                    visible: true,
                    source: new OSM()
                } as any)
            ]
        });
        this.siteSource = new TileWMS({
            crossOrigin: 'anonymous',
            serverType: 'geoserver',
            url: this.layers.url,
            params: {
                // request : 'GetMap',
                // service : 'WMS',
                // version : '1.1.0',
                layers: this.dataset.schema$.layerId,
                styles: '',
                bbox: this.layers.bbox,
                // 加长宽会变形
                // width : '768',
                // height : '330',
                srs: 'EPSG:4326'
                // 加下面的不允许跨域
                // format : 'application/openlayers'
            }
        });
        this.siteLayer = new Tile({
            title: this.dataset.meta.name,
            source: this.siteSource
        } as any);

        let view = new View({
            center: [0, 0],
            zoom: 1
        });
        this.map = new Map({
            target: this.targetId,
            layers: [
                this.baseLayerGroup,
                this.siteLayer
            ],
            view: view,
            controls: new defaultControls({
                // attribution: false,
                rotate: false,
                zoom: false
            }).extend([new FullScreen(), new ScaleLine()])
        } as any);

        this.map.on('singleclick', evt => {
            let url = this.siteSource.getGetFeatureInfoUrl(
                evt.coordinate,
                view.getResolution(),
                'EPSG:3857',
                {
                    INFO_FORMAT: 'text/html',   //geoserver支持jsonp才能输出为jsonp的格式
                    QUERY_LAYERS: this.dataset.schema.layerId
                    // FEATURE_COUNT: 1     //点击查询能返回的数量上限
                    // format_options: ()
                }
            );
            if (url) {
                this.olService.getFeatureInfo(url).subscribe(response => {
                    console.log('selected site index: ' + response[0].index);
                    let coor = JSON.parse(response[0].coor);
                    this.onSiteSelected.emit({
                        index: response[0].index,
                        lat: coor[0],
                        long: coor[1],
                        coor: response[0].coor
                    });
                })
            }
        })
        this.map.on('pointermove', evt => {
            if (evt.dragging)
                return;
            var pixel = this.map.getEventPixel(evt.originalEvent);
            var hit = this.map.forEachLayerAtPixel(pixel, layer => {
                return layer.get('title') === 'Site';
            });
            this.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        })

        this.resize();
    }

    @HostListener('window:resize')
    resize() {
        this.map.updateSize();
    }
}
