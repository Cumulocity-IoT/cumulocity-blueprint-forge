import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TemplateCatalogModalComponent } from '../../../builder/template-catalog/template-catalog.component';
import { Observable, from, Subject, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, first, map, switchMap, tap } from "rxjs/operators";
import { AppIdService } from '../../../builder/app-id.service';
import { ApplicationService, IApplication } from '@c8y/client';
import { AppDataService } from '../../../builder/app-data.service';
import { ProgressIndicatorModalComponent } from '../../../builder/utils/progress-indicator-modal/progress-indicator-modal.component';
import { ProgressIndicatorService } from '../../../builder/utils/progress-indicator-modal/progress-indicator.service';
import { WidgetCatalogService } from '../../../builder/widget-catalog/widget-catalog.service';
import { Dashboards } from './../../template-setup.model';

@Component({
  selector: 'c8y-template-step-three-config',
  templateUrl: './template-step-three-config.component.html',
  host: { class: 'd-contents' }
})
export class TemplateStepThreeConfigComponent extends TemplateSetupStep {
  configStepData: any;
  //dashboardWidgets: DashboardWidgets;
  isDashboardChecked: boolean = false;
  bsModalRef: BsModalRef;
  private progressModal: BsModalRef;

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
    private appDataService: AppDataService, private widgetCatalogService: WidgetCatalogService,
    private progressIndicatorService: ProgressIndicatorService,
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

  //TODO: Refector
  /* dashboardChecked (isDashboardChecked) {
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
 */

  //TODO: Refector // SaveInstall()
  addCheckedDashboards () {
    if (this.configStepData && this.configStepData.dashboards) {

      var checkboxes = document.getElementsByTagName("input");
      for (let i = 0; i < this.configStepData.dashboards.length; i++) {
        if (checkboxes[i].type === 'checkbox' && checkboxes[i].checked) {
      //  this.loadDashboardDetails(this.configStepData.dashboards[i].config);
        }
      }
    }
    this.next();
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

    const currentHost = window.location.host.split(':')[0];
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        this.alertService.warning("Installation isn't supported when running Application on localhost.");
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
    
    for (let plugin of this.configStepData.plugins) {
      this.progressIndicatorService.setMessage(`Installing ${plugin.title}`);
      this.progressIndicatorService.setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.progressIndicatorService.setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.progressIndicatorService.setProgress(90);
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    await new Promise(resolve => setTimeout(resolve, 3000));
    for (let ms of this.configStepData.microservices) {
      this.progressIndicatorService.setMessage(`Installing ${ms.title}`);
      this.progressIndicatorService.setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.progressIndicatorService.setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.progressIndicatorService.setProgress(90);
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    await new Promise(resolve => setTimeout(resolve, 3000));
    for (let db of this.configStepData.dashboards) {
      this.progressIndicatorService.setMessage(`Installing ${db.name}`);
      this.progressIndicatorService.setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.progressIndicatorService.setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 3000));
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

  /* async installDependency(dependency: DependencyDescription): Promise<void> {
    
    if (dependency.type === "plugin") {
        const widgetBinaryFound = this.appList.find(app => app.manifest?.isPackage && (app.name.toLowerCase() === dependency.title?.toLowerCase() ||
            (app.contextPath && app.contextPath?.toLowerCase() === dependency?.contextPath?.toLowerCase())));
        this.showProgressModalDialog(`Installing ${dependency.title}`);
        this.progressIndicatorService.setProgress(10);
        if (widgetBinaryFound) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.progressIndicatorService.setProgress(30);
            this.widgetCatalogService.updateRemotesInCumulocityJson(widgetBinaryFound).then(async () => {
                dependency.isInstalled = true;
                this.isReloadRequired = true;
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.hideProgressModalDialog();
            }, error => {
                this.alertService.danger("There is some technical error! Please try after sometime.");
                console.error(error);
            });
        } else {
            this.progressIndicatorService.setProgress(10);
            this.catalogService.downloadBinary(dependency.link)
                .subscribe(data => {
                    this.progressIndicatorService.setProgress(20);
                    const blob = new Blob([data], {
                        type: 'application/zip'
                    });
                    const fileName = dependency.link.replace(/^.*[\\\/]/, '');
                    const fileOfBlob = new File([blob], fileName);
                    this.widgetCatalogService.installPackage(fileOfBlob).then(async () => {
                        dependency.isInstalled = true;
                        this.isReloadRequired = true;
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        this.hideProgressModalDialog();
                    }, error => {
                        this.alertService.danger("There is some technical error! Please try after sometime.");
                        console.error(error);
                    });
                });
        }
    } else { // installing microservice
        this.showProgressModalDialog(`Downloading ${dependency.title}`);
        this.progressIndicatorService.setProgress(10);
        await new Promise(resolve => setTimeout(resolve, 1000));
        let counter = 10;
        this.microserviceDownloadProgress$ = this.microserviceDownloadProgress.subscribe(async val => {
            counter++;
            if (counter <= 40) {
                this.progressIndicatorService.setProgress(counter);
            }
        });
        this.catalogService.downloadBinary(dependency.link)
            .subscribe(async data => {
                let createdApp = null;
                this.microserviceDownloadProgress$.unsubscribe();
                try {
                    this.progressIndicatorService.setProgress(40);
                    this.progressIndicatorService.setMessage(`Installing ${dependency.title}`);
                    const blob = new Blob([data], {
                        type: 'application/zip'
                    });
                    const fileName = dependency.link.replace(/^.*[\\\/]/, '');
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
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    this.hideProgressModalDialog();
                    dependency.isInstalled = true;
                    this.isReloadRequired = true;
                } catch (ex) {
                    this.applicationBinaryService.cancelAppCreation(createdApp);
                    createdApp = null;
                    this.alertService.danger("There is some technical error! Please try after sometime.");
                    console.error(ex.message);
                   
                }
            });
    }
} */
}
