import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanCommentsDetailsComponent } from './plan-comments-details.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProcurementComment } from '@fiduciary-interface/app/shared/components/dialog-comments/models';

describe('PlanCommentsDetailsComponent', () => {
  let component: PlanCommentsDetailsComponent;
  let fixture: ComponentFixture<PlanCommentsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanCommentsDetailsComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanCommentsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should divide comments into actual and historic correctly', () => {
    const mockComments: ProcurementComment[] = [
      {
        id: '1',
        text: "I'm an actual comment.",
        visibility: 1,
        source: 1,
        status: 1,
        created: new Date(),
        createdBy: 'user1',
        actual: true,
      },
      {
        id: '2',
        text: "I'm another actual comment.",
        visibility: 1,
        source: 1,
        status: 1,
        created: new Date(),
        createdBy: 'user2',
        actual: true,
      },
      {
        id: '3',
        text: "I'm a historic comment.",
        visibility: 0,
        source: 0,
        status: 0,
        created: new Date(),
        createdBy: 'user3',
        actual: false,
      },
      {
        id: '4',
        text: "I'm another historic comment.",
        visibility: 0,
        source: 0,
        status: 0,
        created: new Date(),
        createdBy: 'user4',
        actual: false,
      },
    ];

    component.comments = mockComments;

    expect(component.actualComments.length).toBe(2);
    expect(component.historicComments.length).toBe(2);
  });
});
