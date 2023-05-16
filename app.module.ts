import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as ngRouterModule } from '@angular/router';
import { SetupStep } from '@c8y/ngx-components';
import { HOOK_STEPPER, Steppers,gettext } from '@c8y/ngx-components';
import { CoreModule, BootstrapComponent, RouterModule } from '@c8y/ngx-components';
import { TemplateStepOneComponent } from './setup/template-steps/template-step-one/template-step-one.component';
import { TemplateSetupStepperButtonsComponent } from './setup/template-setup-stepper-buttons.component';
import { TemplateStepTwoDetailsComponent } from './setup/template-steps/template-step-two-details/template-step-two-details.component';
import { TemplateStepThreeConfigComponent } from './setup/template-steps/template-step-three-config/template-step-three-config.component';
import { TemplateCatalogService } from './setup/template-catalog.service';

@NgModule({
  declarations: [
    TemplateStepOneComponent, 
    TemplateSetupStepperButtonsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    ngRouterModule.forRoot([], { enableTracing: false, useHash: true }),
    CoreModule.forRoot()
  ],
  providers: [
    TemplateCatalogService,
    {
    provide: HOOK_STEPPER,
      useValue: [
        {
          stepperId: Steppers.SETUP,
          component: TemplateStepTwoDetailsComponent,
          label: gettext('Connect'),
          setupId: 'cockpitTopLevelNodes',
          priority: 10
        },
        {
          stepperId: Steppers.SETUP,
          component: TemplateStepThreeConfigComponent,
          label: gettext('Configuration'),
          setupId: 'cockpitHomeDashboard',
          priority: 20
        },
        {
          stepperId: Steppers.SETUP,
          component: TemplateStepTwoDetailsComponent,
          label: gettext('Details'),
          setupId: 'cockpitFeatures',
          priority: 25
        },
        
        {
          stepperId: Steppers.SETUP,
          component: TemplateStepOneComponent,
          label: gettext('App Template'),
          required: true,
          setupId: 'applcationTemplate',
          priority: 30
        }
      ] as SetupStep[],  multi: true},
     
  ],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
