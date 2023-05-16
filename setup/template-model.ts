export interface TemplatesView {
    id: string;
    title: string;
    description: string;
    imageLink: Blob;
    configLink: string;
    comingSoon: boolean;
}

export interface TemplateDetails {
    id: string;
    tagLine: string;
    description: string;
    media: MediaDetails[];
    plugins?: PluginDetails[];
    microservices?: MicroserviceDetails[];
    dashboard: string;
}

export interface MediaDetails {
    url: string;
    type: string;
}

export interface PluginDetails {
    id: string;
    title: string;
    tagLine: string;
    link: string;
}

export interface MicroserviceDetails {
    id: string;
    title: string;
    tagLine: string;
    link: string;
}