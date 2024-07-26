import iconv from 'iconv-lite';

import get from 'lodash/get';
import type {
	IBinaryData,
	IDataObject,
	IExecuteFunctions,
} from 'n8n-workflow';
import {
	BINARY_ENCODING,
	NodeOperationError,
} from 'n8n-workflow';
import { stringify } from 'yaml';

export type JsonYamlToBinaryOptions = {
	fileName?: string;
	sourceKey?: string;
	encoding?: string;
	addBOM?: boolean;
	mimeType?: string;
	dataIsBase64?: boolean;
	itemIndex?: number;
	format?: boolean;
};

export async function createBinaryFromJsonAsYAML(
	this: IExecuteFunctions,
	data: IDataObject | IDataObject[],
	options: JsonYamlToBinaryOptions,
): Promise<IBinaryData> {
	let value;
	if (options.sourceKey) {
		value = get(data, options.sourceKey) as IDataObject;
	} else {
		value = data;
	}

	if (value === undefined) {
		throw new NodeOperationError(this.getNode(), `The value in "${options.sourceKey}" is not set`, {
			itemIndex: options.itemIndex || 0,
		});
	}

	let buffer: Buffer;
	if (!options.dataIsBase64) {
		let valueAsString = value as unknown as string;

		if (typeof value === 'object') {
			options.mimeType = 'application/yaml';
			if (options.format) {
				valueAsString = stringify(value, null, 2);
			} else {
				valueAsString = stringify(value);
			}
		}

		buffer = iconv.encode(valueAsString, options.encoding || 'utf8', {
			addBOM: options.addBOM,
		});
	} else {
		buffer = Buffer.from(value as unknown as string, BINARY_ENCODING);
	}

	const binaryData = await this.helpers.prepareBinaryData(
		buffer,
		options.fileName,
		options.mimeType,
	);

	if (!binaryData.fileName) {
		const fileExtension = binaryData.fileExtension ? `.${binaryData.fileExtension}` : '.yaml';
		binaryData.fileName = `file${fileExtension}`;
	}

	return binaryData;
}

export type JsonToBinaryOptions = {
	fileName?: string;
	sourceKey?: string;
	encoding?: string;
	addBOM?: boolean;
	mimeType?: string;
	dataIsBase64?: boolean;
	itemIndex?: number;
	format?: boolean;
};

export async function createBinaryFromJson(
	this: IExecuteFunctions,
	data: IDataObject | IDataObject[],
	options: JsonToBinaryOptions,
): Promise<IBinaryData> {
	let value;
	if (options.sourceKey) {
		value = get(data, options.sourceKey) as IDataObject;
	} else {
		value = data;
	}

	if (value === undefined) {
		throw new NodeOperationError(this.getNode(), `The value in "${options.sourceKey}" is not set`, {
			itemIndex: options.itemIndex || 0,
		});
	}

	let buffer: Buffer;
	if (!options.dataIsBase64) {
		let valueAsString = value as unknown as string;

		if (typeof value === 'object') {
			options.mimeType = 'application/json';
			if (options.format) {
				valueAsString = JSON.stringify(value, null, 2);
			} else {
				valueAsString = JSON.stringify(value);
			}
		}

		buffer = iconv.encode(valueAsString, options.encoding || 'utf8', {
			addBOM: options.addBOM,
		});
	} else {
		buffer = Buffer.from(value as unknown as string, BINARY_ENCODING);
	}

	const binaryData = await this.helpers.prepareBinaryData(
		buffer,
		options.fileName,
		options.mimeType,
	);

	if (!binaryData.fileName) {
		const fileExtension = binaryData.fileExtension ? `.${binaryData.fileExtension}` : '';
		binaryData.fileName = `file${fileExtension}`;
	}

	return binaryData;
}
