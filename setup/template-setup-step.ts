import { CdkStep } from '@angular/cdk/stepper';
import { AppStateService, AlertService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { TemplateConfig, DEFAULT_CONFIG, TemplateDetails,  details_config} from './template-config.model';

export abstract class TemplateSetupStep {
  config: TemplateConfig = DEFAULT_CONFIG;
  detailsConfig: TemplateDetails = details_config; 
  pending = false;

  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService
  ) {}

  async next() {
    this.pending = true;
    try {
      const newConfig = { ...this.setup.data$.value, ...this.config };
      await this.appState.updateCurrentApplicationConfig(newConfig);
      this.setup.stepCompleted(this.stepper.selectedIndex);
      this.setup.data$.next(newConfig);
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
