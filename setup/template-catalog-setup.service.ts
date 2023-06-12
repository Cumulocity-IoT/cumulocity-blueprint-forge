import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { has, get } from "lodash-es";
import { ApplicationService, InventoryBinaryService, InventoryService } from "@c8y/ngx-components/api";
import { CumulocityDashboard } from "builder/template-catalog/template-catalog.model";
import { TemplateBlueprintDetails, TemplateBlueprintEntry } from "./template-setup.model";

const packageJson = require('./../package.json');
@Injectable()
export class TemplateCatalogService{

    private GATEWAY_URL_GitHubAsset = '';
    private GATEWAY_URL_GitHubAPI = '';
    private GATEWAY_URL_GitHubAsset_FallBack = '';
    private GATEWAY_URL_GitHubAPI_FallBack = '';
    private bluePrintTemplatePath = '/blueprintForge/template.json';
    private bluePrintTemplateDetailsPath = '/blueprintForge/boonLogic/config.json';
    private devBranchPath = "?ref=blueprint-forge";
    private preprodBranchPath = "?ref=blueprint-forge";
    pkgVersion: any;
    private isFallBackActive = false;

    private blueprintURL = 'https://presalesglobalprod.apigw-aw-eu.webmethods.io/gateway/GitHubAPIService/1.0/repos/SoftwareAG/global-presales-assets/contents'

    public templateData = new BehaviorSubject<TemplateBlueprintDetails>(undefined);
    templateData$ = this.templateData.asObservable();

   /*  public widgetConfigDetails = new BehaviorSubject<DashboardWidgets>(undefined);
    widgetConfigDetails$ = this.widgetConfigDetails.asObservable(); */
  
    constructor(private http: HttpClient, private inventoryService: InventoryService,
        private appService: ApplicationService, 
        private binaryService: InventoryBinaryService,
        ) {
        this.GATEWAY_URL_GitHubAPI = this.blueprintURL;
        this.GATEWAY_URL_GitHubAsset =  this.blueprintURL;
        this.GATEWAY_URL_GitHubAPI_FallBack = this.blueprintURL;
        this.GATEWAY_URL_GitHubAsset_FallBack =  this.blueprintURL;
        this.pkgVersion = packageJson.version;
        
    }


    getTemplateCatalog(): Observable<TemplateBlueprintEntry[]> {
        let url = `${this.GATEWAY_URL_GitHubAPI}${this.bluePrintTemplatePath}`;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForTemplateCatalog(url);
    }

    getTemplateDetailsCatalog(dashboardurl): Observable<TemplateBlueprintDetails> {
        let url = `${this.GATEWAY_URL_GitHubAPI}${dashboardurl}`;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForTemplateDetailsCatalog(url);
    }

   /*  getDashboardDetails(dashboardURL): Observable<DashboardWidgets> {
        let url = `${this.GATEWAY_URL_GitHubAPI}${dashboardURL}`;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForDashboardDetails(url);
    } */

    getTemplateDetailsCatalogFallBack(dashboardurl): Observable<TemplateBlueprintDetails> {
        let url = `${this.GATEWAY_URL_GitHubAPI_FallBack}${dashboardurl}`;
        this.isFallBackActive = true;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForTemplateDetailsCatalog(url);
    }

   /*  getDashboardDetailsFallBack(dashboardurl): Observable<DashboardWidgets> {
        let url = `${this.GATEWAY_URL_GitHubAPI_FallBack}${dashboardurl}`;
        this.isFallBackActive = true;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForDashboardDetails(url);
    } */
 
    getTemplateCatalogFallBack(): Observable<TemplateBlueprintEntry[]> {
        let url = `${this.GATEWAY_URL_GitHubAPI_FallBack}${this.bluePrintTemplatePath}`;
        this.isFallBackActive = true;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForTemplateCatalog(url);
    }

    private getDataForTemplateCatalog(url: string): Observable<TemplateBlueprintEntry[]> {
        return this.http.get(`${url}`).pipe(map(response => {
            if (!has(response, 'template')) {
                console.error('Failed to load catalog');
                return undefined;
            }

            let catalog = response['template'] as Array<object>;
            return catalog.map(entry => {
                return {
                    title: get(entry, 'title'),
                    description: get(entry, 'description'),
                    thumbnail: get(entry, 'thumbnail'),
                    config: get(entry, 'config'),
                    comingSoon: get(entry, 'coming_soon')
                } as TemplateBlueprintEntry;
                
            });
            
        }));
    }

    /* private getDataForDashboardDetails(url: string): Observable<DashboardWidgets> {
        return this.http.get(`${url}`).pipe(map(response => {
           

            let catalog = response as Array<object>;
            return {
              
                widgets: get(catalog, "widgets")
            } as DashboardWidgets;
            
            
        }));
        
    } */

    private getDataForTemplateDetailsCatalog(url: string): Observable<TemplateBlueprintDetails> {
        return this.http.get(`${url}`).pipe(map(response => {
            // if (!has(response, 'templateId')) {
            //     console.error('Failed to load catalog');
            //     return undefined;
            // }

            let catalog = response as Array<object>;
            return {
                templateId: get(catalog, "templateId"),
                title: get(catalog, 'title'),
                tagLine: get(catalog, 'tagLine'),
                media: get(catalog, 'media'),
                plugins: get(catalog, 'plugins'),
                microservices: get(catalog, 'microservices'),
                dashboards: get(catalog, 'dashboards'),
                description: get(catalog, 'description')
            } as TemplateBlueprintDetails;
            
            
        }));
    }

    downloadBinary(binaryId: string): Observable<ArrayBuffer> {
        return this.http.get(`${this.GATEWAY_URL_GitHubAsset}${binaryId}`, {
            responseType: 'arraybuffer'
        })
        .pipe(catchError(err => {
            console.log('Template Catalog: Download Binary: Error in primary endpoint! using fallback...');
            return this.http.get(`${this.GATEWAY_URL_GitHubAsset_FallBack}${binaryId}`, {
              responseType: 'arraybuffer'
            })
        }));
    }

    
    getGithubURL(relativePath: string){
        let url = `${this.GATEWAY_URL_GitHubAPI}`;
        if(this.isFallBackActive) {
            url = `${this.GATEWAY_URL_GitHubAPI_FallBack}`;
        }
        if(this.pkgVersion.includes('dev')) {
            return url + `${relativePath}${this.devBranchPath}`;
        } else if (this.pkgVersion.includes('rc')) {
            return url + `${relativePath}${this.preprodBranchPath}`;
        }
        return  url + `${relativePath}`;
    }

    getCumulocityDashboardRepresentation(dashboardConfiguration, widgets): CumulocityDashboard {
        return {
            children: this.getWidgetsAsChildren(widgets),
            name: 'Blueprint-Forge-Dashboard',    //dashboardConfiguration.dashboardName
            icon: '',         // dashboardConfiguration.dashboardIcon
            global: true,
            isFrozen: true,
        };
    }

    private getWidgetsAsChildren(widgets): object {
        let children = {};
        console.log('Widgets value in get widgets as children', widgets);
        widgets.forEach(widget => {
            widget.id = this.generateId();
            children[this.generateId()] = widget;
        })
    
        return children;
    }
    
    private generateId(): string {
      let id = this.generateRandomInteger(10000, 100000000);
      return id.toString();
    }
    
    private generateRandomInteger(min, max): number {
      return Math.floor(Math.random() * Math.floor(max) + min);
    }
    


}