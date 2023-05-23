import { CdkStep } from '@angular/cdk/stepper';
import { Component, ViewEncapsulation  } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { AppTemplateDetails, TemplateCatalogEntry } from '../../template-catalog-setup.model';
import { GalleryItem, ImageItem } from 'ng-gallery';

@Component({
  selector: 'c8y-template-step-two-details',
  templateUrl: './template-step-two-details.component.html',
  styleUrls: ['./template-step-two-details.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'd-contents' }
})
export class TemplateStepTwoDetailsComponent extends TemplateSetupStep {
  public templateDetails: AppTemplateDetails;
  configDetails: any;
  images: GalleryItem[];

  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogService: TemplateCatalogService,
    private alertService: AlertService,
  ) {
    super(stepper, step, setup, appState, alert);
    
    this.setup.data$.subscribe(data => { 
    
    if (data.dashboard && data.dashboard != '') {
      this.templateDetails = null;
      this.loadTemplateDetailsCatalog(data.dashboard);
    }
  });
  }

  ngOnInit() {
    
  }


  loadTemplateDetailsCatalog(dashboardURL) {
    this.templateCatalogService.getTemplateDetailsCatalog(dashboardURL)
            .pipe(catchError(err => {
                console.log('Dashboard Catalog: Error in primary endpoint! using fallback...');
                return this.templateCatalogService.getTemplateDetailsCatalogFallBack(dashboardURL)
            }))
            .subscribe((catalog: AppTemplateDetails) => {
              
                this.templateDetails = catalog;
              
                if(this.templateDetails  && this.templateDetails.media) {
                  this.templateDetails.media.forEach( (media:any) => {
                    media.image = this.templateCatalogService.getGithubURL(media.image);
                    media.thumbImage = this.templateCatalogService.getGithubURL(media.thumbImage);
                  });
                } else {
                  this.templateDetails.media = [];
                }

                if(this.templateDetails  && this.templateDetails.media) {
                this.images = this.templateDetails.media.map(item => new ImageItem({ src: item.image }));
                } else {
                  this.images = [];
                }
                
                this.templateCatalogService.templateData.next(this.templateDetails);
               
            }, error => {
                this.alertService.danger("There is some technical error! Please try after sometime.");
            });
  }
}
