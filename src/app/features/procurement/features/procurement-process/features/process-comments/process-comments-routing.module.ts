import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanContainerComponent } from './views/plan-container/plan-container.component';
import { ProcessContainerComponent } from './views/process-container/process-container.component';
import { CommentsContainerComponent } from './views/comments-container/comments-container.component';
import { ProcessCommentsViewComponent } from './views/process-comments-view/process-comments-view.component';
import { CommentOptions, CommentRoute } from './env/commentsModule.env';
import { PlanCommentsActiveViewComponent } from './views/plan-comments-active-view/plan-comments-active-view.component';
import { PlanCommentsHistoricViewComponent } from './views/plan-comments-historic-view/plan-comments-historic-view.component';
import { ProcessCommentsGroupByProcessComponent } from './views/process-comments-group-by-process/process-comments-group-by-process.component';

const routes: Routes = [
  {
    path: '',
    component: CommentsContainerComponent,
    children: [
      {
        path: CommentOptions[0],
        component: PlanContainerComponent,
        children: [
          {
            path: 'active',
            component: PlanCommentsActiveViewComponent,
          },
          {
            path: 'historic',
            component: PlanCommentsHistoricViewComponent,
          },
          { path: '', pathMatch: 'full', redirectTo: 'active' },
        ],
      },
      {
        path: CommentOptions[1],
        component: ProcessContainerComponent,
        children: [
          {
            path: 'active',
            component: ProcessCommentsViewComponent,
            data: {
              commentTypeUrl: CommentRoute[1],
            },
          },
          {
            path: 'historic',
            component: ProcessCommentsViewComponent,
            data: {
              commentTypeUrl: CommentRoute[2],
            },
          },
          {
            path: 'groupByProcess',
            component: ProcessCommentsGroupByProcessComponent,
          },
          { path: '', pathMatch: 'full', redirectTo: 'active' },
        ],
      },
      { path: '', pathMatch: 'full', redirectTo: 'plan' },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessCommentsRoutingModule {}
