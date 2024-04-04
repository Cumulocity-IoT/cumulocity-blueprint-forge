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
    Injectable, ViewChild,
    ViewContainerRef
} from '@angular/core';
import { SimulationStrategyConfigComponent, SimulationStrategyFactory } from '../../builder/simulator/simulation-strategy';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FileSimulatorNotificationService } from './file-simulator.service';
import { InventoryService, FetchClient, ApplicationService, IManagedObject } from '@c8y/client';
import { AppIdService } from "../app-id.service";
import { SimulatorNotificationService } from './simulatorNotification.service';
import { SimulatorManagerService } from '../../builder/simulator/mainthread/simulator-manager.service';
import { SimulatorWorkerAPI } from '../simulator/mainthread/simulator-worker-api.service';
import { SimulationStrategiesService } from "../simulator/simulation-strategies.service";
import { DtdlSimulationModel } from '../../builder/simulator/simulator-config';
import * as _ from 'lodash';

@Injectable({ providedIn: 'root' })
export class SimulatorConfigService extends SimulationStrategyConfigComponent {
    isCSVSimulator: boolean;
    isMSCheckSpin: boolean;
    deviceId: string | undefined;
   // isGroup: boolean = false;
    deviceName: string | undefined;
    isBlueprintSimulator: any;
    numberOfDevice: number | 0;

    constructor(private fileSimulatorNotificationService: FileSimulatorNotificationService,
        private fetchClient: FetchClient, private inventoryService: InventoryService,
        private appIdService: AppIdService, private appService: ApplicationService,
        private simulatorNotificationService: SimulatorNotificationService,
        private simulatorManagerService: SimulatorManagerService,
        private simSvc: SimulatorWorkerAPI,
        public simulationStrategiesService: SimulationStrategiesService
    ) {
        super();
    }

    runOnServerSource: BehaviorSubject<any> = new BehaviorSubject(null);
    runOnServer$: Observable<any> = this.runOnServerSource.asObservable();
 
    newConfig: any;
    isMSExist: boolean = false;
    config: DtdlSimulationModel;

    setRunOnServer(runOnServer: any) {
        this.runOnServerSource.next(runOnServer);
    }

    async generateSimulatorFromConfiguration(groupName, noOfDevices, simulatorConfigFileContent, isGroup, simName) {
        let blueprintForgeDeviceDetails = {
            deviceId: "",
            deviceName: "",
            simulators: "",
            status: 0,
            message: "Success"
        }
        let selectedStrategyFactory: SimulationStrategyFactory;
        let simulatorName = "";
        let validJson : any;
        const fileInput = JSON.stringify(simulatorConfigFileContent);
          validJson = this.isValidJson(fileInput);
        if(!validJson) {
            blueprintForgeDeviceDetails.status = -1;
            blueprintForgeDeviceDetails.message ="Invalid Simulator File format!"
            return blueprintForgeDeviceDetails;
        }
        selectedStrategyFactory = this.simulationStrategiesService.strategiesByName.get(validJson.type);
        if (selectedStrategyFactory === undefined) {
            // TODO alert service
            blueprintForgeDeviceDetails.status = -1;
            blueprintForgeDeviceDetails.message ="Invalid Simulator Configuration!"
            return blueprintForgeDeviceDetails;
        }
        if(simName) {
            simulatorName = simName
        } else {
            simulatorName = validJson.name;
        }
        this.numberOfDevice = noOfDevices;
        
        const metadata = selectedStrategyFactory.getSimulatorMetadata();
        if (metadata && metadata.name.includes('File (CSV/JSON)')) {
            this.isMSExist = await this.fileSimulatorNotificationService.verifyCSVSimulatorMicroServiceStatus();
            this.isMSCheckSpin = false;
            this.setRunOnServer(true);
        } else { await this.verifySimulatorMicroServiceStatus(); }

        if (metadata.configComponent != null) {
            this.newConfig = {}
            this.initializeConfig(simulatorConfigFileContent.config);
            this.newConfig = simulatorConfigFileContent.config;
            this.runOnServer$.subscribe((val) => {
                this.checkIntervalValidation();
            });
        }

        // get simulator Name from strategy's deviceName field
        if (metadata.hideSimulatorName) {
            simulatorName = groupName;
        }
        let device;
            if (isGroup) {
                // Create Group and Devices
                device = await this.AddGroupAndDevices(simulatorName, groupName);
                this.deviceName = groupName;
                this.deviceId = device.id;
            } else {
                // createDevice
                device = (await this.inventoryService.create({
                    c8y_IsDevice: {},
                    name: simulatorName,
                    c8y_RequiredAvailability: {
                        responseInterval: 5
                    },
                    c8y_SupportedOperations: [
                        "c8y_Connection_status"
                    ],
                    c8y_Position: {
                        "lng": 8.6512,
                        "alt": 0,
                        "lat": 49.8728
                    }
                })).data;
                this.deviceName = simulatorName;
                this.deviceId = device.id;
            }

        const appId = this.appIdService.getCurrentAppId();
        let appServiceData;
        if (appId) {
            appServiceData = (await this.appService.detail(appId)).data;
        }
        // updateDevice
        const simulators = appServiceData.applicationBuilder.simulators || [];
       // const isFirstSimulator = (simulators && simulators.length > 0 ? false : true);
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
        this.newConfig.isGroup = isGroup;
        let runOnServer;
        this.runOnServer$.subscribe((val) => {
            runOnServer = val;
        });
        this.newConfig.serverSide = (runOnServer ? true : false);

        const newSimulatorObject = {
            id: simulatorId,
            name: simulatorName,
            type: metadata.name,
            config: this.newConfig,
            lastUpdated: new Date().toISOString(),
            serverSide: (runOnServer ? true : false),
            started: true
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

        await this.simSvc.checkForSimulatorConfigChanges();
        blueprintForgeDeviceDetails = {
            deviceId: this.newConfig.deviceId,
            deviceName: this.newConfig.deviceName,
            simulators: simulators,
            status: 0,
            message: "Success"
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
        }
        else { this.isMSExist = false; }
        this.isMSCheckSpin = false;
    }

    private async AddGroupAndDevices(simulatorName: string, groupName:string, deviceType?: string) {
        let group = null;
        group = (await this.inventoryService.create({
            c8y_IsDeviceGroup: {},
            name: groupName,
            type: "c8y_DeviceGroup"
        })).data;
        for (let index = 0; index < this.numberOfDevice; index++) {
            const childManageObject: Partial<IManagedObject> = {
                c8y_IsDevice: {},
                type: (deviceType ? deviceType : null),
                name: simulatorName + '-' + (index + 1),
                c8y_RequiredAvailability: {
                    responseInterval: 5
                },
                c8y_SupportedOperations: [
                    "c8y_Connection_status"
                ],
                c8y_Position: {
                    "lng": 8.6512,
                    "alt": 0,
                    "lat": 49.8728
                }
            };
            await this.inventoryService.childAssetsCreate(childManageObject, group.id);
        }
        return group;
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

    private isValidJson(input: any) {
        try {
          if (input) {
            const o = JSON.parse(input);
            if (o && (o.constructor === Object || o.constructor === Array)) {
              console.log("o constructor value", o.constructor);
              return o;
            }
          }
        } catch (e) {}
        return false;
      }
}