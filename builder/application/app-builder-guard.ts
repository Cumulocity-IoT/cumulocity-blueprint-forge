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
import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {AppStateService} from "@c8y/ngx-components";
import {ApplicationService, IApplication, UserService} from "@c8y/client";
import { filter, first } from "rxjs/operators";
import {contextPathFromURL} from "../utils/contextPathFromURL";
const packageJson = require('./../../package.json');

/**
 * Some app-builder applications hide the ability to create new applications, they do this by having a default application that is redirected to if the user tries to access the '/' path.
 */
@Injectable({ providedIn: 'root' })
export class RedirectToApp implements CanActivate {
    constructor(private appService: ApplicationService, private router: Router, private appStateService: AppStateService, 
        private userService: UserService) {}

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        // Wait for the user to log in
        await this.appStateService.currentUser
            .pipe(
                filter(user => user != undefined),
                first()
            ).toPromise();
         
        const userHasAdminRights = this.userService.hasRole(this.appStateService.currentUser.value, "ROLE_APPLICATION_MANAGEMENT_ADMIN")
        // Find the current application (The one the user has accessed: /apps/<application-context-path>)
        let appList = [];
        if(userHasAdminRights) {
            appList = (await this.appService.list({pageSize: 2000})).data;
        } else {
            appList = (await this.appService.listByUser(this.appStateService.currentUser.value, { pageSize: 2000 })).data;
        }
        
        const app = appList.find(app => app.contextPath === contextPathFromURL());

        // Find out if the current application has an applicationBuilder fragment (This is the default application config)
        if (app && (app as IApplication & {applicationBuilder?:any}).applicationBuilder) {
            // console.debug('Found a default application, loading it...');
            return this.router.parseUrl(`/application/${app.id}`);
        } else {
            const appIcon: string = 'bathtub';
            const defaultAppBuilderData = {
                applicationBuilder: {
                    version: packageJson.version,
                    branding: {
                        colors: {
                            primary: '#1776BF',
                            active: '#14629F',
                            text: '#0b385b',
                            textOnPrimary: 'white',
                            textOnActive: 'white',
                            hover: '#14629F',
                            headerBar: 'white',
                            toolBar: 'white',
                            tabBar: 'white'
                        }
                    },
                    dashboards: [],
                    simulators: [],
                    icon: appIcon
                },
                icon: {
                  //  name: this.appIcon,
                  //  "class": `fa fa-${this.appIcon}`
                },
            };
            await this.appService.update({
                id: app.id,
                ...defaultAppBuilderData
            } as any);
           // console.debug('No default application, loading the the application builder...');
           return this.router.parseUrl(`/application/${app.id}`);
        }
    }
}

