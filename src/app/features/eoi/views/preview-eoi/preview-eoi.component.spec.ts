import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewEoiComponent } from './preview-eoi.component';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { RouterTestingModule } from '@angular/router/testing';

describe('PreviewEoiComponent', () => {
  let component: PreviewEoiComponent;
  let fixture: ComponentFixture<PreviewEoiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviewEoiComponent],
      providers: [provideMockStore(), ...commonTestProviders],
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    fixture = TestBed.createComponent(PreviewEoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
