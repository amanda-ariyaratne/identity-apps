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

import Button from "@oxygen-ui/react/Button";
import ActionEndpointConfigForm from "@wso2is/admin.actions.v1/components/action-endpoint-config-form";
import { AuthenticationType, EndpointConfigFormPropertyInterface } from "@wso2is/admin.actions.v1/models/actions";
import {
    FederatedAuthenticatorInterface,
    FederatedAuthenticatorListItemInterface
} from "@wso2is/admin.identity-providers.v1/models";
import { IdentityAppsApiException } from "@wso2is/core/exceptions";
import { AlertLevels, IdentifiableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { URLUtils } from "@wso2is/core/utils";
import { FinalForm, FormRenderProps, FormSpy } from "@wso2is/form";
import { EmphasizedSegment } from "@wso2is/react-components";
import { AxiosError } from "axios";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { getLocalAuthenticator } from "../../../api/authenticators";
import {
    getFederatedAuthenticatorDetails,
    updateCustomAuthentication,
    updateFederatedAuthenticator
} from "../../../api/connections";
import {
    AuthenticationPropertiesInterface,
    ConnectionInterface,
    CustomAuthConnectionInterface,
    EndpointAuthenticationUpdateInterface
} from "../../../models/connection";
import { handleConnectionUpdateError } from "../../../utils/connection-utils";
import "./custom-authenticator-settings.scss";
import { CommonAuthenticatorConstants } from "../../../constants/common-authenticator-constants";

/**
 * Proptypes for the Custom Local Authenticator edit page component.
 */
export interface CustomAuthenticatorSettingsPagePropsInterface extends IdentifiableComponentInterface {
    /**
     * Is the authenticator a custom authenticator.
     */
    isCustomAuthenticator: boolean;
    /**
     * Is the authenticator a custom local authenticator.
     */
    isCustomLocalAuthenticator: boolean;
    /**
     * Is the data still loading.
     */
    isLoading?: boolean;
    /**
     * Connection details.
     */
    connector: CustomAuthConnectionInterface | ConnectionInterface;
    /**
     * Callback to update the connector details.
     */
    onUpdate: (id: string, tabName?: string) => void;
}

export const CustomAuthenticatorSettings: FunctionComponent<CustomAuthenticatorSettingsPagePropsInterface> = ({
    isCustomAuthenticator,
    isCustomLocalAuthenticator,
    isLoading,
    connector,
    onUpdate,
    "data-componentid": _componentId = "authenticator-edit-page"
}: CustomAuthenticatorSettingsPagePropsInterface): ReactElement => {
    const dispatch: Dispatch = useDispatch();

    const [ authenticatorEndpoint, setAuthenticatorEndpoint ] = useState<EndpointConfigFormPropertyInterface>(null);
    const [ endpointAuthenticationType, setEndpointAuthenticationType ] = useState<AuthenticationType>(null);
    const [ isAuthenticationUpdateFormState, setIsAuthenticationUpdateFormState ] = useState<boolean>(false);

    const { t } = useTranslation();

    /**
     * This useEffect is utilized only for custom authenticators in order to fetch additional
     * details related to authenticators.
     * This is not required for other connections since all the required details are passed from the parent component.
     */
    useEffect(() => {
        if (!isCustomAuthenticator) {
            return;
        }

        let customAuthenticatorId: string;

        if (isCustomLocalAuthenticator) {
            customAuthenticatorId = (connector as CustomAuthConnectionInterface)?.id;
            getCustomLocalAuthenticator(customAuthenticatorId);
        } else {
            customAuthenticatorId = connector?.federatedAuthenticators?.authenticators[0]?.authenticatorId;
            getCustomFederatedAuthenticator(customAuthenticatorId);
        }
    }, [ isCustomAuthenticator, isCustomLocalAuthenticator ]);

    const resolveDisplayName = (): string => {
        if (isCustomLocalAuthenticator) {
            return (connector as CustomAuthConnectionInterface)?.displayName;
        } else {
            return (connector as ConnectionInterface)?.name;
        }
    };

    /**
     * This function is used to get the custom local authenticator details which includes endpoint
     * configurations that need to be accessed from the "Settings" tab.
     *
     * @param customLocalAuthenticatorId - Custom local authenticator id.
     */
    const getCustomLocalAuthenticator = (customLocalAuthenticatorId: string) => {
        getLocalAuthenticator(customLocalAuthenticatorId)
            .then((data: CustomAuthConnectionInterface) => {
                const endpointAuth: EndpointConfigFormPropertyInterface = {
                    authenticationType: data?.endpoint?.authentication?.type,
                    endpointUri: data?.endpoint?.uri
                };

                setAuthenticatorEndpoint(endpointAuth);
            })
            .catch((error: IdentityAppsApiException) => {
                if (error.response && error.response.data && error.response.data.description) {
                    dispatch(
                        addAlert({
                            description: t("authenticationProvider:notifications.getIDP.error.description", {
                                description: error.response.data.description
                            }),
                            level: AlertLevels.ERROR,
                            message: t("authenticationProvider:" + "notifications.getIDP.error.message")
                        })
                    );

                    return;
                }

                dispatch(
                    addAlert({
                        description: t("authenticationProvider:" + "notifications.getIDP.genericError.description"),
                        level: AlertLevels.ERROR,
                        message: t("authenticationProvider:" + "notifications.getIDP.genericError.message")
                    })
                );
            });
    };

    /**
     * This function is used to get the custom federated authenticator details which includes endpoint
     * configurations that need to be accessed from the "Settings" tab.
     *
     * @param customFederatedAuthenticatorId - Custom federated authenticator id.
     */
    const getCustomFederatedAuthenticator = (customFederatedAuthenticatorId: string) => {
        getFederatedAuthenticatorDetails(connector?.id, customFederatedAuthenticatorId)
            .then((data: FederatedAuthenticatorListItemInterface) => {
                const endpointAuth: EndpointConfigFormPropertyInterface = {
                    authenticationType: data?.endpoint?.authentication?.type,
                    endpointUri: data?.endpoint?.uri
                };

                setAuthenticatorEndpoint(endpointAuth);
            })
            .catch((error: IdentityAppsApiException) => {
                if (error.response && error.response.data && error.response.data.description) {
                    dispatch(
                        addAlert({
                            description: t("authenticationProvider:notifications.getIDP.error.description", {
                                description: error.response.data.description
                            }),
                            level: AlertLevels.ERROR,
                            message: t("authenticationProvider:" + "notifications.getIDP.error.message")
                        })
                    );

                    return;
                }

                dispatch(
                    addAlert({
                        description: t("authenticationProvider:" + "notifications.getIDP.genericError.description"),
                        level: AlertLevels.ERROR,
                        message: t("authenticationProvider:" + "notifications.getIDP.genericError.message")
                    })
                );
            });
    };

    const validateForm = (values: EndpointConfigFormPropertyInterface): any => {
        const errors: Partial<EndpointConfigFormPropertyInterface> = {};

        if (!values?.endpointUri) {
            errors.endpointUri = t("actions:fields.endpoint.validations.empty");
        }
        if (URLUtils.isURLValid(values?.endpointUri)) {
            if (!URLUtils.isHttpsUrl(values?.endpointUri)) {
                errors.endpointUri = t("actions:fields.endpoint.validations.notHttps");
            }
        } else {
            errors.endpointUri = t("actions:fields.endpoint.validations.invalidUrl");
        }
        if (!values?.authenticationType) {
            errors.authenticationType = t("actions:fields.authenticationType.validations.empty");
        }

        switch (endpointAuthenticationType) {
            case AuthenticationType.BASIC:
                if (isAuthenticationUpdateFormState || values?.usernameAuthProperty || values?.passwordAuthProperty) {
                    if (!values?.usernameAuthProperty) {
                        errors.usernameAuthProperty = t(
                            "actions:fields.authentication." + "types.basic.properties.username.validations.empty"
                        );
                    }
                    if (!values?.passwordAuthProperty) {
                        errors.passwordAuthProperty = t(
                            "actions:fields.authentication." + "types.basic.properties.password.validations.empty"
                        );
                    }
                }

                break;
            case AuthenticationType.BEARER:
                if (isAuthenticationUpdateFormState) {
                    if (!values?.accessTokenAuthProperty) {
                        errors.accessTokenAuthProperty = t(
                            "actions:fields.authentication." + "types.bearer.properties.accessToken.validations.empty"
                        );
                    }
                }

                break;
            case AuthenticationType.API_KEY:
                if (isAuthenticationUpdateFormState || values?.headerAuthProperty || values?.valueAuthProperty) {
                    if (!values?.headerAuthProperty) {
                        errors.headerAuthProperty = t(
                            "actions:fields.authentication." + "types.apiKey.properties.header.validations.empty"
                        );
                    }
                    if (!CommonAuthenticatorConstants.API_KEY_HEADER_REGEX.test(values?.headerAuthProperty)) {
                        errors.headerAuthProperty = t(
                            "actions:fields.authentication." + "types.apiKey.properties.header.validations.invalid"
                        );
                    }
                    if (!values?.valueAuthProperty) {
                        errors.valueAuthProperty = t(
                            "actions:fields.authentication." + "types.apiKey.properties.value.validations.empty"
                        );
                    }
                }

                break;
            default:
                break;
        }

        return errors;
    };

    const handleSubmit = (
        values: EndpointConfigFormPropertyInterface,
        changedFields: EndpointConfigFormPropertyInterface
    ) => {
        const authProperties: Partial<AuthenticationPropertiesInterface> = {};

        // Update endpoint authentication properties only when the authentication type is changed
        if (isAuthenticationUpdateFormState) {
            switch (values.authenticationType) {
                case AuthenticationType.BASIC:
                    authProperties.username = values.usernameAuthProperty;
                    authProperties.password = values.passwordAuthProperty;

                    break;
                case AuthenticationType.BEARER:
                    authProperties.accessToken = values.accessTokenAuthProperty;

                    break;
                case AuthenticationType.API_KEY:
                    authProperties.header = values.headerAuthProperty;
                    authProperties.value = values.valueAuthProperty;

                    break;
                case AuthenticationType.NONE:
                    break;
                default:
                    break;
            }
        }

        if (isCustomLocalAuthenticator) {
            const updatingValues: EndpointAuthenticationUpdateInterface = {
                displayName: resolveDisplayName(),
                endpoint: {
                    authentication: isAuthenticationUpdateFormState
                        ? {
                            properties: authProperties,
                            type: values.authenticationType as AuthenticationType
                        }
                        : {
                            properties: (connector as CustomAuthConnectionInterface)?.endpoint?.authentication
                                ?.properties,
                            type: (connector as CustomAuthConnectionInterface)?.endpoint?.authentication
                                ?.type as AuthenticationType
                        },
                    uri: changedFields?.endpointUri ? values.endpointUri :
                        (connector as CustomAuthConnectionInterface)?.endpoint?.uri
                },
                isEnabled: connector.isEnabled,
                isPrimary: connector.isPrimary
            };

            updateCustomAuthentication(connector.id, updatingValues as CustomAuthConnectionInterface)
                .then(() => {
                    dispatch(
                        addAlert({
                            description: t("authenticationProvider:notifications.updateIDP." + "success.description"),
                            level: AlertLevels.SUCCESS,
                            message: t("authenticationProvider:notifications.updateIDP." + "success.message")
                        })
                    );
                    onUpdate(connector.id);
                })
                .catch((error: AxiosError) => {
                    handleConnectionUpdateError(error);
                })
                .finally(() => {
                    getCustomLocalAuthenticator(connector.id);
                });
        } else {
            const federatedAuthenticatorId: string =
                connector?.federatedAuthenticators?.authenticators[0]?.authenticatorId;
            const updatingValues: FederatedAuthenticatorInterface = {
                authenticatorId: federatedAuthenticatorId,
                endpoint: {
                    authentication: {
                        properties: authProperties,
                        type: values.authenticationType as AuthenticationType
                    },
                    uri: values.endpointUri
                },
                isEnabled: connector.isEnabled
            };

            updateFederatedAuthenticator(connector.id, updatingValues)
                .then(() => {
                    dispatch(
                        addAlert({
                            description: t(
                                "authenticationProvider:" +
                                    "notifications.updateFederatedAuthenticator." +
                                    "success.description"
                            ),
                            level: AlertLevels.SUCCESS,
                            message: t(
                                "authenticationProvider:notifications." +
                                    "updateFederatedAuthenticator." +
                                    "success.message"
                            )
                        })
                    );
                    onUpdate(connector.id);
                })
                .catch((error: AxiosError) => {
                    if (error.response && error.response.data && error.response.data.description) {
                        dispatch(
                            addAlert({
                                description: t(
                                    "authenticationProvider:" +
                                        "notifications.updateFederatedAuthenticator." +
                                        "error.description",
                                    { description: error.response.data.description }
                                ),
                                level: AlertLevels.ERROR,
                                message: t(
                                    "authenticationProvider:" +
                                        "notifications.updateFederatedAuthenticator." +
                                        "error.message"
                                )
                            })
                        );

                        return;
                    }

                    dispatch(
                        addAlert({
                            description: t(
                                "authenticationProvider:notifications." +
                                    "updateFederatedAuthenticator." +
                                    "genericError.description"
                            ),
                            level: AlertLevels.ERROR,
                            message: t(
                                "authenticationProvider:notifications." +
                                    "updateFederatedAuthenticator." +
                                    "genericError.message"
                            )
                        })
                    );
                })
                .finally(() => {
                    getCustomFederatedAuthenticator(federatedAuthenticatorId);
                });
        }
    };

    return (
        <div className="custom-authentication-settings-tab">
            <FinalForm
                onSubmit={ (values: EndpointConfigFormPropertyInterface, form: any) => {
                    handleSubmit(values, form.getState().dirtyFields);
                } }
                initialValues={ authenticatorEndpoint }
                validate={ validateForm }
                render={ ({ handleSubmit, form }: FormRenderProps) => (
                    <form onSubmit={ handleSubmit }>
                        <EmphasizedSegment
                            className="endpoint-settings-container"
                            padded={ "very" }
                            data-componentid={ `${_componentId}-section` }
                        >
                            <div className="form-container with-max-width">
                                <ActionEndpointConfigForm
                                    initialValues={ authenticatorEndpoint }
                                    isCreateFormState={ false }
                                    onAuthenticationTypeChange={ (updatedValue: AuthenticationType, change: boolean) => {
                                        setEndpointAuthenticationType(updatedValue);
                                        setIsAuthenticationUpdateFormState(change);
                                    } }
                                />
                                { !isLoading && (
                                    <Button
                                        size="medium"
                                        variant="contained"
                                        onClick={ handleSubmit }
                                        className={ "button-container" }
                                        data-componentid={ `${_componentId}-primary-button` }
                                    >
                                        { t("actions:buttons.update") }
                                    </Button>
                                ) }
                            </div>
                        </EmphasizedSegment>
                        <FormSpy subscription={ { values: true } }>
                            { ({ values }: { values: EndpointConfigFormPropertyInterface }) => {
                                if (!isAuthenticationUpdateFormState) {
                                    form.change("authenticationType", values?.authenticationType);
                                    switch (values?.authenticationType) {
                                        case AuthenticationType.BASIC:
                                            delete values.usernameAuthProperty;
                                            delete values.passwordAuthProperty;

                                            break;
                                        case AuthenticationType.BEARER:
                                            delete values.accessTokenAuthProperty;

                                            break;
                                        case AuthenticationType.API_KEY:
                                            delete values.headerAuthProperty;
                                            delete values.valueAuthProperty;

                                            break;
                                        default:
                                            break;
                                    }
                                }

                                // Clear inputs of property field values of other authentication types.
                                switch (values?.authenticationType) {
                                    case AuthenticationType.BASIC:
                                        delete values.accessTokenAuthProperty;
                                        delete values.headerAuthProperty;
                                        delete values.valueAuthProperty;

                                        break;
                                    case AuthenticationType.BEARER:
                                        delete values.usernameAuthProperty;
                                        delete values.passwordAuthProperty;
                                        delete values.headerAuthProperty;
                                        delete values.valueAuthProperty;

                                        break;
                                    case AuthenticationType.API_KEY:
                                        delete values.usernameAuthProperty;
                                        delete values.passwordAuthProperty;
                                        delete values.accessTokenAuthProperty;

                                        break;
                                    case AuthenticationType.NONE:
                                        delete values.usernameAuthProperty;
                                        delete values.passwordAuthProperty;
                                        delete values.headerAuthProperty;
                                        delete values.valueAuthProperty;
                                        delete values.accessTokenAuthProperty;

                                        break;
                                    default:
                                        break;
                                }

                                return null;
                            } }
                        </FormSpy>
                    </form>
                ) }
            ></FinalForm>
        </div>
    );
};

export default CustomAuthenticatorSettings;
