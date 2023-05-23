import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';
import { AppTemplateDetails } from '../../template-catalog-setup.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeviceSelectorModalComponent } from './../../../builder/utils/device-selector-modal/device-selector.component';
import { IManagedObject } from '@c8y/client';
import { ProgressIndicatorModalComponent } from './../../../builder/utils/progress-indicator-modal/progress-indicator-modal.component';
import { ProgressIndicatorService } from './../../../builder/utils/progress-indicator-modal/progress-indicator.service';

@Component({
  selector: 'c8y-template-step-four-summary',
  templateUrl: './template-step-four-summary.component.html',
  host: { class: 'd-contents' }
})
export class TemplateStepFourSummaryComponent extends TemplateSetupStep {
  templateDetails:any;
  private progressModal: BsModalRef;
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogService: TemplateCatalogService,
    private modalService: BsModalService,
    private deviceSelectorModalRef: BsModalRef,
    private progressIndicatorService: ProgressIndicatorService
  ) {
    super(stepper, step, setup, appState, alert);
  }

  ngOnInit() {
    this.templateCatalogService.templateData.subscribe(currentData => {
      console.log('Stored template data step four', currentData);
      if (currentData) {
        this.templateDetails = currentData;
      }
    });
  }

  openDeviceSelectorDialog(dashboard: any): void {
    this.deviceSelectorModalRef = this.modalService.show(DeviceSelectorModalComponent, { class: 'c8y-wizard', initialState: {} });
    this.deviceSelectorModalRef.content.onDeviceSelected.subscribe((selectedDevice: IManagedObject) => {
        /* this.templateDetails.input.devices[index].reprensentation = {
            id: selectedDevice.id,
            name: selectedDevice['name']
        }; */
        dashboard.devicesName = selectedDevice['name'];
    })
 }

 showProgressModalDialog(message: string): void {
  this.progressModal = this.modalService.show(ProgressIndicatorModalComponent, { class: 'c8y-wizard', initialState: { message } });
}

async configureApp() {
  let totalRemotes = this.templateDetails.plugins.length;
  totalRemotes = totalRemotes + this.templateDetails.microservices.length;
  totalRemotes = totalRemotes + this.templateDetails.dashboards.length;

  const eachRemoteProgress: number = Math.floor((totalRemotes > 1 ? (90 / totalRemotes) : 0));
  let overallProgress = 0;
  this.showProgressModalDialog("Verifying plugins...")
  if (totalRemotes > 1) { this.progressIndicatorService.setOverallProgress(overallProgress) }
  
  for (let plugin of this.templateDetails.plugins) {
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
  for (let ms of this.templateDetails.microservices) {
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
  for (let db of this.templateDetails.dashboards) {
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
}
