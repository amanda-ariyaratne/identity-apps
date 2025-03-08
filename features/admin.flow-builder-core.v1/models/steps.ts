/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Base } from "./base";
import { Resource } from "./resources";

export interface StepPosition {
    x: number;
    y: number;
}

export interface StepSize {
    width: number;
    height: number;
}

export interface Step extends Base {
    size: StepSize;
    position: StepPosition;
    __generationMeta__: any;
}

export enum StepCategories {
    Decision = "DECISION",
    Interface = "INTERFACE",
    Workflow = "WORKFLOW"
}

export enum StepTypes {
    View = "VIEW",
    Rule = "RULE",
    Redirection = "REDIRECTION"
}

export interface StepData {
    components: Resource[];
    [key: string]: any;
}

export enum StaticStepTypes {
    UserOnboard = "USER_ONBOARD",
    Start = "START",
}

export enum RedirectionTypes {
    GoogleFederation = "GoogleOIDCAuthenticator"
}
