import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UndbRecipientComponent } from './undb-recipient.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('UndbRecipientComponent', () => {
  let component: UndbRecipientComponent;
  let fixture: ComponentFixture<UndbRecipientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UndbRecipientComponent],
      imports: [TranslateTestingModule],
      providers: [...commonTestProviders],
    });
    fixture = TestBed.createComponent(UndbRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
