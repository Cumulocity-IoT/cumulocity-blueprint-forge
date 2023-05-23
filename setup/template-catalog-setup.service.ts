import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { has, get } from "lodash-es";
import { IManagedObject, IManagedObjectBinary } from '@c8y/client';
import { AppTemplateDetails, TemplateCatalogEntry } from "./template-catalog-setup.model";
import { ApplicationService, InventoryBinaryService, InventoryService } from "@c8y/ngx-components/api";
import { TemplateSetupStep } from "./template-setup-step";

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

    public templateData = new BehaviorSubject<AppTemplateDetails>(undefined);
    templateData$ = this.templateData.asObservable();
  
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


    getTemplateCatalog(): Observable<TemplateCatalogEntry[]> {
        let url = `${this.GATEWAY_URL_GitHubAPI}${this.bluePrintTemplatePath}`;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForTemplateCatalog(url);
    }

    getTemplateDetailsCatalog(dashboardurl): Observable<AppTemplateDetails> {
        let url = `${this.GATEWAY_URL_GitHubAPI}${dashboardurl}`;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForTemplateDetailsCatalog(url);
    }

    getTemplateDetailsCatalogFallBack(dashboardurl): Observable<AppTemplateDetails> {
        let url = `${this.GATEWAY_URL_GitHubAPI_FallBack}${dashboardurl}`;
        this.isFallBackActive = true;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForTemplateDetailsCatalog(url);
    }

 
    getTemplateCatalogFallBack(): Observable<TemplateCatalogEntry[]> {
        let url = `${this.GATEWAY_URL_GitHubAPI_FallBack}${this.bluePrintTemplatePath}`;
        this.isFallBackActive = true;
        if(this.pkgVersion.includes('dev')) {
            url = url + this.devBranchPath;
        } else if (this.pkgVersion.includes('rc')) {
            url = url + this.preprodBranchPath;
        }
        return this.getDataForTemplateCatalog(url);
    }

    private getDataForTemplateCatalog(url: string): Observable<TemplateCatalogEntry[]> {
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
                    useCase: get(entry, 'use_case'),
                    dashboard: get(entry, 'dashboard'),
                    comingSoon: get(entry, 'coming_soon')
                } as TemplateCatalogEntry;
                
            });
            
        }));
    }

    private getDataForTemplateDetailsCatalog(url: string): Observable<AppTemplateDetails> {
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
            } as AppTemplateDetails;
            
            
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


}