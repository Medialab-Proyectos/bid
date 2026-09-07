import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpnPreviewSdpFrComponent } from './spn-preview-sdp-fr.component';

describe('SpnPreviewSdpFrComponent', () => {
  let component: SpnPreviewSdpFrComponent;
  let fixture: ComponentFixture<SpnPreviewSdpFrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpnPreviewSdpFrComponent]
    });
    fixture = TestBed.createComponent(SpnPreviewSdpFrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
