import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';
import { AppTemplateDetails } from '../../template-catalog-setup.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeviceSelectorModalComponent } from './../../../builder/utils/device-selector-modal/device-selector.component';
import { IManagedObject } from '@c8y/client';

@Component({
  selector: 'c8y-template-step-four-summary',
  templateUrl: './template-step-four-summary.component.html',
  host: { class: 'd-contents' }
})
export class TemplateStepFourSummaryComponent extends TemplateSetupStep {
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogService: TemplateCatalogService,
    private modalService: BsModalService,
    private deviceSelectorModalRef: BsModalRef
  ) {
    super(stepper, step, setup, appState, alert);
  }
  templateDetails:any;
  ngOnInit() {
    this.loadTemplateDetailsCatalog();
  }

  loadTemplateDetailsCatalog() {
    this.templateCatalogService.getTemplateDetailsCatalog()
            .subscribe((catalog: AppTemplateDetails) => {
                this.templateDetails = catalog;
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
}
