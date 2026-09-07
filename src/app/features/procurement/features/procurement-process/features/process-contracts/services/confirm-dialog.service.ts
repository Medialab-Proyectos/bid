import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ContractDialogComponent,
  ConfirmDialogData,
} from '../components/contract-dialog/contract-dialog.component';

/**
 * Servicio para facilitar el uso del diálogo de confirmación
 * Proporciona métodos convenientes para casos de uso comunes
 */
@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * Abre un diálogo de confirmación genérico
   */
  confirm(
    data: ConfirmDialogData,
    config?: MatDialogConfig
  ): Observable<boolean> {
    return this.dialog
      .open(ContractDialogComponent, {
        width: '450px',
        ...config,
        data,
      })
      .afterClosed()
      .pipe(map((result) => result === true));
  }

  /**
   * Muestra un diálogo de confirmación para eliminación
   */
  confirmDelete(
    itemName: string = 'este elemento',
    customMessage?: string
  ): Observable<boolean> {
    return this.confirm({
      title: 'Confirmar eliminación',
      message:
        customMessage ||
        `¿Está seguro que desea eliminar ${itemName}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonColor: 'warn',
    });
  }

  /**
   * Muestra un diálogo de confirmación para guardar cambios
   */
  confirmSave(customMessage?: string): Observable<boolean> {
    return this.confirm({
      title: 'Guardar cambios',
      message: customMessage || '¿Desea guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
      confirmButtonColor: 'primary',
    });
  }

  /**
   * Muestra un diálogo de advertencia antes de descartar cambios
   */
  confirmDiscard(customMessage?: string): Observable<boolean> {
    return this.confirm({
      title: 'Descartar cambios',
      message:
        customMessage ||
        'Tiene cambios sin guardar. ¿Está seguro que desea descartarlos?',
      confirmText: 'Sí, descartar',
      cancelText: 'No, volver',
      confirmButtonColor: 'warn',
    });
  }

  /**
   * Muestra un diálogo de confirmación para salir/abandonar
   */
  confirmLeave(customMessage?: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirmar salida',
      message:
        customMessage ||
        '¿Está seguro que desea salir? Los cambios no guardados se perderán.',
      confirmText: 'Sí, salir',
      cancelText: 'Cancelar',
      confirmButtonColor: 'warn',
    });
  }

  /**
   * Muestra un diálogo de confirmación para continuar con una acción
   */
  confirmContinue(
    title: string,
    message: string,
    confirmText: string = 'Continuar'
  ): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText: 'Cancelar',
      confirmButtonColor: 'primary',
    });
  }

  /**
   * Muestra un diálogo de advertencia con mensaje personalizado
   */
  confirmWarning(
    title: string,
    message: string,
    confirmText: string = 'Aceptar'
  ): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText: 'Cancelar',
      confirmButtonColor: 'warn',
    });
  }

  /**
   * Muestra un diálogo de confirmación para ejecutar una acción
   */
  confirmAction(actionName: string, description?: string): Observable<boolean> {
    return this.confirm({
      title: `Confirmar ${actionName}`,
      message:
        description || `¿Está seguro que desea ${actionName.toLowerCase()}?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmButtonColor: 'primary',
    });
  }
}
