import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ContractDialogComponent,
  ConfirmDialogData,
} from './contract-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ContractDialogComponent', () => {
  let component: ContractDialogComponent;
  let fixture: ComponentFixture<ContractDialogComponent>;
  let dialogRefMock: jest.Mocked<MatDialogRef<ContractDialogComponent>>;

  function setup(dialogData: Partial<ConfirmDialogData> = {}) {
    const defaultData: ConfirmDialogData = {
      title: 'Test Title',
      message: 'Test Message',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      confirmButtonColor: 'primary',
      ...dialogData,
    };

    dialogRefMock = {
      close: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      declarations: [ContractDialogComponent],
      imports: [MatDialogModule, MatButtonModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: defaultData },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(ContractDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    return { component, fixture, dialogRefMock };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should display provided title', () => {
    const { fixture } = setup({ title: 'Custom Title' });
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.confirm-dialog__title');
    expect(title.textContent).toBe('Custom Title');
  });

  it('should display provided message', () => {
    const { fixture } = setup({ message: 'Custom Message' });
    const compiled = fixture.nativeElement;
    const message = compiled.querySelector('.confirm-dialog__message');
    expect(message.textContent).toBe('Custom Message');
  });

  it('should display provided confirm text', () => {
    const { fixture } = setup({ confirmText: 'Accept' });
    const compiled = fixture.nativeElement;
    const confirmButton = compiled.querySelector(
      '.confirm-dialog__button--confirm'
    );
    expect(confirmButton.textContent.trim()).toBe('Accept');
  });

  it('should display provided cancel text', () => {
    const { fixture } = setup({ cancelText: 'Decline' });
    const compiled = fixture.nativeElement;
    const cancelButton = compiled.querySelector(
      '.confirm-dialog__button--cancel'
    );
    expect(cancelButton.textContent.trim()).toBe('Decline');
  });

  it('should use default title when not provided', () => {
    const { component } = setup({ title: undefined });
    expect(component.data.title).toBe('Confirmación');
  });

  it('should use default message when not provided', () => {
    const { component } = setup({ message: undefined });
    expect(component.data.message).toBe('¿Está seguro que desea continuar?');
  });

  it('should use default confirmText when not provided', () => {
    const { component } = setup({ confirmText: undefined });
    expect(component.data.confirmText).toBe('Confirmar');
  });

  it('should use default cancelText when not provided', () => {
    const { component } = setup({ cancelText: undefined });
    expect(component.data.cancelText).toBe('Cancelar');
  });

  it('should use default confirmButtonColor when not provided', () => {
    const { component } = setup({ confirmButtonColor: undefined });
    expect(component.data.confirmButtonColor).toBe('primary');
  });

  it('should apply primary color to confirm button', () => {
    const { fixture } = setup({ confirmButtonColor: 'primary' });
    const compiled = fixture.nativeElement;
    const confirmButton = compiled.querySelector(
      '.confirm-dialog__button--confirm'
    );
    expect(confirmButton.getAttribute('ng-reflect-color')).toBe('primary');
  });

  it('should apply warn color to confirm button', () => {
    const { fixture } = setup({ confirmButtonColor: 'warn' });
    const compiled = fixture.nativeElement;
    const confirmButton = compiled.querySelector(
      '.confirm-dialog__button--confirm'
    );
    expect(confirmButton.getAttribute('ng-reflect-color')).toBe('warn');
  });

  it('should apply accent color to confirm button', () => {
    const { fixture } = setup({ confirmButtonColor: 'accent' });
    const compiled = fixture.nativeElement;
    const confirmButton = compiled.querySelector(
      '.confirm-dialog__button--confirm'
    );
    expect(confirmButton.getAttribute('ng-reflect-color')).toBe('accent');
  });

  it('should close dialog with false when onCancel is called', () => {
    const { component, dialogRefMock } = setup();

    component.onCancel();

    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true when onConfirm is called', () => {
    const { component, dialogRefMock } = setup();

    component.onConfirm();

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when cancel button is clicked', () => {
    const { fixture, dialogRefMock } = setup();
    const compiled = fixture.nativeElement;
    const cancelButton = compiled.querySelector(
      '.confirm-dialog__button--cancel'
    );

    cancelButton.click();

    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true when confirm button is clicked', () => {
    const { fixture, dialogRefMock } = setup();
    const compiled = fixture.nativeElement;
    const confirmButton = compiled.querySelector(
      '.confirm-dialog__button--confirm'
    );

    confirmButton.click();

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should have correct CSS classes structure', () => {
    const { fixture } = setup();
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.confirm-dialog')).toBeTruthy();
    expect(compiled.querySelector('.confirm-dialog__header')).toBeTruthy();
    expect(compiled.querySelector('.confirm-dialog__content')).toBeTruthy();
    expect(compiled.querySelector('.confirm-dialog__actions')).toBeTruthy();
  });

  it('should have mat-dialog directives', () => {
    const { fixture } = setup();
    const compiled = fixture.nativeElement;

    const header = compiled.querySelector('[mat-dialog-title]');
    const content = compiled.querySelector('[mat-dialog-content]');
    const actions = compiled.querySelector('[mat-dialog-actions]');

    expect(header).toBeTruthy();
    expect(content).toBeTruthy();
    expect(actions).toBeTruthy();
  });

  it('should have buttons with correct types', () => {
    const { fixture } = setup();
    const compiled = fixture.nativeElement;

    const cancelButton = compiled.querySelector(
      '.confirm-dialog__button--cancel'
    );
    const confirmButton = compiled.querySelector(
      '.confirm-dialog__button--confirm'
    );

    expect(cancelButton.getAttribute('type')).toBe('button');
    expect(confirmButton.getAttribute('type')).toBe('button');
  });

  it('should handle all data properties provided', () => {
    const fullData: ConfirmDialogData = {
      title: 'Full Title',
      message: 'Full Message',
      confirmText: 'Full Confirm',
      cancelText: 'Full Cancel',
      confirmButtonColor: 'warn',
    };

    const { component } = setup(fullData);

    expect(component.data.title).toBe('Full Title');
    expect(component.data.message).toBe('Full Message');
    expect(component.data.confirmText).toBe('Full Confirm');
    expect(component.data.cancelText).toBe('Full Cancel');
    expect(component.data.confirmButtonColor).toBe('warn');
  });

  it('should initialize data in constructor', () => {
    const { component } = setup({
      title: 'Constructor Test',
      message: 'Constructor Message',
    });

    expect(component.data).toBeDefined();
    expect(component.data.title).toBe('Constructor Test');
  });

  it('should have dialogRef available', () => {
    const { component } = setup();

    expect(component.dialogRef).toBeDefined();
  });
});
