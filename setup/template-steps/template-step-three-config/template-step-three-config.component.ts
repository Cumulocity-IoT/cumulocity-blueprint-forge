import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { AppTemplateDetails, DashboardDetails, DashboardWidgets } from '../../template-catalog-setup.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TemplateCatalogModalComponent } from '../../../builder/template-catalog/template-catalog.component';
import { Observable, from, Subject, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, first, map, switchMap, tap } from "rxjs/operators";
import { AppIdService } from '../../../builder/app-id.service';
import { ApplicationService, IApplication } from '@c8y/client';
import { AppDataService } from '../../../builder/app-data.service';

@Component({
  selector: 'c8y-template-step-three-config',
  templateUrl: './template-step-three-config.component.html',
  host: { class: 'd-contents' }
})
export class TemplateStepThreeConfigComponent extends TemplateSetupStep {
  configStepData: AppTemplateDetails;
  dashboardWidgets: DashboardWidgets;
  bsModalRef: BsModalRef;

  newAppName: string;
    newAppContextPath: string;
    newAppIcon: string;
    isChecked: boolean = true;
    app: Observable<any>;
    refreshApp = new BehaviorSubject<void>(undefined);
  
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogService: TemplateCatalogService,
    private alertService: AlertService,
    private modalService: BsModalService,
    private appIdService: AppIdService, private appService: ApplicationService, 
    private appDataService: AppDataService,
  ) {
    super(stepper, step, setup, appState, alert);

    this.app = combineLatest([appIdService.appIdDelayedUntilAfterLogin$, this.refreshApp]).pipe(
      map(([appId]) => appId),
      switchMap(appId => from(
          this.appDataService.getAppDetails(appId)
      )),
      tap((app: IApplication & { applicationBuilder: any }) => { // TODO: do this a nicer way....
          this.newAppName = app.name;
          this.newAppContextPath = app.contextPath;
          this.newAppIcon = app.applicationBuilder.icon;
      })
  );
  }

  ngOnInit() {
    this.templateCatalogService.templateData.subscribe(currentData => {
      console.log('Stored template data', currentData);
      if (currentData) {
        this.configStepData = currentData;
        this.configStepData.dashboards.map(item =>  item.isChecked = true);
      }
    });
  }

  syncDashboardFlag(event, index) {
    this.configStepData.dashboards[index].isChecked = event.target.checked;
  }

  //TODO: Refector // SaveInstall()
  saveandInstall () {
    console.log('Config step data value while saving', this.configStepData);
    if (this.configStepData && this.configStepData.dashboards) {
      for (let i = 0; i < this.configStepData.dashboards.length; i++) {
        if (this.configStepData.dashboards[i].isChecked) {
          this.loadDashboardDetails(this.configStepData.dashboards[i].dashboard);
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

 // TODO: Phase II
  // showDashboardCatalogDialog(app: any, dashboard: DashboardDetails) {
  //   this.bsModalRef = this.modalService.show(TemplateCatalogModalComponent, { backdrop: 'static', class: 'modal-lg', initialState: { app, dashboard} });
  //   this.bsModalRef.content.onCancel.subscribe((flag: boolean) => {
  //     dashboard.selected = false;
  //   });
  //   this.bsModalRef.content.onSave.subscribe((flag: boolean) => {
  //     dashboard.selected = false;
  //     dashboard.configured = true;
  //   });
  // }
}
