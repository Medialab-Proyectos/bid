import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { RolEnum } from '@core/enums';
import { ComentMenuOptionsEnum } from '@core/enums/menu-options.enum';
import { RoleObj } from '@core/models';
import { AppStateWithContact } from '@core/store';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CommentTypeEnum } from '../../enums/comment-type.enum';
import { DialogStatusEnum } from '../../enums/dialog-status.enum';
import { FormStatusEnum } from '../../enums/form-status.enum';
import { Reply, Comments, DeclineAnswer } from '../../models/comment.model';
import { ModelListPriority } from '../../models/review.model';
import { commentForm, dialogForm } from './review-form.form';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-review',
  templateUrl: './review.component.html',
})
export class ReviewComponent implements OnDestroy {
  @Input() formStatus: FormStatusEnum;
  @Input() literal;
  @Input() numeralComments: Comments[];
  @Input() rolUser: RoleObj;
  @Output() sendComments: EventEmitter<Comments> = new EventEmitter<Comments>();
  @Output() editComment: EventEmitter<any> = new EventEmitter<any>();
  @Output() declineComment: EventEmitter<any> = new EventEmitter<any>();
  @Output() declineAnswer: EventEmitter<DeclineAnswer> =
    new EventEmitter<DeclineAnswer>();
  private readonly subscriptions = new Subscription();

  public commentForm: UntypedFormGroup;
  public dialogForm: UntypedFormGroup;
  public options: string[] = [];
  public optionsAnswer: string[] = [];
  public contact;
  public selectedDialogComment: Comments;
  public selectedDialogIndexComment: number;
  public expandedOptions = false;
  public title: string;
  public state: DialogStatusEnum;
  public visibleAnswer: string;
  public dateFormat = 'H:mm, dd-MM-yyyy';
  public comment: Comments = null;
  public reply: Reply = null;
  public opened = false;
  public openDialog = false;
  public maxlengthComment = 1000;

  FormStatusEnum = FormStatusEnum;
  CommentTypeEnum = CommentTypeEnum;
  DialogStatusEnum = DialogStatusEnum;

  listPriority: Array<ModelListPriority> = [
    {
      id: CommentTypeEnum.LOW,
      value: this.serviceTranslate.instant(
        'FORMS.COMPONENT_REVIEW.TYPE_HIGH_COMMENT'
      ),
    },
    {
      id: CommentTypeEnum.MEDIUM,
      value: this.serviceTranslate.instant(
        'FORMS.COMPONENT_REVIEW.TYPE_MEDIUM_COMMENT'
      ),
    },
    {
      id: CommentTypeEnum.HIGH,
      value: this.serviceTranslate.instant(
        'FORMS.COMPONENT_REVIEW.TYPE_LOW_COMMENT'
      ),
    },
  ];

  constructor(
    private readonly serviceTranslate: TranslateService,
    private readonly storeContact: Store<AppStateWithContact>,
    private readonly datePipe: DatePipe,
    private readonly notificationGlobalService: NotificationGlobalService
  ) {
    this.commentForm = commentForm();
    this.dialogForm = dialogForm();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.getUserData();
  }

  addOptionComments(item: Comments): string {
    let visible = '';

    this.options = [];
    this.optionsAnswer = [];

    if (
      this.contact.name === item.userName &&
      this.rolUser.roleIdCode === item.userRole
    ) {
      this.options.push(
        this.serviceTranslate.instant(ComentMenuOptionsEnum.EDIT),
        this.serviceTranslate.instant(ComentMenuOptionsEnum.DELETE)
      );
    }

    if (
      this.isCoordinatorOrSpecialist(this.rolUser.roleIdCode) &&
      (item.userRole === RolEnum.Team_Leader ||
        item.userRole === RolEnum.Alternate_TeamLeader)
    ) {
      this.options.push(
        this.serviceTranslate.instant(ComentMenuOptionsEnum.REPLY)
      );
      this.optionsAnswer = [
        this.serviceTranslate.instant(ComentMenuOptionsEnum.DELETE),
        this.serviceTranslate.instant(ComentMenuOptionsEnum.EDIT_ANSWER),
      ];
    }

    if (
      (this.rolUser.roleIdCode === RolEnum.Alternate_TeamLeader ||
        this.rolUser.roleIdCode === RolEnum.Team_Leader) &&
      item.userRole === RolEnum.Procurement_Fiduciary_Specialist
    ) {
      this.options.push(
        this.serviceTranslate.instant(ComentMenuOptionsEnum.INCLUDE)
      );
    }

    if (this.options.length === 0) {
      visible = 'hidden';
    }

    if (this.optionsAnswer.length === 0) {
      this.visibleAnswer = 'hidden';
    }

    return visible;
  }

  procesComment(item: Comments): boolean {
    if (
      this.isCoordinatorOrSpecialist(this.rolUser.roleIdCode) &&
      item.userRole === RolEnum.Procurement_Fiduciary_Specialist
    ) {
      return false;
    }

    return true;
  }

  addComments() {
    if (this.commentForm.status === 'VALID') {
      const commentType = this.commentForm.value.type;

      this.comment = {
        numeral: this.literal.number,
        userName: this.contact.name,
        userRole: this.rolUser.roleIdCode,
        date: this.datePipe.transform(new Date(), this.dateFormat),
        type: commentType,
        comment: this.commentForm.value.comment,
        class: null,
        reply: null,
      };

      switch (commentType) {
        case CommentTypeEnum.HIGH:
          this.comment.class = 'c-comment-item c-comment-item--perfil3';
          break;
        case CommentTypeEnum.MEDIUM:
          this.comment.class = 'c-comment-item c-comment-item--perfil1';
          break;
        default:
          this.comment.class = 'c-comment-item c-comment-item--perfil2';
          break;
      }

      this.sendComments.emit(this.comment);
      this.commentForm.reset();
      this.commentForm.controls['type'].setValue(0);
    } else {
      this.commentForm.markAllAsTouched();
      this.notificationGlobalService.showError(
        this.serviceTranslate.instant('FORMS.TOAST.ERROR_FORM_COMMENT'),
        'right',
        'top',
        7000
      );
    }
  }

