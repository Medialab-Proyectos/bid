import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParagraphSectionComponent } from './paragraph-section.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('ParagraphSectionComponent', () => {
  let component: ParagraphSectionComponent;
  let fixture: ComponentFixture<ParagraphSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParagraphSectionComponent],
      imports: [TranslateTestingModule],
      providers: [...commonTestProviders],
    });
    fixture = TestBed.createComponent(ParagraphSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
