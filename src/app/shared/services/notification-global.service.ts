import { Injectable } from '@angular/core';
import {
  NotificationRef,
  NotificationService,
  NotificationSettings,
} from '@progress/kendo-angular-notification';
import { ToastComponent } from '../components/notification/components/toast/toast.component';

type showNotificationType = 'success' | 'error' | 'warning' | 'info';
type horizontalPositionNotifications = 'right';
type verticalPositionNotifications = 'top';
@Injectable({ providedIn: 'root' })
export class NotificationGlobalService {
  readonly hideNotificationTime: number;

  constructor(readonly notificationService: NotificationService) {}

  /** Show a success message with Kendo UI - NotificationService */
  showNotification(
    type: showNotificationType,
    message: string,
    horizontalPosition: horizontalPositionNotifications,
    verticalPosition: verticalPositionNotifications,
    durationTime?: number
  ): void {
    const notificationSettings = {
      content: message,
      cssClass: 'button-notification',
      animation: { type: 'fade', duration: 600 },
      position: {
        horizontal: horizontalPosition,
        vertical: verticalPosition,
      },
      type: { style: type, icon: true },
      hideAfter: 2000,
    } as NotificationSettings;

    if (durationTime || this.hideNotificationTime) {
      notificationSettings.hideAfter =
        durationTime || this.hideNotificationTime;
    } else {
      notificationSettings.closable = true;
    }

    this.notificationService.show(notificationSettings);
  }

  showToast(style, title: string, description?: string[], hideAfter = 2000) {
    const notificationRef: NotificationRef = this.notificationService.show({
      content: ToastComponent,
      animation: { type: 'fade', duration: 150 },
      position: { horizontal: 'right', vertical: 'top' },
      type: { style, icon: true },
      closable: false,
      hideAfter: hideAfter,
    });

    if (notificationRef) {
      const notificationContent = notificationRef.content.instance;
      notificationContent.titleToast = title;
      if (description) {
        notificationContent.detailToast = description;
      }

      notificationContent.closeToast?.subscribe((_) => {
        notificationRef.hide();
      });
    }
  }

  showSuccess(
    message: string,
    horizontalPosition: horizontalPositionNotifications = 'right',
    verticalPosition: verticalPositionNotifications = 'top',
    durationTime = 7000
  ): void {
    this.showNotification(
      'success',
      message,
      horizontalPosition,
      verticalPosition,
      durationTime
    );
  }

  showError(
    message: string,
    horizontalPosition: horizontalPositionNotifications = 'right',
    verticalPosition: verticalPositionNotifications = 'top',
    durationTime = 7000
  ): void {
    this.showNotification(
      'error',
      message,
      horizontalPosition,
      verticalPosition,
      durationTime
    );
  }

  showWarning(
    message: string,
    horizontalPosition: horizontalPositionNotifications = 'right',
    verticalPosition: verticalPositionNotifications = 'top',
    durationTime = 7000
  ): void {
    this.showNotification(
      'warning',
      message,
      horizontalPosition,
      verticalPosition,
      durationTime
    );
  }

  showInfo(
    message: string,
    horizontalPosition: horizontalPositionNotifications = 'right',
    verticalPosition: verticalPositionNotifications = 'top',
    durationTime = 7000
  ): void {
    this.showNotification(
      'info',
      message,
      horizontalPosition,
      verticalPosition,
      durationTime
    );
  }

  showErrorPermission(
    horizontalPosition: horizontalPositionNotifications = 'right',
    verticalPosition: verticalPositionNotifications = 'top',
    durationTime = 7000
  ): void {
    const message =
      'No tienes suficientes permisos para realizar esta operación';
    this.showError(message, horizontalPosition, verticalPosition, durationTime);
  }

  showErrorUndefined(
    serverMessage: string,
    horizontalPosition: horizontalPositionNotifications = 'right',
    verticalPosition: verticalPositionNotifications = 'top',
    durationTime = 7000
  ): void {
    const message = serverMessage;
    this.showError(message, horizontalPosition, verticalPosition, durationTime);
  }

  showErrorNotFound(
    horizontalPosition: horizontalPositionNotifications = 'right',
    verticalPosition: verticalPositionNotifications = 'top',
    durationTime = 7000
  ): void {
    const message = 'Recurso solicitado no encontrado.';
    this.showError(message, horizontalPosition, verticalPosition, durationTime);
  }

  showErrorTimeout(
    horizontalPosition: horizontalPositionNotifications = 'right',
    verticalPosition: verticalPositionNotifications = 'top',
    durationTime = 7000
  ): void {
    const message =
      'Tenemos problemas de conexión con el sistema, intentelo de nuevo pasado unos minutos';
    this.showError(message, horizontalPosition, verticalPosition, durationTime);
  }
}
