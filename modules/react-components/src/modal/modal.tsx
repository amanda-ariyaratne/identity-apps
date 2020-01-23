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

import React, { MouseEvent } from "react";
import { Button, Icon, Modal, ModalProps } from "semantic-ui-react";

export interface ModalComponentProps extends ModalProps {
    type: "positive" | "negative" | "warning" | "info";
    primaryAction?: string;
    secondaryAction?: string;
    onPrimaryActionClick?: () => void;
    onSecondaryActionClick?: (e: MouseEvent<HTMLElement>) => void;
}

export const ModalComponent = (props: ModalComponentProps) => {
    const {
        children,
        type,
        header,
        content,
        open,
        onClose,
        primaryAction,
        secondaryAction,
        onPrimaryActionClick,
        onSecondaryActionClick,
        ...rest
    } = props;

    const iconName = () => {
        if (type === "positive") {
            return (
                <div className="svg-box">
                    <svg className="circular positive-stroke">
                        <circle
                            className="path"
                            cx="75"
                            cy="75"
                            r="50"
                            fill="none"
                            stroke-width="5"
                            stroke-miterlimit="10"
                        />
                    </svg>
                    <svg className="positive-icon positive-stroke">
                        <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)">
                            <path
                                className="positive-icon__check"
                                fill="none"
                                d="M616.306,283.025L634.087,300.805L673.361,261.53"
                            />
                        </g>
                    </svg>
                </div>
            );
        } else if (type === "negative") {
            return (
                <div className="svg-box">
                    <svg className="circular negative-stroke">
                        <circle
                            className="path"
                            cx="75"
                            cy="75"
                            r="50"
                            fill="none"
                            stroke-width="5"
                            stroke-miterlimit="10"
                        />
                    </svg>
                    <svg className="negative-icon negative-stroke">
                        <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-502.652,-204.518)">
                            <path className="first-line" d="M634.087,300.805L673.361,261.53" fill="none"/>
                        </g>
                        <g transform="matrix(-1.28587e-16,-0.79961,0.79961,-1.28587e-16,-204.752,543.031)">
                            <path className="second-line" d="M634.087,300.805L673.361,261.53"/>
                        </g>
                    </svg>
                </div>
            );
        } else if (type === "warning") {
            return (
                <div className="svg-box">
                    <svg className="circular warning-stroke">
                        <circle
                            className="path"
                            cx="75"
                            cy="75"
                            r="50"
                            fill="none"
                            stroke-width="5"
                            stroke-miterlimit="10"
                        />
                    </svg>
                    <svg className="warning-icon warning-stroke">
                        <g transform="matrix(1,0,0,1,-615.516,-257.346)">
                            <g transform="matrix(0.56541,-0.56541,0.56541,0.56541,93.7153,495.69)">
                                <path className="line" d="M634.087,300.805L673.361,261.53" fill="none"/>
                            </g>
                            <g transform="matrix(2.27612,-2.46519e-32,0,2.27612,-792.339,-404.147)">
                                <circle className="dot" cx="621.52" cy="316.126" r="1.318"/>
                            </g>
                        </g>
                    </svg>
                </div>
            );
        } else {
            return (
                    <Icon
                        className="modal-icon"
                        name="info circle"
                        size="huge"
                        color="blue"
                    />
            );
        }
    };

    return (
        <Modal
            { ...rest }
            className="custom-modal"
            open={ open }
            onClose={ onClose }
        >
            { iconName() }
            <Modal.Content>
                <h3 className="modal-heading">
                    { header }
                </h3>
            </Modal.Content>
            <p className="modal-description">
                { content }
            </p>
            { children }
            <Modal.Actions>
                <Button
                    className={ `${ type }-modal-link-button` }
                    onClick={ onSecondaryActionClick }
                >
                    { secondaryAction }
                </Button>
                <Button
                    className={ `${ type }-modal-primary-button` }
                    onClick={ () => onPrimaryActionClick() }
                >
                    { primaryAction }
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

/**
 * Default proptypes for the settings section component.
 */
ModalComponent.defaultProps = {
    dimmer: "blurring",
    size: "tiny"
};
