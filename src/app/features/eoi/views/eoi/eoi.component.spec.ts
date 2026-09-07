import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EoiComponent } from './eoi.component';
import { provideWindowSizeMock } from '@fiduciary-interface/test/window-size-service.mock';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('EoiComponent', () => {
  let component: EoiComponent;
  let fixture: ComponentFixture<EoiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateTestingModule],
      declarations: [EoiComponent],
      providers: [
        provideWindowSizeMock(),
        provideMockStore(),
        ...commonTestProviders,
      ],
    });
    fixture = TestBed.createComponent(EoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
