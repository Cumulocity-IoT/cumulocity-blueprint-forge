export interface StepOneView {
    selectedId: string;
    steps: CurrentStepEnabled;
}

export interface StepTwoDetails {
    selectedId: string;
    steps: CurrentStepEnabled;
}

export interface StepThreeConfiguration {
    selectedId: string;
    artifacts: ArtifactDetails[];
    steps: CurrentStepEnabled;
}

export interface CurrentStepEnabled {
    isTemplateView: boolean;
    isTemplateDetails: boolean;
    isTemplateConfiguration: boolean;
}

export interface ArtifactDetails {
    id: string;
    type: string;
    title: string;
}