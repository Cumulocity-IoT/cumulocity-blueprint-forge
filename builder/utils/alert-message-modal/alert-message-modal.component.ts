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
import { Component, EventEmitter, ViewEncapsulation } from "@angular/core";
import { LoginService } from "@c8y/ngx-components";
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'alert-message-modal',
    templateUrl: './alert-message-modal.component.html',
    // styleUrls: [''],
})
export class AlertMessageModalComponent {

    message: any;
    public event: EventEmitter<any> = new EventEmitter();
    constructor(public bsModalRef: BsModalRef, private loginService: LoginService) { }
    colorStatusClass() {
        switch (this.message.type) {
            case 'danger':
                return 'alert-danger'
            case 'warning':
                return 'alert-warning'
            default:
                return 'alert-info'
        }
    }

    confirm() {
        this.event.emit({ isConfirm: true });
        this.bsModalRef.hide();
    }

    dismiss() {
        this.event.emit({ isConfirm: false });
        this.bsModalRef.hide();
    }

    logout() {
        this.loginService.logout();
    }
}