  addAnswer() {
    if (this.dialogForm.status === 'VALID') {
      let commentEdit = null;
      let replyComment = null;
      switch (this.state) {
        case DialogStatusEnum.EDIT:
          this.selectedDialogComment.comment =
            this.dialogForm.controls['newComment'].value;
          this.selectedDialogComment.date = this.datePipe.transform(
            new Date(),
            this.dateFormat
          );
          this.selectedDialogComment.userName = this.contact.name;
          commentEdit = {
            index: this.selectedDialogIndexComment,
            comment: this.selectedDialogComment,
          };
          this.editComment.emit(commentEdit);
          this.closeDialog();
          break;
        case DialogStatusEnum.REPLY:
        case DialogStatusEnum.EDIT_ANSWER:
          replyComment = {
            userName: this.contact.name,
            date: this.datePipe.transform(new Date(), this.dateFormat),
            comment: this.dialogForm.controls['newComment'].value,
          };
          this.selectedDialogComment.reply = replyComment;
          commentEdit = {
            index: this.selectedDialogIndexComment,
            comment: this.selectedDialogComment,
          };
          this.editComment.emit(commentEdit);
          this.closeDialog();
          break;
        case DialogStatusEnum.INCLUDE:
          const inclueComment = { ...this.selectedDialogComment };

          inclueComment.comment = this.dialogForm.controls['newComment'].value;
          inclueComment.date = this.datePipe.transform(
            new Date(),
            this.dateFormat
          );
          inclueComment.userName = this.contact.name;
          inclueComment.userRole = this.rolUser.roleIdCode;
          this.sendComments.emit(inclueComment);
          this.closeDialog();
          break;
      }
    } else {
      this.dialogForm.markAllAsTouched();
      this.notificationGlobalService.showError(
        this.serviceTranslate.instant('FORMS.TOAST.ERROR_FORM_COMMENT'),
        'right',
        'top',
        7000
      );
    }
  }

  onOptioncomentClick(
    option: ComentMenuOptionsEnum,
    item: Comments,
    index: number
  ) {
    this.selectedDialogComment = item;
    this.selectedDialogIndexComment = index;
    switch (option) {
      case this.serviceTranslate.instant('FORMS.COMMENT_MENU.EDIT'):
        this.runOptionComment(
          DialogStatusEnum.EDIT,
          'FORMS.REVIEW.DIALOG.EDIT_COMMENT',
          item
        );
        break;
      case this.serviceTranslate.instant('FORMS.COMMENT_MENU.DELETE'):
        const declineComment = {
          index,
          comment: item,
        };
        this.declineComment.emit(declineComment);
        break;
      case this.serviceTranslate.instant('FORMS.COMMENT_MENU.REPLY'):
        this.runOptionComment(
          DialogStatusEnum.REPLY,
          'FORMS.REVIEW.DIALOG.REPLY_COMMENT',
          null
        );
        break;
      default: /// case de include FORMS.COMMENT_MENU.INCLUDE
        this.runOptionComment(
          DialogStatusEnum.INCLUDE,
          'FORMS.REVIEW.DIALOG.INCLUDE_COMMENT',
          item
        );
        break;
    }
  }

  runOptionComment(
    state: DialogStatusEnum,
    title: string,
    item: Comments
  ): void {
    this.dialogForm.reset();
    this.state = state;
    this.title = this.serviceTranslate.instant(title);
    if (item !== null) {
      this.dialogForm.controls['newComment'].setValue(item.comment);
    }
    this.dialogOpen();
  }

  runOptionAnswer(
    state: DialogStatusEnum,
    title: string,
    item: Comments
  ): void {
    this.dialogForm.reset();
    this.state = state;
    this.title = this.serviceTranslate.instant(title);
    if (item !== null) {
      this.dialogForm.controls['newComment'].setValue(item.reply.comment);
    }
    this.dialogOpen();
  }

  onOptionAnswerClick(
    option: ComentMenuOptionsEnum,
    item: Comments,
    index: number
  ): void {
    this.selectedDialogComment = item;
    this.selectedDialogIndexComment = index;

    switch (option) {
      case this.serviceTranslate.instant('FORMS.COMMENT_MENU.DELETE'):
        const declineAnswer: DeclineAnswer = {
          index,
          item,
        };
        this.declineAnswer.emit(declineAnswer);
        break;
      case this.serviceTranslate.instant('FORMS.COMMENT_MENU.EDIT_ANSWER'):
        this.runOptionAnswer(
          DialogStatusEnum.EDIT_ANSWER,
          'FORMS.COMMENT_MENU.EDIT_ANSWER',
          item
        );
        break;
    }
  }

  getUserData(): void {
    this.subscriptions.add(
      this.storeContact.select('contact').subscribe((data) => {
        if (data.contact) {
          this.contact = data.contact;
        }
      })
    );
  }

  public close() {
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }

  public closeDialog() {
    this.openDialog = false;
  }

  public dialogOpen() {
    this.openDialog = true;
  }

  public closed() {
    this.expandedOptions = false;
  }

  isCoordinatorOrSpecialist(rol: string): boolean {
    return (
      rol === RolEnum.External_Coordinator ||
      rol === RolEnum.External_Procurement_Specialist
    );
  }
}
