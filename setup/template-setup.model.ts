export interface TemplateBlueprintEntry {
    templateId: string;
    title: string;
    description: string;
    thumbnail: string;
    config: string;
    comingSoon: boolean;
}

export interface TemplateBlueprintDetails {
    templateId: string;
    title: string;
    tagLine: string;
    description: string;
    media?: MediaDetails[];
    plugins?: PluginDetails[];
    microservices?: MicroserviceDetails[];
    dashboards: Dashboards[];
 //   devices?: DeviceDetails[];
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
    fileName: string;
    requiredPlatformVersion: string;
}

export interface MicroserviceDetails {
    id: string;
    title: string;
    link: string;
    fileName: string;
    description: string;
}

export interface Dashboards {
    title: string;
    icon: string;
    isDeviceRequired: boolean;
    dashboard: string;
    description: string;
    selected?: boolean;
    configured?: boolean;
    deviceId?: string;
    isChecked?: boolean;
    dashboardWidgets: DashboardWidgets[];
}
export interface DashboardWidgets {
    id?: string;
    name: string;
    _x: number;
    _y: number;
    _height: number;
    _width: number;
    config: object;
    position?: number;
    title?: string;
    templateUrl?: string;
    configTemplateUrl?: string;
}

/* export interface CSSClasses {
    image: boolean;
    cardDashboard: boolean;
    panelTitleRegular:  boolean;
    card: boolean
} */

/* export interface DeviceDetails {
    type: string;
    placeholder: string;
    representation?: {
        id: string;
        name: string;
    };
} */










