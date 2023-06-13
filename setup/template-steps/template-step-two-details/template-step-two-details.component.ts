import { CdkStep } from '@angular/cdk/stepper';
import { Component, ViewEncapsulation  } from '@angular/core';
import { AlertService, AppStateService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateSetupStep } from './../../template-setup-step';
import { TemplateCatalogSetupService } from '../../template-catalog-setup.service';
import { catchError } from "rxjs/operators";
import { GalleryItem, ImageItem } from 'ng-gallery';
import { TemplateBlueprintDetails } from './../../template-setup.model';

@Component({
  selector: 'c8y-template-step-two-details',
  templateUrl: './template-step-two-details.component.html',
  styleUrls: ['./template-step-two-details.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'd-contents' }
})
export class TemplateStepTwoDetailsComponent extends TemplateSetupStep {
  public templateDetails: TemplateBlueprintDetails;
  configDetails: any;
  images: GalleryItem[];
  isDashboardChecked = true;

  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    private templateCatalogSetupService: TemplateCatalogSetupService,
    private alertService: AlertService,
  ) {
    super(stepper, step, setup, appState, alert);
    
    this.setup.data$.subscribe(data => { 
    
    if (data.config && data.config != '') {
      this.templateDetails = null;
      this.loadTemplateDetailsCatalog(data.config);
    }
  });
  }

  ngOnInit() {
    
  }


  loadTemplateDetailsCatalog(dashboardURL) {
    this.templateCatalogSetupService.getTemplateDetailsCatalog(dashboardURL)
            .pipe(catchError(err => {
                console.log('Dashboard Catalog: Error in primary endpoint! using fallback...');
                return this.templateCatalogSetupService.getTemplateDetailsCatalogFallBack(dashboardURL)
            }))
            .subscribe((catalog: TemplateBlueprintDetails) => {
              
                this.templateDetails = catalog;
              
                if(this.templateDetails  && this.templateDetails.media) {
                  this.templateDetails.media.forEach( (media:any) => {
                    media.image = this.templateCatalogSetupService.getGithubURL(media.image);
                    media.thumbImage = this.templateCatalogSetupService.getGithubURL(media.thumbImage);
                  });
                } else {
                  this.templateDetails.media = [];
                }

                if (this.templateDetails && this.templateDetails.microservices === undefined ) {
                  this.templateDetails.microservices = [];
                }

                /* if (this.templateDetails && this.templateDetails.devices === undefined) {
                  this.templateDetails.devices = [];
                } */

                if(this.templateDetails  && this.templateDetails.media) {
                this.images = this.templateDetails.media.map(item => new ImageItem({ src: item.image }));
                } else {
                  this.images = [];
                }
                
                this.templateCatalogSetupService.templateData.next(this.templateDetails);
               
                
                
            }, error => {
                this.alertService.danger("There is some technical error! Please try after sometime.");
            });
  }
}
