/**
 * Copyright (c) 2023-2025, WSO2 LLC. (https://www.wso2.com).
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

export const APPLICATION_DOMAIN: string = "Application/";
export const INTERNAL_DOMAIN: string = "Internal";
export const ROLE_VIEW_PATH: string = "/roles/";

/**
 * Class containing role constants.
 */
export class RoleConstants {

    /**
     * Private constructor to avoid object instantiation from outside
     * the class.
     */

    /* eslint-disable @typescript-eslint/no-empty-function */
    private constructor() { }

    /**
     * Set of keys used to enable/disable features.
     */
    public static readonly FEATURE_DICTIONARY: Map<string, string> = new Map<string, string>()
        .set("ROLE_CREATE", "roles.create")
        .set("ROLE_UPDATE", "roles.update")
        .set("ROLE_DELETE", "roles.delete")
        .set("ROLE_READ", "roles.read");

    public static readonly SUPER_ADMIN_PERMISSION_KEY: string = "/permission/protected";
}
