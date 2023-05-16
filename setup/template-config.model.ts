export const DEFAULT_HOME_DASHBOARD_NAME = 'home-cockpit1';
export const USER_HOME_DASHBOARD_NAME = 'home-cockpit-user';

export interface TemplateConfig {
  rootNodes: TemplateConfigRootNode[];
  features: {
    alarms: boolean;
    dataExplorer: boolean;
    groups: boolean;
    reports: boolean;
    exports: boolean;
    dataPointLibrary: boolean;
    globalSmartRules: boolean;
    smartRules: boolean;
    subassets: boolean;
    search: boolean;
    [key: string]: boolean;
  };
  hideNavigator: boolean;
  homeDashboardName: string;
  userSpecificHomeDashboard: boolean;
}

export const DEFAULT_CONFIG: TemplateConfig = {
  rootNodes: [],
  features: {
    alarms: true,
    dataExplorer: true,
    groups: true,
    reports: true,
    exports: true,
    dataPointLibrary: true,
    globalSmartRules: true,
    smartRules: true,
    subassets: true,
    search: true
  },
  hideNavigator: false,
  homeDashboardName: DEFAULT_HOME_DASHBOARD_NAME,
  userSpecificHomeDashboard: false
};

export interface TemplateConfigRootNode {
  id: string;
  name: string;
  hideDevices?: boolean;
}

export enum HomeDashboardType {
  /**
   * Shared by all Cockpit apps
   */
  DEFAULT,
  /**
   * Only for the current Cockpit.
   */
  APP,
  /**
   * Only for the current user.
   */
  USER
}

export const COCKPIT_CONFIG_PATH = 'cockpit-application-configuration';
