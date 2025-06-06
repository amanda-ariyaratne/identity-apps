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

import { TierLimitReachErrorModal } from "@wso2is/admin.core.v1/components/modals/tier-limit-reach-error-modal";
import { AppState } from "@wso2is/admin.core.v1/store";
import { EventPublisher } from "@wso2is/admin.core.v1/utils/event-publisher";
import { getUserDetails } from "@wso2is/admin.users.v1/api/users";
import { AddConsumerUserWizard } from "@wso2is/admin.users.v1/components/wizard/add-consumer-user-wizard";
import { AlertLevels, ProfileInfoInterface, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import {
    ContentLoader,
    GenericIcon,
    Heading,
    PrimaryButton,
    SecondaryButton,
    Text
} from "@wso2is/react-components";
import { AxiosError, AxiosResponse } from "axios";
import cloneDeep from "lodash-es/cloneDeep";
import React, { Fragment,FunctionComponent, ReactElement, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { Divider, Grid, Icon, List, Modal } from "semantic-ui-react";
import { createApplication, getApplicationList } from "../../api/application";
import { ApplicationManagementConstants } from "../../constants/application-management";
import LoginApplicationTemplate from "../../data/try-it-application.json";
import { ApplicationListInterface, MainApplicationInterface } from "../../models/application";
import getTryItClientId from "../../utils/get-try-it-client-id";

/**
  * Prop types of the `TryItCreateWizard` component.
  */
interface TryItCreateWizardPropsInterface extends TestableComponentInterface {
     closeWizard: () => void;
     applicationName: string;
     onApplicationCreate: () => void;
}

const INTERMITTENT_REDIRECTION_TIMEOUT: number = 2000;

/**
 * Login Playground application creation wizard.
 *
 * @returns Login Playground application wizard.
 */
const TryItCreateWizard: FunctionComponent<TryItCreateWizardPropsInterface> = (
    props: TryItCreateWizardPropsInterface
): ReactElement => {
    const {
        closeWizard,
        [ "data-testid" ]: testId,
        onApplicationCreate
    } = props;

    const tenantDomain: string = useSelector((state: AppState) => state.auth.tenantDomain);
    const asgardeoLoginPlaygroundURL: string = useSelector((state: AppState) => {
        return state.config?.deployment?.extensions?.asgardeoTryItURL as string;
    });
    const productName: string = useSelector((state: AppState) => state?.config?.ui?.productName);

    const { t } = useTranslation();
    const dispatch: Dispatch = useDispatch();
    const [ showApplicationCreationScreen, setShowApplicationCreationScreen ] = useState<boolean>(false);
    const [ showApplicationRedirectionScreen, setShowApplicationRedirectionScreen ] = useState<boolean>(false);
    const [ showWizard, setShowWizard ] = useState<boolean>(false);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isUserAdded, setIsUserAdded ] = useState(false);
    const [ addedUserList, setAddedUserList ] = useState<string[]>([]);
    const [ openLimitReachedModal, setOpenLimitReachedModal ] = useState<boolean>(false);

    const eventPublisher: EventPublisher = EventPublisher.getInstance();

    let response: ApplicationListInterface = null;


    const addNewUser = (id: string) => {
        setIsLoading(true);
        getUserDetails(id, null)
            .then((response: ProfileInfoInterface) => {
                const users: string[] = addedUserList;

                users.push(
                    response?.userName.split("/")?.length > 1
                        ? response?.userName.split("/")[ 1 ]
                        : response?.userName.split("/")[ 0 ]
                );
                setAddedUserList(users);
                setIsUserAdded(true);
            })
            .catch(() => {
                // TODO add to notifications
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const renderModalContent = (): ReactElement => {
        const renderApplicationRedirectionScreen = (): ReactElement => {
            return (
                <Modal.Content className="loading-modal">
                    <ContentLoader
                        dimmer
                        size="small"
                        text="Taking you to the Application ..."
                    />
                </Modal.Content>
            );
        };

        const renderApplicationCreatingScreen = (): ReactElement => {
            return (
                <Modal.Content className="loading-modal">
                    <ContentLoader
                        dimmer
                        size="small"
                        text="Creating the Try It Application ..."
                    />
                </Modal.Content>
            );
        };

        if (showApplicationCreationScreen) {
            return renderApplicationCreatingScreen();
        }

        if (showApplicationRedirectionScreen) {
            return renderApplicationRedirectionScreen();
        }

        return  (
            <Fragment>
                <Modal.Content className={ "modal-content" }>
                    <Grid centered columns={ 1 } className="playground-wizard-grid" >
                        <Grid.Row textAlign="center">
                            <Grid.Column stretched width={ "16" }>
                                <GenericIcon
                                    icon={ (
                                        /* eslint-disable max-len */
                                        <svg width="80" height="80" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M256 0C114.51 0 0 114.497 0 256C0 397.49 114.497 512 256 512C397.49 512 512 397.503 512 256C512 114.51 397.503 0 256 0ZM256 477.867C133.663 477.867 34.133 378.338 34.133 256C34.133 133.662 133.663 34.133 256 34.133C378.337 34.133 477.867 133.663 477.867 256C477.867 378.337 378.337 477.867 256 477.867Z"
                                                fill="#2185D0" />
                                            <path
                                                d="M255.997 209.777C246.572 209.777 238.93 217.418 238.93 226.844V370.813C238.93 380.238 246.571 387.88 255.997 387.88C265.423 387.88 273.064 380.239 273.064 370.813V226.843C273.063 217.417 265.422 209.777 255.997 209.777Z"
                                                fill="#2185D0" />
                                            <path
                                                d="M256 124.122C237.179 124.122 221.867 139.434 221.867 158.255C221.867 177.076 237.179 192.388 256 192.388C274.821 192.388 290.133 177.076 290.133 158.255C290.133 139.434 274.821 124.122 256 124.122Z"
                                                fill="#2185D0" />
                                        </svg>
                                        /* eslint-enable max-len */
                                    ) }
                                    size="tiny"
                                    className="icon"
                                    transparent
                                    spaced={ "right" }
                                    data-testid={ `${ testId }-image` }
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row >
                            <Grid.Column stretched width={ "16" }>
                                { isUserAdded
                                    ? ( <Heading textAlign="center" as="h1">Almost there!</Heading>)
                                    : <Heading textAlign="center" as="h1">Get Set</Heading>
                                }
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row className="row">
                            <Grid.Column stretched textAlign="center" width={ "16" }>
                                { isLoading
                                    ? (
                                        <ContentLoader/>
                                    )
                                    : (<>
                                        { isUserAdded ?
                                            ( <>
                                                {
                                                    isLoading ? (
                                                        <ContentLoader/>
                                                    ) :
                                                        addedUserList?.map((user: string, index: number) => {
                                                            return (
                                                                <>
                                                                    <List.Item
                                                                        key={ index }
                                                                        className="list-item">
                                                                        <div>
                                                                            <Icon
                                                                                className={ "list-icon" }
                                                                                name={ "check" }
                                                                                color={ "green" }
                                                                            />User <strong>{ user }</strong>
                                                                            { " " }added successfully.
                                                                        </div>
                                                                        <Divider hidden />
                                                                    </List.Item>
                                                                </>

                                                            );
                                                        })
                                                }
                                                <Text>Next, we will create the Try It application in your organization.
                                                    You can later change the login flow of this application and
                                                    try different login flows with Asgardeo. Click { " " }
                                                <Text weight="bold" inline> Continue</Text>
                                                { " " }to proceed. </Text>
                                                <List className="add-user-step-list">

                                                </List>
                                            </>
                                            ) :
                                            (
                                                <>
                                                    <Text>You are about to experience user login with Asgardeo.
                                                        <br />
                                                        Start by { " " }
                                                        <a
                                                            onClick={ () => {
                                                                eventPublisher.
                                                                    publish("application-quick-start-click-add-user");
                                                                setShowWizard(true);
                                                            } }
                                                        >creating a user
                                                        </a>
                                                        { " " } in this organization. If you already have an account,
                                                        click { " " }<Text weight="bold" inline> Continue</Text>
                                                    </Text>
                                                </>
                                            )
                                        }
                                    </>)
                                }
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Grid>
                        <Grid.Row column={ 1 }>
                            <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                                <SecondaryButton
                                    data-testid={ `${ testId }-cancel-button` }
                                    floated="left"
                                    onClick={ () => closeWizard() }
                                >
                                    Cancel
                                </SecondaryButton>
                            </Grid.Column>
                            <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                                <PrimaryButton
                                    data-testid={ `${ testId }-next-button` }
                                    floated="right"
                                    onClick={ () => {
                                        isApplicationAlreadyExist();
                                    } }
                                >
                                    Continue
                                </PrimaryButton>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Actions>
            </Fragment>
        );
    };

    /**
     * Checking if an app is already there called login playground or if not creating one and navigating
     */
    const isApplicationAlreadyExist: () => void = useCallback(async () => {
        const tryItAppClientId: string = getTryItClientId(tenantDomain);

        response = await getApplicationList(null, null, "clientId eq " + tryItAppClientId);

        if (response?.applications?.length > 0){
            navigateToAlreadyExistingTryItApp();

            return;
        }

        setShowApplicationCreationScreen(true);

        const modifiedApplication: MainApplicationInterface = cloneDeep(LoginApplicationTemplate.application);

        modifiedApplication.inboundProtocolConfiguration.oidc.clientId = tryItAppClientId;
        modifiedApplication.inboundProtocolConfiguration.oidc.callbackURLs = [ asgardeoLoginPlaygroundURL ];
        modifiedApplication.inboundProtocolConfiguration.oidc.allowedOrigins = [ asgardeoLoginPlaygroundURL ];
        modifiedApplication.accessUrl = asgardeoLoginPlaygroundURL;

        /**
         * Creating the try it app on demand
         */
        createApplication(modifiedApplication as unknown as MainApplicationInterface)
            .then((response: AxiosResponse) => {
                if(response.status === 201) {
                    setShowApplicationCreationScreen(false);
                    setShowApplicationRedirectionScreen(true);
                    setTimeout(() => {
                        /**
                         * Navigate to the created playground application
                         */
                        //TODO handle with url builder
                        window.open(asgardeoLoginPlaygroundURL
                            + "?client_id="+getTryItClientId(tenantDomain)+ "&org=" + tenantDomain);
                        onApplicationCreate();
                        closeWizard();
                    }, INTERMITTENT_REDIRECTION_TIMEOUT);

                    return;
                }
                //TODO handle error
            })
            .catch((error: AxiosError) => {

                if (error.response.status === 403 &&
                    error?.response?.data?.code ===
                    ApplicationManagementConstants.ERROR_CREATE_LIMIT_REACHED.getErrorCode()) {
                    setOpenLimitReachedModal(true);

                    return;
                } else if (error?.response?.status === 409 && error?.response?.data?.code ===
                    ApplicationManagementConstants.ERROR_CODE_APPLICATION_ALREADY_EXISTS) {
                    closeWizard();
                    dispatch(addAlert({
                        description: t("console:common.quickStart.sections.asgardeoTryIt.errorMessages." +
                            "appCreateDuplicate.description", { productName }),
                        level: AlertLevels.ERROR,
                        message: t("console:common.quickStart.sections.asgardeoTryIt.errorMessages." +
                            "appCreateDuplicate.message")
                    }));

                    return;
                } else {
                    closeWizard();
                    dispatch(addAlert({
                        description: t("console:common.quickStart.sections.asgardeoTryIt.errorMessages." +
                            "appCreateGeneric.description"),
                        level: AlertLevels.ERROR,
                        message: t("console:common.quickStart.sections.asgardeoTryIt.errorMessages." +
                            "appCreateGeneric.message")
                    }));

                    return;
                }
            });
    }, []);

    /**
     * This method navigates to a try-it application if there is an already existing one.
     */
    const navigateToAlreadyExistingTryItApp = (): void => {
        setShowApplicationCreationScreen(false);
        setShowApplicationRedirectionScreen(true);

        /**
         * This is used to display the navigation message to the user for some period of time
         */
        setTimeout(() => {
            /**
             * Navigate to the existing applications
             */
            window.open(`${asgardeoLoginPlaygroundURL}?client_id=${getTryItClientId(tenantDomain)}`+
                `&org=${tenantDomain}`);
            closeWizard();
        }, INTERMITTENT_REDIRECTION_TIMEOUT);
    };

    /**
     * Close the wizard.
     */
    const handleWizardClose = (): void => {
        closeWizard();
    };

    /**
     * Close the limit reached modal.
     */
    const handleLimitReachedModalClose = (): void => {
        setOpenLimitReachedModal(false);
        handleWizardClose();
    };

    return (
        <>
            { openLimitReachedModal && (
                <TierLimitReachErrorModal
                    actionLabel={ t(
                        "applications:notifications." +
                        "tierLimitReachedError.emptyPlaceholder.action"
                    ) }
                    handleModalClose={ handleLimitReachedModalClose }
                    header={ t(
                        "applications:notifications.tierLimitReachedError.heading"
                    ) }
                    description={ t(
                        "applications:notifications." +
                        "tierLimitReachedError.emptyPlaceholder.subtitles"
                    ) }
                    message={ t(
                        "applications:notifications." +
                        "tierLimitReachedError.emptyPlaceholder.title"
                    ) }
                    openModal={ openLimitReachedModal }
                />
            ) }

            <Modal
                open={ true }
                className="wizard login-playground-wizard"
                dimmer="blurring"
                size="small"
                onClose={ closeWizard }
                closeOnDimmerClick={ false }
                closeOnEscape
            >
                { renderModalContent() }
                {
                    showWizard && (
                        <AddConsumerUserWizard
                            data-testid="user-mgt-add-user-wizard-modal"
                            closeWizard={ () => setShowWizard(false) }
                            onSuccessfulUserAddition={ (id: string) => {
                                eventPublisher.publish("application-finish-adding-user");
                                addNewUser(id);
                            } }
                            emailVerificationEnabled={ false }
                            requiredSteps={ [ "BasicDetails" ] }
                            submitStep={ "BasicDetails" }
                            hiddenFields={ [ "firstName", "lastName" ] }
                            showStepper={ false }
                            requestedPasswordOption="create-password"
                            title="Add User"
                            description="Follow the steps to add a new user"
                        />
                    )
                }
            </Modal>
        </>
    );
};

export default TryItCreateWizard;
