import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmDialogService } from './confirm-dialog.service';
import {
  ContractDialogComponent,
  ConfirmDialogData,
} from '../components/contract-dialog/contract-dialog.component';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let dialogService: jest.Mocked<MatDialog>;
  let dialogRefMock: jest.Mocked<MatDialogRef<ContractDialogComponent>>;

  beforeEach(() => {
    dialogRefMock = {
      afterClosed: jest.fn(),
    } as any;

    const dialogMock = {
      open: jest.fn().mockReturnValue(dialogRefMock),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ConfirmDialogService,
        { provide: MatDialog, useValue: dialogMock },
      ],
    });

    service = TestBed.inject(ConfirmDialogService);
    dialogService = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirm', () => {
    it('should open dialog with provided data and return true when confirmed', (done) => {
      const data: ConfirmDialogData = {
        title: 'Test Title',
        message: 'Test Message',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
      };

      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirm(data).subscribe((result) => {
        expect(result).toBe(true);
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          {
            width: '450px',
            data,
          }
        );
        done();
      });
    });

    it('should return false when dialog is cancelled', (done) => {
      const data: ConfirmDialogData = {
        title: 'Test',
        message: 'Test',
      };

      dialogRefMock.afterClosed.mockReturnValue(of(false));

      service.confirm(data).subscribe((result) => {
        expect(result).toBe(false);
        done();
      });
    });

    it('should return false when dialog is closed without selection', (done) => {
      const data: ConfirmDialogData = {
        title: 'Test',
        message: 'Test',
      };

      dialogRefMock.afterClosed.mockReturnValue(of(undefined));

      service.confirm(data).subscribe((result) => {
        expect(result).toBe(false);
        done();
      });
    });

    it('should merge custom config with default config', (done) => {
      const data: ConfirmDialogData = {
        title: 'Test',
        message: 'Test',
      };
      const customConfig = {
        width: '600px',
        disableClose: true,
      };

      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirm(data, customConfig).subscribe(() => {
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          {
            width: '600px',
            disableClose: true,
            data,
          }
        );
        done();
      });
    });
  });

  describe('confirmDelete', () => {
    it('should open delete confirmation dialog with default item name', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmDelete().subscribe((result) => {
        expect(result).toBe(true);
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              title: 'Confirmar eliminación',
              message:
                '¿Está seguro que desea eliminar este elemento? Esta acción no se puede deshacer.',
              confirmText: 'Eliminar',
              cancelText: 'Cancelar',
              confirmButtonColor: 'warn',
            }),
          })
        );
        done();
      });
    });

    it('should open delete confirmation dialog with custom item name', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmDelete('el contrato').subscribe(() => {
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              message:
                '¿Está seguro que desea eliminar el contrato? Esta acción no se puede deshacer.',
            }),
          })
        );
        done();
      });
    });

    it('should open delete confirmation dialog with custom message', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmDelete('item', 'Custom delete message').subscribe(() => {
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              message: 'Custom delete message',
            }),
          })
        );
        done();
      });
    });
  });

  describe('confirmSave', () => {
    it('should open save confirmation dialog with default message', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmSave().subscribe((result) => {
        expect(result).toBe(true);
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              title: 'Guardar cambios',
              message: '¿Desea guardar los cambios realizados?',
              confirmText: 'Guardar',
              cancelText: 'Cancelar',
              confirmButtonColor: 'primary',
            }),
          })
        );
        done();
      });
    });

    it('should open save confirmation dialog with custom message', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmSave('Custom save message').subscribe(() => {
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              message: 'Custom save message',
            }),
          })
        );
        done();
      });
    });
  });

  describe('confirmDiscard', () => {
    it('should open discard confirmation dialog with default message', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmDiscard().subscribe((result) => {
        expect(result).toBe(true);
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              title: 'Descartar cambios',
              message:
                'Tiene cambios sin guardar. ¿Está seguro que desea descartarlos?',
              confirmText: 'Sí, descartar',
              cancelText: 'No, volver',
              confirmButtonColor: 'warn',
            }),
          })
        );
        done();
      });
    });

    it('should open discard confirmation dialog with custom message', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmDiscard('Custom discard message').subscribe(() => {
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              message: 'Custom discard message',
            }),
          })
        );
        done();
      });
    });
  });

  describe('confirmLeave', () => {
    it('should open leave confirmation dialog with default message', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmLeave().subscribe((result) => {
        expect(result).toBe(true);
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              title: 'Confirmar salida',
              message:
                '¿Está seguro que desea salir? Los cambios no guardados se perderán.',
              confirmText: 'Sí, salir',
              cancelText: 'Cancelar',
              confirmButtonColor: 'warn',
            }),
          })
        );
        done();
      });
    });

    it('should open leave confirmation dialog with custom message', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmLeave('Custom leave message').subscribe(() => {
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              message: 'Custom leave message',
            }),
          })
        );
        done();
      });
    });
  });

  describe('confirmContinue', () => {
    it('should open continue confirmation dialog with default confirm text', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service
        .confirmContinue('Continue Title', 'Continue Message')
        .subscribe((result) => {
          expect(result).toBe(true);
          expect(dialogService.open).toHaveBeenCalledWith(
            ContractDialogComponent,
            expect.objectContaining({
              data: expect.objectContaining({
                title: 'Continue Title',
                message: 'Continue Message',
                confirmText: 'Continuar',
                cancelText: 'Cancelar',
                confirmButtonColor: 'primary',
              }),
            })
          );
          done();
        });
    });

    it('should open continue confirmation dialog with custom confirm text', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service
        .confirmContinue('Title', 'Message', 'Custom Continue')
        .subscribe(() => {
          expect(dialogService.open).toHaveBeenCalledWith(
            ContractDialogComponent,
            expect.objectContaining({
              data: expect.objectContaining({
                confirmText: 'Custom Continue',
              }),
            })
          );
          done();
        });
    });
  });

  describe('confirmWarning', () => {
    it('should open warning confirmation dialog with default confirm text', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service
        .confirmWarning('Warning Title', 'Warning Message')
        .subscribe((result) => {
          expect(result).toBe(true);
          expect(dialogService.open).toHaveBeenCalledWith(
            ContractDialogComponent,
            expect.objectContaining({
              data: expect.objectContaining({
                title: 'Warning Title',
                message: 'Warning Message',
                confirmText: 'Aceptar',
                cancelText: 'Cancelar',
                confirmButtonColor: 'warn',
              }),
            })
          );
          done();
        });
    });

    it('should open warning confirmation dialog with custom confirm text', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service
        .confirmWarning('Title', 'Message', 'Custom Accept')
        .subscribe(() => {
          expect(dialogService.open).toHaveBeenCalledWith(
            ContractDialogComponent,
            expect.objectContaining({
              data: expect.objectContaining({
                confirmText: 'Custom Accept',
              }),
            })
          );
          done();
        });
    });
  });

  describe('confirmAction', () => {
    it('should open action confirmation dialog with default description', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service.confirmAction('Aprobar').subscribe((result) => {
        expect(result).toBe(true);
        expect(dialogService.open).toHaveBeenCalledWith(
          ContractDialogComponent,
          expect.objectContaining({
            data: expect.objectContaining({
              title: 'Confirmar Aprobar',
              message: '¿Está seguro que desea aprobar?',
              confirmText: 'Confirmar',
              cancelText: 'Cancelar',
              confirmButtonColor: 'primary',
            }),
          })
        );
        done();
      });
    });

    it('should open action confirmation dialog with custom description', (done) => {
      dialogRefMock.afterClosed.mockReturnValue(of(true));

      service
        .confirmAction('Rechazar', 'Custom action description')
        .subscribe(() => {
          expect(dialogService.open).toHaveBeenCalledWith(
            ContractDialogComponent,
            expect.objectContaining({
              data: expect.objectContaining({
                title: 'Confirmar Rechazar',
                message: 'Custom action description',
              }),
            })
          );
          done();
        });
    });
  });
});
