export interface FirebaseConfig {
  firebase: null | {
    name: string | null;
    options: {
      apiKey: string;
      authDomain?: string;
      databaseURL?: string;
      projectId: string;
      storageBucket?: string;
      messagingSenderId?: string;
      appId?: string;
    };
    firestore: {
      enablePersistence: boolean;
      /**
       * Specifies custom configurations for your Cloud Firestore instance.
       * You must set these before invoking any other methods.
       */
      settings: {
        /** The hostname to connect to. */
        host?: string;
        /** Whether to use SSL when connecting. */
        ssl?: boolean;

        /**
         * Specifies whether to use `Timestamp` objects for timestamp fields in
         * `DocumentSnapshot`s. This is enabled by default and should not be
         * disabled.
         *
         * Previously, Firestore returned timestamp fields as `Date` but `Date`
         * only supports millisecond precision, which leads to truncation and
         * causes unexpected behavior when using a timestamp from a snapshot as a
         * part of a subsequent query.
         *
         * So now Firestore returns `Timestamp` values instead of `Date`, avoiding
         * this kind of problem.
         *
         * To opt into the old behavior of returning `Date` objects, you can
         * temporarily set `timestampsInSnapshots` to false.
         *
         * @deprecated This setting will be removed in a future release. You should
         * update your code to expect `Timestamp` objects and stop using the
         * `timestampsInSnapshots` setting.
         */
        timestampsInSnapshots?: boolean;

        /**
         * An approximate cache size threshold for the on-disk data. If the cache grows beyond this
         * size, Firestore will start removing data that hasn't been recently used. The size is not a
         * guarantee that the cache will stay below that size, only that if the cache exceeds the given
         * size, cleanup will be attempted.
         *
         * The default value is 40 MB. The threshold must be set to at least 1 MB, and can be set to
         * CACHE_SIZE_UNLIMITED to disable garbage collection.
         */
        cacheSizeBytes?: number;

        /**
         * Forces the SDK’s underlying network transport (WebChannel) to use
         * long-polling. Each response from the backend will be closed immediately
         * after the backend sends data (by default responses are kept open in
         * case the backend has more data to send). This avoids incompatibility
         * issues with certain proxies, antivirus software, etc. that incorrectly
         * buffer traffic indefinitely. Use of this option will cause some
         * performance degradation though.
         *
         * This setting may be removed in a future release. If you find yourself
         * using it to work around a specific network reliability issue, please
         * tell us about it in
         * https://github.com/firebase/firebase-js-sdk/issues/1674.
         *
         * @webonly
         */
        experimentalForceLongPolling?: boolean;
      } | null;
      /**
       * Settings that can be passed to Firestore.enablePersistence() to configure
       * Firestore persistence.
       */
      persistenceSettings: {
        /**
         * Whether to synchronize the in-memory state of multiple tabs. Setting this
         * to 'true' in all open tabs enables shared access to local persistence,
         * shared execution of queries and latency-compensated local document updates
         * across all connected instances.
         *
         * To enable this mode, `experimentalTabSynchronization:true` needs to be set
         * globally in all active tabs. If omitted or set to 'false',
         * `enablePersistence()` will fail in all but the first tab.
         *
         * NOTE: This mode is not yet recommended for production use.
         */
        experimentalTabSynchronization?: boolean;
      } | null;
    };
    storageBucket: string | null;
    region: string | null;
    origin: string | null;
    vapid: string | null;
    auth: {
      google: boolean;
      facebook: boolean;
      twitter: boolean;
      github: boolean;
    };
  }
}
