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
    media?: MediaDetails[];
    plugins?: PluginDetails[];
    microservices?: MicroserviceDetails[];
    dashboards: DashboardDetails[];
    devices?: DeviceDetails[];
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
    icon: string;
    config: string;
    description: string;
    widgets: WidgetDetails[];
}

export interface DashboardWidgets {
    widgets: WidgetDetails[];
}

export interface WidgetDetails {
    id?: string;
    configTemplateUrl: string;
    componentId: string;
    classes: CSSClasses;
    _x: number;
    _y: number;
    title: string;
    height: number;
    width: number;
    config: ImageBinaryId;
}

export interface CSSClasses {
    image: boolean;
    cardDashboard: boolean;
    panelTitleRegular:  boolean;
    card: boolean
}

export interface ImageBinaryId {
    imageBinaryId: string;
}

export interface DeviceDetails {
    type: string;
    placeholder: string;
    representation?: {
        id: string;
        name: string;
    };
}









