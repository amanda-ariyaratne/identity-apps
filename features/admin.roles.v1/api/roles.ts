/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
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

import { AsgardeoSPAClient, HttpClientInstance } from "@asgardeo/auth-react";
import { store } from "@wso2is/admin.core.v1/store";
import { RoleConstants } from "@wso2is/core/constants";
import { IdentityAppsApiException } from "@wso2is/core/exceptions";
import { HttpMethods, RoleListInterface } from "@wso2is/core/models";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { CreateRoleInterface, PatchRoleDataInterface, SearchRoleInterface } from "../models/roles";

/**
 * Initialize an axios Http client.
 */
const httpClient: HttpClientInstance = AsgardeoSPAClient.getInstance()
    .httpRequest.bind(AsgardeoSPAClient.getInstance())
    .bind(AsgardeoSPAClient.getInstance());

/**
 * Retrieve Role details for a give role id.
 *
 * @param roleId - role id to retrieve role details
 */
export const getRoleById = (roleId: string): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: store.getState().config.endpoints.roles + "/" + roleId
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Update Data of the matched ID or the role
 *
 * @param roleId - Role id to update role details.
 * @param roleData - Data that needs to be updated.
 */
export const updateRoleDetails = (roleId: string, roleData: PatchRoleDataInterface): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        data: roleData,
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.PATCH,
        url: store.getState().config.endpoints.roles + "/" + roleId
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Retrieve a list of matched roles according to the search query.
 *
 * @param searchData - search query data
 */
export const searchRoleList = (searchData: SearchRoleInterface): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        data: searchData,
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.POST,
        url: store.getState().config.endpoints.rolesWithoutOrgPath + "/.search"
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Delete a selected role with a given role ID.
 *
 * @param roleId - Id of the role which needs to be deleted.
 * @returns A promise containing the status of the delete.
 */
export const deleteRoleById = (roleId: string): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.DELETE,
        url: store.getState().config.endpoints.roles + "/" + roleId
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Create a role in the system with role data given by user.
 *
 * @param data - data object used to create the role
 */
export const createRole = (data: CreateRoleInterface): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        data,
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.POST,
        url: store.getState().config.endpoints.roles
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Add or Update permission for the given Role using the role ID.
 *
 * @param roleId - ID of the role which needs to be updated
 * @param data - Permission data of the role
 */
export const updateRolePermissions = (roleId: string, data: unknown): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        data,
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.PUT,
        url: store.getState().config.endpoints.groups + "/" + roleId
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Retrieve a list of all the permissions from the system.
 *
 * @returns A promise containing the permission list
 */
export const getPermissionList = (): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: store.getState().config.endpoints.permission
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Retrieve the list of permissions available for a given Role Id.
 *
 * @param roleId - Role Id to retrieve relevant permissions
 */
export const getPermissionsForRole = (roleId: string): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: store.getState().config.endpoints.groups + "/" + roleId + "/permissions"
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Update Data of the matched ID or the role
 *
 * @param roleId - Role id to update role details
 * @param roleData - Data that needs to be updated.
 */
export const updateRole = (roleId: string, roleData: PatchRoleDataInterface): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        data: roleData,
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.PATCH,
        url: store.getState().config.endpoints.roles + "/" + roleId
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response);
        }).catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Retrieve the list of groups that are currently in the system.
 * TODO: Return `response.data` rather than `response` and stop returning any.
 *
 * @param domain - User store domain.
 * @returns Promise containing roles list.
 * @throws Exception if any error occured while getting the roles list.
 */
export const getRolesList = (domain: string): Promise<RoleListInterface | any> => {

    const requestConfig: AxiosRequestConfig = {
        headers: {
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        params: {
            domain
        },
        url: store.getState().config.endpoints.roles
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    RoleConstants.ROLES_FETCH_REQUEST_INVALID_RESPONSE_CODE_ERROR,
                    null,
                    response.status,
                    response.request,
                    response,
                    response.config);
            }

            return Promise.resolve(response);
        })
        .catch((error: AxiosError) => {
            throw new IdentityAppsApiException(
                RoleConstants.ROLES_FETCH_REQUEST_ERROR,
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config);
        });
};
