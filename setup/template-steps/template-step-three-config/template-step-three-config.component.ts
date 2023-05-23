import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';

@Component({
  selector: 'c8y-template-step-three-config',
  templateUrl: './template-step-three-config.component.html',
  host: { class: 'd-contents' }
})
export class TemplateStepThreeConfigComponent extends TemplateSetupStep {
  configStepData: any;
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogService: TemplateCatalogService,
  ) {
    super(stepper, step, setup, appState, alert);
  }

  ngOnInit() {
    this.templateCatalogService.templateData.subscribe(currentData => {
      console.log('Stored template data', currentData);
      if (currentData) {
        this.configStepData = currentData;
      }
    });
  }
}
