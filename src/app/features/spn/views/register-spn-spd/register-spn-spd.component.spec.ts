import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterSpnSpdComponent } from './register-spn-spd.component';
import {
  commonTestProviders,
  MatDialogProviders,
} from '@fiduciary-interface/test/test-helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';

const mockNotificationService = {};

describe('RegisterSpnComponent', () => {
  let component: RegisterSpnSpdComponent;
  let fixture: ComponentFixture<RegisterSpnSpdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [RegisterSpnSpdComponent],
      providers: [
        ...MatDialogProviders,
        ...commonTestProviders,
        provideMockStore(),
        {
          provide: NotificationGlobalService,
          useValue: mockNotificationService,
        },
      ],
    });
    fixture = TestBed.createComponent(RegisterSpnSpdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
