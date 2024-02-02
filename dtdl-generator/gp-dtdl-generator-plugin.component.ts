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

import {Component, Input} from "@angular/core";
import { contents } from "./models/contents";
import { dtdlObject } from "./models/dtdlObject";
import { displayName } from "./models/displayName";
import { AlertService,NavigatorNode,} from "@c8y/ngx-components";
import { IManagedObject, IManagedObjectBinary, IResult, InventoryBinaryService, MeasurementService } from "@c8y/client";
import { setTheme } from "ngx-bootstrap/utils";
import { DeviceSelectorModalService } from "./device-selector.service";

@Component({
  selector: 'device-dtdl-generator-plugin',
  templateUrl: './gp-dtdl-generator-plugin.component.html',
  styleUrls: ['./gp-dtdl-generator-plugin.component.css']
})
export class DeviceDTDLGeneratorPluginComponent {
  dtdlCreated:boolean=false;
  dtdlJson='';
  blob:Blob;
  public dtdlObjects:dtdlObject[]=[];
  public contents:contents[]=[];
  public type:string[]=['Telemetry'];
  public schema:string;
  context='dtmi:dtdl:context;2';
  baseId='dtmi:softwareag:globalPresales:';
  public searchString:string;
  deviceName: string = '';
  deviceId: string = '';
  @Input() config;
  @Input() appId; //getting appID for application from the route url.
  

  templateType: number;
  devices: IManagedObject[] = [];
  deviceSelected: IManagedObject;
  deviceChanged:boolean =false;
  
  constructor(private devicesService: DeviceSelectorModalService,private measurementService:MeasurementService, private inventoryBinaryService:InventoryBinaryService, private alertService:AlertService){
    setTheme('bs4');
  };

  //below code is to add (months) number of months to current date (inputDate)
  getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  addMonths = (inputDate, months) => {
    const date = new Date(inputDate)
    date.setDate(1)
    date.setMonth(date.getMonth() + months)
    date.setDate(Math.min(inputDate.getDate(), this.getDaysInMonth(date.getFullYear(), date.getMonth()+1)))
    return date
  }

  //below function to trim 'c8y_' word from measurement name and add space between words
  trimC8y(name:string): string{
    let newName=name.replace('c8y_','');
    newName=newName.split(/(?=[A-Z])/).join(' ');
    return newName;
  }

  // below function is to get measurements for the device selected and add them as contents to dtdl
  async getMeasurements(){
    this.deviceName=this.deviceSelected.name;
    this.dtdlCreated=false;
    this.contents=[];
    let currDate= new Date().toISOString();
    let sixMonthsPrior=this.addMonths(new Date(currDate),-6).toISOString();
    const filter = {
          dateFrom: sixMonthsPrior,
          dateTo: currDate,
          source: this.deviceId
        };
    let messurements= await this.measurementService.listSeries(filter);
    if(messurements.data && messurements.data.series && messurements.data.series.length>0){
      messurements.data.series.forEach((series,index)=>{
        this.type.push(series.type);
        let displayName:displayName={};
        if(series.type.indexOf('c8y_')>=0){
          let disName=this.trimC8y(series.type);
          displayName.en=disName;
        }
        else{
          displayName.en=series.type;
        }
        let content : contents={
          "@id":this.baseId+this.deviceName+':'+series.type+';1',
          "@type":this.type,
          displayName:displayName,
          name:series.name,
          schema:'double',
          unit:series.unit
        }
        this.contents.push(content);
        this.type=['Telemetry'];
      });
    }
    this.generateDtdl();
  }

  //below functions runs after getting measurmenets as contents to create the desired dtdl file.
  generateDtdl(){
    this.dtdlObjects=[];
    let displayName:displayName={
      en: this.deviceName
    };
    let dtdl:dtdlObject={
      '@context': this.context,
      '@id': this.baseId+this.deviceName+';1',
      '@type':'Interface',
      contents:this.contents,
      displayName : displayName
    };
    this.dtdlObjects.push(dtdl);
    this.dtdlCreated=true;
    this.deviceChanged=false;
    this.dtdlJson = JSON.stringify(this.dtdlObjects, null, 2);
    this.blob = new Blob([this.dtdlJson], { type: 'application/json' });
  }

  //below function is to download dtdl file created.
  download(){
    const url = URL.createObjectURL(this.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.deviceName}.json`;
    link.click();
    URL.revokeObjectURL(url);
    link.remove();
  }

  //below function is to save generated file to File Repository
  async saveToFileRepository(){
    let savedId= await this.createBinary(this.blob);
    if(savedId.data && savedId.data.id){
      this.alertService.success(`File ${this.deviceName}_DTDL saved successfully with id:${savedId.data.id}`,`${this.deviceName}_DTDL file saved to Files Repository with id:${savedId.data.id}`);
    }
    else{
      this.alertService.info("Failed to save file",`Save to File Repository failed`);
    }
    
  }
  public createBinary(floorMap:Blob): Promise<IResult<IManagedObjectBinary>> {
    return this.inventoryBinaryService.create(floorMap,{name:`${this.deviceName}_DTDL`});
  }

  //below function is to copy the dtdl generated as text to clipboard.
  copyInputMessage(inputElement){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.alertService.success("Copied DTDL to clipboard");
  }

  //function calling device service to get devices for queried search string
  searchForDevice(): void {
    if(!this.searchString || this.searchString==='' || this.searchString.length==0){
      this.devices=[];
    }
    else if(this.searchString && this.searchString.length>=3){
      this.devicesService.queryDevices(this.templateType, this.searchString )
        .then(response => {
          this.devices = response.data as IManagedObject[];
        });
    }
  }

  //below function is called when a device is selected
  selectDevice(device: IManagedObject): void {
    this.deviceSelected = device;
    if(this.deviceId && this.deviceId!== this.deviceSelected.id){
      this.deviceChanged=true;
    }
    this.deviceId=this.deviceSelected.id;
    this.searchString=this.deviceSelected.name;
    this.devices=[];
    this.dtdlObjects=[];
  }
  
  //below function is to clear search string for device
  clearSearch(): void {
    this.searchString = '';
    this.devices=[];
  }

  //function to apply css on selected device.
  isDeviceSelected(device: IManagedObject): boolean {
    return this.deviceSelected && this.deviceSelected.id === device.id;
  }

}