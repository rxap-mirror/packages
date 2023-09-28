import { Observable } from 'rxjs';
import { ThemeDensity } from './theme.service';

export function ObserveCurrentThemeDensity(): Observable<ThemeDensity> {
  return new Observable((subscriber) => {

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const classList = (mutation.target as HTMLElement).classList;
          const matchingClasses = Array.from(classList).filter((className) =>
            /density-\d/.test(className),
          );
          if (matchingClasses.length > 0) {
            console.log(`Matched classes: ${ matchingClasses }`);
            const match = matchingClasses[0].match(/density-(\d)/);
            if (match) {
              subscriber.next(Number(match[1]) * -1 as ThemeDensity);
            }
          } else {
            subscriber.next(0);
          }
        }
      });
    });

    subscriber.add(() => observer.disconnect());

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [ 'class' ],
    });

  });
}
