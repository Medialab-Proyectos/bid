import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpnPreviewSdpComponent } from './spn-preview-sdp.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { RouterTestingModule } from '@angular/router/testing';

describe('SpnPreviewSdpComponent', () => {
  let component: SpnPreviewSdpComponent;
  let fixture: ComponentFixture<SpnPreviewSdpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [SpnPreviewSdpComponent],
      providers: [provideMockStore(), ...commonTestProviders],
    });
    fixture = TestBed.createComponent(SpnPreviewSdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
