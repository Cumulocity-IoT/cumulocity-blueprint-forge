import { CdkStep } from '@angular/cdk/stepper';
import { AppStateService, AlertService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateBlueprintDetails, TemplateBlueprintEntry } from './template-setup.model';

const DEFAULT_CONFIG: TemplateBlueprintEntry = {
  templateId: "",
  title: "",
  description: "",
  thumbnail: "",
  config: "",
  comingSoon: false,
};
const details_config: TemplateBlueprintDetails = {
  templateId: "",
  title: "",
  tagLine: "",
  description: "",
  dashboards: [],
  input: {}
}
export abstract class TemplateSetupStep {
  // config: TemplateBlueprintEntry = DEFAULT_CONFIG;
  config: any = DEFAULT_CONFIG;
  detailsConfig: TemplateBlueprintDetails = details_config; 
  pending = false;

  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService
  ) {
    this.stepper.linear = true;
    console.log('this stepper', this.stepper);
  }

  async next() {
    this.pending = true;
    try {
      const newConfig = { ...this.setup.data$.value, ...this.config };
      await this.appState.updateCurrentApplicationConfig(newConfig);
      this.step.completed = true;
      this.setup.stepCompleted(this.stepper.selectedIndex);
      this.setup.data$.next(newConfig);
      // localStorage.setItem('config', JSON.stringify(newConfig));
      this.stepper.next();
    } catch (ex) {
      this.alert.addServerFailure(ex);
    } finally {
      this.pending = false;
    }
  }

  back() {
    this.stepper.previous();
  }
}
