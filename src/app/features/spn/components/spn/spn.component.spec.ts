import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpnComponent } from './spn.component';
import { provideWindowSizeMock } from '@fiduciary-interface/test/window-size-service.mock';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('SpnComponent', () => {
  let component: SpnComponent;
  let fixture: ComponentFixture<SpnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateTestingModule],
      providers: [
        provideWindowSizeMock(),
        provideMockStore(),
        ...commonTestProviders,
      ],
      declarations: [SpnComponent],
    });
    fixture = TestBed.createComponent(SpnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
