import { CdkStep } from '@angular/cdk/stepper';
import { AppStateService, AlertService, C8yStepper, SetupComponent } from '@c8y/ngx-components';
import { BlueprintForge } from './template-setup.model';
import { distinctUntilChanged } from "rxjs/operators";
import { SetupConfigService } from './setup-config.service';
const DEFAULT_CONFIG: BlueprintForge = {
  templateURL: "",
  selectedStepperIndex: 0,
  plugins: [],
  dashboards: [],
  microservices: [],
};

export abstract class TemplateSetupStep {
  // config: TemplateBlueprintEntry = DEFAULT_CONFIG;
  config: any = {}
  blueprintForge: BlueprintForge = DEFAULT_CONFIG;
  pending = false;

  constructor(
    public stepper: C8yStepper,
    protected step: CdkStep,
    protected setup: SetupComponent,
    protected appState: AppStateService,
    protected alert: AlertService,
    protected setupConfigService: SetupConfigService
  ) {
    this.stepper.linear = true;
  }

  verifyStepCompleted() {
     this.blueprintForge = this.setupConfigService.stepCompleted(this.stepper, this.step, this.setup);
     if(!this.blueprintForge) { this.blueprintForge = DEFAULT_CONFIG;}
  }
  async next() {
    this.pending = true;
    try {
      this.blueprintForge.selectedStepperIndex = this.stepper.selectedIndex
      this.config.blueprintForge = this.blueprintForge;
      const newConfig = { ...this.setup.data$.value, ...this.config };
      await this.appState.updateCurrentApplicationConfig(newConfig);
      this.step.completed = true;
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
