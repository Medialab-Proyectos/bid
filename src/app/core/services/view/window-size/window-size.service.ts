import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WindowSize {
  screenWidth: number;
  screenHeight: number;
  mobileView: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WindowSizeService {
  private readonly breakPointMobile = 768;
  constructor(@Inject('windowObject') private readonly window: Window) {
    fromEvent(window, 'resize')
      .pipe(
        map(
          () =>
            ({
              screenWidth: window.innerWidth,
              screenHeight: window.innerHeight,
              mobileView:
                window.innerWidth < this.breakPointMobile ? true : false,
            }) as WindowSize
        )
      )
      .subscribe((windowSize) => {
        this.windowSizeChanged.next(windowSize);
      });
  }

  readonly windowSizeChanged = new BehaviorSubject<WindowSize>({
    screenWidth: this.window.innerWidth,
    screenHeight: this.window.innerHeight,
    mobileView: this.window.innerWidth < this.breakPointMobile ? true : false,
  });
}
