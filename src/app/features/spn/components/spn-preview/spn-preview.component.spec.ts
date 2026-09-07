import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpnPreviewComponent } from './spn-preview.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('SpnPreviewComponent', () => {
  let component: SpnPreviewComponent;
  let fixture: ComponentFixture<SpnPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [SpnPreviewComponent],
    });
    fixture = TestBed.createComponent(SpnPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
