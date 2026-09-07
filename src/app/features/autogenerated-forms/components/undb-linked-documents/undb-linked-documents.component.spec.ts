import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UndbLinkedDocumentsComponent } from './undb-linked-documents.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('UndbLinkedDocumentsComponent', () => {
  let component: UndbLinkedDocumentsComponent;
  let fixture: ComponentFixture<UndbLinkedDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UndbLinkedDocumentsComponent],
      imports: [TranslateTestingModule],
      providers: [...commonTestProviders],
    });
    fixture = TestBed.createComponent(UndbLinkedDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
