import { CdkStep } from '@angular/cdk/stepper';
import {  Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogSetupService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { TemplateBlueprintDetails, TemplateBlueprintEntry } from './../../template-setup.model';

@Component({
  selector: 'c8y-template-step-one',
  templateUrl: './template-step-one.component.html',
  styleUrls: ['./template-step-one.component.css'],
  host: { class: 'd-contents' }
})
export class TemplateStepOneComponent extends TemplateSetupStep   {


  public templates: Array<TemplateBlueprintEntry> = [];

  public filterTemplates: Array<TemplateBlueprintEntry> = [];
  templateDetails: TemplateBlueprintDetails;
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogSetupService: TemplateCatalogSetupService,
    private alertService: AlertService
  ) {
    super(stepper, step, setup, appState, alert);
  }

  ngOnInit() {
    this.loadTemplateCatalog();
  }

  ngAfterViewInit() {
    
  }

  loadTemplateCatalog() {
    this.templateCatalogSetupService.getTemplateCatalog()
            .pipe(catchError(err => {
                console.log('Dashboard Catalog: Error in primary endpoint! using fallback...');
                return this.templateCatalogSetupService.getTemplateCatalogFallBack()
            }))
            .subscribe((catalog: Array<TemplateBlueprintEntry>) => {
                this.templates = catalog;
                this.filterTemplates = (this.templates ? this.templates : []);
                this.filterTemplates.forEach(template => {
                    if (template.thumbnail && template?.thumbnail != '') {
                        template.thumbnail = this.templateCatalogSetupService.getGithubURL(template.thumbnail);
                    }
                })
            }, error => {
                this.alertService.danger("There is some technical error! Please try after sometime.");
            });
  }


  selectedTemplate(dashboardURL: string) {
    this.config.config = dashboardURL;
    super.next();    // Navigation to details page
  }


  }
