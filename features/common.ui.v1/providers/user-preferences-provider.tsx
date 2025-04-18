/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
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

import get from "lodash-es/get";
import merge from "lodash-es/merge";
import React, { PropsWithChildren, ReactElement, useEffect, useState } from "react";
import UserPreferencesContext from "../contexts/user-preferences-context";

/**
 * Props interface of {@link UserPreferencesProvider}
 */
export interface UserPreferencesProviderProps<T> {
    /**
     * Initial preferences.
     */
    initialPreferences?: T;
    /**
     * Storage strategy. Default is "localstorage".
     */
    storageStrategy?: "localstorage" | "sessionstorage";
    /**
     * UUI of the user.
     */
    userId: string;
}

const USER_PREFERENCES_STORAGE_KEY: string = "user-preferences";

/**
 * Provider for the Application local settings.
 * This is a generic provider which can be used to store any type of settings.
 * The type of the preferences should be passed as a generic type.
 *
 * @example
 * `<UserPreferencesProvider<Preference> initialPreferences={ { "orgId": { "key": "value" } } }>`
 *
 * @param props - Props for the client.
 * @returns App settings provider.
 */
const UserPreferencesProvider = <T,>({
    children,
    storageStrategy = "localstorage",
    userId: _userId
}: PropsWithChildren<UserPreferencesProviderProps<T>>): ReactElement => {
    const [ preferencesInContext, setPreferencesInContext ] = useState<T>(null);

    /**
     * Set the initial preferences.
     * If the preferences are already set in storage, they will be overridden.
     */
    useEffect(() => {
        const storedPreferences: string = (() => {
            switch (storageStrategy) {
                case "localstorage":
                    return localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
                case "sessionstorage":
                    return sessionStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
                default:
                    return null;
            }
        })();

        if (storedPreferences) {
            const preferences: T = JSON.parse(storedPreferences);

            setPreferencesInContext(preferences);
        }
    }, [ storageStrategy ]);

    /**
     * Set the preferences in storage.
     *
     * @example
     * `setPreferences({ "key": "value" }, "orgId")`
     *
     * @param preferencesToUpdate - The new preferences to update.
     * @param userId - Optional user Id. If provided, the preferences for the passed in user-id will be updated.
     */
    const setPreferences = (preferencesToUpdate: T, userId?: string): void => {
        const updatedPreferences: T = merge({}, preferencesInContext, {
            [userId ?? _userId]: {
                ...preferencesToUpdate
            }
        });

        setPreferencesInContext(updatedPreferences);

        switch (storageStrategy) {
            case "localstorage":
                localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(updatedPreferences));

                break;
            case "sessionstorage":
                sessionStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(updatedPreferences));

                break;
            default:
                break;
        }
    };

    /**
     * Get the preferences from storage.
     *
     * @example
     * `getPreferences("key.nested", "orgId")`
     *
     * @param key - The key of the preference to retrieve.
     * @param userId - Optional user Id. If provided, the preferences for the passed in user-id will be updated.
     */
    const getPreferences = (key: string, userId?: string): T => {
        const userKey: string = userId ?? _userId;

        return get(preferencesInContext, userKey, {})[key] ?? null;
    };

    /**
     * Get all flat-level preferences for the specified organization.
     *
     * @example
     * `getFlatPreferences("orgId")`
     *
     * @param userId - Optional user Id. If provided, the preferences for the passed in user-id will be updated.
     */
    const getFlatPreferences = (userId?: string): T => get(preferencesInContext, userId ?? _userId, {}) as T;

    return (
        <UserPreferencesContext.Provider
            value={ {
                getPreferences,
                setPreferences,
                ...getFlatPreferences()
            } }
        >
            { children }
        </UserPreferencesContext.Provider>
    );
};

export default UserPreferencesProvider;
