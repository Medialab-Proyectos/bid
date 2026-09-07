import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraftCommentsComponent } from './draft-comments.component';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { StoreModule } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  CommentPlanFormGroup,
  FormDialogComments,
} from '../../models/commentsForm.model';

describe('DraftCommentsComponent', () => {
  let component: DraftCommentsComponent;
  let fixture: ComponentFixture<DraftCommentsComponent>;
  let permissionSvc: PermissionService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DraftCommentsComponent],
      providers: [TranslatePipe],
      imports: [
        HttpClientTestingModule,
        MsalTestModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();
    permissionSvc = TestBed.inject(PermissionService);

    fixture = TestBed.createComponent(DraftCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checkPermission', () => {
    it('should return true when createdBy is null and have some permissions', () => {
      const mockProcurementComment: FormGroup<CommentPlanFormGroup> =
        new FormGroup<CommentPlanFormGroup>({
          id: new FormControl(null),
          text: new FormControl(null),
          visibility: new FormControl('1'),
          source: new FormControl(null),
          status: new FormControl(null),
          created: new FormControl(null),
          createdBy: new FormControl(null),
        });
      jest.spyOn(permissionSvc, 'haveSomePermissions').mockReturnValue(true);
      let newFormGroup = new FormGroup<FormDialogComments>({
        comments: new FormArray<FormGroup<CommentPlanFormGroup>>([
          mockProcurementComment,
        ]),
      });
      component._commentsForm = newFormGroup;
      component.userEmail = 'testExternal@yopmail.com';
      const result = component.checkPermission(0);

      expect(result).toBe(true);
    });

    it('should return true when createdBy is not null and has the required conditions for EXTERNAL permission', () => {
      const index = 0;
      const createdByValue = 'example@external-domain.com';
      component.userEmail = 'testExternal@yopmail.com';

      const mockProcurementComment: FormGroup<CommentPlanFormGroup> =
        new FormGroup<CommentPlanFormGroup>({
          id: new FormControl(null),
          text: new FormControl(null),
          visibility: new FormControl('1'),
          source: new FormControl(null),
          status: new FormControl(null),
          created: new FormControl(null),
          createdBy: new FormControl(createdByValue),
        });
      let newFormGroup = new FormGroup<FormDialogComments>({
        comments: new FormArray<FormGroup<CommentPlanFormGroup>>([
          mockProcurementComment,
        ]),
      });
      component._commentsForm = newFormGroup;
      jest.spyOn(permissionSvc, 'haveSomePermissions').mockReturnValue(true);
      const result = component.checkPermission(index);

      expect(result).toBe(true);
    });

    it('should return true when createdBy is not null and has the required conditions for INTERNAL permission', () => {
      const index = 0;
      const createdByValue = 'example@iadb.com';
      component.userEmail = 'testInternal@iadb.com';

      const mockProcurementComment: FormGroup<CommentPlanFormGroup> =
        new FormGroup<CommentPlanFormGroup>({
          id: new FormControl(null),
          text: new FormControl(null),
          visibility: new FormControl('1'),
          source: new FormControl(null),
          status: new FormControl(null),
          created: new FormControl(null),
          createdBy: new FormControl(createdByValue),
        });
      let newFormGroup = new FormGroup<FormDialogComments>({
        comments: new FormArray<FormGroup<CommentPlanFormGroup>>([
          mockProcurementComment,
        ]),
      });
      component._commentsForm = newFormGroup;
      jest.spyOn(permissionSvc, 'haveSomePermissions').mockReturnValue(true);
      const result = component.checkPermission(index);

      expect(result).toBe(true);
    });
  });
  it('should return false when createdBy is not null and NOT has the required conditions for external permission', () => {
    const index = 0;
    const createdByValue = 'example@external-domain.com';
    component.userEmail = 'testExternal@yopmail.com';

    const mockProcurementComment: FormGroup<CommentPlanFormGroup> =
      new FormGroup<CommentPlanFormGroup>({
        id: new FormControl(null),
        text: new FormControl(null),
        visibility: new FormControl('1'),
        source: new FormControl(null),
        status: new FormControl(null),
        created: new FormControl(null),
        createdBy: new FormControl(createdByValue),
      });
    let newFormGroup = new FormGroup<FormDialogComments>({
      comments: new FormArray<FormGroup<CommentPlanFormGroup>>([
        mockProcurementComment,
      ]),
    });
    component._commentsForm = newFormGroup;
    jest.spyOn(permissionSvc, 'haveSomePermissions').mockReturnValue(false);
    const result = component.checkPermission(index);

    expect(result).toBe(false);
  });

  it('should delete a comment at the specified index', () => {
    let newFormGroup = new FormGroup<FormDialogComments>({
      comments: new FormArray<FormGroup<CommentPlanFormGroup>>([
        new FormGroup<CommentPlanFormGroup>({
          id: new FormControl('1'),
          text: new FormControl('1'),
          visibility: new FormControl('1'),
          source: new FormControl(null),
          status: new FormControl(null),
          created: new FormControl(null),
          createdBy: new FormControl('example@external-domain.com'),
        }),
        new FormGroup<CommentPlanFormGroup>({
          id: new FormControl('2'),
          text: new FormControl('2'),
          visibility: new FormControl('1'),
          source: new FormControl(null),
          status: new FormControl(null),
          created: new FormControl(null),
          createdBy: new FormControl('example@external-domain.com'),
        }),
        new FormGroup<CommentPlanFormGroup>({
          id: new FormControl('3'),
          text: new FormControl('3'),
          visibility: new FormControl('1'),
          source: new FormControl(null),
          status: new FormControl(null),
          created: new FormControl(null),
          createdBy: new FormControl('example@external-domain.com'),
        }),
      ]),
    });
    component._commentsForm = newFormGroup;
    const indexToDelete = 1;
    component.deleteComment(indexToDelete);

    expect(component._commentsForm.controls.comments.value).toEqual([
      {
        id: '1',
        text: '1',
        visibility: '1',
        source: null,
        status: null,
        created: null,
        createdBy: 'example@external-domain.com',
      },
      {
        id: '3',
        text: '3',
        visibility: '1',
        source: null,
        status: null,
        created: null,
        createdBy: 'example@external-domain.com',
      },
    ]);
  });

  describe('disableVisibility', () => {
    it('should disable visibility at the specified index if permission check fails', () => {
      const indexToDisable = 0;
      const newFormGroup = new FormGroup<FormDialogComments>({
        comments: new FormArray<FormGroup<CommentPlanFormGroup>>([
          new FormGroup<CommentPlanFormGroup>({
            id: new FormControl('1'),
            text: new FormControl('1'),
            visibility: new FormControl('1'),
            source: new FormControl(null),
            status: new FormControl(null),
            created: new FormControl(null),
            createdBy: new FormControl('example@external-domain.com'),
          }),
          new FormGroup<CommentPlanFormGroup>({
            id: new FormControl('2'),
            text: new FormControl('21'),
            visibility: new FormControl('21'),
            source: new FormControl(null),
            status: new FormControl(null),
            created: new FormControl(null),
            createdBy: new FormControl('example@external-domain.com'),
          }),
        ]),
      });
      component._commentsForm = newFormGroup;
      jest.spyOn(component, 'checkPermission').mockReturnValue(false);

      component.disableVisibility(indexToDisable);

      const visibilityControl =
        component._commentsForm.controls.comments.controls[indexToDisable];
      expect(visibilityControl.controls.visibility.enabled).toBe(false);
    });

    it('should not disable visibility at the specified index if permission check passes', () => {
      const indexToDisable = 0;
      const newFormGroup = new FormGroup<FormDialogComments>({
        comments: new FormArray<FormGroup<CommentPlanFormGroup>>([
          new FormGroup<CommentPlanFormGroup>({
            id: new FormControl('1'),
            text: new FormControl('1'),
            visibility: new FormControl('1'),
            source: new FormControl(null),
            status: new FormControl(null),
            created: new FormControl(null),
            createdBy: new FormControl('example@external-domain.com'),
          }),
          new FormGroup<CommentPlanFormGroup>({
            id: new FormControl('2'),
            text: new FormControl('21'),
            visibility: new FormControl('21'),
            source: new FormControl(null),
            status: new FormControl(null),
            created: new FormControl(null),
            createdBy: new FormControl('example@external-domain.com'),
          }),
        ]),
      });
      component._commentsForm = newFormGroup;
      jest.spyOn(component, 'checkPermission').mockReturnValue(true);

      component.disableVisibility(indexToDisable);

      const visibilityControl =
        component._commentsForm.controls.comments.controls[indexToDisable];
      expect(visibilityControl.controls.visibility.enabled).toBe(true);
    });
  });

  describe('addNewCommentFormGroup', () => {
    it('should add a new comment form group and scroll to the section', () => {
      const newFormGroup = new FormGroup<FormDialogComments>({
        comments: new FormArray<FormGroup<CommentPlanFormGroup>>([]),
      });
      component._commentsForm = newFormGroup;
      const initialCommentsLength =
        component._commentsForm.controls.comments.length;
      component.addNewCommentFormGroup();

      const newCommentsLength =
        component._commentsForm.controls.comments.length;

      expect(newCommentsLength).toBe(initialCommentsLength + 1);
    });
  });

  it('should set the commentsForm and add a new comment form group if empty', () => {
    const newFormGroup = new FormGroup<FormDialogComments>({
      comments: new FormArray<FormGroup<CommentPlanFormGroup>>([]),
    });
    const addNewCommentFormGroupSpy = jest.spyOn(
      component,
      'addNewCommentFormGroup'
    );

    component.commentsForm = newFormGroup;

    expect(component['_commentsForm']).toBe(newFormGroup);

    expect(addNewCommentFormGroupSpy).toHaveBeenCalled();
  });
});
