/*
* Copyright (c) 2019 Software AG, Darmstadt, Germany and/or its licensors
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
import { AlertService, AppStateService } from "@c8y/ngx-components";
import * as delay from "delay";
import { ApplicationService, IApplication } from "@c8y/client";
import { UpdateableAlert } from "./../builder/utils/UpdateableAlert";
import { contextPathFromURL } from "./../builder/utils/contextPathFromURL";

@Component({
    selector: 'blueprint-forge-app-config',
    templateUrl: './app-config.component.html',
    styleUrls: ['./app-config.component.less']
})
export class AppConfigComponent {
    
    @Input() appName: string;
    @Input() appContextPath: string;
    @Input() appIcon: string;
    @Input() reload: boolean;
    @Input() app: IApplication
    constructor(private alertService: AlertService, private appStateService: AppStateService,
        private appService: ApplicationService ) {
    }


    async saveAppChanges(app) {
        const savingAlert = new UpdateableAlert(this.alertService);
        savingAlert.update('Saving application...');
        try {
            app.name = this.appName;
            app.applicationBuilder.icon = this.appIcon;
            app.icon = {
                name: this.appIcon,
                "class": `fa fa-${this.appIcon}`
            };

            const update: any = {
                id: app.id,
                name: app.name,
                key: `${this.appContextPath}-app-key`,
                applicationBuilder: app.applicationBuilder,
                icon: app.icon
            };

            let contextPathUpdated = false;
            const currentAppContextPath = app.contextPath;
            if (app.contextPath && app.contextPath != this.appContextPath) {
                app.contextPath = this.appContextPath;
                update.contextPath = this.appContextPath;
                contextPathUpdated = true;
            }

            let appManifest: any = app.manifest;
            if (appManifest) {
                appManifest.contextPath = app.contextPath;
                appManifest.key = update.key;
                appManifest.icon = app.icon;
                appManifest.name = app.name;
                update.manifest = appManifest;
            }
            await this.appService.update(update);
            // update manifest
           /*  await this.appService.storeAppManifest(app.id, {
                ...appManifest
            }); */
            if (contextPathUpdated && contextPathFromURL() === currentAppContextPath) {
                savingAlert.update('Saving application...\nWaiting for redeploy...');
                // Pause while c8y server reloads the application
                await delay(5000);
                window.location = `/apps/${this.appContextPath}/${window.location.hash}` as any;
            }

            savingAlert.update('Application saved!', 'success');
            savingAlert.close(1500);
            if(this.reload) { location.reload();}
        } catch (e) {
            savingAlert.update('Unable to save!\nCheck browser console for details', 'danger');
            throw e;
        }

        // Refresh the application name/icon
    //    this.brandingService.updateStyleForApp(app);
        // Refresh the applications list
        this.appStateService.currentUser.next(this.appStateService.currentUser.value);
    }
}