import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'c8y-template-setup-stepper-buttons',
  templateUrl: './template-setup-stepper-buttons.component.html'
})
export class TemplateSetupStepperButtonsComponent {
  @Input() index;
  @Output() onNext = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();
  
}
