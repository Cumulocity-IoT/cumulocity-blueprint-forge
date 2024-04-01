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
import { Injectable, ViewChild,
  ViewContainerRef,ComponentFactory,
  ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { SimulationStrategyConfigComponent, SimulationStrategyFactory } from '../../builder/simulator/simulation-strategy';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FileSimulatorNotificationService } from './file-simulator.service';
import { InventoryService, FetchClient, ApplicationService, IManagedObject } from '@c8y/client';
import { AppIdService } from "../app-id.service";
import { SimulatorNotificationService } from './simulatorNotification.service';
import { SimulatorManagerService } from '../../builder/simulator/mainthread/simulator-manager.service';
import { SimulatorWorkerAPI } from '../simulator/mainthread/simulator-worker-api.service';
import { SimulationStrategiesService } from "../simulator/simulation-strategies.service";
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DtdlSimulationModel } from '../../builder/simulator/simulator-config';
import * as _ from 'lodash';

@Injectable({providedIn: 'root'})
export class SimulatorConfigService extends SimulationStrategyConfigComponent {
  isCSVSimulator: boolean;  
  isMSCheckSpin: boolean;
  runOnServer: boolean;
  deviceId: string | undefined;
  isGroup: boolean = false;
  deviceName: string | undefined;
  isBlueprintSimulator: any;
  numberOfDevice: number | 0;
  configFromFile: any;

  constructor(private fileSimulatorNotificationService: FileSimulatorNotificationService,
    private fetchClient: FetchClient, private inventoryService: InventoryService,
    private appIdService: AppIdService, private appService: ApplicationService,
    private simulatorNotificationService: SimulatorNotificationService,
    private simulatorManagerService: SimulatorManagerService,
    private simSvc: SimulatorWorkerAPI,
    public simulationStrategiesService: SimulationStrategiesService,
    private resolver: ComponentFactoryResolver,
    public bsModalRef: BsModalRef
    ) {     
        super();        
  }
  
  runOnServerSource: BehaviorSubject<any> = new BehaviorSubject(null);
  runOnServer$: Observable<any> = this.runOnServerSource.asObservable();
  @ViewChild("configWrapper", { read: ViewContainerRef, static: true }) configWrapper: ViewContainerRef;

  selectedStrategyFactory: SimulationStrategyFactory;
  simulatorName: string = '';
  newConfig: any;
  isMSExist: boolean = false;
  groupName: string | undefined;
  
/*   public onSaveSimulatorService =  new BehaviorSubject<any>(undefined);
  onSaveSimulatorService$ = this.onSaveSimulatorService.asObservable(); */
  deviceType: string| undefined;
  isConfigFileError: boolean = false;
  config: DtdlSimulationModel;

  setRunOnServer(runOnServer: any) {
    this.runOnServerSource.next(runOnServer);
  }

