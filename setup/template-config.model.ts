export interface TemplateConfig {
  templateId: string,
  title: string,
  description: string,
  thumbnail: string,
  dashboard: string,
  comingSoon: boolean
}

export const DEFAULT_CONFIG: TemplateConfig = {
  templateId: "",
  title: "",
  description: "",
  thumbnail: "",
  dashboard: "",
  comingSoon: false,
};

export interface TemplateDetails {
  templateId: string,
  title: string, 
  tagLine: string,
  image: string,
  video: string,
  description: string
}

export const details_config: TemplateDetails = {
  templateId: "",
  title: "",
  tagLine: "",
  image: "",
  video: "",
  description: ""

}


