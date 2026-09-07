import { TestBed } from '@angular/core/testing';
import { NotificationGlobalService } from './notification-global.service';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import {
  NotificationService,
  NOTIFICATION_CONTAINER,
} from '@progress/kendo-angular-notification';
import { ElementRef } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationGlobalService', () => {
  let service: NotificationGlobalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DialogModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
        NoopAnimationsModule,
      ],
      providers: [
        NotificationService,
        provideMockStore({}),
        {
          provide: NOTIFICATION_CONTAINER,
          useFactory: () => {
            return { nativeElement: document.body } as ElementRef;
          },
        },
      ],
    });
    service = TestBed.inject(NotificationGlobalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showWarning', () => {
    it('should show a warning notification', () => {
      const message = 'This is a warning message';
      const horizontalPosition = 'right';
      const verticalPosition = 'top';
      const durationTime = 7000;

      const spy = jest.spyOn(service, 'showNotification');

      service.showWarning(
        message,
        horizontalPosition,
        verticalPosition,
        durationTime
      );

      expect(spy).toHaveBeenCalledWith(
        'warning',
        message,
        horizontalPosition,
        verticalPosition,
        durationTime
      );
    });
    it('should use default values if optional parameters are not provided', () => {
      const message = 'This is a warning message';

      const spy = jest.spyOn(service, 'showNotification');

      service.showWarning(message);

      expect(spy).toHaveBeenCalledWith(
        'warning',
        message,
        'right',
        'top',
        7000
      );
    });
  });

  describe('showInfo', () => {
    it('should show a showInfo notification', () => {
      const message = 'This is a showInfo message';
      const horizontalPosition = 'right';
      const verticalPosition = 'top';
      const durationTime = 7000;

      const spy = jest.spyOn(service, 'showNotification');

      service.showInfo(
        message,
        horizontalPosition,
        verticalPosition,
        durationTime
      );

      expect(spy).toHaveBeenCalledWith(
        'info',
        message,
        horizontalPosition,
        verticalPosition,
        durationTime
      );
    });
    it('should use default values if optional parameters are not provided', () => {
      const message = 'This is a showInfo message';

      const spy = jest.spyOn(service, 'showNotification');

      service.showInfo(message);

      expect(spy).toHaveBeenCalledWith('info', message, 'right', 'top', 7000);
    });
  });

  describe('showErrorPermission', () => {
    it('should show a ErrorPermission notification', () => {
      const message =
        'No tienes suficientes permisos para realizar esta operación';
      const horizontalPosition = 'right';
      const verticalPosition = 'top';
      const durationTime = 7000;

      const spy = jest.spyOn(service, 'showError');

      service.showErrorPermission(
        horizontalPosition,
        verticalPosition,
        durationTime
      );

      expect(spy).toHaveBeenCalledWith(
        message,
        horizontalPosition,
        verticalPosition,
        durationTime
      );
    });

    it('should use default values if optional parameters are not provided', () => {
      const message =
        'No tienes suficientes permisos para realizar esta operación';
      const spy = jest.spyOn(service, 'showError');

      service.showErrorPermission();

      expect(spy).toHaveBeenCalledWith(message, 'right', 'top', 7000);
    });
  });

  describe('showErrorNotFound', () => {
    it('should show a ErrorNotFound notification', () => {
      const message = 'Recurso solicitado no encontrado.';
      const horizontalPosition = 'right';
      const verticalPosition = 'top';
      const durationTime = 7000;

      const spy = jest.spyOn(service, 'showError');

      service.showErrorNotFound(
        horizontalPosition,
        verticalPosition,
        durationTime
      );

      expect(spy).toHaveBeenCalledWith(
        message,
        horizontalPosition,
        verticalPosition,
        durationTime
      );
    });

    it('should use default values if optional parameters are not provided', () => {
      const message = 'Recurso solicitado no encontrado.';

      const spy = jest.spyOn(service, 'showError');

      service.showErrorNotFound();

      expect(spy).toHaveBeenCalledWith(message, 'right', 'top', 7000);
    });
  });

  describe('showErrorTimeout', () => {
    it('should show a ErrorTimeout notification', () => {
      const message =
        'Tenemos problemas de conexión con el sistema, intentelo de nuevo pasado unos minutos';
      const horizontalPosition = 'right';
      const verticalPosition = 'top';
      const durationTime = 7000;

      const spy = jest.spyOn(service, 'showError');

      service.showErrorTimeout(
        horizontalPosition,
        verticalPosition,
        durationTime
      );

      expect(spy).toHaveBeenCalledWith(
        message,
        horizontalPosition,
        verticalPosition,
        durationTime
      );
    });

    it('should use default values if optional parameters are not provided', () => {
      const message =
        'Tenemos problemas de conexión con el sistema, intentelo de nuevo pasado unos minutos';
      const spy = jest.spyOn(service, 'showError');

      service.showErrorTimeout();

      expect(spy).toHaveBeenCalledWith(message, 'right', 'top', 7000);
    });
  });
});
