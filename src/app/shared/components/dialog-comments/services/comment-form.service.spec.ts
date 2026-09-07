import { TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';
import { ProcurementComment } from '../models';
import {
  CommentPlanFormGroup,
  FormDialogComments,
} from '../models/commentsForm.model';

import { CommentFormService } from './comment-form.service';
import { commentEnvironment } from '../dialog-comment.environment';

const mockInstance = {
  id: 'string',
  text: 'string',
  visibility: '2',
  source: 3,
  status: 4,
  created: new Date(2022, 11, 11),
  createdBy: 'string',
};

const mockEmptyProcurementComment = {
  id: null,
  text: null,
  visibility: commentEnvironment.DEFAULT_VISIBILITY,
  source: null,
  status: null,
  created: null,
  createdBy: null,
  marked: null,
  modifiedBy: null,
  editedBy: null,
  edited: null,
  userNameCreated: null,
  userNameEdited: null,
};

describe('CommentFormService', () => {
  let service: CommentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addComment Function', () => {
    it('should modify the lenght of the formArray in one', () => {
      let newFormGroup = new FormGroup<FormDialogComments>({
        comments: new FormArray<FormGroup<CommentPlanFormGroup>>([]),
      });
      service.addComment(newFormGroup);
      expect(newFormGroup.controls.comments.length).toBe(1);
    });
  });

  describe('newCommentFormGroup', () => {
    it('should return a instance of a FormGroup of type CommentPlanFormGroup filled with a ProcurementComment data', () => {
      let newProcurementComment: ProcurementComment = {
        id: 'string',
        text: 'string',
        visibility: 2,
        source: 3,
        status: 4,
        created: new Date(2022, 11, 11),
        createdBy: 'string',
      };
      const instance = service.newCommentFormGroup(newProcurementComment);
      expect(instance.getRawValue()).toEqual(mockInstance);
    });
  });

  describe('createNewComment', () => {
    it('should initialize the comment with the visibility on the deafult value', () => {
      const newProcurementComment = service.createNewComment();
      expect(newProcurementComment.visibility).toBe(
        commentEnvironment.DEFAULT_VISIBILITY
      );
    });
    it('should return and empty Object', () => {
      const newProcurementComment = service.createNewComment();
      expect(newProcurementComment).toEqual(mockEmptyProcurementComment);
    });
  });
});
