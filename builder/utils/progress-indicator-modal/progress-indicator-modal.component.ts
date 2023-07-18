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
import { Component, OnDestroy, ViewEncapsulation } from "@angular/core";
import { Subscription } from 'rxjs';
import { ProgressIndicatorService } from './progress-indicator.service';

@Component({
    selector: 'progress-indicator-modal',
    templateUrl: './progress-indicator-modal.component.html',
    styleUrls: ['./styles.less'],
    encapsulation: ViewEncapsulation.None,
})
export class ProgressIndicatorModalComponent implements OnDestroy {

    message: string;
    progressStatus =  '0';
    overallProgressStatus = '0';
    progressSub: Subscription;
    overallProgressSub: Subscription;
    messageSub: Subscription;
    constructor(private progressIndicatorService: ProgressIndicatorService) {
        this.progressSub = this.progressIndicatorService.progress$.subscribe( (v: any) => {
            this.progressStatus = v + '%';
        })
        this.overallProgressSub = this.progressIndicatorService.overallProgress$.subscribe( (v: any) => {
            this.overallProgressStatus = v + '%';
        })
        this.messageSub = this.progressIndicatorService.message$.subscribe( (message: any) => {
            this.message = message;
        })
    }

    ngOnDestroy(): void {
        this.progressSub.unsubscribe();
        this.overallProgressSub.unsubscribe();
        this.messageSub.unsubscribe();
    }
}