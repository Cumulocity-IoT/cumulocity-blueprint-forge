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
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
  export class ProgressIndicatorService {

    progress$ = new Subject<number>();
    overallProgress$ = new Subject<number>();
    message$ = new Subject<string>();

    setProgress(progress: number) {
        this.progress$.next(progress);
    }

    setOverallProgress(progress: number) {
      this.overallProgress$.next(progress);
  }

    setMessage(message: string) {
      this.message$.next(message);
    }
  
  }