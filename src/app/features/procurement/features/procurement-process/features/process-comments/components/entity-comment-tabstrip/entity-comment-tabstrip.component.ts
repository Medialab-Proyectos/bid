import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommentsEventBussService } from '../../services/comments-event-buss.service';
import { ProcurementDraftCommentsComponent } from '../procurement-process-draft-comments/procurement-process-draft-comments.component';

@Component({
  selector: 'fi-entity-comment-tabstrip',
  templateUrl: './entity-comment-tabstrip.component.html',
  providers: [ProcurementDraftCommentsComponent],
})
export class EntityCommentTabstripComponent implements OnInit {
  @ViewChildren('draftComments')
  comments: QueryList<ProcurementDraftCommentsComponent>;
  showOptions: boolean;
  constructor(
    readonly commentsSvc: CommentsEventBussService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    let actualRouteUrl = this.commentsSvc.router.routerState.snapshot.url;
    this.commentsSvc.checkModule(actualRouteUrl);
    this.commentsSvc.groupedTab$.subscribe((data) => {
      this.showOptions = !data;
    });
  }

  newFunction() {
    const comments: NodeListOf<HTMLElement> =
      this.el.nativeElement.querySelectorAll('fi-process-draft-comments');

    comments.forEach((comment: HTMLElement) => {
      this.recursiveComponentSearch(comment);
    });
  }

  private recursiveComponentSearch(element: HTMLElement) {
    element.childNodes.forEach((child: Node) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        this.recursiveComponentSearch(child as HTMLElement);
      }
    });
  }

  public navLinks = [
    {
      label: 'PROCUREMENT.COMMENTS_TAB.ACTIVE_TAB',
      link: './active',
      index: 0,
      status: 'active',
    },
    {
      label: 'PROCUREMENT.COMMENTS_TAB.HISTORIC_TAB',
      link: './historic',
      index: 1,
      status: 'active',
    },
  ];
}
