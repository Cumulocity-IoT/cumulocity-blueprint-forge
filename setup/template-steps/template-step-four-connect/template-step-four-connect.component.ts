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
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, PluginsService, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from '../../template-setup-step';
import { TemplateCatalogSetupService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subscription, interval } from 'rxjs';
import { tap } from "rxjs/operators";
import { ApplicationService, IApplication, IManagedObject, InventoryService } from '@c8y/client';
import { AppDataService } from '../../../builder/app-data.service';
import { ProgressIndicatorModalComponent } from '../../../builder/utils/progress-indicator-modal/progress-indicator-modal.component';
import { ProgressIndicatorService } from '../../../builder/utils/progress-indicator-modal/progress-indicator.service';
import { WidgetCatalogService } from '../../../builder/widget-catalog/widget-catalog.service';
import { Dashboards, MicroserviceDetails, PluginDetails, TemplateBlueprintDetails } from '../../template-setup.model';
import { ApplicationBinaryService } from '../../../builder/application-binary.service';
import { TemplateCatalogService } from '../../../builder/template-catalog/template-catalog.service';
import { DeviceSelectorModalComponent } from '../../../builder/utils/device-selector-modal/device-selector.component';
import { NgForm } from '@angular/forms';
import { SetupConfigService } from '../../setup-config.service';
import { SettingsService } from '../../../builder/settings/settings.service';
import { DOCUMENT } from '@angular/common';
import { NewSimulatorModalComponent } from '../../../builder/simulator-config/new-simulator-modal.component';
import * as _ from 'lodash';
@Component({
  selector: 'c8y-template-step-four-connect',
  templateUrl: './template-step-four-connect.component.html',
  styleUrls: ['./template-step-four-connect.component.css'],
  host: { class: 'd-contents' }
})
export class TemplateStepFourConnectComponent extends TemplateSetupStep implements OnInit {

  templateDetails: TemplateBlueprintDetails;
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
  templateSelected: string;
  isMSEnabled: boolean = false;
  welcomeTemplateData: any;
  simulatorSelected: boolean;
  enableSimulator: boolean;
  enableDeviceOrGroup: boolean;
  enableLik: boolean;
  simulatorModelContent: any;
  blankTemplateDashboard: boolean;
  isSpin: boolean = false;
  fileUploadMessage: string;
  onSaveClicked: boolean = false;
  groupTemplateFromSimulator: boolean;
  indexOfDashboardUpdatedFromDC: any;
  dynamicDashboardValueToUpdate: any;
  filterTemplates: Array<[]>;
  dashboardTemplateSelected: any;
  linkDashboards: any;
  linkDashboardsCopy: any;
  storeDefaultDashboardName: string;
  fileName: string = 'Select File';
  simulatorConfigFiles: any[];

  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogSetupService: TemplateCatalogSetupService, private invService: InventoryService,
    private modalService: BsModalService, private applicationBinaryService: ApplicationBinaryService,
    private appService: ApplicationService,
    private appDataService: AppDataService, private widgetCatalogService: WidgetCatalogService,
    private progressIndicatorService: ProgressIndicatorService, private catalogService: TemplateCatalogService,
    @Inject(DOCUMENT) private document: Document, private deviceSelectorModalRef: BsModalRef, 
    private appStateService: AppStateService, protected setupConfigService: SetupConfigService, 
    private settingsService: SettingsService, private pluginsService: PluginsService,
    private alertService: AlertService
    
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
    
