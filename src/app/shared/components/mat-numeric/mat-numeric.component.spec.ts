import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatNumericComponent } from './mat-numeric.component';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MatNumericComponent', () => {
  let component: MatNumericComponent;
  let fixture: ComponentFixture<MatNumericComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatNumericComponent,
        TranslateTestingModule,
        NoopAnimationsModule,
      ],
      providers: [provideMockStore(), ...commonTestProviders],
    });
    fixture = TestBed.createComponent(MatNumericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
