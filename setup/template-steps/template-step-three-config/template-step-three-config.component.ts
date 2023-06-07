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
  configStepData: any;
  dashboardConfigDetails: DashboardDetails;
  dashboardWidgets: DashboardWidgets;
  isDashboardChecked: boolean = false;
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
      }
    });
  }


  dashboardChecked (isDashboardChecked) {
    let checkboxes = document.getElementsByTagName("input");
    for (let ch = 0; ch < checkboxes.length; ch++) {
      if (checkboxes[ch].type === 'checkbox' && checkboxes[ch].checked && checkboxes[ch].parentElement.id === 'dashboard'+ch) {
        this.isDashboardChecked = true;
        break;
      } else {
        this.isDashboardChecked = false;
      }
    }
    return this.isDashboardChecked;
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

  showDashboardCatalogDialog(app) {
    this.bsModalRef = this.modalService.show(TemplateCatalogModalComponent, { backdrop: 'static', class: 'modal-lg', initialState: { app } });
    // this.bsModalRef.content.onSave.subscribe((isReloadRequired: boolean) => {
    //     if (isReloadRequired) {
    //         location.reload();
    //         if (this.defaultListView === '1') {
    //             this.prepareDashboardHierarchy(app);
    //         }
    //     }
    // });
  }
}
