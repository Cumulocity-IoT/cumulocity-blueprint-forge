export interface TemplateCatalogEntry {
    title: string;
    description: string;
    thumbnail: string;
    device?: string;
    manufactur?: string;
    useCase: string;
    dashboard: string;
    comingSoon: boolean;
}

export interface AppTemplateDetails {
    title: string;
    tagLine: string;
    description: string;
    media: MediaDetails[];
    plugins: PluginDetails[];
    microservices: MicroserviceDetails[];
    dashboards: DashboardDetails[];
}

export interface MediaDetails {
    image: string;
    thumbImage: string;
}

export interface PluginDetails  {
    id: string;
    title: string;
    description: string;
    link: string;
    requiredPlatformVersion: string;
}

export interface MicroserviceDetails {
    id: string;
    title: string;
    link: string;
    description: string;
}

export interface DashboardDetails {
    name: string;
    config: string;
    description: string;
}