    this.templateCatalogSetupService.blankTemplate.subscribe(value => {
      if (value) {
        this.blankTemplateDashboard = value;
        this.configureApp(this.currentApp);
      }
    });
  }
  ngAfterViewInit(): void {
    console.log('After view init called');
    this.verifyStepCompleted();
  }

  ngOnInit() {
    this.simulatorSelected = false;
    this.templateCatalogSetupService.templateData.subscribe(async currentData => {
      this.isFormValid = this.appConfigForm?.form.valid;
      if (currentData) {
        this.templateDetails = currentData;
        this.generateLinkingDashboards();
        this.dashboardManipulations();
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
    this.templateCatalogSetupService.dynamicDashboardTemplate.subscribe(value => {
      this.dynamicDashboardValueToUpdate = value;
        this.dynamicDashboardValueToUpdate ? (this.dynamicDashboardValueToUpdate.titleAssigned = value?.title) : null;
    });
    
    this.templateCatalogSetupService.templatesFromDashboardCatalog.subscribe(filterTemplates => this.filterTemplates = filterTemplates);
    
  }

  async toggleToEnableSimulator(event, dashboard, index) {
    this.indexOfDashboardUpdatedFromDC = index;
    this.simulatorSelected = true;
    dashboard.enableSimulator = true;
    dashboard.enableLink = false;
    dashboard.enableDeviceOrGroup = false;
    if (dashboard.enableSimulator) {
      this.loadSimulatorConfigFiles(dashboard);
    } else {
      this.fileUploadMessage = null;
      dashboard.name = null;
        dashboard.devices = [{
            type: "Temperature Sensor",
              placeholder: "device01",
              reprensentation : {
                id: null,
                name: ''
              }
          }];
          for (let dd = 0; dd < this.templateDetails.dashboards.length; dd++) {
            if (this.templateDetails.dashboards[dd].isDeviceRequired === true && this.templateDetails.dashboards[dd].linkWithDashboard === dashboard.id) {
              this.templateDetails.dashboards[dd].devices = dashboard.devices;
           } 
          }
        this.deviceFormValid = false;
    }
  }

  async loadTemplateDetails(dbDashboard): Promise<Observable<any>> {
    return this.catalogService.getTemplateDetails(dbDashboard)
      .pipe(catchError(err => {
        return this.catalogService.getTemplateDetailsFallBack(dbDashboard);
      }));
  }

  async configureApp(app: any) {
    const isAnyStepPending = this.setup.steps.some((step, index) => (index !== this.setup.steps.length-1) && (step.completed === false));
    if(!isAnyStepPending) {
      this.next();
      return;
    } 
      const currentHost = window.location.host.split(':')[0];
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      this.alert.warning("Installation isn't supported when running Application on localhost.");
      return;
    }  

    this.templateCatalogSetupService.dynamicDashboardTemplateDetails.subscribe(value => {
      this.templateDetails.plugins = this.templateDetails.plugins.concat(value.input.dependencies);
    });

   this.templateDetails.plugins = this.templateDetails.plugins.reduce((accumulator, current)=> {
      if (!accumulator.find((item) => item.id === current.id)) {
        current.selected = true;
        if (this.widgetCatalogService.isCompatiblieVersion(current) ) {
          accumulator.push(current);
        }
      }
      return accumulator;
    }, []);

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
    const listOfPackages = await this.pluginsService.listPackages();
    for (let plugin of configDataPlugins) {
      await this.installPlugin(plugin, listOfPackages);
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
    for (let [index, db] of configDataDashboards.entries()) {
      this.progressIndicatorService.setProgress(20);
      this.progressIndicatorService.setMessage(`Installing ${db.title}`);
      await new Promise(resolve => setTimeout(resolve, 1000));


      // in case of multiple templates

      let templateDetailsData;
      let  dashboardTemplates;
      if (db.welcomeTemplates) {
        this.templateCatalogSetupService.welcomeTemplateSelected.subscribe(value => this.templateSelected = value);
         dashboardTemplates =  this.welcomeTemplateData.find(dashboardTemplate => dashboardTemplate.dashboardName === this.templateSelected);
          if (dashboardTemplates && this.templateSelected === 'Default Template') {
            templateDetailsData = await (await this.loadTemplateDetails(db.dashboard)).toPromise();
          } else {
            templateDetailsData = await (await this.loadTemplateDetails(dashboardTemplates.dashboard)).toPromise();
          }
      } else {
        templateDetailsData = await (await this.loadTemplateDetails(db.dashboard)).toPromise();
      }

      
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
      this.appDataService.isGroupDashboardFromSimulator.subscribe(value => this.groupTemplateFromSimulator = value);


      // 1. normal dashboard : isGroupDashboard: false
      // 2. normal but device or group without folder: isGroupDashboard: false
      // 3. group template -with folder - > isGroupDashboard : true
      if(db.isGroupDashboard || db.templateType && db.templateType === 2) {
        this.groupTemplate = true;
      } else {
        this. groupTemplate = false;
      }
      
      if (index === this.indexOfDashboardUpdatedFromDC) {
        this.templateCatalogSetupService.dynamicDashboardTemplate.subscribe(value => {
          db.dashboard = value.dashboard;


          this.dynamicDashboardValueToUpdate = value;
            this.dynamicDashboardValueToUpdate ? (this.dynamicDashboardValueToUpdate.titleAssigned = value?.title) : null;
          if(this.dynamicDashboardValueToUpdate?.titleAssigned) {
            dashboardConfiguration.dashboardName = this.dynamicDashboardValueToUpdate?.titleAssigned.split("-")[0];
          }
        });
        
        this.templateCatalogSetupService.dynamicDashboardTemplateDetails.subscribe(value => {
          templateDetailsData.input.dependencies = JSON.parse(JSON.stringify(value.input.dependencies));
          templateDetailsData.input.images = JSON.parse(JSON.stringify(value.input.images));
          templateDetailsData.widgets = JSON.parse(JSON.stringify(value.widgets));
        })
      }
      await this.catalogService.createDashboard(this.currentApp, dashboardConfiguration, db, templateDetailsData, this.groupTemplate);
      this.progressIndicatorService.setProgress(90);
      overallProgress = overallProgress + eachRemoteProgress;
      this.progressIndicatorService.setOverallProgress(overallProgress)
    };
    await this.processDashboardLinks();
    await this.progressIndicatorService.setProgress(95);
    overallProgress = overallProgress + eachRemoteProgress;
    this.progressIndicatorService.setOverallProgress(overallProgress)
    if (window && window['aptrinsic']) {
      window['aptrinsic']('track', 'gp_blueprint_forge_template_installed', {
        "templateName": this.templateDetails.title,
        "appName": this.currentApp.name,
        "tenantId": this.settingsService.getTenantName(),
      });
    }
    this.hideProgressModalDialog();
    sessionStorage.removeItem("templateURL");
    if (this.blankTemplateDashboard) {
      this.setup.steps[2].completed = true;
      this.setup.stepCompleted(2);
      this.next();
      this.showProgressModalDialog("Establishing Basic Dashboards for Blank Template")
      this.progressIndicatorService.setOverallProgress(5);
      this.setup.steps[3].completed = true;
      this.setup.stepCompleted(3);
      this.next();
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.hideProgressModalDialog();
    } else {
      this.next();
    }
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

  async installPlugin(plugin: PluginDetails, listOfPlugins: IApplication[]): Promise<void> {
    const widgetBinaryFound = listOfPlugins.find(app => (app.name.toLowerCase() === plugin.title?.toLowerCase() ||
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

  //Processing dashboardlinks for dashboard navigations
  private async processDashboardLinks() {
    if(this.templateDetails.dashboardLinks && this.templateDetails.dashboardLinks.length > 0){
      if(this.currentApp.id) {   
        this.progressIndicatorService.setMessage(`Updating Dashboard links`);
        const app: any  = await (await this.appDataService.getAppDetails(this.currentApp.id + "")).toPromise();
            if(app.applicationBuilder && app.applicationBuilder?.dashboards && app.applicationBuilder?.dashboards.length > 0){
                let dashboards = app.applicationBuilder.dashboards;
                for(let dbLinks of this.templateDetails.dashboardLinks) {
                  const updatableDashboardId = dashboards.find( db => db.name === dbLinks.dashboardName)?.id;
                  const targetDashboardId = dashboards.find( db => (db.name === dbLinks.targetDashboardName) || (db.name.trim() === this.dynamicDashboardValueToUpdate?.titleAssigned.split("-")[0].trim()))?.id;
                  if(updatableDashboardId && targetDashboardId){
                    const updatableDashboardObj = (await this.invService.detail(updatableDashboardId)).data?.c8y_Dashboard;
                    if(updatableDashboardObj) {
                      const keys = Object.keys(updatableDashboardObj.children);
                      keys.forEach( (key, idx) => {
                        if(updatableDashboardObj?.children[key]?.componentId ==dbLinks.widgetComponentId) {
                          _.set( updatableDashboardObj.children[key],dbLinks.updatableProperty, targetDashboardId);
                        } 
                      });
                      await this.invService.update({
                        id: updatableDashboardId,
                        "c8y_Dashboard": updatableDashboardObj
                    });
                  }
                }
                }  
            }
        };
      }
  }

  openDeviceSelectorDialog(dashboard, templateType: number, index) {
    this.indexOfDashboardUpdatedFromDC = index;
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
           }  else if (this.templateDetails.dashboards[dd].isDeviceRequired === true && this.templateDetails.dashboards[dd].linkWithDashboard !== dashboard.id && !dashboard.name) {
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
         } else if (this.templateDetails.dashboards[dd].isDeviceRequired === true && this.templateDetails.dashboards[dd].linkWithDashboard !== dashboard.id && !dashboard.name) {
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

  
  assignSelectedDashboard(selectedDashboard, index, event) {
    // this.templateCatalogSetupService.indexOfDashboardToUpdateTemplate = index;
    // this.selectedDashboardName = event.value;
    // this.templateCatalogSetupService.dynamicDashboardTemplate.next(event.item);
    // this.loadTemplateDetails(event.item,index);
  }


  updateDashboardTemplateSelected (event, index) {
    this.templateDetails.dashboards[index].dashboardTemplateSelected = event.value;
  }

  dashboardManipulations() {
    this.templateDetails.dashboards = this.templateDetails.dashboards.reduce((acc, element) => {
      if (element.isGroupDashboard) {
        return [element, ...acc];
      }
      return [...acc, element];
    }, []);
    this.templateDetails.dashboards.forEach(dashboard => {
      
      dashboard.enableSimulator = false;
      dashboard.enableDeviceOrGroup = true;
      dashboard.enableLink = false;
      if (dashboard.linkWithDashboard) {
        dashboard.enableLink = true;
        dashboard.enableSimulator = dashboard.enableDeviceOrGroup = false;
        dashboard.findMatchedLink = this.templateDetails.dashboards.find(matchedItem => dashboard.linkWithDashboard === matchedItem.id);
        dashboard.defaultLinkedDashboard = dashboard.findMatchedLink.title;
        dashboard.dashboardTemplateSelected = dashboard.findMatchedLink.title;
        dashboard.selectedDashboardName = dashboard.title;
        dashboard.fileName ="Select File";
      } else if (!dashboard.linkWithDashboard && dashboard.isGroupDashboard ){
        this.loadSimulatorConfigFiles(dashboard);
        dashboard.selectedDashboardName = dashboard.title;
        dashboard.fileName ="Select File";

        

      } 
    });
}


async loadSimulatorConfigFiles(dashboard) {
  let templateDetailsData;
        templateDetailsData = await (await this.loadTemplateDetails(dashboard.dashboard)).toPromise();

        const SimulatorConfigFiles = [];
    let currentSimulatorData;
    for (let i = 0; i < templateDetailsData.simulatorDTDL.length; i++) {
      currentSimulatorData = await (await this.loadTemplateDetails(templateDetailsData.simulatorDTDL[i].simulatorFile)).toPromise();
      SimulatorConfigFiles.push({
          fileName: templateDetailsData.simulatorDTDL[i].simulatorFileName,
          fileContent: currentSimulatorData
      });
    
      }
      this.simulatorConfigFiles = JSON.parse(JSON.stringify(SimulatorConfigFiles));
      // dashboard.fileName = this.simulatorConfigFiles[0].fileName;
}
  linkOtherDashboard(dashboard) {
    dashboard.enableLink = true;
    dashboard.enableSimulator = false;
    dashboard.enableDeviceOrGroup = false;
  }

  connectActualDeviceOrGroup(dashboard) {
    dashboard.enableDeviceOrGroup = true;
    dashboard.enableSimulator = dashboard.enableLink = false;
  }

  updateConfigurationFile() {
    // let matchedConfigValue = JSON.parse(JSON.stringify(this.SimulatorConfigFiles)).find(element => element.fileName === this.fileName);
    // const fileInput = JSON.stringify(matchedConfigValue.fileContent)
    // const validJson = this.isValidJson(fileInput);
    // this.isConfigFileUploading = true;
    //         if (validJson) {
    //         this.processFileInput(validJson);
    //         }

}

private isValidJson(input: any) {
  try {
      if (input) {
          const o = JSON.parse(input);
          if (o && (o.constructor === Object || o.constructor === Array)) {
              console.log('o constructor value', o.constructor);
              return o;
          }
      }
  } catch (e) { }
  return false;
}

// processFileInput(validJson) {
//   this.selectedStrategyFactory = this.simulationStrategiesService.strategiesByName.get(validJson.type);
//           if (this.selectedStrategyFactory === undefined) {
//               this.isConfigFileError = true;
//           } else {
//               this.configFromFile = validJson.config;
//               this.simulatorName = validJson.name;
//               if (this.enableSimulator) {
//                   this.wizard.selectStep('device');
//               }
//           }
// }



generateLinkingDashboards() {
  this.linkDashboards = JSON.parse(JSON.stringify(this.templateDetails.dashboards));
        this.linkDashboards = this.linkDashboards.filter(item => item.title != "Welcome" && item.title !== "Help and Support" && item.title !== "Instruction");
        this.linkDashboardsCopy = JSON.parse(JSON.stringify(this.linkDashboards));
        let findMatchedTitle;
        this.templateDetails.dashboards.forEach(dashboardItem => {
          if (dashboardItem.title != 'Instruction' && dashboardItem.title != 'Help and Support' && dashboardItem.title != 'Welcome') {
            this.linkDashboards = JSON.parse(JSON.stringify(this.linkDashboardsCopy));
          dashboardItem.linkDashboards = this.linkDashboards;
          findMatchedTitle = dashboardItem.linkDashboards.findIndex(titleObject => titleObject.title === dashboardItem.title);
          if (findMatchedTitle >= 0) {
            dashboardItem.linkDashboards.splice(findMatchedTitle, 1);
          }
          }
          
        });


        this.templateDetails.dashboards.forEach(item => item.dashboardTemplateSelected = item.title);
}
  
  }
