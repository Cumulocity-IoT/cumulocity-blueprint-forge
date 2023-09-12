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
import { Injectable } from "@angular/core";
import { AppStateService, C8yStepper, SetupComponent } from "@c8y/ngx-components";
import { BlueprintForge } from "./template-setup.model";
import { CdkStep } from "@angular/cdk/stepper";

@Injectable()
export class SetupConfigService{
    appConfig: any;
    stepperIndex = 0;
    constructor(protected appState: AppStateService) {
        this.appState.currentApplicationConfig.subscribe( appConfig => {
            this.appConfig = appConfig;
    })
    }
    stepCompleted(stepper: C8yStepper, step: CdkStep, setup: SetupComponent) {
        if(this.appConfig && this.appConfig.blueprintForge && this.appConfig.blueprintForge.selectedStepperIndex > 0){
            while(this.stepperIndex <= (this.appConfig.blueprintForge.selectedStepperIndex  + 1) ){
                this.stepperIndex ++;       
                setTimeout(() => {  
                  step.completed = true;
                  setup.stepCompleted(stepper.selectedIndex);
                  setup.data$.next(this.appConfig);
                  stepper.next();
                 }, 10);
              }
              return this.appConfig.blueprintForge;
        }
        return null;
        
    }
}