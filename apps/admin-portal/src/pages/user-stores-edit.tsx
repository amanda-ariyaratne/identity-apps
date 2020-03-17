/**
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the 'License'); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { useEffect, useState } from "react"
import { PageLayout } from "../layouts"
import { getAUserStore } from "../api";
import { AlertLevels, UserStore } from "../models";
import { ResourceTab } from "@wso2is/react-components";
import {
    EditBasicDetailsUserStore,
    EditConnectionDetails,
    EditAdvancedProperties,
    EditOptionalProperties
} from "../components";
import { history } from "../helpers";
import { useDispatch } from "react-redux";
import { addAlert } from "../store/actions";

export const UserStoresEditPage = (props): React.ReactElement => {

    const userStoreId = props.match.params.id;

    const [userStore, setUserStore] = useState<UserStore>(null);

    const dispatch = useDispatch();

    const getUserStore = () => {
        getAUserStore(userStoreId).then(response => {
            setUserStore(response);
        }).catch(error => {
            dispatch(addAlert(
                {
                    description: error?.description,
                    level: AlertLevels.ERROR,
                    message: error?.message
                }
            ));
        })
    }

    useEffect(() => {
        getUserStore();
    }, []);

    const panes = [
        {
            menuItem: "Basic Details",
            render: () => (
                <EditBasicDetailsUserStore
                    userStore={ userStore }
                    update={ getUserStore }
                    id={ userStoreId }
                />
            )
        },
        {
            menuItem: "Connection Details",
            render: () => (
                <EditConnectionDetails
                    userStore={ userStore }
                    update={ getUserStore }
                />
            )
        },
        {
            menuItem: "Advanced Properties",
            render: () => (
                <EditAdvancedProperties
                    userStore={ userStore }
                    update={ getUserStore }
                />
            )
        },
        {
            menuItem: "Optional Properties",
            render: () => (
                <EditOptionalProperties
                    userStore={ userStore }
                    update={ getUserStore }
                />
            )
        }
    ];

    return (
        <PageLayout
            title={ userStore?.name }
            description={ "Edit User Store" }
            backButton={ {
                onClick: () => {
                    history.push("/user-stores");
                },
                text: "Go back to User Stores"
            } }
            titleTextAlign="left"
            bottomMargin={ false }
        >
            <ResourceTab panes={ panes } />
        </PageLayout>
    )
}
