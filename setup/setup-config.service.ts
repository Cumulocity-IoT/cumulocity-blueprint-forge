import { Injectable } from "@angular/core";
import { C8yStepper, SetupComponent } from "@c8y/ngx-components";
import { BlueprintForge } from "./template-setup.model";
import { CdkStep } from "@angular/cdk/stepper";

@Injectable()
export class SetupConfigService{

    stepperIndex = 0;
    constructor() {}
    

    stepCompleted(stepper: C8yStepper, step: CdkStep, setup: SetupComponent, blueprintForge: BlueprintForge, newConfig: any) {
        while(this.stepperIndex <= blueprintForge.selectedStepperIndex ){
          this.stepperIndex ++;       
          setTimeout(() => {  
            step.completed = true;
            setup.stepCompleted(stepper.selectedIndex);
            setup.data$.next(newConfig);
            stepper.next();
           }, 10);
        }
    }
}