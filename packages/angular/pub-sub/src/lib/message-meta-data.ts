export class MessageMetaData<T = unknown> {
  /**
   * A unique identifier of the message sent through the events bus.
   * @private
   */
  private readonly _id: string;

  /**
   * Time in milliseconds in which the message was generated.
   * @private
   */
  private readonly _timestamp: number;

  /**
   * Constructor for this class.
   *
   * @param _topic Original topic associated to the message sent through the events bus.
   * @param [_data] Optional: Additional data sent with the message.
   */
  constructor(
    /**
     * Original topic associated to the message.
     * @private
     */
    private readonly _topic: string,
    /**
     * Data associated to message. It's optional.
     * @private
     */
    private readonly _data?: T,
  ) {
    this._id = this.uuid();
    this._timestamp = new Date().getTime();
  }

  /**
   * Gets unique identifier of the message sent through the events bus.
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Original topic associated to the message.
   */
  public get topic(): string {
    return this._topic;
  }

  /**
   * Data associated to message. It's optional.
   */
  public get data(): T | undefined {
    return this._data;
  }

  /**
   * Gets the time in milliseconds in which the message was generated.
   */
  public get timestamp(): number {
    return this._timestamp;
  }

  /**
   * Generates UUID version 4. The solution above uses Math.random() for brevity, however Math.random() is not
   * guaranteed to be a high-quality RNG.
   *
   * @return UUID version 4.
   */
  private uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
      const r = (
                  Math.random() * 16
                ) | 0;
      const v = c === 'x' ? r : (
                                  r & 0x3
                                ) | 0x8;
      return v.toString(16);
    });
  }
}
