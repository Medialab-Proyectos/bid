import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterEoiComponent } from './register-eoi.component';
import { provideWindowSizeMock } from '@fiduciary-interface/test/window-size-service.mock';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  commonTestProviders,
  MatDialogProviders,
} from '@fiduciary-interface/test/test-helpers';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';

export const mockNotification = {};

describe('RegisterEoiComponent', () => {
  let component: RegisterEoiComponent;
  let fixture: ComponentFixture<RegisterEoiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [RegisterEoiComponent],
      providers: [
        provideWindowSizeMock(),
        provideMockStore(),
        ...commonTestProviders,
        ...MatDialogProviders,
        { provide: NotificationGlobalService, useValue: mockNotification },
      ],
    });
    fixture = TestBed.createComponent(RegisterEoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
