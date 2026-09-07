import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsSystemOperationsComponent } from './details-system-operations.component';

describe('DetailsSystemOperationsComponent', () => {
  let component: DetailsSystemOperationsComponent;
  let fixture: ComponentFixture<DetailsSystemOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsSystemOperationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsSystemOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
