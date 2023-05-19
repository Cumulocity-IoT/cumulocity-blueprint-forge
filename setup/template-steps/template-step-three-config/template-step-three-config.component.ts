import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';
import { AppTemplateDetails } from '../../template-catalog-setup.model';

@Component({
  selector: 'c8y-template-step-three-config',
  templateUrl: './template-step-three-config.component.html',
  host: { class: 'd-contents' }
})
export class TemplateStepThreeConfigComponent extends TemplateSetupStep {
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,  private templateCatalogService: TemplateCatalogService ,
  ) {
    super(stepper, step, setup, appState, alert);
  }
  templateDetails: any;

  ngOnInit() {
    this.loadTemplateDetailsCatalog();
  }

  loadTemplateDetailsCatalog() {
    this.templateCatalogService.getTemplateDetailsCatalog()
            .subscribe((catalog: AppTemplateDetails) => {
                this.templateDetails = catalog;
            });  
  }
}
