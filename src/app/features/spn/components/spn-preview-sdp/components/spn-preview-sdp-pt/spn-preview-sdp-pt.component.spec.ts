import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpnPreviewSdpPtComponent } from './spn-preview-sdp-pt.component';

describe('SpnPreviewSdpPtComponent', () => {
  let component: SpnPreviewSdpPtComponent;
  let fixture: ComponentFixture<SpnPreviewSdpPtComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpnPreviewSdpPtComponent]
    });
    fixture = TestBed.createComponent(SpnPreviewSdpPtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
