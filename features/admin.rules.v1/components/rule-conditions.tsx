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

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { SelectChangeEvent } from "@mui/material";
import Autocomplete from "@oxygen-ui/react/Autocomplete";
import Box from "@oxygen-ui/react/Box";
import Button from "@oxygen-ui/react/Button";
import CircularProgress from "@oxygen-ui/react/CircularProgress";
import Divider from "@oxygen-ui/react/Divider";
import Fab from "@oxygen-ui/react/Fab";
import FormControl from "@oxygen-ui/react/FormControl";
import MenuItem from "@oxygen-ui/react/MenuItem";
import Select from "@oxygen-ui/react/Select";
import TextField from "@oxygen-ui/react/TextField";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import debounce from "lodash-es/debounce";
import React, { Fragment, FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useGetResourcesList from "../api/use-get-resource-list";
import { useRulesContext } from "../hooks/use-rules-context";
import {
    ConditionExpressionMetaInterface,
    ExpressionValueInterface,
    LinkInterface,
    ListDataInterface
} from "../models/meta";
import {
    AdjoiningOperatorTypes,
    ConditionExpressionInterface,
    ExpressionFieldTypes,
    RuleConditionInterface,
    RuleConditionsInterface,
    RuleInterface
} from "../models/rules";

/**
 * Value input autocomplete props interface.
 */
interface ValueInputAutocompleteProps {
    localValue: string;
    resourceType: string;
    initialResourcesLoadUrl: string;
    filterBaseResourcesUrl: string;
}

/**
 * Condition value input props interface.
 */
interface ConditionValueInputProps {
    metaValue: ExpressionValueInterface;
}

interface ResourceListSelectProps {
    initialResourcesLoadUrl: string;
    filterBaseResourcesUrl: string;
}

/**
 * Props interface of {@link RulesComponent}
 */
export interface RulesComponentPropsInterface extends IdentifiableComponentInterface {
    rule: RuleInterface;
}

/**
 * Rules condition component to recursive render.
 *
 * @param props - Props injected to the component.
 * @returns Rule condition component.
 */
const RuleConditions: FunctionComponent<RulesComponentPropsInterface> = ({
    ["data-componentid"]: componentId = "rules-component",
    rule: ruleInstance
}: RulesComponentPropsInterface): ReactElement => {

    const ruleConditions: RuleConditionsInterface = ruleInstance.rules;

    const {
        addNewRuleConditionExpression,
        conditionExpressionsMeta,
        updateConditionExpression,
        removeRuleConditionExpression
    } = useRulesContext();

    const { t } = useTranslation();

    /**
     * Rule expression component to recursive render.
     *
     * @param props - Props injected to the component.
     * @returns Rule expression component.
     */
    const RuleExpression = ({
        expression,
        ruleId,
        conditionId,
        index,
        isConditionExpressionRemovable
    }: {
        expression: ConditionExpressionInterface;
        ruleId: string;
        conditionId: string;
        index: number;
        isConditionExpressionRemovable: boolean;
    }) => {
        const findMetaValuesAgainst: ConditionExpressionMetaInterface = conditionExpressionsMeta.find(
            (expressionMeta: ConditionExpressionMetaInterface) => expressionMeta.field.name === expression.field
        );

        /**
         * Debounced function to handle the change of the condition expression.
         *
         * @param changedValue - Changed value.
         * @param ruleId - Rule id.
         * @param conditionId - Condition id.
         * @param expressionId - Expression id.
         * @param fieldName - Field name.
         * @returns Debounced function.
         */
        const handleExpressionChangeDebounced: (
            changedValue: string,
            ruleId: string,
            conditionId: string,
            expressionId: string,
            fieldName: ExpressionFieldTypes
        ) => void = debounce(
            (
                changedValue: string,
                ruleId: string,
                conditionId: string,
                expressionId: string,
                fieldName: ExpressionFieldTypes
            ) => {
                updateConditionExpression(changedValue, ruleId, conditionId, expressionId, fieldName);
            },
            300
        );

        /**
         * Value input autocomplete component.
         *
         * @param metaValue - Meta value.
         * @param resourceType - Resource type.
         * @returns Value input autocomplete component.
         */
        const ValueInputAutocomplete: FunctionComponent<ValueInputAutocompleteProps> = ({
            localValue,
            resourceType,
            initialResourcesLoadUrl,
            filterBaseResourcesUrl
        }: ValueInputAutocompleteProps) => {
            const [ inputValue, setInputValue ] = useState<string>(localValue);
            const [ options, setOptions ] = useState([]);
            const [ open, setOpen ] = useState<boolean>(false);

            const filterUrl: string = inputValue ?
                filterBaseResourcesUrl?.replace("*", inputValue) : initialResourcesLoadUrl;
            const { data: initialResources = [], isLoading: isInitialLoading } = useGetResourcesList(
                initialResourcesLoadUrl
            );
            const { data: filteredResources = [], isLoading: isFiltering } = useGetResourcesList(filterUrl);

            useEffect(() => {
                if (inputValue && filterUrl) {
                    if (filteredResources && Array.isArray(filteredResources[resourceType])) {
                        setOptions(filteredResources[resourceType]);
                    }
                } else {
                    if (initialResources && Array.isArray(initialResources[resourceType])) {
                        setOptions(initialResources[resourceType]);
                    }
                }
            }, [ inputValue, initialResources, filteredResources, filterUrl ]);

            return (
                <Autocomplete
                    open={ open }
                    onOpen={ () => setOpen(true) }
                    onClose={ () => setOpen(false) }
                    options={ options || [] }
                    getOptionLabel={ (option: { name: string }) => option.name || "" }
                    loading={ isInitialLoading || isFiltering }
                    value={
                        (options || []).some((option: { id: string }) => option.id === inputValue)
                            ? options.find((option: { id: string }) => option.id === inputValue)
                            : null
                    }
                    onChange={ (event: React.SyntheticEvent, value: { id: string; name: string } | null) => {
                        if (value) {
                            handleExpressionChangeDebounced(
                                value.id,
                                ruleId,
                                conditionId,
                                expression.id,
                                ExpressionFieldTypes.Value
                            );
                        }
                    } }
                    onInputChange={ (event: React.ChangeEvent, value: string) => setInputValue(value) }
                    renderInput={ (params: any) => (
                        <TextField
                            { ...params }
                            variant="outlined"
                            value={ inputValue }
                            InputProps={ {
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        { isInitialLoading || isFiltering ? (
                                            <CircularProgress color="inherit" size={ 20 } />
                                        ) : null }
                                        { params.InputProps.endAdornment }
                                    </>
                                )
                            } }
                        />
                    ) }
                    renderOption={ (props: any, option: { name: string; id: string }) => (
                        <li { ...props } key={ option.id }>
                            { option.name }
                        </li>
                    ) }
                />
            );
        };

        /**
         * Resource list select component.
         *
         * @returns Resource list select component.
         */
        const ResourceListSelect: FunctionComponent<ResourceListSelectProps> = (props: any) => {
            const { initialResourcesLoadUrl, filterBaseResourcesUrl } = props;

            let resourcesList: any = null;
            let resourceType: string = "";

            const { data: fetchedResourcesList } = useGetResourcesList(initialResourcesLoadUrl);

            // Determine resourcesList if it's needed
            if (findMetaValuesAgainst?.value?.links?.length > 1 && fetchedResourcesList) {
                resourcesList = fetchedResourcesList;
            }

            // TODO: Handle other resource types once the API is ready
            if (expression.field === "application") {
                resourceType = "applications";
            }

            if (resourcesList) {
                if (resourcesList.count > 10) {
                    return (
                        <ValueInputAutocomplete
                            localValue={ expression.value }
                            resourceType={ resourceType }
                            initialResourcesLoadUrl={ initialResourcesLoadUrl }
                            filterBaseResourcesUrl={ filterBaseResourcesUrl }
                        />
                    );
                }

                return (
                    <Select
                        value={ expression.value }
                        onChange={ (e: SelectChangeEvent) => {
                            updateConditionExpression(
                                e.target.value,
                                ruleId,
                                conditionId,
                                expression.id,
                                ExpressionFieldTypes.Value
                            );
                        } }
                    >
                        { resourcesList[resourceType]?.map((item: any, index: number) => (
                            <MenuItem value={ item.id } key={ `${expression.id}-${index}` }>
                                { item.name }
                            </MenuItem>
                        )) }
                    </Select>
                );
            }
        };

        /**
         * Condition value input component.
         *
         * @param metaValue - Meta value.
         * @returns Condition value input component.
         */
        const ConditionValueInput: FunctionComponent<ConditionValueInputProps> = (props: any) => {
            const { metaValue } = props;

            if (metaValue?.inputType === "input" || null) {
                return (
                    <TextField
                        value={ expression.value }
                        onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
                            handleExpressionChangeDebounced(
                                e.target.value,
                                ruleId,
                                conditionId,
                                expression.id,
                                ExpressionFieldTypes.Value
                            );
                        } }
                    />
                );
            }

            if (metaValue?.inputType === "options") {
                if (metaValue?.values?.length > 1) {
                    return (
                        <Select
                            value={ expression.value }
                            onChange={ (e: SelectChangeEvent) => {
                                updateConditionExpression(
                                    e.target.value,
                                    ruleId,
                                    conditionId,
                                    expression.id,
                                    ExpressionFieldTypes.Value
                                );
                            } }
                        >
                            { metaValue.values?.map((item: ListDataInterface, index: number) => (
                                <MenuItem value={ item.name } key={ `${expression.id}-${index}` }>
                                    { item.displayName }
                                </MenuItem>
                            )) }
                        </Select>
                    );
                }

                if (metaValue?.links?.length > 1) {
                    const initialResourcesLoadUrl: string = metaValue?.links.find(
                        (link: LinkInterface) => link.rel === "values"
                    )?.href;
                    const filterBaseResourcesUrl: string = metaValue?.links.find(
                        (link: LinkInterface) => link.rel === "filter"
                    )?.href;

                    if (initialResourcesLoadUrl && filterBaseResourcesUrl) {
                        return (
                            <ResourceListSelect
                                initialResourcesLoadUrl={ initialResourcesLoadUrl }
                                filterBaseResourcesUrl={ filterBaseResourcesUrl }
                            />
                        );
                    }

                    return null;
                }

                return null;
            }

            return null;
        };

        return (
            <Box
                sx={ { position: "relative" } }
                key={ index }
                className="box-container"
                data-componentid={ componentId }
            >
                <FormControl fullWidth size="small">
                    <Select
                        value={ expression.field }
                        onChange={ (e: SelectChangeEvent) => {
                            updateConditionExpression(
                                e.target.value,
                                ruleId,
                                conditionId,
                                expression.id,
                                ExpressionFieldTypes.Field
                            );
                            updateConditionExpression(
                                "",
                                ruleId,
                                conditionId,
                                expression.id,
                                ExpressionFieldTypes.Value
                            );
                        } }
                    >
                        { conditionExpressionsMeta?.map((item: ConditionExpressionMetaInterface, index: number) => (
                            <MenuItem value={ item.field?.name } key={ `${expression.id}-${index}` }>
                                { item.field?.displayName }
                            </MenuItem>
                        )) }
                    </Select>
                </FormControl>
                <FormControl sx={ { mb: 1, minWidth: 120, mt: 1 } } size="small">
                    <Select
                        value={ expression.operator }
                        onChange={ (e: SelectChangeEvent) => {
                            updateConditionExpression(
                                e.target.value,
                                ruleId,
                                conditionId,
                                expression.id,
                                ExpressionFieldTypes.Operator
                            );
                        } }
                    >
                        { findMetaValuesAgainst?.operators?.map((item: ListDataInterface, index: number) => (
                            <MenuItem value={ item.name } key={ `${expression.id}-${index}` }>
                                { item.displayName }
                            </MenuItem>
                        )) }
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                    <ConditionValueInput metaValue={ findMetaValuesAgainst?.value } />
                </FormControl>
                <FormControl sx={ { mt: 1 } } size="small">
                    <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={ () => {
                            addNewRuleConditionExpression(
                                ruleId,
                                conditionId,
                                AdjoiningOperatorTypes.And,
                                expression.id
                            );
                        } }
                        className="add-button"
                        startIcon={ <AddIcon /> }
                    >
                        { t("rules:buttons.and") }
                    </Button>
                </FormControl>

                { isConditionExpressionRemovable && (
                    <Fab
                        aria-label="delete"
                        size="small"
                        sx={ { position: "absolute" } }
                        className="remove-button"
                        onClick={ () => removeRuleConditionExpression(ruleId, expression.id) }
                    >
                        <RemoveIcon className="remove-button-icon" />
                    </Fab>
                ) }
            </Box>
        );
    };

    return (
        <>
            { ruleConditions?.map(
                (condition: RuleConditionInterface, index: number) =>
                    ruleInstance?.condition === AdjoiningOperatorTypes.Or && (
                        <Fragment key={ index }>
                            { condition.condition === AdjoiningOperatorTypes.And && (
                                <>
                                    { condition.expressions?.map(
                                        (expression: ConditionExpressionInterface, exprIndex: number) => (
                                            <Box sx={ { mt: 2 } } key={ exprIndex }>
                                                <RuleExpression
                                                    expression={ expression }
                                                    ruleId={ ruleInstance.id }
                                                    conditionId={ condition.id }
                                                    index={ exprIndex }
                                                    isConditionExpressionRemovable={
                                                        condition.expressions.length > 1 ||
                                                        ruleInstance.rules.length > 1
                                                    }
                                                />
                                            </Box>
                                        )
                                    ) }
                                </>
                            ) }
                            { condition.expressions?.length > 0 && (
                                <Divider sx={ { mb: 1, mt: 2 } }>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="secondary"
                                        onClick={ () =>
                                            addNewRuleConditionExpression(
                                                ruleInstance.id,
                                                condition.id,
                                                AdjoiningOperatorTypes.Or
                                            )
                                        }
                                        startIcon={ <AddIcon /> }
                                    >
                                        { t("rules:buttons.or") }
                                    </Button>
                                </Divider>
                            ) }
                        </Fragment>
                    )
            ) }
        </>
    );
};

export default RuleConditions;
