/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import Joi from "@hapi/joi";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, Icon, List } from "semantic-ui-react";
import { getProfileInfo, updateProfileInfo } from "../../../api";
import { AccountRecoveryIcons } from "../../../configs";
import { Notification, Validation } from "../../../models";
import { EditSection, FormWrapper, ThemeIcon } from "../../shared";

/**
 * Proptypes for the EmailRecoveryComponent component.
 */
interface EmailRecoveryProps {
    onNotificationFired: (notification: Notification) => void;
}

/**
 * Email recovery section.
 *
 * @param {EmailRecoveryProps} props
 * @return {JSX.Element}
 */
export const EmailRecovery: React.FunctionComponent<EmailRecoveryProps> = (props: EmailRecoveryProps): JSX.Element => {
    const [email, setEmail] = useState("");
    const [editedEmail, setEditedEmail] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const { t } = useTranslation();
    const { onNotificationFired } = props;

    const handleUpdate = (emailParam: string) => {
        const data = {
            Operations: [
                {
                    op: "replace",
                    value: {}
                }
            ],
            schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"]
        };

        data.Operations[0].value = {
            emails: [emailParam]
        };

        updateProfileInfo(data).then((response) => {
            if (response.status === 200) {
                onNotificationFired({
                    description: t(
                        "views:components.accountRecovery.emailRecovery.updateEmail.notifications" +
                            ".success.description"
                    ),
                    message: t(
                        "views:components.accountRecovery.emailRecovery.updateEmail.notifications.success.message"
                    ),
                    otherProps: {
                        positive: true
                    },
                    visible: true
                });
                getProfileInfo().then((res) => {
                    setEmailAddress(res);
                });
                setIsEdit(false);
            } else {
                onNotificationFired({
                    description: t(
                        "views:components.accountRecovery.emailRecovery.updateEmail.notifications.error.description"
                    ),
                    message: t(
                        "views:components.accountRecovery.emailRecovery.updateEmail.notifications.error.message"
                    ),
                    otherProps: {
                        negative: true
                    },
                    visible: true
                });
            }
        });
    };

    /**
     * This function gets the email address from the response passed as the argument
     * and assigns it to email and editedEmail.
     * @param response
     */
    const setEmailAddress = (response) => {
        let emailAddress = "";
        if (response.emails) {
            response.emails.map((emailParam) => {
                emailAddress = emailParam;
            });
        }
        setEmail(emailAddress);
        setEditedEmail(emailAddress);
    };

    /**
     * This is called when the edit icon is clicked.
     *
     */
    const handleEdit = () => {
        setIsEdit(true);
    };

    /**
     * This is called when the cancel button is pressed
     */
    const handleCancel = () => {
        setIsEdit(false);
    };

    /**
     * This function masks the email address passed as the argument and returns
     * the masked email address.
     * The text between the second character of the email and the @ sign is masked.
     * @param {string} email
     */
    const maskEmail = (emailParam: string) => {
        let mask = "";
        const indexOfAt = emailParam.indexOf("@");
        const textToBeMasked = emailParam.slice(2, indexOfAt);

        for (const i of textToBeMasked) {
            mask += "*";
        }

        const maskedEmail = email.replace(textToBeMasked, mask);

        return maskedEmail;
    };

    /**
     * This function returns the EditSection component and the recovery option
     * elements based on if the edit icon has been clicked
     */
    const showEditView = () => {
        if (!isEdit) {
            return (
                <Grid padded>
                    <Grid.Row columns={2}>
                        <Grid.Column width={11} className="first-column">
                            <List.Content floated="left">
                                <ThemeIcon
                                    icon={AccountRecoveryIcons.email}
                                    size="mini"
                                    twoTone
                                    transparent
                                    square
                                    rounded
                                    relaxed
                                />
                            </List.Content>
                            <List.Content>
                                <List.Header>{t("views:components.accountRecovery.emailRecovery.heading")}</List.Header>
                                <List.Description>
                                    {email || email !== ""
                                        ? t("views:components.accountRecovery.emailRecovery.descriptions.update", {
                                              email: maskEmail(email)
                                          })
                                        : t("views:components.accountRecovery.emailRecovery.descriptions.add")}
                                </List.Description>
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={5} className="last-column">
                            <List.Content floated="right">
                                {email || email !== "" ? (
                                    <Icon
                                        link
                                        onClick={handleEdit}
                                        className="list-icon"
                                        size="small"
                                        color="grey"
                                        name="pencil alternate"
                                    />
                                ) : (
                                    <Icon
                                        link
                                        onClick={handleEdit}
                                        className="list-icon"
                                        size="small"
                                        color="grey"
                                        name="plus"
                                    />
                                )}
                            </List.Content>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            );
        }
        return (
            <EditSection>
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <List>
                                <List.Item>
                                    <List.Content>
                                        <FormWrapper
                                            formFields={[
                                                {
                                                    label: t(
                                                        "views:components.accountRecovery.emailRecovery.forms" +
                                                            ".emailResetForm.inputs.email.label"
                                                    ),
                                                    name: "email",
                                                    placeholder: t(
                                                        "views:components.accountRecovery.emailRecovery.forms" +
                                                            ".emailResetForm.inputs.email.placeholder"
                                                    ),
                                                    required: true,
                                                    requiredErrorMessage: t(
                                                        "views:components.accountRecovery.emailRecovery.forms" +
                                                            ".emailResetForm.inputs.email.validations.empty"
                                                    ),
                                                    type: "text",
                                                    validation: (value: string, validation: Validation) => {
                                                        const emailError = Joi.string()
                                                            .email({
                                                                tlds: {
                                                                    allow: ["com"]
                                                                }
                                                            })
                                                            .validate(value).error;

                                                        if (emailError) {
                                                            validation.isValid = false;
                                                            validation.errorMessages.push(emailError.message);
                                                        }
                                                    },
                                                    value: editedEmail,
                                                    width: 9
                                                },
                                                {
                                                    hidden: true,
                                                    type: "divider"
                                                },
                                                {
                                                    size: "small",
                                                    type: "submit",
                                                    value: t("common:update").toString()
                                                },
                                                {
                                                    className: "link-button",
                                                    onClick: handleCancel,
                                                    size: "small",
                                                    type: "button",
                                                    value: t("common:cancel").toString()
                                                }
                                            ]}
                                            onSubmit={(values) => {
                                                handleUpdate(values.get("email").toString());
                                            }}
                                            groups={[{ startIndex: 2, endIndex: 4, style: "inline" }]}
                                        />
                                    </List.Content>
                                </List.Item>
                            </List>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </EditSection>
        );
    };

    useEffect(() => {
        getProfileInfo().then((response) => {
            setEmailAddress(response);
        });
    }, []);

    return showEditView();
};
