import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionalParagraphComponent } from './optional-paragraph.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('OptionalParagraphComponent', () => {
  let component: OptionalParagraphComponent;
  let fixture: ComponentFixture<OptionalParagraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        OptionalParagraphComponent,
        TranslateTestingModule,
        NoopAnimationsModule,
      ],
      providers: [...commonTestProviders],
    });
    fixture = TestBed.createComponent(OptionalParagraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
