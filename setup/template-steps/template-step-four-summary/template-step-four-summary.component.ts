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
