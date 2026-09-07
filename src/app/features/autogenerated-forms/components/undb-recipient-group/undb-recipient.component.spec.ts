import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UndbRecipientComponentGroup } from './undb-recipient.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('UndbRecipientComponent', () => {
  let component: UndbRecipientComponentGroup;
  let fixture: ComponentFixture<UndbRecipientComponentGroup>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UndbRecipientComponentGroup],
      imports: [TranslateTestingModule],
      providers: [...commonTestProviders],
    });
    fixture = TestBed.createComponent(UndbRecipientComponentGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
