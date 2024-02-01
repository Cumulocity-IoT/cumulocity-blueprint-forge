/*
* Copyright (c) 2024 Software AG, Darmstadt, Germany and/or its licensors
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

import {Component} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";


@Component({
    selector: 'dtdl-simulator-modal',
    templateUrl: './dtdl-simulator-modal.component.html',
    styleUrls: ['./dtdl-simulator-modal.component.html']
})


export class DtdlSimulatorModalComponent {
    typeOptions=[
        { name:'--select type--', value:0 },
        { name:'DTDL Configuration', value:1 },
        { name:'CSV Configuration', value:2 }
    ];
    pageOptions=[
        { name:'Last 50 measurements', value:50 },
        { name:'Last 100 measurements', value:100 },
        { name:'Last 200 measurements', value:200 }
    ]
    typeSelected=0;
    pageSize=50;
    public onGenerate: Subject<any>;

    constructor(public bsModalRef: BsModalRef){
        this.onGenerate=new Subject();
    };

    typeChanged(){
        console.log("Type Selected:",this.typeSelected);
    }

    pageChanged(){
        console.log("Page Size:",this.pageSize);
    }

    createSimulatorClicked(){
        let response:any={
            pageSize:this.pageSize,
            typeSelected:this.typeSelected
        }
        this.onGenerate.next(response);
        this.bsModalRef.hide();
    }
}