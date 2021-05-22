import { Injectable, Inject } from '@angular/core';
import { RXAP_SENTRY_CONFIG } from './tokens';
import {
  init,
  BrowserOptions,
  ReportDialogOptions,
  showReportDialog,
  lastEventId,
  forceLoad,
  onLoad,
  flush,
  close,
  wrap,
} from '@sentry/browser';
import {
  captureException,
  captureMessage,
  captureEvent,
  configureScope,
  addBreadcrumb,
  setContext,
  setExtras,
  setTags,
  setExtra,
  setTag,
  setUser,
  withScope,
  startTransaction,
} from '@sentry/minimal';
import {
  Breadcrumb,
  CaptureContext,
  Event,
  Extra,
  Extras,
  Severity,
  Transaction,
  TransactionContext,
  User,
} from '@sentry/types';
import { Scope } from '@sentry/hub';

@Injectable({
  providedIn: 'root',
})
export class SentryService {
  public readonly options: Readonly<BrowserOptions>;

  constructor(
    @Inject(RXAP_SENTRY_CONFIG)
    options: any
  ) {
    this.options = options;
  }

  public init(): void {
    init(this.options);
  }

  /**
   * Present the user with a report dialog.
   *
   * @param options Everything is optional, we try to fetch all info need from the global scope.
   */
  public showReportDialog(options?: ReportDialogOptions): void {
    showReportDialog(options);
  }

  /**
   * This is the getter for lastEventId.
   *
   * @returns The last event id of a captured event.
   */
  public lastEventId(): string | undefined {
    return lastEventId();
  }

  /**
   * This function is here to be API compatible with the loader.
   * @hidden
   */
  public forceLoad(): void {
    forceLoad();
  }

  /**
   * This function is here to be API compatible with the loader.
   * @hidden
   */
  public onLoad(callback: () => void): void {
    onLoad(callback);
  }

  /**
   * A promise that resolves when all current events have been sent.
   * If you provide a timeout and the queue takes longer to drain the promise returns false.
   *
   * @param timeout Maximum time in ms the client should wait.
   */
  public flush(timeout?: number): PromiseLike<boolean> {
    return flush(timeout);
  }

  /**
   * A promise that resolves when all current events have been sent.
   * If you provide a timeout and the queue takes longer to drain the promise returns false.
   *
   * @param timeout Maximum time in ms the client should wait.
   */
  public close(timeout?: number): PromiseLike<boolean> {
    return close(timeout);
  }

  /**
   * Wrap code within a try/catch block so the SDK is able to capture errors.
   *
   * @param fn A function to wrap.
   *
   * @returns The result of wrapped function call.
   */
  public wrap(fn: (...args: any) => any): any {
    wrap(fn);
  }

  /**
   * Captures an exception event and sends it to Sentry.
   *
   * @param exception An exception-like object.
   * @param captureContext
   * @returns The generated eventId.
   */
  public captureException(
    exception: any,
    captureContext?: CaptureContext
  ): string {
    return captureException(exception, captureContext);
  }

  /**
   * Captures a message event and sends it to Sentry.
   *
   * @param message The message to send to Sentry.
   * @param captureContext Define the level of the message.
   * @returns The generated eventId.
   */
  public captureMessage(
    message: string,
    captureContext?: CaptureContext | Severity
  ): string {
    return captureMessage(message, captureContext);
  }

  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * @param event The event to send to Sentry.
   * @returns The generated eventId.
   */
  public captureEvent(event: Event): string {
    return captureEvent(event);
  }

  /**
   * Callback to set context information onto the scope.
   * @param callback Callback function that receives Scope.
   */
  public configureScope(callback: (scope: Scope) => void): void {
    configureScope(callback);
  }

  /**
   * Records a new breadcrumb which will be attached to future events.
   *
   * Breadcrumbs will be added to subsequent events to provide more context on
   * user's actions prior to an error or crash.
   *
   * @param breadcrumb The breadcrumb to record.
   */
  public addBreadcrumb(breadcrumb: Breadcrumb): void {
    addBreadcrumb(breadcrumb);
  }

  /**
   * Sets context data with the given name.
   * @param name of the context
   * @param context Any kind of data. This data will be normalized.
   */
  public setContext(
    name: string,
    context: { [key: string]: any } | null
  ): void {
    setContext(name, context);
  }

  /**
   * Set an object that will be merged sent as extra data with the event.
   * @param extras Extras object to merge into current context.
   */
  public setExtras(extras: Extras): void {
    setExtras(extras);
  }

  /**
   * Set an object that will be merged sent as tags data with the event.
   * @param tags Tags context object to merge into current context.
   */
  public setTags(tags: { [key: string]: string }): void {
    setTags(tags);
  }

  /**
   * Set key:value that will be sent as extra data with the event.
   * @param key String of extra
   * @param extra Any kind of data. This data will be normalized.
   */
  public setExtra(key: string, extra: Extra): void {
    setExtra(key, extra);
  }

  /**
   * Set key:value that will be sent as tags data with the event.
   * @param key String key of tag
   * @param value String value of tag
   */
  public setTag(key: string, value: string): void {
    setTag(key, value);
  }

  /**
   * Updates user context information for future events.
   *
   * @param user User context object to be set in the current context. Pass `null` to unset the user.
   */
  public setUser(user: User | null): void {
    setUser(user);
  }

  /**
   * Creates a new scope with and executes the given operation within.
   * The scope is automatically removed once the operation
   * finishes or throws.
   *
   * This is essentially a convenience function for:
   *
   *     pushScope();
   *     callback();
   *     popScope();
   *
   * @param callback that will be enclosed into push/popScope.
   */
  public withScope(callback: (scope: Scope) => void): void {
    withScope(callback);
  }

  /**
   * Starts a new `Transaction` and returns it. This is the entry point to manual
   * tracing instrumentation.
   *
   * A tree structure can be built by adding child spans to the transaction, and
   * child spans to other spans. To start a new child span within the transaction
   * or any span, call the respective `.startChild()` method.
   *
   * Every child span must be finished before the transaction is finished,
   * otherwise the unfinished spans are discarded.
   *
   * The transaction must be finished with a call to its `.finish()` method, at
   * which point the transaction with all its finished child spans will be sent to
   * Sentry.
   *
   * @param context Properties of the new `Transaction`.
   */
  public startTransaction(context: TransactionContext): Transaction {
    return startTransaction(context);
  }
}
