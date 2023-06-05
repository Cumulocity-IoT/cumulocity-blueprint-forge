import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { AppTemplateDetails, DashboardDetails, DashboardWidgets } from '../../template-catalog-setup.model';

@Component({
  selector: 'c8y-template-step-three-config',
  templateUrl: './template-step-three-config.component.html',
  host: { class: 'd-contents' }
})
export class TemplateStepThreeConfigComponent extends TemplateSetupStep {
  configStepData: any;
  dashboardConfigDetails: DashboardDetails;
  dashboardWidgets: DashboardWidgets;
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogService: TemplateCatalogService,
    private alertService: AlertService,
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

  addCheckedDashboards () {
    if (this.configStepData && this.configStepData.dashboards) {

      var checkboxes = document.getElementsByTagName("input");
      for (let i = 0; i < this.configStepData.dashboards.length; i++) {
        if (checkboxes[i].type === 'checkbox' && checkboxes[i].checked) {
        this.loadDashboardDetails(this.configStepData.dashboards[i].config);
        }
      }
    }
    this.next();
  }
  

  loadDashboardDetails(configURL) {
    this.templateCatalogService.getDashboardDetails(configURL)
            .pipe(catchError(err => {
                console.log('Dashboard Catalog: Error in primary endpoint! using fallback...');
                return this.templateCatalogService.getDashboardDetailsFallBack(configURL)
            }))
            .subscribe((response: DashboardWidgets) => { 
                console.log('Dashboard config details', response);
                this.dashboardWidgets = response;
                this.templateCatalogService.widgetConfigDetails.next(this.dashboardWidgets);
            }, error => {
                this.alertService.danger("There is some technical error! Please try after sometime.");
            });
  }
}
