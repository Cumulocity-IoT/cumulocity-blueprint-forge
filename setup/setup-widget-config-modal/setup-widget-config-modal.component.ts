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
import { Form } from "@angular/forms";
import { LoginService } from "@c8y/ngx-components";
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'setup-widget-config-modal',
    templateUrl: './setup-widget-config-modal.component.html',
    // styleUrls: [''],
})
export class SetupWidgetConfigModalComponent {

    public event: EventEmitter<any> = new EventEmitter();
    dashboardBasicConfig: any;
    config_form: Form;
    storeBasicConfig: any;
    constructor(public bsModalRef: BsModalRef, private loginService: LoginService) { }
    colorStatusClass() {
        // switch (this.message.type) {
        //     case 'danger':
        //         return 'alert-danger'
        //     case 'warning':
        //         return 'alert-warning'
        //     default:
        //         return 'alert-info'
        // }
    }

    confirm(config_form) {
        this.storeBasicConfig = JSON.parse(JSON.stringify(this.dashboardBasicConfig));
        config_form.reset();
        this.event.emit({ isConfirm: true, basicConfigParams: this.storeBasicConfig  });
        this.bsModalRef.hide();
    }

    dismiss(config_form) {
        config_form.reset();
        this.event.emit({ isConfirm: false });
        this.bsModalRef.hide();
    }

    logout() {
        this.loginService.logout();
    }
}