import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmCancelDialogComponent } from './confirm-cancel-dialog.component';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { TranslateTestingModule } from 'ngx-translate-testing';

// Mock para MatDialogRef
export const mockMatDialogRef = {
  close: jest.fn(),
  backdropClick: jest.fn(),
  keydownEvents: jest.fn(),
  updatePosition: jest.fn(),
  updateSize: jest.fn(),
  addPanelClass: jest.fn(),
  removePanelClass: jest.fn(),
};

describe('ConfirmCancelDialogComponent', () => {
  let component: ConfirmCancelDialogComponent;
  let fixture: ComponentFixture<ConfirmCancelDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateTestingModule],
      declarations: [ConfirmCancelDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        ...commonTestProviders,
      ],
    });

    fixture = TestBed.createComponent(ConfirmCancelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
