import { Observable } from 'rxjs';

export function ObserveElementHeight(parent: HTMLElement, selector: string) {
  return new Observable<number | null>(subscriber => {
    // Function to emit the current height
    const emitHeight = () => {
      const el = parent.querySelector(selector);
      if (el) {
        subscriber.next(el.clientHeight);
      } else {
        subscriber.next(null);
      }
    };

    // MutationObserver to watch for when the element is added or attributes change
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          emitHeight();
        }
      });
    });

    // Configuration of the observer:
    const config = {attributes: true, childList: true, subtree: true};

    // Start observing the document
    observer.observe(parent, config);

    // Emit initial height if element exists
    emitHeight();

    // Return a teardown logic which will be called when unsubscribe is called
    return () => {
      observer.disconnect();
    };
  });
}
