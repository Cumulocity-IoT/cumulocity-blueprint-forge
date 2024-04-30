/*
* Copyright (c) 2023 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */
import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { cloneDeep } from "lodash-es";
import { Subject } from "rxjs";

@Component({
    selector: 'dashboard-list-modal',
    templateUrl: './dashboard-list.component.html',
    styleUrls: ['./styles.less', './dashboard-list.component.css']
})
export class DashboardListModalComponent implements OnInit{
    dashboardTemplatesList: any;
    searchString: string;
    showImage: boolean = false;
    imageIndex: any;
    dashboardTemplatesListCopy: any;
    public onTemplateSelected: Subject<string>;
    templateSelected: any;
	  
    constructor(private modalRef: BsModalRef) { }
    ngOnInit() {
        this.dashboardTemplatesListCopy = cloneDeep(this.dashboardTemplatesList);
        this.onTemplateSelected = new Subject();
    }

    searchForDashboard() {
        if (!this.searchString || this.searchString === '' || this.searchString.length == 0) {
            this.dashboardTemplatesList = [];
          }
          else if (this.searchString && this.searchString.length >= 3) {
            this.dashboardTemplatesList = this.dashboardTemplatesList.filter(dashboardTemplate => 
                dashboardTemplate?.title.toLowerCase().includes(this.searchString.toLowerCase())
            )
          }
    }
    
     clearSearch(): void {
        this.searchString = '';
        this.dashboardTemplatesList = cloneDeep(this.dashboardTemplatesListCopy);
      }

    closeDialog(): void {
        this.modalRef.hide();
    }

    showImageCanvas(dashboard, index) {
        this.showImage = !this.showImage;  
        this.imageIndex = index;
        this.templateSelected = dashboard?.title?.trim();
    }

    backToList() {
        this.showImage = false;
    }

    selectDashboardTemplate() {
        this.onTemplateSelected.next(this.templateSelected);
        this.closeDialog();
    }

    selectTemplateChosen(dashboard) {
        this.templateSelected = dashboard?.title?.trim();
    }
}