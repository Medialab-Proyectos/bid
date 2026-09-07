import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpnPreviewSdpBaseComponent } from './spn-preview-sdp-base.component';

describe('SpnPreviewSdpBaseComponent', () => {
  let component: SpnPreviewSdpBaseComponent;
  let fixture: ComponentFixture<SpnPreviewSdpBaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpnPreviewSdpBaseComponent]
    });
    fixture = TestBed.createComponent(SpnPreviewSdpBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
