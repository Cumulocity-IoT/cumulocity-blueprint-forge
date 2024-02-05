/*
* Copyright (c) 2024 Software AG, Darmstadt, Germany and/or its licensors
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

import { Component, Input } from "@angular/core";
import { dtdlObject, contents, displayName, dtdlModelConfig, alternateConfigs, operations, metadata, config, dtdlSimulator } from "./models/dtdlObject";
import { AlertService, NavigatorNode, } from "@c8y/ngx-components";
import { IManagedObject, IManagedObjectBinary, IResult, ISeriesFilter, InventoryBinaryService, MeasurementService, aggregationType } from "@c8y/client";
import { setTheme } from "ngx-bootstrap/utils";
import { DeviceSelectorModalService } from "./device-selector.service";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DtdlSimulatorModalComponent } from "./dtdl-simulator-modal/dtdl-simulator-modal.component";

@Component({
  selector: 'device-dtdl-generator-plugin',
  templateUrl: './gp-dtdl-generator-plugin.component.html',
  styleUrls: ['./gp-dtdl-generator-plugin.component.css']
})
export class DeviceDTDLGeneratorPluginComponent {
  dtdlCreated: boolean = false;
  simConfigCreated: boolean = false;
  isLoading:boolean=false;
  dtdlJson = '';
  simConfigJson = '';
  blob: Blob;
  public dtdlObjects: dtdlObject[] = [];
  public contents: contents[] = [];
  public type: string[] = ['Telemetry'];
  public schema: string;
  context = 'dtmi:dtdl:context;2';
  baseId = 'dtmi:softwareag:globalPresales:';
  public searchString: string;
  deviceName: string = '';
  deviceId: string = '';
  @Input() config;
  @Input() appId; //getting appID for application from the route url.
  currDate = new Date().toISOString();


  templateType: number;
  devices: IManagedObject[] = [];
  deviceSelected: IManagedObject;
  deviceChanged: boolean = false;

  bsModalRef: BsModalRef;
  mesPageLimit: number;
  /* 
    simulatorType:[
        { name:'--select type--', value:0 },
        { name:'Random value', value:1 },
        { name:'Value series', value:2 }
    ]
  */
  simulatorType: number;
  _ = require("lodash");
  dtdlModelConfig: dtdlModelConfig[] = [];
  dtdlSimulatorConfig: dtdlSimulator;
  interval: number[] = [];
  meanInterval: number = 30;

  generateSimConfigPopoverText = `
  <p>This simulator configuration file is compatible with the simulators of Application Builder and Blueprint Forge</p>
  <p>
    <b>How to use:</b>
    <ul>
      <li>Generate simulator configuration for selected device.</li>
      <li>Download the file generated.</li>
      <li>Go to simulator tab in your application.</li>
      <li>Click on add simulator, then choose <i>import existing simulator</i>.</li>
      <li>Upload the downloaded file.</li>
      <li>Enjoy configuring your simulator!</li>
    </ul>    
  </p>
    `;
  generateDTDLPopoverText = `
  <p>A Digital Twins Definition Language (DTDL) file serves as the representation of the digital twin for a physical device. If your physical device is configured in device management, a DTDL file can be generated. Additionally, this DTDL file can be employed for simulating a real device.</p>
  `;

  constructor(private modalService: BsModalService, private devicesService: DeviceSelectorModalService, private measurementService: MeasurementService, private inventoryBinaryService: InventoryBinaryService, private alertService: AlertService) {
    setTheme('bs4');
  };

  //below code is to add (months) number of months to current date (inputDate)
  getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  addMonths = (inputDate, months) => {
    const date = new Date(inputDate)
    date.setDate(1)
    date.setMonth(date.getMonth() + months)
    date.setDate(Math.min(inputDate.getDate(), this.getDaysInMonth(date.getFullYear(), date.getMonth() + 1)))
    return date
  }

  //below function to trim 'c8y_' word from measurement name and add space between words
  trimC8y(name: string): string {
    let newName = name.replace('c8y_', '');
    newName = newName.split(/(?=[A-Z])/).join(' ');
    return newName;
  }

  // below function is to get measurements for the device selected and add them as contents to dtdl
  async getMeasurements(clickedOn: string) {
    this.isLoading=true;
    this.deviceName = this.deviceSelected.name;
    this.dtdlCreated = false;
    this.simConfigCreated = false;
    let sixMonthsPrior = this.addMonths(new Date(this.currDate), -6).toISOString();
    const filter: ISeriesFilter = {
      dateFrom: sixMonthsPrior,
      dateTo: this.currDate,
      source: this.deviceId
    };
    let messurements = await this.measurementService.listSeries(filter);
    if (clickedOn == 'Generate DTDL')
      this.generateContentsForDTDL(messurements);
    else if (clickedOn == 'Generate simulator')
      this.showDtdlSimulatorModal(messurements);
  }

  async generateDTDLSimulator(series) {
    if (series && series.length > 0) {
      this.dtdlModelConfig = [];
      this.interval = [];
      this.listMeasurement(series);
    }
  }

  generateContentsForDTDL(messurements: any) {
    this.contents = [];
    if (messurements.data && messurements.data.series && messurements.data.series.length > 0) {
      messurements.data.series.forEach((series, index) => {
        this.type.push(series.type);
        let displayName: displayName = {};
        if (series.type.indexOf('c8y_') >= 0) {
          let disName = this.trimC8y(series.type);
          displayName.en = disName;
        }
        else {
          displayName.en = series.type;
        }
        let content: contents = {
          "@id": this.baseId + this.deviceName + ':' + series.type + ';1',
          "@type": this.type,
          displayName: displayName,
          name: series.name,
          schema: 'double',
          unit: series.unit
        }
        this.contents.push(content);
        this.type = ['Telemetry'];
      });
    }
    this.generateDtdl();
  }

  //below functions runs after getting measurmenets as contents to create the desired dtdl file.
  generateDtdl() {
    this.dtdlObjects = [];
    let displayName: displayName = {
      en: this.deviceName
    };
    let dtdl: dtdlObject = {
      '@context': this.context,
      '@id': this.baseId + this.deviceName + ';1',
      '@type': 'Interface',
      contents: this.contents,
      displayName: displayName
    };
    this.dtdlObjects.push(dtdl);
    this.dtdlJson = JSON.stringify(this.dtdlObjects, null, 2);
    this.blob = new Blob([this.dtdlJson], { type: 'application/json' });
    this.dtdlCreated = true;
    this.deviceChanged = false;
    this.isLoading=false;
  }

  //below function is to download dtdl file created.
  download() {
    const url = URL.createObjectURL(this.blob);
    const link = document.createElement('a');
    link.href = url;
    if (this.dtdlCreated)
      link.download = `${this.deviceName}_dtdl.json`;
    else if (this.simConfigCreated)
      link.download = `${this.deviceName}_config.json`;
    link.click();
    URL.revokeObjectURL(url);
    link.remove();
  }

  //below function is to save generated file to File Repository
  async saveToFileRepository() {
    var savedId;
    if (this.dtdlCreated)
      savedId = await this.createBinary(this.blob);
    else if (this.simConfigCreated)
      savedId = await this.createBinarySimConfig(this.blob);
    if (savedId.data && savedId.data.id) {
      if (this.dtdlCreated)
        this.alertService.success(`File ${this.deviceName}_DTDL saved successfully with id:${savedId.data.id}`, `${this.deviceName}_DTDL file saved to Files Repository with id:${savedId.data.id}`);
      else if (this.simConfigCreated)
        this.alertService.success(`File ${this.deviceName}_CONFIG saved successfully with id:${savedId.data.id}`, `${this.deviceName}_CONFIG file saved to Files Repository with id:${savedId.data.id}`);
    }
    else {
      this.alertService.info("Failed to save file", `Save to File Repository failed`);
    }

  }
  public createBinary(floorMap: Blob): Promise<IResult<IManagedObjectBinary>> {
    return this.inventoryBinaryService.create(floorMap, { name: `${this.deviceName}_DTDL` });
  }
  public createBinarySimConfig(floorMap: Blob): Promise<IResult<IManagedObjectBinary>> {
    return this.inventoryBinaryService.create(floorMap, { name: `${this.deviceName}_CONFIG` });
  }

  //below function is to copy the dtdl generated as text to clipboard.
  copyInputMessage(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.alertService.success("Copied Text to clipboard");
  }

  //function calling device service to get devices for queried search string
  searchForDevice(): void {
    if (!this.searchString || this.searchString === '' || this.searchString.length == 0) {
      this.devices = [];
    }
    else if (this.searchString && this.searchString.length >= 3) {
      this.devicesService.queryDevices(this.templateType, this.searchString)
        .then(response => {
          this.devices = response.data as IManagedObject[];
        });
    }
  }

  //below function is called when a device is selected
  selectDevice(device: IManagedObject): void {
    this.deviceSelected = device;
    if (this.deviceId && this.deviceId !== this.deviceSelected.id) {
      this.deviceChanged = true;
    }
    this.deviceId = this.deviceSelected.id;
    this.searchString = this.deviceSelected.name;
    this.devices = [];
    this.dtdlObjects = [];
  }

  //below function is to clear search string for device
  clearSearch(): void {
    this.searchString = '';
    this.devices = [];
  }

  //function to apply css on selected device.
  isDeviceSelected(device: IManagedObject): boolean {
    return this.deviceSelected && this.deviceSelected.id === device.id;
  }

  showDtdlSimulatorModal(messurements) {
    this.bsModalRef = this.modalService.show(DtdlSimulatorModalComponent, { backdrop: 'static', class: 'modal-sm', initialState: {messurements} });
    this.bsModalRef.content.onGenerate.subscribe((response) => {
      this.mesPageLimit = response.pageSize;
      this.simulatorType = response.typeSelected;
      if(this.simulatorType==1 || this.simulatorType==2)
        this.generateDTDLSimulator(response.selectedMeasurements);
    });
    this.bsModalRef.content.onCancel.subscribe((canceled)=>{
      this.isLoading=false;
    })
  }

  async listMeasurement(selectedMeasurements) {
    for (let series of selectedMeasurements) {
      let sixMonthsPrior = this.addMonths(new Date(this.currDate), -6).toISOString();
      const msmtFilter = {
        pageSize: this.mesPageLimit,
        valueFragmentSeries: series.name,
        valueFragmentType: series.type,
        dateFrom: sixMonthsPrior,
        dateTo: this.currDate,
        revert: true,
        source: this.deviceId
      };

      let mesListResponse = (await (this.measurementService.list(msmtFilter)));
      let unit= mesListResponse.data[0][series.type][series.name].unit;
      let times = mesListResponse.data.map((element) => element.time);

      //getting max and min value for the measurement
      let values = mesListResponse.data.map((element) => element[series.type][series.name].value);
      values=values.reverse();
      let minValue = this._.min(values);
      let maxValue = this._.max(values);
      let simulationType = this.simulatorType==1 ? "randomValue" : "valueSeries";
      let value:string=values.join(',');
      this.pushToInterval(times);

      //getting eventText for measurement
      let measName = series.type;
      if (series.type.indexOf('c8y_') >= 0) {
        let disName = this.trimC8y(series.type);
        measName = disName;
      }

      //generating operations for measurement
      let operations: operations = {
        schema: "double",
        isObjectType: false,
        // maxValue: maxValue,
        simulationType: simulationType,
        alternateConfigs: {
          configIndex: 0,
          opSourceName: "",
          payloadFragment: "c8y_Command.text",
          operations: [],
          opEnabled: false,
          opReply: false,
          opSource: ""
        },
        eventType: series.name,
        measurementName: measName,
        fragment: series.type,
        unit: unit,
        // minValue: minValue,
        series: series.name,
        matchingValue: "default",
        eventText: measName,
        id: this.baseId + this.deviceName + ':' + series.type + ';1'
      }

      if(this.simulatorType==1){
        operations.minValue=minValue;
        operations.maxValue=maxValue;
      }
      else if(this.simulatorType==2){
        operations.value=value;
      }

      //generating alternateConfigs for measurement
      let alternateConfigs: alternateConfigs = {
        configIndex: 0,
        opSourceName: "",
        payloadFragment: "c8y_Command.text",
        operations: [operations],
        opEnabled: false,
        opReply: false,
        opSource: ""
      }

      //generating dtdlModelConfig for the measurement
      let dtdlModelConfig: dtdlModelConfig = {
        schema: "double",
        fragment: series.type,
        unit: unit,
        isObjectType: false,
        series: series.name,
        matchingValue: "default",
        eventText: measName,
        simulationType: simulationType,
        alternateConfigs: alternateConfigs,
        id: this.baseId + this.deviceName + ':' + series.type + ';1',
        eventType: series.name,
        measurementName: measName
      }

      this.dtdlModelConfig.push(dtdlModelConfig);
    }
    this.generateSimConfig();
  }

  pushToInterval(times) {
    let n = times.length;
    if (n > 5) {
      n = 5
    }
    //creating array for intervals of size 5, then getting it's mean to get final interval.
    let intervales: number[] = [];
    for (let i = 0, j = 1; i < n; i++, j++) {
      intervales.push((new Date(times[i])).valueOf() - (new Date(times[j])).valueOf());
    }
    let int: number = (this._.round(this._.mean(intervales), -3) / 1000);
    this.interval.push(int);
  }

  generateSimConfig(): void {
    let now = new Date();
    let nowTime = now.getTime();

    let metadata: metadata = {
      hideSimulatorName: true,
      name: "DTDL",
      icon: "window-restore",
      description: "Simulate a device based on DTDL (Digital Twin Definition Language)"
    }
    this.meanInterval = this._.mean(this.interval);
    if(this.meanInterval < 30){
      this.meanInterval=30;
    }
    let config: config = {
      serverSide: false,
      dtdlDeviceId: "",
      metadata: metadata,
      intervalInvalid: false,
      matchingValue: "default",
      modalSize: "modal-md",
      interval: this.meanInterval,          
      alternateConfigs: {
        configIndex: 0,
        opSourceName: "",
        payloadFragment: "c8y_Command.text",
        operations: [
          {
            dtdlDeviceId: "",
            matchingValue: "default",
            modalSize: "modal-md",
            interval: this.meanInterval,          
            alternateConfigs: {
              configIndex: 0,
              opSourceName: "",
              payloadFragment: "c8y_Command.text",
              operations: [],
              opReply: false,
              opSource: ""
            },
            dtdlModelConfig: [],
            deviceId: ""
          }
        ],
        opReply: false,
        opSource: ""
      },
      isGroup: false,
      dtdlModelConfig: this.dtdlModelConfig,
      deviceName: this.deviceName,
      deviceId: ""
    }
    this.dtdlSimulatorConfig = {
      serverSide: false,
      lastUpdated: now.toISOString(),
      name: this.deviceName,
      id: nowTime,
      type: "DTDL",
      config: config
    }
    this.simConfigJson = JSON.stringify(this.dtdlSimulatorConfig, null, 2);
    this.blob = new Blob([this.simConfigJson], { type: 'application/json' });
    this.simConfigCreated = true;
    this.deviceChanged = false;
    this.isLoading=false;
  }
}