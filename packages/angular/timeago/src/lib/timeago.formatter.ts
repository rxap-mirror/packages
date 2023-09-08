import { $localize } from '@angular/localize/init';

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;


export function TimeagoFormatter(date: number | string | Date): string {
  const then = new Date(date).getTime();
  const now = Date.now();
  const seconds = Math.round(Math.abs(now - then) / 1000);

  const ago = then < now;

  if (seconds < MINUTE) {
    const value = Math.round(seconds);
    const isPlural = value > 1;
    if (ago) {
      if (isPlural) {
        return $localize`:@@secondsAgo:${ value } seconds ago`;
      } else {
        return $localize`:@@secondAgo:less than a second ago`;
      }
    } else {
      if (isPlural) {
        return $localize`:@@secondsFromNow:${ value } seconds from now`;
      } else {
        return $localize`:@@secondFromNow:less than a second from now`;
      }
    }
  }

  if (seconds < HOUR) {
    const value = Math.round(seconds / MINUTE);
    const isPlural = value > 1;
    if (ago) {
      if (isPlural) {
        return $localize`:@@minutesAgo:${ value } minutes ago`;
      } else {
        return $localize`:@@minuteAgo:about a minute ago`;
      }
    } else {
      if (isPlural) {
        return $localize`:@@minutesFromNow:${ value } minutes from now`;
      } else {
        return $localize`:@@minuteFromNow:about a minute from now`;
      }
    }
  }

  if (seconds < DAY) {
    const value = Math.round(seconds / HOUR);
    const isPlural = value > 1;
    if (ago) {
      if (isPlural) {
        return $localize`:@@hoursAgo:${ value } hours ago`;
      } else {
        return $localize`:@@hourAgo:about an hour ago`;
      }
    } else {
      if (isPlural) {
        return $localize`:@@hoursFromNow:${ value } hours from now`;
      } else {
        return $localize`:@@hourFromNow:about an hour from now`;
      }
    }
  }

  if (seconds < WEEK) {
    const value = Math.round(seconds / DAY);
    const isPlural = value > 1;
    if (ago) {
      if (isPlural) {
        return $localize`:@@daysAgo:${ value } days ago`;
      } else {
        return $localize`:@@dayAgo:about a day ago`;
      }
    } else {
      if (isPlural) {
        return $localize`:@@daysFromNow:${ value } days from now`;
      } else {
        return $localize`:@@dayFromNow:about a day from now`;
      }
    }
  }

  if (seconds < MONTH) {
    const value = Math.round(seconds / WEEK);
    const isPlural = value > 1;
    if (ago) {
      if (isPlural) {
        return $localize`:@@weeksAgo:${ value } weeks ago`;
      } else {
        return $localize`:@@weekAgo:about a week ago`;
      }
    } else {
      if (isPlural) {
        return $localize`:@@weeksFromNow:${ value } weeks from now`;
      } else {
        return $localize`:@@weekFromNow:about a week from now`;
      }
    }
  }

  if (seconds < YEAR) {
    const value = Math.round(seconds / MONTH);
    const isPlural = value > 1;
    if (ago) {
      if (isPlural) {
        return $localize`:@@monthsAgo:${ value } months ago`;
      } else {
        return $localize`:@@monthAgo:about a month ago`;
      }
    } else {
      if (isPlural) {
        return $localize`:@@monthsFromNow:${ value } months from now`;
      } else {
        return $localize`:@@monthFromNow:about a month from now`;
      }
    }
  }


  const value = Math.round(seconds / YEAR);
  const isPlural = value > 1;
  if (ago) {
    if (isPlural) {
      return $localize`:@@yearsAgo:${ value } years ago`;
    } else {
      return $localize`:@@yearAgo:about a year ago`;
    }
  } else {
    if (isPlural) {
      return $localize`:@@yearsFromNow:${ value } years from now`;
    } else {
      return $localize`:@@yearFromNow:about a year from now`;
    }
  }

}
