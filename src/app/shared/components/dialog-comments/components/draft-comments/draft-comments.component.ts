import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Enumerator } from '@core/models';
import { CommentFormService } from '../../services/comment-form.service';
import { FormDialogComments } from '../../models/commentsForm.model';
import { PermissionEnum } from '@core/enums';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { AppStateWithContact } from '@core/store';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-draft-comments',
  templateUrl: './draft-comments.component.html',
  styleUrls: [],
})
export class DraftCommentsComponent implements OnInit, OnDestroy {
  @Input() set commentsForm(value: FormGroup<FormDialogComments>) {
    this._commentsForm = value;
    if (value.controls?.comments.length === 0) {
      this.addNewCommentFormGroup();
    }
  }
  @Input() visibility: Enumerator[];
  @Input() disabledByProperty: boolean[];

  _commentsForm: FormGroup<FormDialogComments>;
  userEmail: string;
  private readonly subscriptions = new Subscription();
  public visibilityPermissionExternal: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  public visibilityPermissionInternal: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];

  constructor(
    private readonly commentsFormSvc: CommentFormService,
    private readonly permissionSvc: PermissionService,
    readonly storeContact: Store<AppStateWithContact>
  ) {}

  get comments() {
    return this._commentsForm?.controls?.comments;
  }

  ngOnInit(): void {
    const sub = this.storeContact.select('contact').subscribe((data) => {
      if (data.contact) {
        this.userEmail = data.contact.email;
      }
    });
    this.subscriptions.add(sub);
  }
  checkPermission(index: number): boolean {
    const createdBy =
      this._commentsForm.controls.comments.controls[index]?.controls?.createdBy
        ?.value;
    const internalUserDomain = 'iadb.org';
    const userEmailDomain = this.userEmail.split('@')[1].toLocaleLowerCase();
    const commentEmailDomain = createdBy?.split('@')[1].toLocaleLowerCase();

    const hasExternalPermission = this.permissionSvc.haveSomePermissions(
      this.visibilityPermissionExternal
    );
    const hasInternalPermission = this.permissionSvc.haveSomePermissions(
      this.visibilityPermissionInternal
    );

    if (createdBy === null) {
      return hasExternalPermission || hasInternalPermission;
    } else if (
      hasExternalPermission &&
      userEmailDomain !== internalUserDomain &&
      commentEmailDomain !== internalUserDomain
    ) {
      return true;
    } else if (
      hasInternalPermission &&
      userEmailDomain === internalUserDomain &&
      commentEmailDomain === internalUserDomain
    ) {
      return true;
    }
    return false;
  }

  deleteComment(index: number): void {
    this._commentsForm?.controls?.comments.removeAt(index);
  }

  disableVisibility(index: number): void {
    if (!this.checkPermission(index)) {
      this._commentsForm.controls.comments.controls[
        index
      ]?.controls.visibility.disable();
    }
  }

  addNewCommentFormGroup(): void {
    this.commentsFormSvc.addComment(this._commentsForm);
    window.scrollTo(
      0,
      document.querySelector('#draftCommentsSection').scrollHeight
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
