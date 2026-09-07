import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoProcessTitleComponent } from './info-process-title.component';

describe('InfoProcessTitleComponent', () => {
  let component: InfoProcessTitleComponent;
  let fixture: ComponentFixture<InfoProcessTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoProcessTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoProcessTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
