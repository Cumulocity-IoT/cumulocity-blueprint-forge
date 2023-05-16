import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from './../../template-catalog.service';
import { catchError } from "rxjs/operators";
import { TemplateCatalogEntry } from './../../template-catalog.model';

@Component({
  selector: 'c8y-template-step-one',
  templateUrl: './template-step-one.component.html',
  styleUrls: ['./template-step-one.component.css'],
  host: { class: 'd-contents' }
})
export class TemplateStepOneComponent extends TemplateSetupStep {

  public templates: Array<TemplateCatalogEntry> = [];

  public filterTemplates: Array<TemplateCatalogEntry> = [];
  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogService: TemplateCatalogService,
    private alertService: AlertService
  ) {
    super(stepper, step, setup, appState, alert);
  }

  ngOnInit() {
    this.loadTemplateCatalog();
  }

  loadTemplateCatalog() {
    this.templateCatalogService.getTemplateCatalog()
            .pipe(catchError(err => {
                console.log('Dashboard Catalog: Error in primary endpoint! using fallback...');
                return this.templateCatalogService.getTemplateCatalogFallBack()
            }))
            .subscribe((catalog: Array<TemplateCatalogEntry>) => {
                this.templates = catalog;
                this.filterTemplates = (this.templates ? this.templates : []);
                this.filterTemplates.forEach(template => {
                    if (template.thumbnail && template?.thumbnail != '') {
                        template.thumbnail = this.templateCatalogService.getGithubURL(template.thumbnail);
                    }
                })
            }, error => {
                this.alertService.danger("There is some technical error! Please try after sometime.");
            });
  }
}