  async saveSimulatorConfiguration(groupName, noOfDevices, simulatorConfigFileContent, isGroup) {
    this.groupName = groupName;
    this.numberOfDevice = noOfDevices;
    const metadata = this.selectedStrategyFactory.getSimulatorMetadata();
        if (metadata && metadata.name.includes('File (CSV/JSON)')) {
            this.isMSExist = await this.fileSimulatorNotificationService.verifyCSVSimulatorMicroServiceStatus();
            this.isMSCheckSpin = false;
            this.setRunOnServer(true);
            this.runOnServer = true;
        } else { await this.verifySimulatorMicroServiceStatus(); }

        // this.configWrapper.clear();

        if (metadata.configComponent != null) {
          this.newConfig = {}
            // const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(metadata.configComponent);
            // const componentRef: ComponentRef<SimulationStrategyConfigComponent> = this.configWrapper.createComponent(factory);
            // componentRef.instance.config = this.newConfig = {};

            // if (this.configFromFile === undefined || this.configFromFile === null) {
            //     componentRef.instance.initializeConfig();
            // } else {
            //     componentRef.instance.initializeConfig(this.configFromFile);
            //     componentRef.instance.config.deviceName = this.simulatorName;
            // }

            // this.newConfig = simulatorConfigFileContent;
            this.initializeConfig(simulatorConfigFileContent.config);
            this.newConfig = simulatorConfigFileContent.config;
            console.log('new config after mapping', this.newConfig);

            // if (componentRef.instance.config.modalSize) {
            //     this.bsModalRef.setClass(componentRef.instance.config.modalSize);
            // }
            this.newConfig.metadata = metadata;
            // componentRef.instance.config.isGroup = this.isGroup;
            this.runOnServer$.subscribe((val) => {
                // componentRef.instance.config.serverSide = val;
                this.checkIntervalValidation();
            });

        }

    // If Flie CSV/JSON simulator then upload binary
    let fileId = '';
  
    // get simulator Name from strategy's deviceName field
    console.log('newConfig value', this.newConfig);
    if (metadata.hideSimulatorName) {
        this.simulatorName = this.groupName;
    }
    let device;
    this.isGroup = isGroup;
    if (!this.deviceId) {
        if (this.isGroup) {
            // Create Group and Devices
            device = await this.AddGroupAndDevices();
            this.deviceName = this.groupName;
            this.deviceId = device.id;
        } else {
            // createDevice
            device = (await this.inventoryService.create({
                c8y_IsDevice: {},
                name: this.simulatorName,
                c8y_RequiredAvailability: {
                    responseInterval: 5
                },
                c8y_SupportedOperations: [
                    "c8y_Connection_status"
                ]
            })).data;
            this.deviceName = this.simulatorName;
            this.deviceId = device.id;
        }

    } else {
        // getExistingDevice
        // device = (await this.inventoryService.detail(this.deviceId)).data;
    }
    //  this.deviceId = device.id;

    const appId = this.appIdService.getCurrentAppId();
    let appServiceData;
    if (appId) {
        appServiceData = (await this.appService.detail(appId)).data;
    }
    // updateDevice
    const simulators = appServiceData.applicationBuilder.simulators || [];
    const isFirstSimulator = (simulators && simulators.length > 0 ? false: true );
    const simulatorId = Math.floor(Math.random() * 1000000);
    this.newConfig.deviceId = this.deviceId;

    
    // Added by darpan to sync device id in alternateConfigs
    if (this.newConfig.alternateConfigs && this.newConfig.alternateConfigs.operations &&
        this.newConfig.alternateConfigs.operations.length > 0) {
        this.newConfig.alternateConfigs.operations.forEach(ops => {
            ops.deviceId = this.deviceId;
        });
    }
    this.newConfig.deviceName = this.deviceName;
    this.newConfig.isGroup = this.isGroup;
    let runOnServer;
    this.runOnServer$.subscribe((val) => {
        runOnServer = val;
    });
    const newSimulatorObject = {
        id: simulatorId,
        name: this.simulatorName,
        type: metadata.name,
        config: this.newConfig,
        lastUpdated: new Date().toISOString(),
        serverSide: (runOnServer ? true : false),
        started : true
    };
    
    simulators.push(newSimulatorObject);
    appServiceData.applicationBuilder.simulators = simulators;

    await this.appService.update({
        id: appId,
        applicationBuilder: appServiceData.applicationBuilder
    } as any);
     if (runOnServer) {
        this.simulatorNotificationService.post({
            id: appId,
            name: appServiceData.name,
            tenant: (appServiceData.owner && appServiceData.owner.tenant && appServiceData.owner.tenant.id ? appServiceData.owner.tenant.id : ''),
            type: appServiceData.type,
            simulator: newSimulatorObject
        });
    }

    if(isFirstSimulator) {
        this.simulatorManagerService.initialize();
        this.simSvc.startOperationListener();
    }
    // We could just wait for them to refresh, but it's nicer to instantly refresh
    await this.simSvc.checkForSimulatorConfigChanges();
    let blueprintForgeDeviceDetails = {
        deviceId: this.newConfig.deviceId,
        deviceName: this.newConfig.deviceName,
        simulators: simulators
    }
   return (blueprintForgeDeviceDetails);
  }


  private async verifySimulatorMicroServiceStatus() {
    this.isMSCheckSpin = true;
    const response = await this.fetchClient.fetch('service/simulator-app-builder/health');
    const data = await response.json()
    if (data && data.status && data.status === "UP") {
        this.isMSExist = true;
        this.setRunOnServer(true);
        this.runOnServer = true;
    }
    else { this.isMSExist = false; }
    this.isMSCheckSpin = false;
}

private async AddGroupAndDevices() {
  let group = null;
  group = (await this.inventoryService.create({
      c8y_IsDeviceGroup: {},
      name: this.groupName,
      type: "c8y_DeviceGroup"
  })).data;
  for (let index = 0; index < this.numberOfDevice; index++) {
      const childManageObject: Partial<IManagedObject> = {
          c8y_IsDevice: {},
          type: (this.deviceType ? this.deviceType: null),
          name: this.simulatorName + '-' + (index + 1),
          c8y_RequiredAvailability: {
              responseInterval: 5
          },
          c8y_SupportedOperations: [
              "c8y_Connection_status"
          ]
      };
      console.log('group id', group.id)
      await this.inventoryService.childAssetsCreate(childManageObject, group.id);
  }
  return group;
}

processFileInput(validJson, simulatorName) {
  this.selectedStrategyFactory = this.simulationStrategiesService.strategiesByName.get(validJson.type);
          if (this.selectedStrategyFactory === undefined) {
              this.isConfigFileError = true;
          } else {
              this.configFromFile = validJson.config;
              this.simulatorName = simulatorName;
              // if (this.enableSimulator) {
              //     this.wizard.selectStep('device');
              // }
          }
}

private checkIntervalValidation() {
  let serverSide;
  this.runOnServer$.subscribe((val) => {
      serverSide = val;
      if (!serverSide && this.newConfig.interval < 30) {
          this.newConfig.intervalInvalid = true;
      } else {
          this.newConfig.intervalInvalid = false;
      }
  });
}


initializeConfig(existingConfig?: DtdlSimulationModel) {
    let c: DtdlSimulationModel = {
        deviceId: "",
        matchingValue: "default",
        interval: 30,
        alternateConfigs: undefined
    };

    this.checkAlternateConfigs(c);

    if (existingConfig) {
        c.alternateConfigs = _.cloneDeep(existingConfig.alternateConfigs);
    } else {
        let copy: DtdlSimulationModel = _.cloneDeep(c);
        copy.alternateConfigs = undefined;
        c.alternateConfigs.operations.push(copy);
    }
    this.config = c;
    this.config.modalSize = "modal-md";
    this.config.generationType = 'measurement'
    this.config.headerPresent = false;
    this.checkIntervalValidation();
}
}