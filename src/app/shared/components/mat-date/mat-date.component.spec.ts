import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDateComponent } from './mat-date.component';
import { provideMockStore } from '@ngrx/store/testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY } from 'rxjs';

describe('MatDateComponent', () => {
  let component: MatDateComponent;
  let fixture: ComponentFixture<MatDateComponent>;

  beforeEach(async () => {
    const mockControl = new FormControl();

    const mockNgControl: Partial<NgControl> = {
      control: mockControl,
      valueAccessor: null,
      statusChanges: EMPTY,
      name: 'testDate',
      touched: false,
      untouched: true,
      pristine: true,
      dirty: false,
      valid: true,
      invalid: false,
      pending: false,
      disabled: false,
      enabled: true,
      errors: null,
      value: null,
      status: 'VALID',
    };

    await TestBed.configureTestingModule({
      imports: [MatDateComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        provideMockStore({
          initialState: {
            preferences: {
              preferences: {
                preferredLanguage: 'en',
              },
            },
          },
        }),
        ...commonTestProviders,
        { provide: NgControl, useValue: mockNgControl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatDateComponent);
    component = fixture.componentInstance;

    (component as any).ngControl = mockNgControl;
  });

  it('should create', () => {
    fixture.autoDetectChanges(false);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
