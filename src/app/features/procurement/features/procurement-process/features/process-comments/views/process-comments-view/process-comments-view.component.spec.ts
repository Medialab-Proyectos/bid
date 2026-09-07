import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCommentsViewComponent } from './process-comments-view.component';
import { StoreModule } from '@ngrx/store';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { processCommentsTabEnum } from '@core/enums';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  CommentProcurementFormGroup,
  FormProcurementComments,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models/commentsForm.model';

describe('ProcessCommentsViewComponent', () => {
  let component: ProcessCommentsViewComponent;
  let fixture: ComponentFixture<ProcessCommentsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessCommentsViewComponent],
      imports: [
        StoreModule.forRoot({}),
        MsalTestModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 'historic' }],
              data: {
                commentTypeUrl: processCommentsTabEnum.PROCESS_ACTIVE,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessCommentsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checkAnyMarked', () => {
    it('should set marked array to empty', () => {
      component.checkAnyMarked();
      expect(component.marked).toEqual([]);
    });

    describe('when isHistoricTab is true', () => {
      beforeEach(() => {
        component.isHistoricTab = true;
        component.comments = [
          {
            parentId: '',
            processName: '',
            comments: [
              {
                id: 'id1',
                text: 'string',
                visibility: 1,
                source: 1,
                status: 1,
                created: 'string',
                createdBy: 'createdBy',

                marked: true,
              },
              {
                id: 'id1',
                text: 'string',
                visibility: 1,
                source: 1,
                status: 1,
                created: 'string',
                createdBy: 'createdBy',

                marked: false,
              },
            ],
          },
          {
            parentId: '',
            processName: '',
            comments: [
              {
                id: 'id1',
                text: 'string',
                visibility: 1,
                source: 1,
                status: 1,
                created: 'string',
                createdBy: 'createdBy',

                marked: false,
              },
            ],
          },

          ,
        ];
      });

      it('should set marked array based on comments', () => {
        component.checkAnyMarked();
        expect(component.marked).toEqual([true, false]);
      });
    });

    describe('when isHistoricTab is void', () => {
      it('should set marked array based on form controls', () => {
        component.isHistoricTab = false;
        component.form = [
          new FormGroup<FormProcurementComments>({
            comments: new FormArray<FormGroup<CommentProcurementFormGroup>>([]),
          }),
        ];
        const comment = new FormGroup<CommentProcurementFormGroup>({
          id: new FormControl(null),
          visibility: new FormControl<string>(null),
          source: new FormControl<number>(null),
          status: new FormControl<number>(null),
          text: new FormControl<string>(null),
          created: new FormControl<Date>(null),
          createdBy: new FormControl<string>(null),
          modifiedBy: new FormControl<string>(null),
          oldVisibility: new FormControl<string>(null),
          oldText: new FormControl<string>(null),
          edited: new FormControl<string>(null),
          editedBy: new FormControl<string>(null),
          selected: new FormControl<boolean>(false),
          userNameCreated: new FormControl<string>(null),
          userNameEdited: new FormControl<string>(null),
          marked: new FormControl<boolean>(false),
        });
        component.form[0].controls.comments.push(comment);

        component.checkAnyMarked();
        expect(component.marked).toEqual([false]);
      });
    });
  });
});
