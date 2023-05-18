import { CdkStep } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { AppTemplateDetails, TemplateCatalogEntry } from '../../template-catalog-setup.model';
import { GalleryItem, ImageItem } from 'ng-gallery';

@Component({
  selector: 'c8y-template-step-two-details',
  templateUrl: './template-step-two-details.component.html',
  styleUrls: ["./template-step-two-details.component.css"],
  host: { class: 'd-contents' }
})
export class TemplateStepTwoDetailsComponent extends TemplateSetupStep {
  public templateDetails: AppTemplateDetails;
  images: GalleryItem[];
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
    this.loadTemplateDetailsCatalog();
  }

  loadTemplateDetailsCatalog() {
    this.templateCatalogService.getTemplateDetailsCatalog()
            .pipe(catchError(err => {
                console.log('Dashboard Catalog: Error in primary endpoint! using fallback...');
                return this.templateCatalogService.getTemplateDetailsCatalogFallBack()
            }))
            .subscribe((catalog: AppTemplateDetails) => {
                this.templateDetails = catalog;
                if(this.templateDetails  && this.templateDetails.media) {
                  this.templateDetails.media.forEach( (media:any) => {
                    media.image = this.templateCatalogService.getGithubURL(media.image);
                    media.thumbImage = this.templateCatalogService.getGithubURL(media.thumbImage);
                  });
                }
                this.images = this.templateDetails.media.map(item => new ImageItem({ src: item.image }));
                console.log(this.templateDetails);
                /* if (this.templateDetails.image && this.templateDetails?.image != '') {
                  this.templateDetails.image = this.templateCatalogService.getGithubURL(this.templateDetails.image);
              } */
            }, error => {
                this.alertService.danger("There is some technical error! Please try after sometime.");
            });
  }
}
