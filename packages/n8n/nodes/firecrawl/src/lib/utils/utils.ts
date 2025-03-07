import type { IDataObject } from 'n8n-workflow';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DynamicZodObject = z.ZodObject<any, any, any, any>;

import type {
	ParametersValues as RawParametersValues,
	PlaceholderDefinition,
	SendIn,
	ToolParameter,
} from './interfaces';

const extractPlaceholders = (text: string): string[] => {
	const placeholder = /(\{[a-zA-Z0-9_-]+\})/g;
	const returnData: string[] = [];

	const matches = text.matchAll(placeholder);

	for (const match of matches) {
		returnData.push(match[0].replace(/{|}/g, ''));
	}

	return returnData;
};

export const extractParametersFromText = (
	placeholders: PlaceholderDefinition[],
	text: string,
	sendIn: SendIn,
	key?: string,
): ToolParameter[] => {
	if (typeof text !== 'string') return [];

	const parameters = extractPlaceholders(text);

	if (parameters.length) {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		const inputParameters = prepareParameters(
			parameters.map((name) => ({
				name,
				valueProvider: 'modelRequired',
			})),
			placeholders,
			'keypair',
			sendIn,
			'',
		);

		return key
			? inputParameters.parameters.map((p) => ({ ...p, key }))
			: inputParameters.parameters;
	}

	return [];
};

function prepareParameters(
	rawParameters: RawParametersValues,
	placeholders: PlaceholderDefinition[],
	parametersInputType: 'model' | 'keypair' | 'json',
	sendIn: SendIn,
	modelInputDescription: string,
	jsonWithPlaceholders?: string,
): { parameters: ToolParameter[]; values: IDataObject } {
	const parameters: ToolParameter[] = [];
	const values: IDataObject = {};

	if (parametersInputType === 'model') {
		return {
			parameters: [
				{
					name: sendIn,
					required: true,
					type: 'json',
					description: modelInputDescription,
					sendIn,
				},
			],
			values: {},
		};
	}

	if (parametersInputType === 'keypair') {
		for (const entry of rawParameters) {
			if (entry.valueProvider.includes('model')) {
				const placeholder = placeholders.find((p) => p.name === entry.name);

				const parameter: ToolParameter = {
					name: entry.name,
					required: entry.valueProvider === 'modelRequired',
					sendIn,
				};

				if (placeholder) {
					parameter.type = placeholder.type;
					parameter.description = placeholder.description;
				}

				parameters.push(parameter);
			} else if (entry.value) {
				// if value has placeholders push them to parameters
				parameters.push(
					...extractParametersFromText(placeholders, entry.value, sendIn, entry.name),
				);
				values[entry.name] = entry.value; //push to user provided values
			}
		}
	}

	if (parametersInputType === 'json' && jsonWithPlaceholders) {
		parameters.push(
			...extractParametersFromText(placeholders, jsonWithPlaceholders, sendIn, `${sendIn + 'Raw'}`),
		);
	}

	return {
		parameters,
		values,
	};
}

function makeParameterZodSchema(parameter: ToolParameter) {
	let schema: z.ZodTypeAny;

	if (parameter.type === 'string') {
		schema = z.string();
	} else if (parameter.type === 'number') {
		schema = z.number();
	} else if (parameter.type === 'boolean') {
		schema = z.boolean();
	} else if (parameter.type === 'json') {
		schema = z.record(z.any());
	} else {
		schema = z.string();
	}

	if (!parameter.required) {
		schema = schema.optional();
	}

	if (parameter.description) {
		schema = schema.describe(parameter.description);
	}

	return schema;
}

export function makeToolInputSchema(parameters: ToolParameter[]): DynamicZodObject {
	const schemaEntries = parameters.map((parameter) => [
		parameter.name,
		makeParameterZodSchema(parameter),
	]);

	return z.object(Object.fromEntries(schemaEntries));
}
