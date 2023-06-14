import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogSetupService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TemplateCatalogModalComponent } from '../../../builder/template-catalog/template-catalog.component';
import { Observable, from, Subject, Subscription, BehaviorSubject, combineLatest, interval } from 'rxjs';
import { debounceTime, first, map, switchMap, tap } from "rxjs/operators";
import { AppIdService } from '../../../builder/app-id.service';
import { ApplicationService, IApplication } from '@c8y/client';
import { AppDataService } from '../../../builder/app-data.service';
import { ProgressIndicatorModalComponent } from '../../../builder/utils/progress-indicator-modal/progress-indicator-modal.component';
import { ProgressIndicatorService } from '../../../builder/utils/progress-indicator-modal/progress-indicator.service';
import { WidgetCatalogService } from '../../../builder/widget-catalog/widget-catalog.service';
import { DashboardWidgets, Dashboards, MicroserviceDetails, PluginDetails, TemplateBlueprintDetails, TemplateBlueprintEntry } from './../../template-setup.model';
import { ApplicationBinaryService } from '../../../builder/application-binary.service';
import { TemplateCatalogService } from '../../../builder/template-catalog/template-catalog.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'c8y-template-step-three-config',
  templateUrl: './template-step-three-config.component.html',
  host: { class: 'd-contents' }
})
export class TemplateStepThreeConfigComponent extends TemplateSetupStep {
 // dashboardWidgets: DashboardWidgets;
  private progressModal: BsModalRef;
  private appList = [];
  private microserviceDownloadProgress = interval(3000);
  private microserviceDownloadProgress$: Subscription;

  configStepData: any;
  //dashboardWidgets: DashboardWidgets;
  bsModalRef: BsModalRef;
  newAppName: string;
  newAppContextPath: string;
  newAppIcon: string;
  isChecked: boolean = true;

