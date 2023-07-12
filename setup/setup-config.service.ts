import { Injectable } from "@angular/core";
import { AppStateService, C8yStepper, SetupComponent } from "@c8y/ngx-components";
import { BlueprintForge } from "./template-setup.model";
import { CdkStep } from "@angular/cdk/stepper";

@Injectable()
export class SetupConfigService{
    appConfig: any;
    stepperIndex = 0;
    constructor(protected appState: AppStateService) {
        this.appState.currentApplicationConfig.subscribe( appConfig => {
            this.appConfig = appConfig;
    })
    }
    

    stepCompleted(stepper: C8yStepper, step: CdkStep, setup: SetupComponent) {
        if(this.appConfig && this.appConfig.blueprintForge && this.appConfig.blueprintForge.selectedStepperIndex > 0){
            while(this.stepperIndex <= (this.appConfig.blueprintForge.selectedStepperIndex  + 1) ){
                this.stepperIndex ++;       
                setTimeout(() => {  
                  step.completed = true;
                  setup.stepCompleted(stepper.selectedIndex);
                  setup.data$.next(this.appConfig);
                  stepper.next();
                 }, 10);
              }
              return this.appConfig.blueprintForge;
        }
        return null;
        
    }
}