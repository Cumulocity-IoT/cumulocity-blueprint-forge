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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
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
import { Dashboards, MicroserviceDetails, PluginDetails } from './../../template-setup.model';
import { ApplicationBinaryService } from '../../../builder/application-binary.service';
import { TemplateCatalogService } from '../../../builder/template-catalog/template-catalog.service';
import { AppBuilderExternalAssetsService } from 'app-builder-external-assets';
import { DeviceSelectorModalComponent } from './../../../builder/utils/device-selector-modal/device-selector.component';

import * as delay from "delay";
import { UpdateableAlert } from "../../../builder/utils/UpdateableAlert";
import { contextPathFromURL } from "../../../builder/utils/contextPathFromURL";
import { NgForm } from '@angular/forms';
import { SetupConfigService } from './../../setup-config.service';
import { SettingsService } from '../../../builder/settings/settings.service';
import { SetupWidgetConfigModalComponent } from '../../../setup/setup-widget-config-modal/setup-widget-config-modal.component';
@Component({
  selector: 'c8y-template-step-three-config',
  templateUrl: './template-step-three-config.component.html',
  styleUrls: ['./template-step-three-config.component.css'],
  host: { class: 'd-contents' }
})
export class TemplateStepThreeConfigComponent extends TemplateSetupStep implements OnInit, AfterViewInit{
  
 templateDetails:any;
  private progressModal: BsModalRef;
  private appList = [];
  private microserviceDownloadProgress = interval(3000);
  private microserviceDownloadProgress$: Subscription;
  private groupTemplate = false;
  @ViewChild("appConfigForm",{static: false}) appConfigForm: NgForm;

  configStepData: any;
  bsModalRef: BsModalRef;
  newAppName: string;
  newAppContextPath: string;
  newAppIcon: string;
  isChecked: boolean = true;

  app: Observable<any>;
  refreshApp = new BehaviorSubject<void>(undefined);
  currentApp: IApplication;
  templateDetailsData: any;
  isFormValid = false;
  deviceFormValid : boolean;
  assetButtonText: String = 'Device/Asset';
  groupTemplateInDashboard: boolean;

 
  // devicePopup: boolean = false;
  // typePopup: boolean  = false;
  // groupPopup: boolean = false;
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
    private externalService: AppBuilderExternalAssetsService,
    private deviceSelectorModalRef: BsModalRef,
     private alertService: AlertService, private appStateService: AppStateService,
    protected setupConfigService: SetupConfigService, private settingsService: SettingsService,
    
  ) {
    
    super(stepper, step, setup, appState, alert, setupConfigService);
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
      this.isFormValid= this.appConfigForm?.form.valid;
      if (currentData) {
        this.templateDetails = currentData;
        console.log('template details value', this.templateDetails);
      }
      // In case of no device 
      if (!(this.templateDetails?.input) || !(this.templateDetails?.input?.devices) || !(this.templateDetails?.input?.devices?.length > 0)) {
          this.deviceFormValid = true;
        } else {
          this.deviceFormValid = false;
        }
      });
  }

  ngAfterViewInit() {
    this.verifyStepCompleted();
  }
  syncDashboardFlag(event, index) {
    this.templateDetails.dashboards[index].selected = event.target.checked;
  }
  syncPluginFlag(event, index) {
    this.templateDetails.plugins[index].selected = event.target.checked;
  }
  syncMicroserviceFlag(event, index) {
    this.templateDetails.microservices[index].selected = event.target.checked;
  }

  //TODO: Refector // SaveInstall()
  async saveandInstall (app: any) {
    if(this.appConfigForm.form.valid) {
      if(this.currentApp.name !== this.newAppName || 
        this.currentApp.contextPath !== this.newAppContextPath || 
        this.currentApp.applicationBuilder.icon !== this.newAppIcon ) {
          await this.saveAppChanges(app);
        }
      await this.configureApp();
    } else {
      this.alert.danger("Please fill required details to proceed further.");
        return;
    }
  }

  showSetupConfigModal(dashboardBasicConfig): BsModalRef {
    return this.modalService.show(SetupWidgetConfigModalComponent, { class: 'c8y-wizard', initialState: { dashboardBasicConfig } });
}

