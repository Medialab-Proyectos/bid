import { Injectable } from '@angular/core';
import { DialogReturn, ModalService } from './modal.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PopupNotificationService {
  constructor(readonly fiModalSvc: ModalService) {}

  handleNotificationModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      'NOTIFICATION.MODAL.TITLE',
      [
        { text: 'NOTIFICATION.MODAL.OPTION.NO' },
        {
          text: 'NOTIFICATION.MODAL.OPTION.YES',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'NOTIFICATION.MODAL.OPTION.CONTENT',
          bold: false,
        },
      ]
    );
  }
}
