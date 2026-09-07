import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpnPreviewSdpEsComponent } from './spn-preview-sdp-es.component';

describe('SpnPreviewSdpEsComponent', () => {
  let component: SpnPreviewSdpEsComponent;
  let fixture: ComponentFixture<SpnPreviewSdpEsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpnPreviewSdpEsComponent]
    });
    fixture = TestBed.createComponent(SpnPreviewSdpEsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
