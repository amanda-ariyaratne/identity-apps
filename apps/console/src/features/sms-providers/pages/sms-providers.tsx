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

import { IdentityAppsApiException } from "@wso2is/core/exceptions";
import { hasRequiredScopes } from "@wso2is/core/helpers";
import { AlertLevels, IdentifiableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { FinalForm, FormRenderProps } from "@wso2is/form";
import {
    ConfirmationModal,
    DangerZone,
    DangerZoneGroup,
    DocumentationLink,
    EmphasizedSegment,
    InfoCard,
    PageLayout,
    useDocumentation
} from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { Divider, Grid, Placeholder } from "semantic-ui-react";
import CustomSMSProvider from "./custom-sms-provider";
import TwilioSMSProvider from "./twilio-sms-provider";
import VonageSMSProvider from "./vonage-sms-provider";
import {
    AppConstants,
    AppState,
    FeatureConfigInterface
} from "../../core";
import { history } from "../../core/helpers";
import { deleteSMSProviders, updateSMSProvider, useSMSProviders } from "../api";
import { providerCards } from "../configs/provider-cards";
import { SMSProviderConstants } from "../constants";
import {
    ContentType,
    SMSProviderAPIInterface,
    SMSProviderCardInterface,
    SMSProviderConfigFormErrorValidationsInterface,
    SMSProviderInterface,
    SMSProviderPropertiesInterface,
    SMSProviderSettingsState
} from "../models";

type SMSProviderPageInterface = IdentifiableComponentInterface;

const SMSProviders: FunctionComponent<SMSProviderPageInterface> = (
    props: SMSProviderPageInterface
): ReactElement => {

    const {
        ["data-componentid"]: componentId
    } = props;
    const featureConfig: FeatureConfigInterface = useSelector((state: AppState) => state.config.ui.features);

    const [ isOpenRevertConfigModal, setOpenRevertConfigModal ] = useState<boolean>(false);
    const { getLink } = useDocumentation();
    const { t } = useTranslation();
    const dispatch: Dispatch<any> = useDispatch();
    const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);
    const [ isDeleting, setIsDeleting ] = useState<boolean>(false);
    const allowedScopes: string = useSelector((state: AppState) => state?.auth?.allowedScopes);
    const defaultProviderParams: {
        [key: string]: SMSProviderInterface;
    } = {
        CustomSMSProvider: {
            key: "",
            name: SMSProviderConstants.SMS_PROVIDER_CONFIG_NAME,
            provider: "",
            providerURL: "",
            secret: "",
            sender: ""
        },
        TwilioSMSProvider: {
            name: SMSProviderConstants.SMS_PROVIDER_CONFIG_NAME,
            provider: SMSProviderConstants.TWILIO,
            twilioKey: "",
            twilioSecret: "",
            twilioSender: ""
        },
        VonageSMSProvider: {
            name: SMSProviderConstants.SMS_PROVIDER_CONFIG_NAME,
            provider: SMSProviderConstants.VONAGE,
            vonageKey: "",
            vonageSecret: "",
            vonageSender: ""
        }

    };
    const [ smsProviderSettings, setSmsProviderSettings ] = useState<SMSProviderSettingsState>({
        providerParams: defaultProviderParams,
        selectedProvider: null
    });
    const isReadOnly: boolean = useMemo(() => !hasRequiredScopes(
        featureConfig?.smsProviders,
        featureConfig?.smsProviders?.scopes?.update,
        allowedScopes
    ), [ featureConfig, allowedScopes ]);

    const {
        data: originalSMSProviderConfig,
        isLoading: isSMSProviderConfigFetchRequestLoading,
        mutate: mutateSMSProviderConfig,
        error: smsProviderConfigFetchRequestError
    } = useSMSProviders();
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        if (!originalSMSProviderConfig) {
            return;
        }
        if (originalSMSProviderConfig instanceof IdentityAppsApiException || smsProviderConfigFetchRequestError) {
            handleRetrieveError();

            return;
        }
        let configuredProvider: string = SMSProviderConstants.TWILIO_SMS_PROVIDER;
        const providersObject: { [key: string]: SMSProviderInterface } =
            originalSMSProviderConfig.reduce(
                (acc: { [key: string]: SMSProviderInterface }, provider: SMSProviderAPIInterface) => {
                    if (provider.provider === SMSProviderConstants.TWILIO) {
                        configuredProvider = SMSProviderConstants.TWILIO_SMS_PROVIDER;
                    } else if (provider.provider === SMSProviderConstants.VONAGE) {
                        configuredProvider = SMSProviderConstants.VONAGE_SMS_PROVIDER;
                    } else {
                        configuredProvider = SMSProviderConstants.CUSTOM_SMS_PROVIDER;
                    }
                    const configuredSMSProvider: SMSProviderInterface = {
                        contentType: provider.contentType as ContentType,
                        headers: provider.properties.find(
                            (property: SMSProviderPropertiesInterface) => property.key === "http.headers")?.value,
                        httpMethod: provider.properties.find(
                            (property: SMSProviderPropertiesInterface) => property.key === "http.method")?.value,
    
                        name: provider.name,
                        payload: provider.properties.find(
                            (property: SMSProviderPropertiesInterface) => property.key === "body")?.value,
                        provider: provider.provider,
                        providerURL: provider.providerURL 
                    };

                    if (configuredProvider === SMSProviderConstants.TWILIO_SMS_PROVIDER) {
                        configuredSMSProvider.twilioKey = provider.key;
                        configuredSMSProvider.twilioSecret = provider.secret;
                        configuredSMSProvider.twilioSender = provider.sender;
                    } else if (configuredProvider === SMSProviderConstants.VONAGE_SMS_PROVIDER) {
                        configuredSMSProvider.vonageKey = provider.key;
                        configuredSMSProvider.vonageSecret = provider.secret;
                        configuredSMSProvider.vonageSender = provider.sender;
                    } else {
                        configuredSMSProvider.key = provider.key;
                        configuredSMSProvider.secret = provider.secret;
                        configuredSMSProvider.sender = provider.sender;
                    }
                    acc[configuredProvider] = configuredSMSProvider;

                    return acc;
                }, {});

        setSmsProviderSettings({
            providerParams: {
                ...smsProviderSettings.providerParams,
                ...providersObject
            },
            selectedProvider: configuredProvider
        });
        setIsLoading(false);

    }, [ originalSMSProviderConfig ]);

    /**
     * Displays the error banner when unable to fetch sms provider configuration.
     */
    const handleRetrieveError = (): void => {
        dispatch(
            addAlert({
                description: t("extensions:develop.smsProviders." +
                    "notifications.getConfiguration.error.description"),
                level: AlertLevels.ERROR,
                message: t("extensions:develop.smsProviders." +
                    "notifications.getConfiguration.error.message")
            })
        );
    };

    /**
     * Displays the sucess banner when sms provider configurations are updated.
     */
    const handleUpdateSuccess = () => {
        dispatch(
            addAlert({
                description: t("extensions:develop.smsProviders." +
                    "notifications.updateConfiguration.success.description"),
                level: AlertLevels.SUCCESS,
                message: t("extensions:develop.smsProviders." +
                    "notifications.updateConfiguration.success.message")
            })
        );
    };

    /**
     * Displays the error banner when unable to update sms provider configurations.
     */
    const handleUpdateError = () => {
        dispatch(
            addAlert({
                description: t("extensions:develop.smsProviders." +
                    "notifications.updateConfiguration.error.description"),
                level: AlertLevels.ERROR,
                message: t("extensions:develop.smsProviders." +
                    "notifications.updateConfiguration.error.message")
            })
        );
    };

    /**
     * Displays the sucess banner when sms provider configurations are deleted.
     */
    const handleDeleteSuccess = () => {
        dispatch(
            addAlert({
                description: t("extensions:develop.smsProviders." +
                    "notifications.deleteConfiguration.success.description"),
                level: AlertLevels.SUCCESS,
                message: t("extensions:develop.smsProviders." +
                    "notifications.deleteConfiguration.success.message")
            })
        );
    };

    const handleProviderChange = (selectedProvider: string) => {
        setSmsProviderSettings({ ...smsProviderSettings, selectedProvider });
    };

    const handleSubmit = (values: SMSProviderInterface) => {
        setIsSubmitting(true);
        const { selectedProvider } = smsProviderSettings;

        const properties: SMSProviderPropertiesInterface[] = buildProperties(values);
        const provider: string = selectedProvider === SMSProviderConstants.TWILIO_SMS_PROVIDER ? 
            SMSProviderConstants.TWILIO : selectedProvider === SMSProviderConstants.VONAGE_SMS_PROVIDER ? 
                SMSProviderConstants.VONAGE : values.provider;
        const contentType: ContentType = values.contentType ?? ContentType.JSON;
        const submittingValues: SMSProviderAPIInterface = {
            contentType: contentType,
            key: selectedProvider === SMSProviderConstants.TWILIO_SMS_PROVIDER ? 
                values.twilioKey : selectedProvider === SMSProviderConstants.VONAGE_SMS_PROVIDER ? 
                    values.vonageKey : values.key,
            properties: properties,
            provider: provider,
            secret: selectedProvider === SMSProviderConstants.TWILIO_SMS_PROVIDER ? 
                values.twilioSecret : selectedProvider === SMSProviderConstants.VONAGE_SMS_PROVIDER ? 
                    values.vonageSecret : values.secret,
            sender: selectedProvider === SMSProviderConstants.TWILIO_SMS_PROVIDER ? 
                values.twilioSender : selectedProvider === SMSProviderConstants.VONAGE_SMS_PROVIDER ? 
                    values.vonageSender : values.sender
        };
        
        if (values.providerURL) {
            submittingValues.providerURL = values.providerURL;
        }

        handleConfigurationDelete(true).then((isDeleted: boolean) => {
            if (isDeleted) {
                updateSMSProvider(submittingValues)
                    .then((updatedData: SMSProviderAPIInterface) => {
                        const updatedSMSProvider: SMSProviderInterface = {
                            contentType: updatedData.contentType as ContentType,
                            headers: updatedData.properties.find(
                                (property: SMSProviderPropertiesInterface) => property.key === "http.headers")?.value,
                            httpMethod: updatedData.properties.find(
                                (property: SMSProviderPropertiesInterface) => property.key === "http.method")?.value,
                            key: updatedData.key,
                            name: updatedData.name,
                            payload: updatedData.properties.find(
                                (property: SMSProviderPropertiesInterface) => property.key === "body")?.value,
                            provider: updatedData.provider,
                            providerURL: updatedData.providerURL,
                            secret: updatedData.secret,
                            sender: updatedData.sender
                        };
                        const updatedParams: { [key: string]: SMSProviderInterface } =
                            { ...defaultProviderParams, [selectedProvider as string]: updatedSMSProvider };

                        setSmsProviderSettings({ ...smsProviderSettings, providerParams: updatedParams });
                        setIsSubmitting(false);
                        handleUpdateSuccess();
                    })
                    .catch(() => {
                        handleUpdateError();
                        setIsSubmitting(false);
                    }).finally(() => {
                        setIsSubmitting(false);
                        mutateSMSProviderConfig();
                    });
            } else {
                handleDeleteError();
                setIsSubmitting(false);
            }
        }).catch(() => {
            handleDeleteError();
            setIsSubmitting(false);
        });
    };

    const buildProperties = (values: SMSProviderInterface) => {
        const properties: SMSProviderPropertiesInterface[] = [];

        if (values.payload) {
            properties.push({ key: "body", value: values.payload });
        }
        if (values.headers) {
            properties.push({ key: "http.headers", value: values.headers });
        }
        if (values.httpMethod) {
            properties.push({ key: "http.method", value: values.httpMethod });
        }

        return properties;
    };

    const validateForm = (
        values: SMSProviderInterface
    ): SMSProviderConfigFormErrorValidationsInterface => {
        const error: SMSProviderConfigFormErrorValidationsInterface = {
            contentType: undefined,
            key: undefined,
            payload: undefined,
            provider: undefined,
            providerURL: undefined,
            secret: undefined,
            sender: undefined,
            twilioKey: undefined,
            twilioSecret: undefined,
            twilioSender: undefined,
            vonageKey: undefined,
            vonageSecret: undefined,
            vonageSender: undefined
        };

        if (smsProviderSettings.selectedProvider === "TwilioSMSProvider") {
            if (!values?.twilioKey) {
                error.twilioKey = t(
                    "extensions:develop.smsProviders.form.twilio.validations.required"
                );
            }
            if (!values?.twilioSecret) {
                error.twilioSecret = t(
                    "extensions:develop.smsProviders.form.twilio.validations.required"
                );
            }
            if (!values?.twilioSender) {
                error.twilioSender = t(
                    "extensions:develop.smsProviders.form.twilio.validations.required"
                );
            }
        } else if (smsProviderSettings.selectedProvider === "VonageSMSProvider") {
            if (!values?.vonageKey) {
                error.vonageKey = t(
                    "extensions:develop.smsProviders.form.vonage.validations.required"
                );
            }
            if (!values?.vonageSecret) {
                error.vonageSecret = t(
                    "extensions:develop.smsProviders.form.vonage.validations.required"
                );
            }
            if (!values?.vonageSender) {
                error.vonageSender = t(
                    "extensions:develop.smsProviders.form.vonage.validations.required"
                );
            }
        } else {
            if (!values?.key) {
                error.key = t(
                    "extensions:develop.smsProviders.form.custom.validations.required"
                );
            }
            if (!values?.secret) {
                error.secret = t(
                    "extensions:develop.smsProviders.form.custom.validations.required"
                );
            }
            if (!values?.sender) {
                error.sender = t(
                    "extensions:develop.smsProviders.form.custom.validations.required"
                );
            }
            if (!values?.providerURL) {
                error.providerURL = t(
                    "extensions:develop.smsProviders.form.custom.validations.required"
                );
            }
            if (!values?.contentType) {
                error.contentType = t(
                    "extensions:develop.smsProviders.form.custom.validations.required"
                );
            }
            if (!(values?.contentType == ContentType.JSON || values?.contentType == ContentType.FORM)) {
                error.contentType = t(
                    "extensions:develop.smsProviders.form.custom.validations.contentTypeInvalid"
                );
            }
            if (!values?.payload) {
                error.payload = t(
                    "extensions:develop.smsProviders.form.custom.validations.required"
                );
            }
            if (!values?.provider) {
                error.key = t(
                    "extensions:develop.smsProviders.form.custom.validations.required"
                );
            }
        }

        return error;
    };

    const handleConfigurationDelete = async (deleteBeforeUpdate?: boolean): Promise<boolean> => {
        !deleteBeforeUpdate && setIsDeleting(true);

        return deleteSMSProviders()
            .then(() => {
                !deleteBeforeUpdate && handleDeleteSuccess();
                !deleteBeforeUpdate && setSmsProviderSettings({ providerParams: {}, 
                    selectedProvider: SMSProviderConstants.TWILIO_SMS_PROVIDER });
                !deleteBeforeUpdate && mutateSMSProviderConfig();

                return true;
            })
            .catch((e: IdentityAppsApiException) => {
                !deleteBeforeUpdate && handleDeleteError();
                if (deleteBeforeUpdate && e.response.status === 404) {
                    return true;
                }

                return false;
            }).finally(() => {
                setIsDeleting(false);
            });
    };


    const handleDeleteError = () => {
        dispatch(
            addAlert({
                description: t("extensions:develop.smsProviders." +
                    "notifications.deleteConfiguration.error.description"),
                level: AlertLevels.ERROR,
                message: t("extensions:develop.smsProviders." +
                    "notifications.deleteConfiguration.error.message")
            })
        );
    };

    /**
    * Renders the loading placeholder.
    */
    const renderLoadingPlaceholder = () => {
        return (
            <div data-componentid={ `${componentId}-form-loading` }>
                {
                    [ ...Array(3) ].map((key: number) => {
                        return (
                            <Placeholder key={ key }>
                                <Placeholder.Line length="very short" />
                                <div>
                                    <Placeholder.Line length="long" />
                                    <Placeholder.Line length="medium" />
                                </div>
                            </Placeholder>
                        );
                    })
                }
            </div>
        );
    };


    /**
     * Resolves the page description.
     */
    const resolvePageDescription = (): ReactElement => {
        return (
            <div>
                <div style={ { whiteSpace: "pre-line" } }>
                    {
                        t("extensions:develop.smsProviders.subHeading")
                    }
                    <DocumentationLink
                        link={ getLink("develop.smsProviders.learnMore") }
                    >
                        { t("extensions:common.learnMore") }
                    </DocumentationLink>
                </div>
            </div>
        );
    };

    const handleBackButtonClick = () => {
        history.push(`${ AppConstants.getDeveloperViewBasePath() }/notification-channels`);
    };

    return (
        <PageLayout
            title={ t("extensions:develop.smsProviders.heading") }
            pageTitle={ t("extensions:develop.smsProviders.heading") }
            description={ resolvePageDescription() }
            bottomMargin={ false }
            contentTopMargin={ false }
            pageHeaderMaxWidth={ true }
            backButton={ {
                onClick: handleBackButtonClick,
                text: t("extensions:develop.smsProviders.goBack")
            } }
            data-componentid={ `${componentId}-form-layout` }
        >
            { isSMSProviderConfigFetchRequestLoading || isDeleting || isLoading ? (
                renderLoadingPlaceholder()
            ) : (
                <EmphasizedSegment className="form-wrapper" padded={ "very" }>
                    <Grid className={ "mt-2" } >
                        <Grid.Row columns={ 1 }>
                            <Grid.Column >
                                <FinalForm
                                    onSubmit={ handleSubmit }
                                    validate={ validateForm }
                                    initialValues={ 
                                        smsProviderSettings.selectedProvider 
                                            ? smsProviderSettings
                                                .providerParams[smsProviderSettings.selectedProvider] 
                                            :  {} 
                                    }
                                    render={ ({ handleSubmit }: FormRenderProps) => (
                                        <form onSubmit={ handleSubmit } noValidate>
                                            <div className="card-list">
                                                <Grid>
                                                    <Grid.Row columns={ 3 }>
                                                        { providerCards.map(
                                                            (provider: SMSProviderCardInterface) => (
                                                                <Grid.Column width={ 5 } key={ provider.id }>
                                                                    <InfoCard
                                                                        fluid
                                                                        data-componentid=
                                                                            { `${componentId}
                                                                                -sms-provider-info-card` }
                                                                        image={ provider.icon }
                                                                        imageSize="mini"
                                                                        header={
                                                                            provider.name
                                                                        }
                                                                        className=
                                                                            { smsProviderSettings.selectedProvider 
                                                                                    === provider.key ? "selected" : "" 
                                                                            }
                                                                        key={ provider.id }
                                                                        onClick={ () => 
                                                                            handleProviderChange(provider.key) 
                                                                        } 
                                                                        showSetupGuideButton={ false }
                                                                        showCardAction={ false }
                                                                    />
                                                                </Grid.Column>
                                                            )) }
                                                    </Grid.Row>
                                                </Grid>
                                            </div>
                                            { smsProviderSettings.selectedProvider && (
                                                <Divider hidden />

                                            ) }
                                            { smsProviderSettings.selectedProvider && (
                                                <>
                                                    { smsProviderSettings.selectedProvider === 
                                                        SMSProviderConstants.CUSTOM_SMS_PROVIDER && (
                                                        <CustomSMSProvider
                                                            isReadOnly={ isReadOnly }
                                                            onSubmit={ handleSubmit }
                                                        />
                                                    ) }
                                                    { smsProviderSettings.selectedProvider === 
                                                        SMSProviderConstants.TWILIO_SMS_PROVIDER && (
                                                        <TwilioSMSProvider
                                                            isReadOnly={ isReadOnly }
                                                            onSubmit={ handleSubmit }
                                                        />
                                                    ) }
                                                    { smsProviderSettings.selectedProvider === 
                                                        SMSProviderConstants.VONAGE_SMS_PROVIDER && (
                                                        <VonageSMSProvider
                                                            isReadOnly={ isReadOnly }
                                                            onSubmit={ handleSubmit }
                                                        />
                                                    ) }
                                                </>
                                            ) }
                                        </form>
                                    ) }
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </EmphasizedSegment>

            ) }
            {
                !isLoading && !isSMSProviderConfigFetchRequestLoading && (
                    <>
                        <Divider hidden />
                        <DangerZoneGroup
                            sectionHeader={ t("extensions:develop.smsProviders.dangerZoneGroup" +
                                ".header") }
                        >
                            <DangerZone
                                data-componentid={ `${componentId}-revert-sms-provider-config` }
                                actionTitle={ t("extensions:develop.smsProviders.dangerZoneGroup" +
                                    ".revertConfig.actionTitle") }
                                header={ t("extensions:develop.smsProviders.dangerZoneGroup" +
                                    ".revertConfig.heading") }
                                subheader={ t("extensions:develop.smsProviders.dangerZoneGroup" +
                                    ".revertConfig.subHeading") }
                                onActionClick={ (): void => {
                                    setOpenRevertConfigModal(true);
                                } }
                            />
                        </DangerZoneGroup>
                        <ConfirmationModal
                            primaryActionLoading={ isSubmitting }
                            data-componentid={ `${ componentId}-revert-confirmation-modal` }
                            onClose={ (): void => setOpenRevertConfigModal(false) }
                            type="negative"
                            open={ isOpenRevertConfigModal }
                            assertionHint={ t("extensions:develop.smsProviders.confirmationModal" +
                                ".assertionHint") }
                            assertionType="checkbox"
                            primaryAction={ t("common:confirm") }
                            secondaryAction={ t("common:cancel") }
                            onSecondaryActionClick={ (): void => setOpenRevertConfigModal(false) }
                            onPrimaryActionClick={ (): void => { 
                                setIsSubmitting(true);
                                handleConfigurationDelete().finally(() => {
                                    setIsSubmitting(false);
                                    setOpenRevertConfigModal(false);
                                });

                            } }
                            closeOnDimmerClick={ false }
                        >
                            <ConfirmationModal.Header
                                data-componentid={ `${componentId}-revert-confirmation-modal-header` }
                            >
                                { t("extensions:develop.smsProviders.confirmationModal.header") }
                            </ConfirmationModal.Header>
                            <ConfirmationModal.Message
                                data-componentid={
                                    `${componentId}revert-confirmation-modal-message`
                                }
                                attached
                                negative
                            >
                                { t("extensions:develop.smsProviders.confirmationModal.message") }
                            </ConfirmationModal.Message>
                            <ConfirmationModal.Content>
                                { t("extensions:develop.smsProviders.confirmationModal.content") }
                            </ConfirmationModal.Content>
                        </ConfirmationModal>
                    </>
                ) }
        </PageLayout>
    );
};

/**
 * Default props for the component.
 */
SMSProviders.defaultProps = {
    "data-componentid": "sms-provider-page"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default SMSProviders;
