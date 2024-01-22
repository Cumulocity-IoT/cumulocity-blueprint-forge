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
  isChecked: boolean = true;

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
    this.templateCatalogSetupService.templateData.subscribe(async currentData => {
        this.templateDetails = currentData;
      console.log('template details in step four', this.templateDetails);
      // In case of no device 
      // if (!(this.templateDetails?.input) || !(this.templateDetails?.input?.devices) || !(this.templateDetails?.input?.devices?.length > 0)) {
      //   this.deviceFormValid = true;
      // } else {
      //   this.deviceFormValid = false;
      // }
      // this.appList = (await this.appService.list({ pageSize: 2000 })).data;
      // this.isMSEnabled =  this.applicationBinaryService.isMicroserviceEnabled(this.appList);
    });
  }
  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
  }

  ngOnInit() {
    this.enableSimulator = false;
    
  }

  async toggleToEnableSimulator(event, dashboard) {
    this.enableSimulator = event.target.checked;
    let templateDetailsData;
    templateDetailsData = await (await this.loadTemplateDetails(dashboard.dashboard)).toPromise();
    // Need to pass Simulator config file array of object
 
    const SimultorConfigFiles = [];
    let currentSimulatorData;

    // Not able to use forEach, as it takes callback as parameter which expects to be async
    for (let i = 0; i < templateDetailsData.dtdl.length; i++) {
      currentSimulatorData = await (await this.loadTemplateDetails(templateDetailsData.dtdl[i].simulatorFile)).toPromise();
      SimultorConfigFiles.push({
          fileName: templateDetailsData.dtdl[i].simulatorFileName,
          fileContent: currentSimulatorData
      });
    }
    this.bsModalRef = this.modalService.show(NewSimulatorModalComponent, { backdrop: 'static', class: 'c8y-wizard', initialState:{appId: this.currentApp.id + "", isBlueprintSimulator: true, enableSimulator: this.enableSimulator, simulatorConfigFiles: SimultorConfigFiles, fileLength: SimultorConfigFiles.length}} );
  }


  async loadTemplateDetails(dbDashboard): Promise<Observable<any>> {
    return this.catalogService.getTemplateDetails(dbDashboard)
      .pipe(catchError(err => {
        console.log('Dashboard Catalog Details: Error in primary endpoint! using fallback...');
        return this.catalogService.getTemplateDetailsFallBack(dbDashboard);
      }));
  }

  }
