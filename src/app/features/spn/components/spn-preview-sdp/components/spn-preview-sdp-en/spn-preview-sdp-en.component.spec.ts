import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpnPreviewSdpEnComponent } from './spn-preview-sdp-en.component';

describe('SpnPreviewSdpEnComponent', () => {
  let component: SpnPreviewSdpEnComponent;
  let fixture: ComponentFixture<SpnPreviewSdpEnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpnPreviewSdpEnComponent]
    });
    fixture = TestBed.createComponent(SpnPreviewSdpEnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
