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

import { colorToHex, contrastingTextColor, lighter, darker } from "./color-util";

export function standardTheme(branding: any) {
    const standardTheme = `
    body {

        /* Navigator color: */
        --brand-primary: ${colorToHex(branding.colors.primary)};
        --brand-light: ${lighter(branding.colors.primary)};
        --navigator-active-bg: ${colorToHex(branding.colors.active)};

        /* Navigator text: */
        --navigator-text-color: ${colorToHex(branding.colors.textOnPrimary)};
        --navigator-title-color: ${colorToHex(branding.colors.textOnPrimary)};
        --navigator-active-color: ${colorToHex(branding.colors.textOnActive)};
        --navigator-hover-color: ${colorToHex(branding.colors.hover)};
      

        /* All the other text: */
        --brand-dark: ${colorToHex(branding.colors.text)};
        --header-hover-color: ${branding.colors.hover ? colorToHex(branding.colors.hover) : '#14629f'};
        --header-color: ${branding.colors.headerBar ? colorToHex(branding.colors.headerBar) : '#ffffff'};
        --page-tabs-background:${branding.colors.tabBar ? colorToHex(branding.colors.tabBar) : '#ffffff'};
     
        ${branding.logoHeight != undefined ? '--navigator-platform-logo-height: ' + branding.logoHeight + 'px;' : ''}

        /*1017 changes */
        --header-text-color:  ${colorToHex(branding.colors.text)};
        --c8y-headings-color:${colorToHex(branding.colors.text)};
        --c8y-action-bar-color-actions:${colorToHex(branding.colors.text)};
        --c8y-action-bar-icon-color:${colorToHex(branding.colors.text)};
        --c8y-nav-tabs-color-default:${colorToHex(branding.colors.text)};
        --c8y-nav-tabs-icon-color-active:${colorToHex(branding.colors.textOnActive)};
        --c8y-action-bar-color-actions-hover:${colorToHex(branding.colors.hover)};
        --c8y-action-bar-background-default: ${colorToHex(branding.colors.toolBar)};
        --header-hover-color: ${colorToHex(branding.colors.hover)};    
        --navigator-color-active:  ${colorToHex(branding.colors.textOnPrimary)};
        --navigator-separator-color: ${colorToHex(branding.colors.primary)};
        --c8y-body-background-color: ${darker(branding.colors.primary)};
        --navigator-bg-color: ${colorToHex(branding.colors.primary)};
        --navigator-header-bg: ${colorToHex(branding.colors.primary)};
        --c8y-component-icon-dark-color-dark: ${colorToHex(branding.colors.text)};
        --c8y-component-background-default: ${lighter(branding.colors.primary)};
        --c8y-form-control-background-default:${darker(branding.colors.primary)};
        --c8y-form-control-color-default:${colorToHex(branding.colors.text)};
        --c8y-component-color-default:${colorToHex(branding.colors.text)};
        --c8y-component-color-actions:${colorToHex(branding.colors.text)};
        --c8y-component-background-active:  ${lighter(branding.colors.primary)};
        --c8y-component-form-label-color:  ${darker(branding.colors.text)};
        --c8y-component-background-odd:  ${colorToHex(branding.colors.primary)};
        --c8y-component-background-expanded:${darker(branding.colors.primary)}; //Need a higher color
        --c8y-form-label-color: ${colorToHex(branding.colors.text)};
        --c8y-component-color-link: ${darker(branding.colors.text)};
        --c8y-component-icon-color: ${darker(branding.colors.text)};
        --c8y-nav-tabs-background-default:  ${lighter(branding.colors.primary)};
        --c8y-form-control-background-focus:  ${lighter(branding.colors.primary)};
        --c8y-form-control-color-focus:${colorToHex(branding.colors.text)};
        --c8y-alert-background-default: ${lighter(branding.colors.primary)};
        --c8y-alert-color-default:${colorToHex(branding.colors.text)};

        --c8y-level-0: ${lighter(branding.colors.primary)};
        --c8y-level-1-custom: ${lighter(branding.colors.primary,1.1)};
        --c8y-level-2-custom: ${lighter(branding.colors.primary,1.2)};

        

        /* Widget specific */
        --component-color: ${colorToHex(branding.colors.text)};
        --card-color: ${colorToHex(branding.colors.text)};
        --card-background: ${lighter(branding.colors.primary)};
        --component-background: ${lighter(branding.colors.primary)};
        --component-label-color:${darker(branding.colors.text)};       

        --dropdown-background: ${branding.colors.headerBar ? colorToHex(branding.colors.headerBar) : '#ffffff'};
        --toolbar-background:${branding.colors.toolBar ? colorToHex(branding.colors.toolBar) : '#ffffff'};
        --toolbar-color: ${colorToHex(branding.colors.text)};
        --toolbar-actions-color-hover: ${branding.colors.toolBar ? colorToHex(branding.colors.hover) : '#14629f'};
        --toolbar-focus-color: ${colorToHex(branding.colors.text)};
        --dropdown-actions-color-hover: ${colorToHex(branding.colors.text)};
        --component-actions-color-hover: ${colorToHex(branding.colors.text)};
        --page-tabs-link-color: ${colorToHex(branding.colors.text)};
        --page-tabs-actions-color: ${colorToHex(branding.colors.text)};
        --page-tabs-actions-color-hover: ${colorToHex(branding.colors.text)};
        --list-group-actions-color: var(--component-link-color, #000);
        --dropdown-active-color:${colorToHex(branding.colors.active)};
        --tooltip-background: ${colorToHex(branding.colors.active)};/*0b385b*/
        --tooltip-color: ${colorToHex(branding.colors.textOnActive)};

        }

        .header-bar {
            box-shadow: inset 0 -1px 0 0 var(--c8y-body-background-color, var(--c8y-component-border-color));
        }

        .page-tabs-horizontal .tabContainer .nav-tabs {
            background-color: var(--page-tabs-background, #fff);
            box-shadow: inset 0 -1px 0 0 var(--c8y-body-background-color, var(--c8y-component-border-color));
        }

        .page-tabs-horizontal .tabContainer .nav-tabs > div > a {
            background-color: var(--page-tabs-background, #fff);
            box-shadow: inset 0 -1px 0 0 var(--c8y-body-background-color, var(--c8y-component-border-color));
        }

        .page-tabs-horizontal .tabContainer .nav-tabs > div.active > a {
            background-color: var(--page-tabs-background, #fff);
            box-shadow: inset 0 calc(var(--c8y-nav-tabs-border-width-active) * -1) 0 0 var(--c8y-nav-tabs-border-color-active);
        }

        .navigator .title .tenant-brand {
        background-image: url(${CSS.escape(branding.logo || '')});
        padding-bottom: var(--navigator-platform-logo-height,28px);
        }

        .title .c8y-app-icon {
        ${branding.logoHeight != undefined ? '' : 'margin-top: -16px;'}
        }

        .btn.btn-primary {
        color: ${contrastingTextColor(branding.colors.primary)};
        background-color: var(--brand-primary);
        }
        .btn.btn-primary:active,.btn.btn-primary:active:hover {
        color: ${contrastingTextColor(branding.colors.text)};
        
        }
        .btn.btn-primary:hover,.btn.btn-primary:focus {
        color: var(--brand-primary, #1776BF);
        background-color: ${contrastingTextColor(branding.colors.primary)};
        }
        
        .btn-group .btn {
            background-color: transparent;
        }

        .btn-default {
            background-color: inherit;
        }
       
        .body-theme {
            --body-background-color: var(--c8y-body-background-color,#fff);
        }
        .simulator-body-theme {
           --body-background-color: var(--c8y-body-background-color, #fff);
        }
        .dashboard-body-theme {
            --body-background-color: var(--c8y-body-background-color,#fff);
        }
        .label-color {
            color: var(--navigator-active-color, #000);
        }
        .card-color {
            background: var(--brand-light, #fff);
            color: var(--navigator-active-color, #000);
        }
        .dashboard-grid .card-dashboard  .bg-level-0 {
            background-color: var(--brand-light, var(--c8y-level-0))!important;
        }       
            
        .app-switcher-dropdown-menu{
            border: none !important;
        }
        .dashboard-grid .card-dashboard  .navbar-default {
            background-color: inherit;
        }
        
       
        .dashboard-grid .card-dashboard .form-control {
            background-color: var(--card-background, var(--c8y-component-background-default)) !important;
            color: var(--card-color, #000) !important;
        }
      
        label {
            color: var(--component-label-color) !important;
        }
        
        [datepicker] table, [uib-datepicker] table, [uib-daypicker] table {
            background-color: var(--c8y-root-component-background-default, #fff);
            color:var(--c8y-root-component-color-default, #fff);
        }
        .bg-inherit {
            background-color: var(--card-background, var(--c8y-component-background-default)) !important;
        }
        .bg-level-1 {
            background-color: var(--c8y-level-1-custom) !important;
        }
        .bg-level-2 {
            background-color: var(--c8y-level-2-custom) !important;
        }
        .ng-select .ng-select-container{            
            background-color: var(--c8y-form-control-background-default) !important;
            color: var(--component-color);
        }
        .ng-dropdown-panel .ng-dropdown-panel-items .ng-option{
            background-color: var(--c8y-form-control-background-default) !important;
            color: var(--component-label-color);
        }
        .ng-dropdown-panel .ng-dropdown-panel-items .ng-option.ng-option-marked {
            color: var(--component-color);
        }
        .ng-dropdown-panel .ng-dropdown-panel-items .ng-option.ng-option-selected, .ng-dropdown-panel .ng-dropdown-panel-items .ng-option.ng-option-selected.ng-option-marked{
            color: var(--component-color);
        }
        .ng-select.ng-select-multiple .ng-select-container .ng-value-container .ng-input > input {
            color: var(--c8y-form-control-color-default);
        }
         
        .c8y-wizard-form {
            background-color:inherit;
        }
        .form-read-only .form-group label {
            color: var(--component-label-color) !important;
        }    

        .app-noicon {
            color: var(--brand-primary);
        }
        .c8y-switch input[type=checkbox]+span:after {
            background-color: var(--component-label-color) !important;
        }
        .range-display__range__current {
            border-top: 2px solid var(--brand-dark, var(--brand-light, var(--c8y-brand-light)));
        }
        .range-display--vertical .range-display__range__current {
            border-left: 2px solid var(--brand-dark, var(--brand-light, var(--c8y-brand-light)));
        }
    `;

    return standardTheme;
}
