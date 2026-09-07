import { BehaviorSubject } from 'rxjs';
import { WindowSizeService } from '@core/services/view';

export function provideWindowSizeMock({ mobileView } = { mobileView: false }) {
  const windowSizeServiceMock = {
    windowSizeChanged: new BehaviorSubject({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      mobileView,
    }),
  };
  return [
    { provide: 'windowObject', useValue: window },
    { provide: WindowSizeService, useValue: windowSizeServiceMock },
  ];
}
