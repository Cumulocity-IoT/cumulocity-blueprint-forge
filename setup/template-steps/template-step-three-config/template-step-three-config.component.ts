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
import { DeviceSelectorModalComponent } from './../../../builder/utils/device-selector-modal/device-selector.component';

import * as delay from "delay";
import { UpdateableAlert } from "../../../builder/utils/UpdateableAlert";
import { contextPathFromURL } from "../../../builder/utils/contextPathFromURL";
import { NgForm } from '@angular/forms';
import { SetupConfigService } from './../../setup-config.service';
import { SettingsService } from '../../../builder/settings/settings.service';
import { SetupWidgetConfigModalComponent } from '../../../setup/setup-widget-config-modal/setup-widget-config-modal.component';
import { DOCUMENT } from '@angular/common';
import { BrandingService } from '../../../builder/branding/branding.service';
import { LinkSimulatorDeviceModalComponent } from '../../simulator-device-modal/link-simulator-device-modal.component';
@Component({
  selector: 'c8y-template-step-three-config',
  templateUrl: './template-step-three-config.component.html',
  styleUrls: ['./template-step-three-config.component.css'],
  host: { class: 'd-contents' }
})
export class TemplateStepThreeConfigComponent extends TemplateSetupStep implements OnInit, AfterViewInit {

  templateDetails: any;
  private progressModal: BsModalRef;
  private appList = [];
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

  ngOnInit() {
    this.simulatorSelected = false;
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

  

  showSetupConfigModal(dashboardBasicConfig): BsModalRef {
    return this.modalService.show(SetupWidgetConfigModalComponent, { class: 'c8y-wizard', initialState: { dashboardBasicConfig } });
  }

  async configureBasicInput(dashboard, index) {
    const basicConfigurationRef = this.showSetupConfigModal(dashboard.basicConfig);
    await basicConfigurationRef.content.event.subscribe(async data => {
      if (data && data.isConfirm) {
        this.templateDetails.dashboards[index].basicConfig = data.basicConfigParams;
      }
    });
  }

  // TODO: Phase II
  showDashboardCatalogDialog(app: any, dashboard: Dashboards) {
    this.bsModalRef = this.modalService.show(TemplateCatalogModalComponent, { backdrop: 'static', class: 'modal-lg', initialState: { app, dashboard } });
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

  

  hideProgressModalDialog() {
    this.progressModal.hide();
  }

  

 

  async loadTemplateDetails(dbDashboard): Promise<Observable<any>> {
   
    return this.catalogService.getTemplateDetails(dbDashboard)
      .pipe(catchError(err => {
        console.log('Dashboard Catalog Details: Error in primary endpoint! using fallback...');
        return this.catalogService.getTemplateDetailsFallBack(dbDashboard);
      }));
  }

 
 

  setTheme(app, primary, active, text, textOnPrimary, textOnActive, hover, headerBar, tabBar, toolBar, selectedTheme) {
    app.applicationBuilder.branding.enabled = true;
    app.applicationBuilder.branding.colors.primary = primary;
    app.applicationBuilder.branding.colors.active = active;
    app.applicationBuilder.branding.colors.text = text;
    app.applicationBuilder.branding.colors.textOnPrimary = textOnPrimary;
    app.applicationBuilder.branding.colors.textOnActive = textOnActive;
    app.applicationBuilder.branding.colors.hover = hover;
    app.applicationBuilder.branding.colors.headerBar = headerBar;
    app.applicationBuilder.branding.colors.tabBar = tabBar;
    app.applicationBuilder.branding.colors.toolBar = toolBar;
    app.applicationBuilder.selectedTheme = selectedTheme;

    if (selectedTheme === 'Default') {
      this.renderer.removeClass(this.document.body, 'body-theme');
      this.renderer.removeClass(this.document.body, 'dashboard-body-theme');
    } else {
      this.renderer.addClass(this.document.body, 'body-theme');
    }
    this.brandingService.updateStyleForApp(app);
  }

  assignDashboardName(selectedTemplate) {
    this.templateSelected = selectedTemplate.dashboardName;
    
  }

  showSimulatorDeviceDialog() {
    this.bsModalRef = this.modalService.show(LinkSimulatorDeviceModalComponent, { backdrop: 'static', class: 'c8y-wizard' });
}

async validateandNext(app) {
    if (this.appConfigForm.form.valid) {
      if (this.currentApp.name !== this.newAppName ||
        this.currentApp.contextPath !== this.newAppContextPath ||
        (this.currentApp.applicationBuilder && this.currentApp.applicationBuilder.icon !== this.newAppIcon)) {
        await this.saveAppChanges(app);
      }
    } else {
      this.alert.danger("Please fill required details to proceed further.");
      return;
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
