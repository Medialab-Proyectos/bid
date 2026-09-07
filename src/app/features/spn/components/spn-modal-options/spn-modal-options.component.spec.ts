import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpnModalOptionsComponent } from './spn-modal-options.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { of } from 'rxjs';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

export const mockMatDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: jest.fn().mockReturnValue(of({})),
    componentInstance: {},
  }),
};

export const mockDialogRef = {
  close: jest.fn(),
  afterClosed: jest.fn().mockReturnValue(of({})),
};

export const testProviders = [
  { provide: MatDialog, useValue: mockMatDialog },
  { provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialogRef, useValue: mockDialogRef },
];

describe('SpnModalOptionsComponent', () => {
  let component: SpnModalOptionsComponent;
  let fixture: ComponentFixture<SpnModalOptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpnModalOptionsComponent],
      providers: [...testProviders, ...commonTestProviders],
    });
    fixture = TestBed.createComponent(SpnModalOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
