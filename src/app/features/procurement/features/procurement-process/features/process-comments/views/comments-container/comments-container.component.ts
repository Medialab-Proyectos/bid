import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { CommentOptions } from '../../env/commentsModule.env';
import { CommentsEventBussService } from '../../services/comments-event-buss.service';
import { ViewTabComment } from '../../enums/viewTabComment.enum';

@Component({
  selector: 'fi-comments-container',
  templateUrl: './comments-container.component.html',
})
export class CommentsContainerComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private commentsSvc: CommentsEventBussService
  ) {}

  public navLinks = [
    {
      label: 'PROCUREMENT.COMMENTS_TAB.PLAN_TAB.TITLE',
      link: './' + CommentOptions[0],
      index: 0,
      status: 'active',
    },
    {
      label: 'PROCUREMENT.COMMENTS_TAB.PROCESS_TAB.TITLE',
      link: './' + CommentOptions[1],
      index: 1,
      status: 'active',
    },
  ];

  sub: Subscription = new Subscription();

  getActualUrlOnLink() {
    let actualRouteUrl = this.commentsSvc.router.routerState.snapshot.url;
    this.commentsSvc.checkModule(actualRouteUrl);
  }

  ngOnInit(): void {
    this.getActualUrlOnLink();
    this.sub.add(
      this.router.events
        .pipe(filter((event: any) => event.type === 15))
        .subscribe(() => {
          let actualRouteUrl = this.router.url;
          this.commentsSvc.checkModule(actualRouteUrl);
        })
    );
  }

  ngOnDestroy(): void {
    this.commentsSvc.viewTab = ViewTabComment.PLAN;
    this.sub.unsubscribe();
  }
}
