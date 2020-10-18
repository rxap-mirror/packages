import { SnippetOptions } from '@fullstory/browser';

export interface FullstoryConfig extends SnippetOptions {

  /**
   * Sets your FullStory Org Id. Find out how to get your Org Id [here](https://help.fullstory.com/hc/en-us/articles/360047075853).
   */
  orgId: string;

  /**
   * When set to true, enables FullStory debug messages; defaults to false.
   */
  debug?: boolean;

  /**
   * Sets the global identifier for FullStory when conflicts with FS arise.
   * see [help](https://help.fullstory.com/hc/en-us/articles/360020624694-What-if-the-identifier-FS-is-used-by-another-script-on-my-site-)
   */
  namespace?: string;

  /**
   * When set to true, FullStory is added to cross-domain IFrames and records
   * content; defaults to false. Before using, you should understand the security
   * implications, and configure your Content Security Policy (CSP) HTTP headers
   * accordingly - specifically the frame-ancestors directive. Failure to
   * configure your CSP headers while using this setting can bypass IFrames
   * security protections that are included in modern browsers.
   */
  recordCrossDomainIFrames?: boolean;

  /**
   * When set to true, this tells FullStory that the IFrame is the "root" of
   * the recording and should be its own session; defaults to false. Use this
   * when your app is embedded in an IFrame on a site not running FullStory or
   * when the site is running FullStory, but you want your content sent to a
   * different FullStory org.
   */
  recordOnlyThisIFrame?: boolean;

  /**
   * Set to true if you want to deactivate FullStory in your development
   * environment. When set to true, FullStory will shutdown recording and all
   * subsequent SDK method calls will be no-ops. At the time init is called with
   * devMode: true, a single event call will be sent to FullStory to indicate
   * that the SDK is in devMode; this is to help trouble-shoot the case that
   * the SDK was accidentally set to devMode: true in a production environment.
   * Additionally, any calls to SDK methods will console.warn that FullStory
   * is in devMode. Defaults to false.
   */
  devMode?: boolean;

}
