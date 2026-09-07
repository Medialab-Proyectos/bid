import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommentFilterForm, FilterComment } from '../models';
import { BehaviorSubject } from 'rxjs';
import { ViewTabComment } from '../enums/viewTabComment.enum';
import { Router } from '@angular/router';
import { UpdateCommentsRquest } from '@core/models/requests/procurement-comments-request.model';
import { UpdateCommentsResponse } from '@core/models/responses/procurement-comments-response.model';
import { CommentProcurementFormGroup } from '@fiduciary-interface/app/shared/components/dialog-comments/models/commentsForm.model';
import {
  CommentsSelectionAction,
  ProcurementCommentTypeEnum,
} from '@core/enums';

@Injectable({
  providedIn: 'root',
})
export class CommentsEventBussService {
  constructor(public router: Router) {}
  public selectedComments = {};

  private readonly _viewTab = new BehaviorSubject<ViewTabComment>(
    ViewTabComment.PLAN
  );
  readonly viewTab$ = this._viewTab.asObservable();

  private readonly _commentsUpdateVisibility =
    new BehaviorSubject<UpdateCommentsResponse>(null);
  readonly commentsUpdateVisibility$ =
    this._commentsUpdateVisibility.asObservable();

  private readonly _activeTab = new BehaviorSubject<boolean>(true);
  readonly activeTab$ = this._activeTab.asObservable();

  private readonly _groupedTab = new BehaviorSubject<boolean>(null);
  readonly groupedTab$ = this._groupedTab.asObservable();

  private readonly _commentDraftEditing = new BehaviorSubject<boolean>(null);
  readonly commentDraftEditing$ = this._commentDraftEditing.asObservable();

  private readonly _processActiveCommentDraft = new BehaviorSubject<boolean[]>(
    []
  );

  private readonly _selectCommentsMode = new BehaviorSubject<boolean>(null);
  readonly selectCommentsMode$ = this._selectCommentsMode.asObservable();

  readonly processActiveCommentDraft$ =
    this._processActiveCommentDraft.asObservable();

  private readonly _selectCommentOption = new BehaviorSubject<boolean>(false);
  readonly selectCommentOption$ = this._selectCommentOption.asObservable();

  private readonly _loadingAPI = new BehaviorSubject<boolean>(false);
  readonly loadingAPI$ = this._loadingAPI.asObservable();

  private readonly _changeAllCommentsVisibility = new BehaviorSubject<string>(
    null
  );
  readonly changeAllCommentsVisibility$ =
    this._changeAllCommentsVisibility.asObservable();

  private _commenType: ProcurementCommentTypeEnum = null;

  private readonly _currentFormValue = new BehaviorSubject<FilterComment>({
    user: null,
    visibility: null,
    dateRange: {
      endDate: null,
      initialDate: null,
    },
    processId: null,
    processName: null,
    marked: false,
  });
  readonly currentFormValue$ = this._currentFormValue.asObservable();

  public set selectCommentsMode(val: boolean) {
    if (val !== undefined) {
      this._selectCommentsMode.next(val);
    }
  }
  public get selectCommentsMode() {
    return this._selectCommentsMode.getValue();
  }
  public set changeAllCommentsVisibility(visibility: string) {
    this._changeAllCommentsVisibility.next(visibility);
  }

  public set commenType(val: ProcurementCommentTypeEnum) {
    this._commenType = val;
  }
  public get commenType() {
    return this._commenType;
  }

  public set loading(val: boolean) {
    this._loadingAPI.next(val);
  }
  public get loading() {
    return this._selectCommentsMode.getValue();
  }

  public get currentFormValue() {
    return this._currentFormValue.getValue();
  }

  public set currentFormValue(val: FilterComment) {
    if (val) {
      this._currentFormValue.next(val);
    }
  }
  public resetCurrentFormValue() {
    const resetForm = {
      user: null,
      updatedBy: null,
      visibility: null,
      dateRange: {
        endDate: null,
        initialDate: null,
      },
      updatedRange: {
        endDate: null,
        initialDate: null,
      },
      processId: null,
      processName: null,
      marked: false,
    };
    this.currentFormValue = resetForm;
  }

  public get viewTab() {
    return this._viewTab.getValue();
  }

  public set viewTab(val: ViewTabComment) {
    if (val) {
      this._viewTab.next(val);
    }
  }

  public get activeTab() {
    return this._activeTab.getValue();
  }

