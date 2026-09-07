import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ProcurementCommentTypeEnum } from '@core/enums';
import { Enumerator } from '@core/models';
import { CommentsEventBussService } from '../services/comments-event-buss.service';

@Component({
  selector: 'fi-procurement-comments-group-by-process-detail',
  templateUrl: './procurement-comments-group-by-process-detail.component.html',
})
export class ProcurementCommentsGroupByProcessDetailComponent
  implements OnInit, OnDestroy
{
  @Input() data;
  @Input() commentVisibilitiesEnum: Enumerator[];
  @Input() userEmail: string;
  @Input() processIndex: number;
  @Input() parentId: string;
  @Input() form;
  @Input() selectedProcess: string[] = [];
  @Input() processCode: string = '';
  @Output() checkMarked: EventEmitter<boolean> = new EventEmitter<boolean>();

  commentType = ProcurementCommentTypeEnum.PROCESS_DETAIL;
  constructor(private commentsSvc: CommentsEventBussService) {}

  ngOnInit(): void {
    this.commentsSvc.commenType = ProcurementCommentTypeEnum.PROCESS_DETAIL;
  }
  ngOnDestroy(): void {
    this.commentsSvc.commenType = null;
  }
  checkMark(event: boolean): void {
    this.checkMarked.emit(event);
  }
}
