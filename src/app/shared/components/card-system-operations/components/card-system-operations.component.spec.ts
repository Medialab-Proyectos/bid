import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { CardSystemOperationsComponent } from './card-system-operations.component';

describe('CardSystemOperationsComponent', () => {
  let component: CardSystemOperationsComponent;
  let fixture: ComponentFixture<CardSystemOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutModule],
      declarations: [CardSystemOperationsComponent],
      providers: [{ provide: 'windowObject', useValue: window }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardSystemOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
