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


import React, {  PropsWithChildren, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthenticationSequenceInterface } from "../../admin.applications.v1/models/application";
import { AppState } from "../../admin.core.v1";
import { useAILoginFlowGenerationResult } from "../api/use-ai-login-flow-generation-result";
import LoginFlowAIBanner from "../components/login-flow-ai-banner";
import LoginFlowAILoadingScreen from "../components/login-flow-ai-loading-screen";
import AILoginFlowContext from "../context/ai-login-flow-context";

export type AILoginFlowProviderProps = unknown;

/**
 * Provider for the sign on methods context.
 *
 * @param props - Props for the client.
 * @returns Sign On Mehtods provider.
 */
const AILoginFlowProvider = (props: PropsWithChildren<AILoginFlowProviderProps>): React.ReactElement=>{
    const { children } = props;

    const disabledFeatures: string[] = useSelector((state: AppState) =>
        state.config.ui.features?.applications?.disabledFeatures);

    const [ aiGeneratedLoginFlow, setAiGeneratedLoginFlow ] = useState<AuthenticationSequenceInterface>(undefined);
    const [ operationId, setOperationId ] = useState<string>();
    const [ isGeneratingLoginFlow, setGeneratingLoginFlow ] = useState<boolean>(false);
    const [ loginFlowGenerationCompleted, setLoginFlowGenerationCompleted ] = useState<boolean>(false);

    /**
     * Custom hook to get the login flow generation result.
     */
    const { data, error } = useAILoginFlowGenerationResult(operationId, loginFlowGenerationCompleted);

    useEffect(() => {
        if (error) {
            setGeneratingLoginFlow(false);
        }

        if (loginFlowGenerationCompleted && !error && data) {
            handleGenerate(data);
        }
    }, [ data, loginFlowGenerationCompleted ]);

    /**
     * Function to process the API response and generate the login flow.
     *
     * @param data - Data from the API response.
     */
    const handleGenerate = (data: AuthenticationSequenceInterface) => {
        setAiGeneratedLoginFlow(data);
        setLoginFlowGenerationCompleted(false);
        setGeneratingLoginFlow(false);
    };

    return (
        <AILoginFlowContext.Provider
            value={ {
                aiGeneratedLoginFlow,
                handleGenerate,
                isGeneratingLoginFlow,
                loginFlowGenerationCompleted,
                operationId,
                setGeneratingLoginFlow,
                setLoginFlowGenerationCompleted,
                setOperationId
            } }
        >
            {
                isGeneratingLoginFlow ? (
                    <LoginFlowAILoadingScreen traceId={ operationId }/>
                ) : (
                    <>
                        {
                            !disabledFeatures?.includes("applications.loginFlow.ai") && (
                                <LoginFlowAIBanner/>
                            )
                        }
                        { children }
                    </>
                )
            }
        </AILoginFlowContext.Provider>
    );
};

export default AILoginFlowProvider;
