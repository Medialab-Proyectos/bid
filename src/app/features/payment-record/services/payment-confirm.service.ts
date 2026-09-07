import { Injectable } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { Observable, filter, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

/** What the user has to agree to before an action that is hard to undo. */
export interface ConfirmRequest {
  titleKey: string;
  messageKey: string;
  consequenceKey?: string;
  confirmKey?: string;
  params?: { [key: string]: string | number };
  danger?: boolean;
}

/**
 * Asks before an action that is expensive to undo.
 *
 * Kept apart from `PaymentRecordDialogService` on purpose: the dialogs that
 * need to ask are themselves opened by that service, and depending on it from
 * inside them would close a circle. This one only knows about Kendo.
 */
@Injectable({ providedIn: 'root' })
export class PaymentConfirmService {
  constructor(
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService
  ) {}

  /** Emits only when the user agreed, so callers can subscribe and act. */
  ask(request: ConfirmRequest): Observable<boolean> {
    const dialog = this.dialogService.open({
      title: this.translate.instant(request.titleKey),
      content: ConfirmDialogComponent,
      cssClass: 'pr-modal',
      width: 560,
    });

    const instance = dialog.content.instance as ConfirmDialogComponent;
    instance.messageKey = request.messageKey;
    instance.consequenceKey = request.consequenceKey;
    instance.params = request.params ?? {};
    instance.danger = Boolean(request.danger);
    if (request.confirmKey) {
      instance.confirmKey = request.confirmKey;
    }

    return dialog.result.pipe(
      map((outcome) => Boolean((outcome as { confirmed?: boolean })?.confirmed)),
      filter((confirmed) => confirmed)
    );
  }
}
