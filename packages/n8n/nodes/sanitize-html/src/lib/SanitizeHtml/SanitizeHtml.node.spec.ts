import { SanitizeHtml } from './SanitizeHtml.node';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import sanitizeHtml from 'sanitize-html';

describe('SanitizeHtml Node', () => {
  let node: SanitizeHtml;

  beforeEach(() => {
    node = new SanitizeHtml();
  });

  it('should sanitize basic HTML and keep defaults intact', async () => {
    const inputData: INodeExecutionData[] = [
      { json: { html: '<p>Hello <script>alert("xss")</script>world</p>' } }
    ];

    const parameters: Record<string, any> = {
      html: '<p>Hello <script>alert("xss")</script>world</p>',
      allowedAttributes: { allowed: [] },
      allowedTags: {},
    };

    const context = {
      getInputData: jest.fn().mockReturnValue(inputData),
      getNodeParameter: jest.fn().mockImplementation((paramName) => parameters[paramName]),
      continueOnFail: jest.fn().mockReturnValue(false),
    } as unknown as IExecuteFunctions;

    const result = await node.execute.call(context);

    expect(result).toBeDefined();
    expect(result![0][0].json).toEqual({
      html: '<p>Hello world</p>',
    });
  });

  it('should allow modifying allowed attributes without mutating global defaults', async () => {
    // Record original defaults
    const originalDefaults = JSON.parse(JSON.stringify(sanitizeHtml.defaults.allowedAttributes));

    const inputData: INodeExecutionData[] = [
      { json: { html: '<a href="https://example.com" custom-attr="test">link</a>' } }
    ];

    const parameters: Record<string, any> = {
      html: '<a href="https://example.com" custom-attr="test">link</a>',
      allowedAttributes: {
        allowed: [
          { tag: 'a', attributes: ['href', 'custom-attr'] }
        ]
      },
      allowedTags: {},
    };

    const context = {
      getInputData: jest.fn().mockReturnValue(inputData),
      getNodeParameter: jest.fn().mockImplementation((paramName) => parameters[paramName]),
      continueOnFail: jest.fn().mockReturnValue(false),
    } as unknown as IExecuteFunctions;

    const result = await node.execute.call(context);

    expect(result).toBeDefined();
    expect(result![0][0].json).toEqual({
      html: '<a href="https://example.com" custom-attr="test">link</a>',
    });

    // Check that global defaults were NOT mutated
    expect(sanitizeHtml.defaults.allowedAttributes).toEqual(originalDefaults);
  });
});
