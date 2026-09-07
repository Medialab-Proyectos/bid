import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpnPreviewSdoComponent } from './spn-preview-sdo.component';

describe('SpnPreviewSdoComponent', () => {
  let component: SpnPreviewSdoComponent;
  let fixture: ComponentFixture<SpnPreviewSdoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpnPreviewSdoComponent]
    });
    fixture = TestBed.createComponent(SpnPreviewSdoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
