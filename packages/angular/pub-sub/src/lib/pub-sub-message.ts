import { MessageMetaData } from './message-meta-data';

export interface PubSubMessage<T = unknown> {
  /**
   * Key to identify message.
   */
  key: string;

  /**
   * Full message metadata.
   */
  metadata: MessageMetaData<T>;
}

export interface CachedPubSubMessage<T = unknown> extends PubSubMessage<T> {
  retention?: number;
}