  public set activeTab(val: boolean) {
    if (val !== undefined) {
      this._activeTab.next(val);
    }
  }

  public get commentDraftEditing() {
    return this._activeTab.getValue();
  }

  public set commentDraftEditing(val: boolean) {
    if (val !== undefined) {
      this._commentDraftEditing.next(val);
    }
  }

  public get commentsUpdateVisibility() {
    return this._commentsUpdateVisibility.getValue();
  }

  public set commentsUpdateVisibility(val: UpdateCommentsResponse) {
    if (val !== null) {
      this._commentsUpdateVisibility.next(val);
    }
  }

  public get groupedTab() {
    return this._groupedTab.getValue();
  }

  public set groupedTab(val: boolean) {
    if (val !== undefined) {
      this._groupedTab.next(val);
    }
  }

  public get processActiveCommentDraft() {
    return this._processActiveCommentDraft.getValue();
  }

  public set processActiveCommentDraft(val: boolean[]) {
    this._processActiveCommentDraft.next(val);
  }

  public setprocessActiveCommentValue(index: number, value: boolean) {
    let newArray = [...this.processActiveCommentDraft];
    newArray[index] = value;
    const isEditing = newArray.some((val) => val);
    this.selectCommentOption = isEditing;
    this.processActiveCommentDraft = newArray;
  }

  public get selectCommentOption() {
    return this._selectCommentOption.getValue();
  }

  public set selectCommentOption(val: boolean) {
    if (val !== undefined) {
      this._selectCommentOption.next(val);
    }
  }

  initializeForm(): FormGroup<CommentFilterForm> {
    return new FormGroup({
      user: new FormControl('', [Validators.minLength(2)]),
      visibility: new FormControl(''),
      dateRange: new FormGroup({
        initialDate: new FormControl(null),
        endDate: new FormControl(null),
      }),
      activeVersion: new FormControl<boolean>(true),
      dropdownSelection: new FormControl('1'),
      processId: new FormControl('', [Validators.minLength(2)]),
      processName: new FormControl('', [Validators.minLength(2)]),
      marked: new FormControl<boolean>(false),
    });
  }

  checkModule(actualRouteUrl: string) {
    if (
      actualRouteUrl.includes('/process/active') ||
      actualRouteUrl.includes('/process/historic')
    ) {
      this.viewTab = ViewTabComment.PROCESS;
    } else {
      this.viewTab = ViewTabComment.PLAN;
    }

    if (
      actualRouteUrl.includes('process/active') ||
      actualRouteUrl.includes('plan/active')
    ) {
      this.activeTab = true;
    } else {
      this.activeTab = false;
    }

    if (actualRouteUrl.includes('process/groupByProcess')) {
      this.groupedTab = true;
      this.activeTab = false;
    } else {
      this.groupedTab = false;
    }
  }

  public resetConsts() {
    this.processActiveCommentDraft = [];
    this.selectCommentOption = false;
  }

  updateCommentOnSelection(
    parentId: string,
    comment: FormGroup<CommentProcurementFormGroup>,
    action: CommentsSelectionAction
  ): void {
    if (action === CommentsSelectionAction.ADD) {
      if (this.selectedComments.hasOwnProperty(parentId)) {
        this.selectedComments[parentId].push(comment);
      } else {
        this.selectedComments[parentId] = [comment];
      }
    } else if (action === CommentsSelectionAction.REMOVE) {
      if (this.selectedComments.hasOwnProperty(parentId)) {
        const index = this.selectedComments[parentId].findIndex(
          (c) => c.value.id === comment.value.id
        );

        if (index !== -1) {
          this.selectedComments[parentId].splice(index, 1);

          if (this.selectedComments[parentId].length === 0) {
            delete this.selectedComments[parentId];
          }
        }
      }
    }
  }

  mapSelectedComments(visibility: number): UpdateCommentsRquest {
    let array: any = [];
    let comments = [];
    Object.keys(this.selectedComments).forEach((key) => {
      array.push({
        id: key,
        comment: this.selectedComments[key],
      });
    });
    array.forEach((p) => {
      p.comment.forEach((c) => {
        comments.push({
          id: p.id,
          comment: {
            id: c.value.id,
            text: c.controls.text.value,
            visibility,
          },
        });
      });
    });
    this.selectedComments = {};
    return {
      commentsParent: comments,
    };
  }
}
