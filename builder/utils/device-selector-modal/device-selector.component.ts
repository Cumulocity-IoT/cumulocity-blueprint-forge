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
import { Component, OnInit } from "@angular/core";
import { InventoryService, IManagedObject } from '@c8y/client';
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { DeviceSelectorModalService } from "./device-selector.service";

@Component({
    selector: 'device-selector-modal',
    templateUrl: './device-selector.template.html',
    styleUrls: ['styles.less']
})
export class DeviceSelectorModalComponent implements OnInit {

    public onDeviceSelected: Subject<IManagedObject>;

    searchString: string;

    devices: IManagedObject[] = [];

    deviceSelected: IManagedObject;

    constructor(private modalRef: BsModalRef, private devicesService: DeviceSelectorModalService) { }

    ngOnInit(): void {
        this.onDeviceSelected = new Subject();
        this.loadDevices();
    }

    loadDevices() {
        this.devicesService.queryDevices()
            .then(response => {
                this.devices = response.data as IManagedObject[];
            });
    }

    searchForDevice(): void {
        this.devicesService.queryDevices(this.searchString)
            .then(response => {
                this.devices = response.data as IManagedObject[];
            });
    }

    clearSearch(): void {
        this.searchString = '';
        this.loadDevices();
    }

    selectDevice(device: IManagedObject): void {
        this.deviceSelected = device;
    }

    isDeviceSelected(device: IManagedObject): boolean {
        return this.deviceSelected && this.deviceSelected.id === device.id;
    }

    isSelectButtonEnabled() {
        return this.deviceSelected;
    }

    closeDialog(): void {
        this.modalRef.hide();
    }

    onSelectButtonClicked(): void {
        this.onDeviceSelected.next(this.deviceSelected);
        this.closeDialog();
    }
}