  app: Observable<any>;
  refreshApp = new BehaviorSubject<void>(undefined);
  currentApp: IApplication;
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogSetupService: TemplateCatalogSetupService,
    private modalService: BsModalService, private applicationBinaryService: ApplicationBinaryService,
    private appIdService: AppIdService, private appService: ApplicationService,
    private appDataService: AppDataService, private widgetCatalogService: WidgetCatalogService,
    private progressIndicatorService: ProgressIndicatorService, private catalogService: TemplateCatalogService
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
    this.app.subscribe (app => {
      this.currentApp = app;
    } );
  }

  ngOnInit() {
    this.templateCatalogSetupService.templateData.subscribe(currentData => {
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
  async saveandInstall () {
    await this.configureApp();
   /*  console.log('Config step data value while saving', this.configStepData);
    if (this.configStepData && this.configStepData.dashboards) {
      for (let i = 0; i < this.configStepData.dashboards.length; i++) {
        if (this.configStepData.dashboards[i].isChecked) {
          // this.loadDashboardDetails(this.configStepData.dashboards[i].dashboard);
        }
      }
    } */
  }


 /*  loadDashboardDetails(configURL) {
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
  } */

 // TODO: Phase II
  showDashboardCatalogDialog(app: any, dashboard: Dashboards) {
    this.bsModalRef = this.modalService.show(TemplateCatalogModalComponent, { backdrop: 'static', class: 'modal-lg', initialState: { app, dashboard} });
    this.bsModalRef.content.onCancel.subscribe((flag: boolean) => {
      dashboard.selected = false;
    });
    this.bsModalRef.content.onSave.subscribe((flag: boolean) => {
      dashboard.selected = false;
      dashboard.configured = true;
    });
  }

  showProgressModalDialog(message: string): void {
    this.progressModal = this.modalService.show(ProgressIndicatorModalComponent, { class: 'c8y-wizard', initialState: { message } });
  }

  async configureApp() {
    this.appList = (await this.appService.list({ pageSize: 2000 })).data;
    const currentHost = window.location.host.split(':')[0];
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        this.alert.warning("Installation isn't supported when running Application on localhost.");
        return;
    }
    // create Dashboard and install dependencies
    // Also connect with the devices selected
    let totalRemotes = this.configStepData.plugins.length;
    totalRemotes = totalRemotes + this.configStepData.microservices.length;
    totalRemotes = totalRemotes + this.configStepData.dashboards.length;

    const eachRemoteProgress: number = Math.floor((totalRemotes > 1 ? (90 / totalRemotes) : 0));
    let overallProgress = 0;
    this.showProgressModalDialog("Verifying plugins...")
    if (totalRemotes > 1) { this.progressIndicatorService.setOverallProgress(overallProgress) }
    this.progressIndicatorService.setOverallProgress(5);
    for (let plugin of this.configStepData.plugins) {
      await this.installPlugin(plugin);
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (let ms of this.configStepData.microservices) {
      this.progressIndicatorService.setMessage(`Installing ${ms.title}`);
      this.progressIndicatorService.setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const isInstalled = (await this.applicationBinaryService.verifyExistingMicroservices(ms.id)) as any;
      if(!isInstalled) { await this.installMicroservice(ms); }
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (let db of this.configStepData.dashboards) {
      this.progressIndicatorService.setProgress(20);
      this.progressIndicatorService.setMessage(`Installing ${db.title}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const templateDetails = await (await this.loadTemplateDetails(db)).toPromise();
      const dashboardConfiguration = {
        dashboardId: '12598412',
        dashboardName: db.title,
        dashboardIcon:  db.icon,
        deviceId: '',
        tabGroup: '',
        dashboardVisibility: '',
        roles: ''
      };
      this.progressIndicatorService.setProgress(40);
      await this.catalogService.createDashboard(this.currentApp, dashboardConfiguration, db, templateDetails);
      this.progressIndicatorService.setProgress(90);
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    this.hideProgressModalDialog();
    this.next();
  }

  hideProgressModalDialog() {
    this.progressModal.hide();
  }

  async installMicroservice(microService: MicroserviceDetails): Promise<void> {
    let counter = 10;
    this.microserviceDownloadProgress$ = this.microserviceDownloadProgress.subscribe(async val => {
      counter++;
      if (counter <= 40) {
        this.progressIndicatorService.setProgress(counter);
      }
    });
    const data = await this.templateCatalogSetupService.downloadBinary(microService.link).toPromise();
    let createdApp = null;
    this.microserviceDownloadProgress$.unsubscribe();
    try {
      this.progressIndicatorService.setProgress(40);
      this.progressIndicatorService.setMessage(`Installing ${microService.title}`);
      const blob = new Blob([data], {
        type: 'application/zip'
      });
      const fileName = microService.link.replace(/^.*[\\\/]/, '');
      const fileOfBlob = new File([blob], fileName);

      const createdApp = await this.applicationBinaryService.createAppForArchive(fileOfBlob);
      this.progressIndicatorService.setProgress(50);
      counter = 50;
      this.microserviceDownloadProgress$ = this.microserviceDownloadProgress.subscribe(async val => {
        counter++;
        if (counter <= 80) {
          this.progressIndicatorService.setProgress(counter);
        }
      });
      await this.applicationBinaryService.uploadMicroservice(fileOfBlob, createdApp);
      this.microserviceDownloadProgress$.unsubscribe();
      this.progressIndicatorService.setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (ex) {
      this.applicationBinaryService.cancelAppCreation(createdApp);
      createdApp = null;
      this.alert.danger("There is some technical error! Please try after sometime.");
      console.error(ex.message);
      /* // prepare translation of static message if it exists
      const staticErrorMessage =
          ERROR_MESSAGES[ex.message] && this.translateService.instant(ERROR_MESSAGES[ex.message]);
      // if there is no static message, use dynamic one from the exception
      this.errorMessage = staticErrorMessage ?? ex.message;
      if (!this.errorMessage && !this.uploadCanceled) {
          this.alertService.addServerFailure(ex);
      } */
    }
  }

  async installPlugin(plugin: PluginDetails): Promise<void> {

    const widgetBinaryFound = this.appList.find(app => app.manifest?.isPackage && (app.name.toLowerCase() === plugin.title?.toLowerCase() ||
      (app.contextPath && app.contextPath?.toLowerCase() === plugin?.contextPath?.toLowerCase())));
    this.progressIndicatorService.setMessage(`Installing ${plugin.title}`);
    this.progressIndicatorService.setProgress(10);
    if (widgetBinaryFound) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.progressIndicatorService.setProgress(30);
      await this.widgetCatalogService.updateRemotesInCumulocityJson(widgetBinaryFound).then(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }, error => {
        this.alert.danger("There is some technical error! Please try after sometime.");
        console.error(error);
      });
    } else {
      this.progressIndicatorService.setProgress(10);
      const data = await this.templateCatalogSetupService.downloadBinary(plugin.link).toPromise();

      this.progressIndicatorService.setProgress(20);
      const blob = new Blob([data], {
        type: 'application/zip'
      });
      const fileName = plugin.link.replace(/^.*[\\\/]/, '');
      const fileOfBlob = new File([blob], fileName);
      this.widgetCatalogService.installPackage(fileOfBlob).then(async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }, error => {
        this.alert.danger("There is some technical error! Please try after sometime.");
        console.error(error);
      });

    }

  }
  async loadTemplateDetails(db: Dashboards): Promise<Observable<any>> {
    return this.catalogService.getTemplateDetails(db.dashboard)
        .pipe(catchError(err => {
            console.log('Dashboard Catalog Details: Error in primary endpoint! using fallback...');
            return this.catalogService.getTemplateDetailsFallBack(db.dashboard);
    }));      
 }
}