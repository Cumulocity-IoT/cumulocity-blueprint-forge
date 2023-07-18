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
import {CoreModule, HOOK_COMPONENTS} from "@c8y/ngx-components";
import {DemoWidgetConfig} from "./demo-widget-config.component";
import {DemoWidget} from "./demo-widget.component";
import {NgModule} from "@angular/core";

@NgModule({
    imports: [
        CoreModule
    ],
    declarations: [DemoWidget, DemoWidgetConfig],
    entryComponents: [DemoWidget, DemoWidgetConfig],
    providers: [{
        provide: HOOK_COMPONENTS,
        multi: true,
        useValue: {
            id: 'acme.demo.widget',
            label: 'Demo widget',
            description: 'Displays mirrored text',
            component: DemoWidget,
            configComponent: DemoWidgetConfig
        }
    }],
})
export class DemoWidgetModule {}
