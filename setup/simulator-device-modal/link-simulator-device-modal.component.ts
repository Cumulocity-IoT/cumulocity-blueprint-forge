/*
* Copyright (c) 2023 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */

import {
    Component,
    Optional,
    ViewChild,
    ViewContainerRef,
    ComponentFactoryResolver,
    ComponentFactory,
    ComponentRef
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { WizardComponent } from "../../wizard/wizard.component";
import {SimulationStrategyConfigComponent, SimulationStrategyFactory} from "../../builder/simulator/simulation-strategy";
import { SimulationStrategiesService } from "./../../builder/simulator/simulation-strategies.service";
import { DtdlSimulationModel } from "../../builder/simulator/simulator-config";
import { cloneDeep } from "lodash";
import * as _ from 'lodash';
import { SimulatorConfigService } from '../../builder/simulator-config/simulator-config.service';
import { ControlContainer, NgForm } from '@angular/forms';
import { FileSimulatorNotificationService } from '../../builder/simulator-config/file-simulator.service';
import { FetchClient } from '@c8y/client';

export function controlContainerFactory(controlContainer?: ControlContainer) {
    return controlContainer;
  }

@Component({
    templateUrl: './link-simulator-device-modal.component.html',
    styleUrls: ['./link-simulator-device-modal.component.css'],
    viewProviders: [ { provide: ControlContainer, useExisting: NgForm, useFactory: controlContainerFactory, 
        deps: [[new Optional(), NgForm]]  } ]
})
export class LinkSimulatorDeviceModalComponent {
    
    busy: boolean = false;
    isConfigFileUploading: boolean = false;
    isConfigFileError: boolean = false;
    existingConfig: any;
    newConfig: any;

    @ViewChild(WizardComponent, { static: true }) wizard: WizardComponent;
    @ViewChild("configWrapper", { read: ViewContainerRef, static: true }) configWrapper: ViewContainerRef;

    selectedStrategyFactory: SimulationStrategyFactory;
    groupEnabled: boolean;
    config: any;
    configModel: DtdlSimulationModel[] = [];
    dtdlFile: FileList;
    isUploading = false;
    isError = false;
    measurementFilterEnabled = true;
    configFromFile: any;
    simulatorName: string = '';
    isMSExist: boolean = false;
    isMSCheckSpin: boolean;
    runOnServer: boolean;
    isGroup: boolean = false;

    constructor(
        public bsModalRef: BsModalRef, public simulationStrategiesService: SimulationStrategiesService,
        private simConfigService: SimulatorConfigService,
        private fileSimulatorNotificationService: FileSimulatorNotificationService,
        private simulatorConfigService: SimulatorConfigService,
        private fetchClient: FetchClient,
        private resolver: ComponentFactoryResolver,
        
    ) {  }

    ngOnInit() {
      this.config = { "modalSize": "modal-md", "dtdlDeviceId": "", "dtdlModelConfig": [ { "schema": "double", "fragment": "Temperature", "unit": "degreeFahrenheit", "isObjectType": false, "series": "temperature", "matchingValue": "default", "eventText": "Temperature", "simulationType": "randomValue", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "double", "isObjectType": false, "maxValue": 10, "simulationType": "randomValue", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "eventType": "temperature", "measurementName": "Temperature", "fragment": "Temperature", "unit": "degreeFahrenheit", "minValue": 5, "series": "temperature", "matchingValue": "default", "eventText": "Temperature", "id": "dtmi:rigado::RuuviTag:temperature;1" } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::RuuviTag:temperature;1", "eventType": "temperature", "measurementName": "Temperature" }, { "schema": "double", "fragment": "RelativeHumidity", "unit": "percent", "isObjectType": false, "series": "humidity", "matchingValue": "default", "eventText": "RelativeHumidity", "simulationType": "valueSeries", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "double", "isObjectType": false, "simulationType": "valueSeries", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "eventType": "humidity", "measurementName": "RelativeHumidity", "fragment": "RelativeHumidity", "unit": "percent", "series": "humidity", "matchingValue": "default", "eventText": "RelativeHumidity", "id": "dtmi:rigado::RuuviTag:humidity;1", "value": "1,2,3" } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::RuuviTag:humidity;1", "eventType": "humidity", "measurementName": "RelativeHumidity" }, { "schema": "integer", "fragment": "Pressure", "unit": "kilopascal", "isObjectType": false, "series": "Pressure", "matchingValue": "default", "eventText": "Pressure", "simulationType": "randomWalk", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "integer", "isObjectType": false, "maxValue": 20, "simulationType": "randomWalk", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "eventType": "Pressure", "measurementName": "Pressure", "fragment": "Pressure", "unit": "kilopascal", "minValue": 5, "series": "Pressure", "matchingValue": "default", "eventText": "Pressure", "id": "dtmi:rigado::RuuviTag:Pressure;1", "maxDelta": 3, "startingValue": 10 } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::RuuviTag:Pressure;1", "eventType": "Pressure", "measurementName": "Pressure" }, { "schema": "integer", "fragment": "RSSI", "unit": "", "isObjectType": false, "series": "rssi", "matchingValue": "default", "eventText": "RSSI", "simulationType": "eventCreation", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "integer", "fragment": "RSSI", "unit": "", "isObjectType": false, "series": "rssi", "matchingValue": "default", "eventText": "RSSI", "simulationType": "eventCreation", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::IotDevice:rssi;1", "eventType": "rssi", "measurementName": "RSSI" } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::IotDevice:rssi;1", "eventType": "rssi", "measurementName": "RSSI" }, { "schema": "double", "fragment": "Battery Level", "unit": "volt", "isObjectType": false, "series": "batteryLevel", "matchingValue": "default", "eventText": "Battery Level", "simulationType": "positionUpdate", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "double", "altitude": "0,0", "isObjectType": false, "latitude": "100,101", "simulationType": "positionUpdate", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "eventType": "batteryLevel", "measurementName": "Battery Level", "fragment": "Battery Level", "unit": "volt", "series": "batteryLevel", "matchingValue": "default", "eventText": "Battery Level", "id": "dtmi:rigado::IotDevice:batteryLevel;1", "longitude": "100,101" } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::IotDevice:batteryLevel;1", "eventType": "batteryLevel", "measurementName": "Battery Level" } ], "interval": 30, "alternateConfigs": { "opSource": "", "opSourceName": "", "payloadFragment": "c8y_Command.text", "opReply": false, "operations": [ { "modalSize": "modal-md", "dtdlDeviceId": "", "dtdlModelConfig": [], "interval": 30, "alternateConfigs": { "opSource": "", "opSourceName": "", "payloadFragment": "c8y_Command.text", "opReply": false, "operations": [], "configIndex": 0 }, "matchingValue": "default" } ], "configIndex": 0 }, "matchingValue": "default", "deviceName": "RuuviTag", "metadata": { "name": "DTDL", "icon": "window-restore", "description": "Simulate a device based on DTDL (Digital Twin Definition Language)", "hideSimulatorName": true }, "isGroup": false, "serverSide": true, "intervalInvalid": false };
        this.groupEnabled = false;
        this.measurementFilterEnabled = true;
        this.handleDTDLFileMeasurements();
        // let validJson = {"serverSide":false,"lastUpdated":"2023-11-27T09:50:15.088Z","name":"RuuviTag","started":true,"id":247803,"type":"DTDL","config":{"serverSide":false,"dtdlDeviceId":"","metadata":{"hideSimulatorName":true,"name":"DTDL","icon":"window-restore","description":"Simulate a device based on DTDL (Digital Twin Definition Language)"},"intervalInvalid":false,"matchingValue":"default","modalSize":"modal-md","interval":30,"alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"dtdlDeviceId":"","matchingValue":"default","modalSize":"modal-md","interval":30,"alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opReply":false,"opSource":""},"dtdlModelConfig":[],"deviceId":"2202"}],"opReply":false,"opSource":""},"isGroup":true,"dtdlModelConfig":[{"schema":"double","fragment":"Temperature","unit":"degreeFahrenheit","isObjectType":false,"series":"temperature","matchingValue":"default","eventText":"Temperature","simulationType":"randomValue","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"double","isObjectType":false,"maxValue":10,"simulationType":"randomValue","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"eventType":"temperature","measurementName":"Temperature","fragment":"Temperature","unit":"degreeFahrenheit","minValue":5,"series":"temperature","matchingValue":"default","eventText":"Temperature","id":"dtmi:rigado::RuuviTag:temperature;1"}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::RuuviTag:temperature;1","eventType":"temperature","measurementName":"Temperature"},{"schema":"double","fragment":"RelativeHumidity","unit":"percent","isObjectType":false,"series":"humidity","matchingValue":"default","eventText":"RelativeHumidity","simulationType":"valueSeries","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"double","isObjectType":false,"simulationType":"valueSeries","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"eventType":"humidity","measurementName":"RelativeHumidity","fragment":"RelativeHumidity","unit":"percent","series":"humidity","matchingValue":"default","eventText":"RelativeHumidity","id":"dtmi:rigado::RuuviTag:humidity;1","value":"1,2,3"}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::RuuviTag:humidity;1","eventType":"humidity","measurementName":"RelativeHumidity"},{"schema":"integer","fragment":"Pressure","unit":"kilopascal","isObjectType":false,"series":"Pressure","matchingValue":"default","eventText":"Pressure","simulationType":"randomWalk","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"integer","isObjectType":false,"maxValue":20,"simulationType":"randomWalk","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"eventType":"Pressure","measurementName":"Pressure","fragment":"Pressure","unit":"kilopascal","minValue":5,"series":"Pressure","matchingValue":"default","eventText":"Pressure","id":"dtmi:rigado::RuuviTag:Pressure;1","maxDelta":3,"startingValue":10}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::RuuviTag:Pressure;1","eventType":"Pressure","measurementName":"Pressure"},{"schema":"integer","fragment":"RSSI","unit":"","isObjectType":false,"series":"rssi","matchingValue":"default","eventText":"RSSI","simulationType":"eventCreation","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"integer","fragment":"RSSI","unit":"","isObjectType":false,"series":"rssi","matchingValue":"default","eventText":"RSSI","simulationType":"eventCreation","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::IotDevice:rssi;1","eventType":"rssi","measurementName":"RSSI"}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::IotDevice:rssi;1","eventType":"rssi","measurementName":"RSSI"},{"schema":"double","fragment":"Battery Level","unit":"volt","isObjectType":false,"series":"batteryLevel","matchingValue":"default","eventText":"Battery Level","simulationType":"positionUpdate","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"double","altitude":"0,0","isObjectType":false,"latitude":"100,101","simulationType":"positionUpdate","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"eventType":"batteryLevel","measurementName":"Battery Level","fragment":"Battery Level","unit":"volt","series":"batteryLevel","matchingValue":"default","eventText":"Battery Level","id":"dtmi:rigado::IotDevice:batteryLevel;1","longitude":"100,101"}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::IotDevice:batteryLevel;1","eventType":"batteryLevel","measurementName":"Battery Level"}],"deviceName":"smartSensor","deviceId":"2202"}};
          let validJson = { "modalSize": "modal-md", "dtdlDeviceId": "", "dtdlModelConfig": [ { "schema": "double", "fragment": "Temperature", "unit": "degreeFahrenheit", "isObjectType": false, "series": "temperature", "matchingValue": "default", "eventText": "Temperature", "simulationType": "randomValue", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "double", "isObjectType": false, "maxValue": 10, "simulationType": "randomValue", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "eventType": "temperature", "measurementName": "Temperature", "fragment": "Temperature", "unit": "degreeFahrenheit", "minValue": 5, "series": "temperature", "matchingValue": "default", "eventText": "Temperature", "id": "dtmi:rigado::RuuviTag:temperature;1" } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::RuuviTag:temperature;1", "eventType": "temperature", "measurementName": "Temperature" }, { "schema": "double", "fragment": "RelativeHumidity", "unit": "percent", "isObjectType": false, "series": "humidity", "matchingValue": "default", "eventText": "RelativeHumidity", "simulationType": "valueSeries", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "double", "isObjectType": false, "simulationType": "valueSeries", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "eventType": "humidity", "measurementName": "RelativeHumidity", "fragment": "RelativeHumidity", "unit": "percent", "series": "humidity", "matchingValue": "default", "eventText": "RelativeHumidity", "id": "dtmi:rigado::RuuviTag:humidity;1", "value": "1,2,3" } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::RuuviTag:humidity;1", "eventType": "humidity", "measurementName": "RelativeHumidity" }, { "schema": "integer", "fragment": "Pressure", "unit": "kilopascal", "isObjectType": false, "series": "Pressure", "matchingValue": "default", "eventText": "Pressure", "simulationType": "randomWalk", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "integer", "isObjectType": false, "maxValue": 20, "simulationType": "randomWalk", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "eventType": "Pressure", "measurementName": "Pressure", "fragment": "Pressure", "unit": "kilopascal", "minValue": 5, "series": "Pressure", "matchingValue": "default", "eventText": "Pressure", "id": "dtmi:rigado::RuuviTag:Pressure;1", "maxDelta": 3, "startingValue": 10 } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::RuuviTag:Pressure;1", "eventType": "Pressure", "measurementName": "Pressure" }, { "schema": "integer", "fragment": "RSSI", "unit": "", "isObjectType": false, "series": "rssi", "matchingValue": "default", "eventText": "RSSI", "simulationType": "eventCreation", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "integer", "fragment": "RSSI", "unit": "", "isObjectType": false, "series": "rssi", "matchingValue": "default", "eventText": "RSSI", "simulationType": "eventCreation", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::IotDevice:rssi;1", "eventType": "rssi", "measurementName": "RSSI" } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::IotDevice:rssi;1", "eventType": "rssi", "measurementName": "RSSI" }, { "schema": "double", "fragment": "Battery Level", "unit": "volt", "isObjectType": false, "series": "batteryLevel", "matchingValue": "default", "eventText": "Battery Level", "simulationType": "positionUpdate", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [ { "schema": "double", "altitude": "0,0", "isObjectType": false, "latitude": "100,101", "simulationType": "positionUpdate", "alternateConfigs": { "configIndex": 0, "opSourceName": "", "payloadFragment": "c8y_Command.text", "operations": [], "opEnabled": false, "opReply": false, "opSource": "" }, "eventType": "batteryLevel", "measurementName": "Battery Level", "fragment": "Battery Level", "unit": "volt", "series": "batteryLevel", "matchingValue": "default", "eventText": "Battery Level", "id": "dtmi:rigado::IotDevice:batteryLevel;1", "longitude": "100,101" } ], "opEnabled": false, "opReply": false, "opSource": "" }, "id": "dtmi:rigado::IotDevice:batteryLevel;1", "eventType": "batteryLevel", "measurementName": "Battery Level" } ], "interval": 30, "alternateConfigs": { "opSource": "", "opSourceName": "", "payloadFragment": "c8y_Command.text", "opReply": false, "operations": [ { "modalSize": "modal-md", "dtdlDeviceId": "", "dtdlModelConfig": [], "interval": 30, "alternateConfigs": { "opSource": "", "opSourceName": "", "payloadFragment": "c8y_Command.text", "opReply": false, "operations": [], "configIndex": 0 }, "matchingValue": "default" } ], "configIndex": 0 }, "matchingValue": "default", "deviceName": "RuuviTag", "metadata": { "name": "DTDL", "icon": "window-restore", "description": "Simulate a device based on DTDL (Digital Twin Definition Language)", "hideSimulatorName": true }, "isGroup": false, "serverSide": true, "intervalInvalid": false };
        
       this.dtdlFile = JSON.parse(JSON.stringify(validJson));
          this.processDTDL(validJson);
    }


    handleDTDLFileMeasurements() {
      
       
          this.preselectMeasurements();


    }

    private processDTDL(dtdl: any) {
        this.declareConfig();
        if(dtdl.constructor === Object) {
            this.config.deviceName = (dtdl.displayName && dtdl.displayName.constructor === Object ? dtdl.displayName.en : dtdl.displayName);
            this.processDTDLMeasurement(dtdl.contents);
        } else {
            dtdl.forEach( (device, idx) => {
                if(idx === 0) {
                    this.config.deviceName = (device.displayName && device.displayName.constructor === Object ? device.displayName.en : device.displayName);
                }
                this.processDTDLMeasurement(device.contents);
            });
        }
    }

    private processDTDLMeasurement(dtdlM: any, deviceId?: string) {
        if(dtdlM && dtdlM.length > 0) {
            const dtdlJSON: any = this.dtdlFile;
            dtdlM.forEach((content: any) => {
                if(content['@type'].includes("Telemetry")) {
                    this.processTelemetry(content, deviceId);
                } else if (content['@type'].includes("Component")) {
                    const schemaContent = (content.schema && content.schema.contents ? content.schema.contents : []);
                    schemaContent.forEach((content: any) => {
                        if(content['@type'].includes("Telemetry")) {
                            this.processTelemetry(content,deviceId);
                        } 
                    });
                    if(content.schema && content.schema.length > 0){
                        const locateContent = dtdlJSON.find( dtdlMsrmnt => dtdlMsrmnt['@id'] === content.schema);
                        if(locateContent && locateContent.contents && locateContent.contents.length > 0) {
                            const contents1stLevelObj = locateContent.contents;
                            contents1stLevelObj.forEach((content1stLevel: any) => {
                                if(content1stLevel['@type'].includes("Telemetry") || (!this.measurementFilterEnabled  && content1stLevel['@type'].includes("Property"))) {
                                    const level2DisplayName =  (content1stLevel.displayName && content1stLevel.displayName.constructor === Object ? content1stLevel.displayName.en : content1stLevel.displayName);
                                    const level1DisplayName = (content.displayName && content.displayName.constructor === Object ? content.displayName.en : content.displayName);
                                    this.processTelemetry(content1stLevel,deviceId, (level1DisplayName ? level1DisplayName + ':' + level2DisplayName : level2DisplayName));
                                } 
                            });
                        }
                    }
                }
            });
        }
    }

    initializeConfig(existingConfig?: DtdlSimulationModel) {
        this.existingConfig = existingConfig;
        this.declareConfig();
        if(this.existingConfig === undefined || this.existingConfig === null) {
            this.config.interval = 30;
        } else {
            this.config.interval = this.existingConfig.interval;
            this.existingConfig.dtdlModelConfig.forEach((dmc: DtdlSimulationModel) => {
                this.checkAlternateConfigs(dmc);
                this.config.dtdlModelConfig.push(dmc);
            });
        }
    }
 
    private preselectMeasurements() {
        if(this.existingConfig !== undefined && this.existingConfig !== null) {
            for(let i in this.existingConfig.dtdlModelConfig) {
                for(let j in this.configModel) {    
                    if(this.configModel[j].measurementName === this.existingConfig.dtdlModelConfig[i].measurementName) {
                        this.configModel[j] = this.existingConfig.dtdlModelConfig[i];
                        this.config.dtdlModelConfig.push(this.existingConfig.dtdlModelConfig[i]);
                    }
                }
            }
        }
    }

    private declareConfig() {
        this.config.modalSize = "modal-md";
        this.config.dtdlDeviceId = "";
        this.config.dtdlModelConfig = [];
        this.configModel = [];
        this.config.interval = 30;
        this.checkAlternateConfigs(this.config);
    }

    private processTelemetry(content: any, deviceId?: string, displayName?: string) {
        const typeLength = (Array.isArray(content['@type']) ? content['@type'].length : 0);
        const model: DtdlSimulationModel = {
            simulationType: 'randomValue',
            matchingValue: "default",
            alternateConfigs: {
                opEnabled: false,
                opReply: false,
                opSource: "",
                opSourceName: "",
                payloadFragment: "c8y_Command.text",
                configIndex: 0,
                operations: []
            }
        };
        model.measurementName = (displayName  && displayName.length > 0 ? displayName : (content.displayName && content.displayName.constructor === Object ? content.displayName.en : content.displayName));
        model.fragment = ( typeLength > 0 ? content['@type'][typeLength - 1] : content['@type']);
        model.id = (content['@id'] ?  content['@id']: Math.floor(Math.random() * 1000000).toString());
        model.schema = content.schema;
        model.series = content.name;
        model.unit = content.unit;
        model.deviceId = deviceId;
        model.eventText = model.measurementName;
        model.eventType = content.name;
        model.isObjectType = (model.schema['@type'] === 'Object');
        if(model.isObjectType && model.schema.fields) {
            const fields = model.schema.fields;
            if(fields && fields.length > 0 ) {
                fields.forEach(field => {
                    const fieldModel: DtdlSimulationModel = {
                        simulationType: 'randomValue',
                        matchingValue: "default",
                        alternateConfigs: {
                            opEnabled: false,
                            opReply: false,
                            opSource: "",
                            opSourceName: "",
                            payloadFragment: "c8y_Command.text",
                            configIndex: 0,
                            operations: []
                        }            
                    };
                    fieldModel.measurementName = model.measurementName + " : " + field.displayName;
                    fieldModel.fragment = model.fragment;
                    fieldModel.id = (field['@id'] ?  field['@id']: Math.floor(Math.random() * 1000000).toString());
                    fieldModel.schema = field.schema;
                    fieldModel.series = content.name +":" + field.name;
                    fieldModel.unit = field.unit;
                    fieldModel.deviceId = deviceId;
                    fieldModel.isObjectType = false;
                    fieldModel.isFieldModel = true;
                    fieldModel.parentId = model.id;
                    fieldModel.eventText = fieldModel.measurementName;
                    fieldModel.eventType = field.name;
                    fieldModel.alternateConfigs.operations.push(cloneDeep(fieldModel));
                    this.configModel.push(fieldModel);
                });
            }
        } else  {
            this.configModel.push(model);
            this.checkAlternateConfigs(model)
            model.alternateConfigs.operations.push(cloneDeep(model));
        }
    }

    public checkAlternateConfigs(target: DtdlSimulationModel) {
        // if (!this.hasOperations(target)) {
        //     target.alternateConfigs = {
        //         opSource: "",
        //         opSourceName: "",
        //         payloadFragment: "c8y_Command.text",
        //         opReply: false,
        //         operations: [],
        //         configIndex: 0
        //     };

        //     if( !_.has(target, "matchingValue") ) {
        //         _.set(target, "matchingValue", `default`);    
        //     }

        //     target.alternateConfigs.operations.push(cloneDeep(target));
        // }
    }

    async createSimulator(selectedAsset) {
      if (selectedAsset === 'device') {
        const validJson = {"serverSide":false,"lastUpdated":"2023-11-27T09:50:15.088Z","name":"RuuviTag","started":true,"id":247803,"type":"DTDL","config":{"serverSide":false,"dtdlDeviceId":"","metadata":{"hideSimulatorName":true,"name":"DTDL","icon":"window-restore","description":"Simulate a device based on DTDL (Digital Twin Definition Language)"},"intervalInvalid":false,"matchingValue":"default","modalSize":"modal-md","interval":30,"alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"dtdlDeviceId":"","matchingValue":"default","modalSize":"modal-md","interval":30,"alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opReply":false,"opSource":""},"dtdlModelConfig":[],"deviceId":"2202"}],"opReply":false,"opSource":""},"isGroup":true,"dtdlModelConfig":[{"schema":"double","fragment":"Temperature","unit":"degreeFahrenheit","isObjectType":false,"series":"temperature","matchingValue":"default","eventText":"Temperature","simulationType":"randomValue","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"double","isObjectType":false,"maxValue":10,"simulationType":"randomValue","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"eventType":"temperature","measurementName":"Temperature","fragment":"Temperature","unit":"degreeFahrenheit","minValue":5,"series":"temperature","matchingValue":"default","eventText":"Temperature","id":"dtmi:rigado::RuuviTag:temperature;1"}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::RuuviTag:temperature;1","eventType":"temperature","measurementName":"Temperature"},{"schema":"double","fragment":"RelativeHumidity","unit":"percent","isObjectType":false,"series":"humidity","matchingValue":"default","eventText":"RelativeHumidity","simulationType":"valueSeries","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"double","isObjectType":false,"simulationType":"valueSeries","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"eventType":"humidity","measurementName":"RelativeHumidity","fragment":"RelativeHumidity","unit":"percent","series":"humidity","matchingValue":"default","eventText":"RelativeHumidity","id":"dtmi:rigado::RuuviTag:humidity;1","value":"1,2,3"}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::RuuviTag:humidity;1","eventType":"humidity","measurementName":"RelativeHumidity"},{"schema":"integer","fragment":"Pressure","unit":"kilopascal","isObjectType":false,"series":"Pressure","matchingValue":"default","eventText":"Pressure","simulationType":"randomWalk","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"integer","isObjectType":false,"maxValue":20,"simulationType":"randomWalk","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"eventType":"Pressure","measurementName":"Pressure","fragment":"Pressure","unit":"kilopascal","minValue":5,"series":"Pressure","matchingValue":"default","eventText":"Pressure","id":"dtmi:rigado::RuuviTag:Pressure;1","maxDelta":3,"startingValue":10}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::RuuviTag:Pressure;1","eventType":"Pressure","measurementName":"Pressure"},{"schema":"integer","fragment":"RSSI","unit":"","isObjectType":false,"series":"rssi","matchingValue":"default","eventText":"RSSI","simulationType":"eventCreation","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"integer","fragment":"RSSI","unit":"","isObjectType":false,"series":"rssi","matchingValue":"default","eventText":"RSSI","simulationType":"eventCreation","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::IotDevice:rssi;1","eventType":"rssi","measurementName":"RSSI"}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::IotDevice:rssi;1","eventType":"rssi","measurementName":"RSSI"},{"schema":"double","fragment":"Battery Level","unit":"volt","isObjectType":false,"series":"batteryLevel","matchingValue":"default","eventText":"Battery Level","simulationType":"positionUpdate","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[{"schema":"double","altitude":"0,0","isObjectType":false,"latitude":"100,101","simulationType":"positionUpdate","alternateConfigs":{"configIndex":0,"opSourceName":"","payloadFragment":"c8y_Command.text","operations":[],"opEnabled":false,"opReply":false,"opSource":""},"eventType":"batteryLevel","measurementName":"Battery Level","fragment":"Battery Level","unit":"volt","series":"batteryLevel","matchingValue":"default","eventText":"Battery Level","id":"dtmi:rigado::IotDevice:batteryLevel;1","longitude":"100,101"}],"opEnabled":false,"opReply":false,"opSource":""},"id":"dtmi:rigado::IotDevice:batteryLevel;1","eventType":"batteryLevel","measurementName":"Battery Level"}],"deviceName":"smartSensor","deviceId":"2202"}};
        if (validJson) {
          this.selectedStrategyFactory = this.simulationStrategiesService.strategiesByName.get(validJson.type);
          this.configFromFile = validJson.config;
          this.simulatorName = validJson.name;
        }
        this.wizard.selectStep('show-measurement');
        const metadata = this.selectedStrategyFactory.getSimulatorMetadata();
        if (metadata && metadata.name.includes('File (CSV/JSON)')) {
          this.isMSExist = await this.fileSimulatorNotificationService.verifyCSVSimulatorMicroServiceStatus();
          this.simulatorConfigService.setRunOnServer(true);
      } else { await this.verifySimulatorMicroServiceStatus(); }
      }
    }


    private async verifySimulatorMicroServiceStatus() {
      const metadata = this.selectedStrategyFactory.getSimulatorMetadata();
      this.isMSCheckSpin = true;
      const response = await this.fetchClient.fetch('service/simulator-app-builder/health');
      const data = await response.json()
      if (data && data.status && data.status === "UP") {
          this.isMSExist = true;
          this.simulatorConfigService.setRunOnServer(true);
          this.runOnServer = true;
      }
      else { this.isMSExist = false; }
      this.isMSCheckSpin = false;

      this.configWrapper.clear();

        if (metadata.configComponent != null) {
            const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(metadata.configComponent);
            const componentRef: ComponentRef<SimulationStrategyConfigComponent> = this.configWrapper.createComponent(factory);
            componentRef.instance.config = this.newConfig = {};

            if (this.configFromFile === undefined || this.configFromFile === null) {
                componentRef.instance.initializeConfig();
            } else {
                componentRef.instance.initializeConfig(this.configFromFile);
                componentRef.instance.config.deviceName = this.simulatorName;
            }

            this.newConfig = componentRef.instance.config;//TODO: needed after merge? 

            if (componentRef.instance.config.modalSize) {
                this.bsModalRef.setClass(componentRef.instance.config.modalSize);
            }
            this.newConfig.metadata = metadata;
            componentRef.instance.config.isGroup = this.isGroup;
            this.simulatorConfigService.runOnServer$.subscribe((val) => {
                componentRef.instance.config.serverSide = val;
                this.checkIntervalValidation();
            });

        }
  }

  checkIntervalValidation() {
    let serverSide;
    this.simulatorConfigService.runOnServer$.subscribe((val) => {
        serverSide = val;
        if (!serverSide && this.newConfig.interval < 30) {
            this.newConfig.intervalInvalid = true;
        } else {
            this.newConfig.intervalInvalid = false;
        }
    });
}

    }