async configureBasicInput(dashboard, index) {
    const basicConfigurationRef = this.showSetupConfigModal(dashboard.basicConfig);
    await basicConfigurationRef.content.event.subscribe(async data => {
      if (data && data.isConfirm) {
        console.log('Data value', data, 'dashboard value', dashboard);;
        this.templateDetails.dashboards[index].basicConfig = data.basicConfigParams;
      }
    });
  }
  
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
    // if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    //     this.alert.warning("Installation isn't supported when running Application on localhost.");
    //     return;
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
    this.showProgressModalDialog("Verifying plugins...")
    if (totalRemotes > 1) { this.progressIndicatorService.setOverallProgress(overallProgress) }
    this.progressIndicatorService.setOverallProgress(5);
    for (let plugin of configDataPlugins) {
      await this.installPlugin(plugin);
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (let ms of configDataMicroservices) {
      this.progressIndicatorService.setMessage(`Installing ${ms.title}`);
      this.progressIndicatorService.setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const isInstalled = (await this.applicationBinaryService.verifyExistingMicroservices(ms.id)) as any;
      if(!isInstalled) { await this.installMicroservice(ms); }
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (let db of configDataDashboards) {
      this.progressIndicatorService.setProgress(20);
      this.progressIndicatorService.setMessage(`Installing ${db.title}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const templateDetailsData = await (await this.loadTemplateDetails(db)).toPromise();
      
      const dashboardConfiguration = {
        dashboardId: '12598412',
        dashboardName: db.title,
        dashboardIcon:  db.icon,
        deviceId: '',
        tabGroup: '',
        dashboardVisibility: db.visibility,
        roles: '',
        templateType: db.templateType, // 0: default, 1: group, 2: type
      };
      
      this.progressIndicatorService.setProgress(40);
      templateDetailsData.input.devices = db.devices;
      if (db.title !== 'Instruction' && db.title !== 'Welcome' && db.title !== 'Help and Support' && db.isConfigRequred) {
        templateDetailsData.widgets.forEach( widget => {
          const dbWidgetConfig = db.basicConfig.find( basicConfig => basicConfig.componentId == widget.componentId);
         if(dbWidgetConfig)  {
          dbWidgetConfig.config.forEach( item  => {

            // Works if widget config in global presales is not nested
            if (item.type === 'select') {
              if(widget.config && widget.config?.hasOwnProperty(item.fieldName)){
                widget.config[item.fieldName].push(item.name);
              }
            } else  {
              if(widget.config && widget.config?.hasOwnProperty(item.fieldName)){
                widget.config[item.fieldName] = item.name;
              }
            }
          })
         }
        });
      }
      console.log('db value', db, templateDetailsData, 'this templatedetails', this.templateDetails);
      
      if (db.templateType && db.templateType === 1 && !db.isGroupDashboard) {
        this.groupTemplate = true;
      } else if (db.templateType && db.templateType === 2 && !db.isGroupDashboard) {
        this.groupTemplate = true;
      } else {
        this.groupTemplate = false;
      }

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

async loadTemplateDetails(db: Dashboards): Promise<Observable<any>> {
  return this.catalogService.getTemplateDetails(db.dashboard)
      .pipe(catchError(err => {
          console.log('Dashboard Catalog Details: Error in primary endpoint! using fallback...');
          return this.catalogService.getTemplateDetailsFallBack(db.dashboard);
  }));      
}

 openDeviceSelectorDialog(dashboard, templateType: number, index) {
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
      console.log('selected value on type', selectedItem);
        dashboard.name = selectedItem;
        dashboard.templateType = templateType;
        dashboard.devices = [{
          type: "Temperature Sensor",
            placeholder: "device01",
            reprensentation : {
              id: selectedItem,
              name: selectedItem
            }
        }]


        let deviceFieldNotField;
        for (let dd = 0; dd < this.templateDetails.dashboards.length; dd++) {
          if (this.templateDetails.dashboards[dd].isDeviceRequired === false ) {
            deviceFieldNotField = true;
            
          } else if (this.templateDetails.dashboards[dd].isDeviceRequired === true ) 
           if(this.templateDetails.dashboards[dd].devices && this.templateDetails.dashboards[dd].devices[0] && this.templateDetails.dashboards[dd].devices[0]?.reprensentation.id !== null && this.templateDetails.dashboards[dd].devices[0]?.reprensentation.id !== undefined) {
            deviceFieldNotField = true;
          } else {
            deviceFieldNotField = false;
            break;
          }
        }
    
        this.deviceFormValid = deviceFieldNotField;
            
         
        

      });
    }
        
     
        
        // if (dashboard.devices && dashboard.devices[0].reprensentation.id !== null && dashboard.devices[0].reprensentation.id !== undefined ) {
        //   this.deviceFormValid = true;
        // } else {
        //   this.deviceFormValid = false;
        // }
    
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
    for (let dd = 0; dd < this.templateDetails.dashboards.length; dd++) {
      if (this.templateDetails.dashboards[dd].isDeviceRequired === false ) {
        deviceFieldNotField = true;
        
      } else if (this.templateDetails.dashboards[dd].isDeviceRequired === true ) 
       if(this.templateDetails.dashboards[dd].devices && this.templateDetails.dashboards[dd].devices[0] && this.templateDetails.dashboards[dd].devices[0]?.reprensentation.id !== null && this.templateDetails.dashboards[dd].devices[0]?.reprensentation.id !== undefined) {
        deviceFieldNotField = true;
      } else {
        deviceFieldNotField = false;
        break;
      }
    }

    this.deviceFormValid = deviceFieldNotField;
      console.log('Dashboard value', dashboard);
      console.log('template details value', this.templateDetails);
     
      
      // if (dashboard.devices && dashboard.devices[0].reprensentation.id !== null && dashboard.devices[0].reprensentation.id !== undefined ) {
      //   this.deviceFormValid = true;
      // } else {
      //   this.deviceFormValid = false;
      // }
  });
}

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
}