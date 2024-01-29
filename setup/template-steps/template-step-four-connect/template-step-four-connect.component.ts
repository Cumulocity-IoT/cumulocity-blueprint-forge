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
import { AfterViewInit, Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from '../../template-setup-step';
import { TemplateCatalogSetupService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TemplateCatalogModalComponent } from '../../../builder/template-catalog/template-catalog.component';
import { Observable, from, Subscription, BehaviorSubject, combineLatest, interval } from 'rxjs';
import { map, switchMap, tap } from "rxjs/operators";
import { AppIdService } from '../../../builder/app-id.service';
import { ApplicationService, IApplication, IManagedObject } from '@c8y/client';
import { AppDataService } from '../../../builder/app-data.service';
import { ProgressIndicatorModalComponent } from '../../../builder/utils/progress-indicator-modal/progress-indicator-modal.component';
import { ProgressIndicatorService } from '../../../builder/utils/progress-indicator-modal/progress-indicator.service';
import { WidgetCatalogService } from '../../../builder/widget-catalog/widget-catalog.service';
import { Dashboards, MicroserviceDetails, PluginDetails } from '../../template-setup.model';
import { ApplicationBinaryService } from '../../../builder/application-binary.service';
import { TemplateCatalogService } from '../../../builder/template-catalog/template-catalog.service';
import { DeviceSelectorModalComponent } from '../../../builder/utils/device-selector-modal/device-selector.component';

import * as delay from "delay";
import { UpdateableAlert } from "../../../builder/utils/UpdateableAlert";
import { contextPathFromURL } from "../../../builder/utils/contextPathFromURL";
import { NgForm } from '@angular/forms';
import { SetupConfigService } from '../../setup-config.service';
import { SettingsService } from '../../../builder/settings/settings.service';
import { SetupWidgetConfigModalComponent } from '../../setup-widget-config-modal/setup-widget-config-modal.component';
import { DOCUMENT } from '@angular/common';
import { BrandingService } from '../../../builder/branding/branding.service';
import { LinkSimulatorDeviceModalComponent } from '../../simulator-device-modal/link-simulator-device-modal.component';
import { NewSimulatorModalComponent } from '../../../builder/simulator-config/new-simulator-modal.component';
@Component({
  selector: 'c8y-template-step-four-connect',
  templateUrl: './template-step-four-connect.component.html',
  styleUrls: ['./template-step-four-connect.component.css'],
  host: { class: 'd-contents' }
})
export class TemplateStepFourConnectComponent extends TemplateSetupStep implements OnInit {

  templateDetails: any;
  private progressModal: BsModalRef;
  private appList = [];
  private microserviceDownloadProgress = interval(3000);
  private microserviceDownloadProgress$: Subscription;
  private groupTemplate = false;
  @ViewChild("appConfigForm", { static: false }) appConfigForm: NgForm;

  configStepData: any;
  bsModalRef: BsModalRef;
  newAppName: string;
  newAppContextPath: string;
  newAppIcon: string;

  app: Observable<any>;
  currentApp: IApplication;
  templateDetailsData: any;
  isFormValid = false;
  deviceFormValid: boolean;
  assetButtonText: String = 'Select Device';
  groupTemplateInDashboard: boolean;
  dashboardName: any;
  dashboardTemplate: any;
  templateSelected: String = 'Default Template';
  isMSEnabled: boolean = false;
  welcomeTemplateData: any;
  simulatorSelected: boolean;
  enableSimulator: boolean;
  simulatorModelContent: any;


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
    private progressIndicatorService: ProgressIndicatorService, private catalogService: TemplateCatalogService,
    @Inject(DOCUMENT) private document: Document, private brandingService: BrandingService,
    private deviceSelectorModalRef: BsModalRef, private renderer: Renderer2,
    private alertService: AlertService, private appStateService: AppStateService,
    protected setupConfigService: SetupConfigService, private settingsService: SettingsService,

  ) {

    super(stepper, step, setup, appState, alert, setupConfigService);
    this.app = this.appStateService.currentApplication.pipe(
      tap((app: IApplication & { applicationBuilder: any }) => { 
        this.newAppName = app.name;
        this.newAppContextPath = app.contextPath;
        this.newAppIcon = (app.applicationBuilder && app.applicationBuilder.icon ? app.applicationBuilder.icon: "flash");
      })
    );
    this.app.subscribe(app => {
      this.currentApp = app;
    });
  }
  ngAfterViewInit(): void {
    this.verifyStepCompleted();
  }

  ngOnInit() {
    this.enableSimulator = false;
    this.templateCatalogSetupService.templateData.subscribe(async currentData => {
      this.isFormValid = this.appConfigForm?.form.valid;
      if (currentData) {
        this.templateDetails = currentData;
      }
      // In case of no device 
      if (!(this.templateDetails?.input) || !(this.templateDetails?.input?.devices) || !(this.templateDetails?.input?.devices?.length > 0)) {
        this.deviceFormValid = true;
      } else {
        this.deviceFormValid = false;
      }
      this.appList = (await this.appService.list({ pageSize: 2000 })).data;
      this.isMSEnabled =  this.applicationBinaryService.isMicroserviceEnabled(this.appList);
    });
    this.templateCatalogSetupService.welcomeTemplateData.subscribe(welcomeTemplateData => {
      this.welcomeTemplateData = welcomeTemplateData;
    });
    
  }

  async toggleToEnableSimulator(event, dashboard, index) {
    this.simulatorSelected = true;
    this.enableSimulator = event.target.checked;
    let templateDetailsData;
    templateDetailsData = await (await this.loadTemplateDetails(dashboard.dashboard)).toPromise();
    console.log('templateDetailsData*************', templateDetailsData);
    // Need to pass Simulator config file array of object
 
    const SimultorConfigFiles = [];
    let currentSimulatorData;

    // Not able to use forEach, as it takes callback as parameter which expects to be async
    for (let i = 0; i < templateDetailsData.simulatorDTDL.length; i++) {
      currentSimulatorData = await (await this.loadTemplateDetails(templateDetailsData.simulatorDTDL[i].simulatorFile)).toPromise();
      SimultorConfigFiles.push({
          fileName: templateDetailsData.simulatorDTDL[i].simulatorFileName,
          fileContent: currentSimulatorData
      });
    }
    this.bsModalRef = this.modalService.show(NewSimulatorModalComponent, { backdrop: 'static', class: 'c8y-wizard', initialState:{appId: this.currentApp.id + "", isBlueprintSimulator: true, enableSimulator: this.enableSimulator, simulatorConfigFiles: SimultorConfigFiles, fileLength: SimultorConfigFiles.length}} );
    this.bsModalRef.content.onSave.subscribe(content => this.simulatorModelContent = content);
    dashboard.name = this.simulatorModelContent.deviceId;
      dashboard.templateType = dashboard.templateType;
      dashboard.devices = [{
        type: "Temperature Sensor",
          placeholder: "device01",
          reprensentation : {
            id: this.simulatorModelContent.deviceId,
            name: this.simulatorModelContent.deviceName
          }
      }]
    let deviceFieldNotField;
    for (let dd = 0; dd < this.templateDetails.dashboards.length; dd++) {
      if (this.templateDetails.dashboards[dd].isDeviceRequired === false ) {
        deviceFieldNotField = true;
      } 
      else if (this.templateDetails.dashboards[dd].isDeviceRequired === true && this.templateDetails.dashboards[dd].linkWithDashboard === dashboard.id) {
        this.templateDetails.dashboards[dd].devices = dashboard.devices;
         deviceFieldNotField = true;
     } else {
          deviceFieldNotField = false;
          break;
     }
    }
    this.deviceFormValid = deviceFieldNotField;
  }


  async loadTemplateDetails(dbDashboard): Promise<Observable<any>> {
    return this.catalogService.getTemplateDetails(dbDashboard)
      .pipe(catchError(err => {
        console.log('Dashboard Catalog Details: Error in primary endpoint! using fallback...');
        return this.catalogService.getTemplateDetailsFallBack(dbDashboard);
      }));
  }

// saveandInstall and its dependent functions are moved from step three
  async saveandInstall(app: any) {
      if (this.currentApp.name !== this.newAppName ||
        this.currentApp.contextPath !== this.newAppContextPath ||
        (this.currentApp.applicationBuilder && this.currentApp.applicationBuilder.icon !== this.newAppIcon)) {
        await this.saveAppChanges(app);
      }
      await this.configureApp(app);
    // if (this.appConfigForm.form.valid) {
    //   if (this.currentApp.name !== this.newAppName ||
    //     this.currentApp.contextPath !== this.newAppContextPath ||
    //     (this.currentApp.applicationBuilder && this.currentApp.applicationBuilder.icon !== this.newAppIcon)) {
    //     await this.saveAppChanges(app);
    //   }
    //   await this.configureApp(app);
    // } else {
    //   this.alert.danger("Please fill required details to proceed further.");
    //   return;
    // }
  }


  async saveAppChanges(app) {
    const savingAlert = new UpdateableAlert(this.alertService);
    savingAlert.update('Saving application...');
    try {
      app.name = this.newAppName;
      app.applicationBuilder.icon = this.newAppIcon;
      app.icon = {
        name: this.newAppIcon,
        "class": `fa fa-${this.newAppIcon}`
      };

      const update: any = {
        id: app.id,
        name: app.name,
        key: app.key,
        applicationBuilder: app.applicationBuilder,
        icon: app.icon
      };

      let contextPathUpdated = false;
      const currentAppContextPath = app.contextPath;
      if (app.contextPath && app.contextPath != this.newAppContextPath) {
        app.contextPath = this.newAppContextPath;
        update.contextPath = this.newAppContextPath;
        contextPathUpdated = true;
      }

      let appManifest: any = app.manifest;
      if (appManifest) {
        appManifest.contextPath = app.contextPath;
        appManifest.key = update.key;
        appManifest.icon = app.icon;
        appManifest.name = app.name;
        update.manifest = appManifest;
      }
      await this.appService.update(update);

      if (contextPathUpdated && contextPathFromURL() === currentAppContextPath) {
        savingAlert.update('Saving application...');
        // Pause while c8y server reloads the application
        await delay(5000);
        window.location = `/apps/${this.newAppContextPath}/${window.location.hash}` as any;
      }

      savingAlert.update('Application saved!', 'success');
      savingAlert.close(1500);
    } catch (e) {
      savingAlert.update('Unable to save!\nCheck browser console for details', 'danger');
      throw e;
    }
    this.appStateService.currentUser.next(this.appStateService.currentUser.value);
  }

  async configureApp(app: any) {
    
    const currentHost = window.location.host.split(':')[0];
    // if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    //   this.alert.warning("Installation isn't supported when running Application on localhost.");
    //   return;
    // }

    // Filter dashboards which are selected
    let configDataDashboards = this.templateDetails.dashboards.filter(item => item.selected === true);
    let configDataPlugins = this.templateDetails.plugins.filter(item => item.selected === true);
    let configDataMicroservices = this.templateDetails.microservices.filter(item => item.selected === true);

    // create Dashboard and install dependencies
    // Also connect with the devices selected
    let totalRemotes = configDataPlugins.length;
    totalRemotes = totalRemotes + configDataMicroservices.length;
    totalRemotes = totalRemotes + configDataDashboards.length;


    const eachRemoteProgress: number = Math.floor((totalRemotes > 1 ? (90 / totalRemotes) : 0));
    let overallProgress = 0;
    this.showProgressModalDialog("Verifying dependencies...")
    
    if (totalRemotes > 1) { this.progressIndicatorService.setOverallProgress(overallProgress) }
    this.progressIndicatorService.setOverallProgress(5);
    for (let plugin of configDataPlugins) {
      await this.installPlugin(plugin);
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress);
    };
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (this.isMSEnabled) {
      for (let ms of configDataMicroservices) {
        this.progressIndicatorService.setMessage(`Installing ${ms.title}`);
        this.progressIndicatorService.setProgress(10);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const isInstalled = (await this.applicationBinaryService.verifyExistingMicroservices(ms.id)) as any;
        if (!isInstalled) { await this.installMicroservice(ms); }
        overallProgress = overallProgress + eachRemoteProgress;
        this.progressIndicatorService.setOverallProgress(overallProgress)
      };
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    let dbClasses = {};
    if(app.applicationBuilder && app.applicationBuilder.selectedTheme) {
      dbClasses = {
        "dashboard-theme-branded": true
      };
    }
    for (let db of configDataDashboards) {
      this.progressIndicatorService.setProgress(20);
      this.progressIndicatorService.setMessage(`Installing ${db.title}`);
      await new Promise(resolve => setTimeout(resolve, 1000));


      // in case of multiple templates

      let templateDetailsData;
      let  dashboardTemplates;
      if (db.welcomeTemplates) {
         dashboardTemplates =  this.welcomeTemplateData.find(dashboardTemplate => dashboardTemplate.dashboardName === this.templateSelected);
          if (dashboardTemplates && this.templateSelected === 'Default Template') {
            templateDetailsData = await (await this.loadTemplateDetails(db.dashboard)).toPromise();
          } else {
            templateDetailsData = await (await this.loadTemplateDetails(dashboardTemplates.dashboard)).toPromise();
          }
      } else {
        templateDetailsData = await (await this.loadTemplateDetails(db.dashboard)).toPromise();
      }
      console.log('template details data 222222222', templateDetailsData);
      const dashboardConfiguration = {
        dashboardId: '12598412',
        dashboardName: db.title,
        dashboardIcon: db.icon,
        deviceId: '',
        tabGroup: '',
        dashboardVisibility: db.visibility,
        roles: '',
        templateType: db.templateType, // 0: default, 1: group, 2: type
        classes: dbClasses
      };

      this.progressIndicatorService.setProgress(40);
      console.log('db value', db);
      templateDetailsData.input.devices = db.devices;
      if (db.title !== 'Instruction' && db.title !== 'Welcome' && db.title !== 'Help and Support' && db.isConfigRequred) {
        templateDetailsData.widgets.forEach(widget => {
          const dbWidgetConfig = db.basicConfig.find(basicConfig => basicConfig.componentId == widget.componentId);
          if (dbWidgetConfig) {
            dbWidgetConfig.config.forEach(item => {

              // Works if widget config in global presales is not nested
              if (item.type === 'select') {
                if (widget.config && widget.config?.hasOwnProperty(item.fieldName)) {
                  widget.config[item.fieldName].push(item.name);
                }
              } else {
                if (widget.config && widget.config?.hasOwnProperty(item.fieldName)) {
                  widget.config[item.fieldName] = item.name;
                }
              }
            })
          }
        });
      }
      
      if (db.templateType && db.templateType === 1 && !db.isGroupDashboard) {
        this.groupTemplate = true;
      } else if (db.templateType && db.templateType === 2 && !db.isGroupDashboard) {
        this.groupTemplate = true;
      } else {
        this.groupTemplate = false;
      }
      console.log('template details data', this.templateDetails);
      await this.catalogService.createDashboard(this.currentApp, dashboardConfiguration, db, templateDetailsData, this.groupTemplate);
      this.progressIndicatorService.setProgress(90);
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    if (window && window['aptrinsic']) {
      window['aptrinsic']('track', 'gp_blueprint_forge_template_installed', {
        "templateName": this.templateDetails.title,
        "appName": this.currentApp.name,
        "tenantId": this.settingsService.getTenantName(),
      });
    }
    this.hideProgressModalDialog();
    this.next();
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

      const createdApp = await this.applicationBinaryService.createAppForMicroservice(fileOfBlob, microService);
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
      createdApp = null;
      this.alert.danger("There is some technical error! Please try after sometime.");
      console.error(ex.message);
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
      await this.widgetCatalogService.updateRemotesInCumulocityJson(widgetBinaryFound, true).then(async () => {
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
      await this.widgetCatalogService.installPackage(fileOfBlob).then(async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }, error => {
        this.alert.danger("There is some technical error! Please try after sometime.");
        console.error(error);
      });

    }
  }

  openDeviceSelectorDialog(dashboard, templateType: number, index) {
    this.simulatorSelected = false;
    switch (templateType) {
      case 1:
        this.assetButtonText = "Device Group";
        this.groupTemplate = true;
        break;
      case 2:
        this.assetButtonText = "Device/Asset Type";
        this.groupTemplate = true;
        break;
      default:
        this.assetButtonText = "Device/Asset";
        this.groupTemplate = false;
        break;
}
  this.deviceSelectorModalRef = this.modalService.show(DeviceSelectorModalComponent, { class: 'c8y-wizard', initialState: { templateType } });
 
  if(templateType == 2) {
    this.deviceSelectorModalRef.content.onTypeSelected.subscribe((selectedItem: IManagedObject) => {
        dashboard.name = selectedItem;
        dashboard.templateType = templateType;
        dashboard.devices = [{
          type: "Temperature Sensor",
          placeholder: "device01",
          reprensentation: {
            id: selectedItem,
            name: selectedItem
          }
        }];

        let deviceFieldNotField;
        if (!this.simulatorSelected) {
          for (let dd = 0; dd < this.templateDetails.dashboards.length; dd++) {
            if (this.templateDetails.dashboards[dd].isDeviceRequired === false) {
              deviceFieldNotField = true;
            } 
            else if (this.templateDetails.dashboards[dd].isDeviceRequired === true && this.templateDetails.dashboards[dd].linkWithDashboard === dashboard.id) {
              this.templateDetails.dashboards[dd].devices = dashboard.devices;
               deviceFieldNotField = true;
           } else {
                deviceFieldNotField = false;
                break;
           }
          }
          this.deviceFormValid = deviceFieldNotField;
        }
       
      });
    }
else {
  this.deviceSelectorModalRef.content.onDeviceSelected.subscribe((selectedItem: IManagedObject) => {
      dashboard.name = selectedItem['name'];
      dashboard.templateType = templateType;
      dashboard.devices = [{
        type: "Temperature Sensor",
          placeholder: "device01",
          reprensentation : {
            id: selectedItem.id,
            name: selectedItem['name']
          }
      }]
      
      let deviceFieldNotField;
      if (!this.simulatorSelected) {
        for (let dd = 0; dd < this.templateDetails.dashboards.length; dd++) {
          if (this.templateDetails.dashboards[dd].isDeviceRequired === false ) {
            deviceFieldNotField = true;
          } 
          else if (this.templateDetails.dashboards[dd].isDeviceRequired === true && this.templateDetails.dashboards[dd].linkWithDashboard === dashboard.id) {
            this.templateDetails.dashboards[dd].devices = dashboard.devices;
             deviceFieldNotField = true;
         } else {
              deviceFieldNotField = false;
              break;
         }
        }
        this.deviceFormValid = deviceFieldNotField;
      }
    
  });
}

 }

  hideProgressModalDialog() {
    this.progressModal.hide();
  }

  showProgressModalDialog(message: string): void {
    this.progressModal = this.modalService.show(ProgressIndicatorModalComponent, { class: 'c8y-wizard', initialState: { message } });
  }

  }
