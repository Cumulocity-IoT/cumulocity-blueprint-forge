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
import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent, Widget } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { SetupConfigService } from './../../setup-config.service';

@Component({
  selector: 'c8y-template-step-four-summary',
  templateUrl: './template-step-four-summary.component.html',
  styleUrls: ['./template-step-four-summary.component.css'],
  host: { class: 'd-contents' }
})
export class TemplateStepFourSummaryComponent extends TemplateSetupStep {
  
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    protected setupConfigService: SetupConfigService
    
  ) {
    super(stepper, step, setup, appState, alert, setupConfigService);
  }

  ngOnInit() {
  
  }

  
}
