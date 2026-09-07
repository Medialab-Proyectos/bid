import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ProcurementCommentViewType } from '@core/enums';
import { AddComment } from '@core/models';
import { UpdateCommentsRquest } from '@core/models/requests/procurement-comments-request.model';
import {
  PostCommentResponse,
  ProcuremenProcessCommentsResponse,
  UpdateCommentsResponse,
} from '@core/models/responses/procurement-comments-response.model';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import { CommentsDomain } from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { CommentProcurementFormGroup } from '@fiduciary-interface/app/shared/components/dialog-comments/models/commentsForm.model';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable, filter, map, take, switchMap } from 'rxjs';
import { FilterComment } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ProcurementCommentsService {
  private readonly apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  constructor(
    readonly http: HttpClient,
    private readonly biddingProcessStore: BiddingProcessPlanStoreService
  ) {}

  saveComment(
    commentDomain: CommentsDomain,
    parentId: string,
    comment: AddComment[],
    isNewComment: boolean = true
  ): Observable<PostCommentResponse> {
    const url = `${this.apiUrl}/api/comments?domain=${commentDomain}&parentId=${parentId}&isNewComment=${isNewComment}`;
    return this.http.post<PostCommentResponse>(url, comment);
  }

  updateComments(
    commentDomain: CommentsDomain,
    commentRquest: UpdateCommentsRquest
  ): Observable<UpdateCommentsResponse> {
    const url = `${this.apiUrl}/api/comments?domain=${commentDomain}`;
    return this.http.put<UpdateCommentsResponse>(url, commentRquest);
  }

  deleteComment(
    commentId: string,
    commentDomain: CommentsDomain
  ): Observable<string> {
    const url = `${this.apiUrl}/api/comments/${commentDomain}/${commentId}`;
    return this.http.delete<string>(url);
  }

  getComments(
    planId: string,
    filters: FilterComment,
    viewType: ProcurementCommentViewType
  ): Observable<any> {
    let url = `${this.apiUrl}/api/biddingProcessPlan/${planId}/comments`;
    let params = new HttpParams();
    params = params.set('viewType', viewType);
    params = this.transformFilterToQuery(params, filters);

    return this.http.get<string>(url, { params });
  }

  getCommentsByPlan(
    viewType: ProcurementCommentViewType,
    filters: FilterComment
  ): Observable<any> {
    return this.biddingProcessStore.getOrLoadBiddingProcessPlan().pipe(
      filter((data) => data.biddingPlanState.biddingProcessPlan !== null),
      map((data) => data.biddingPlanState.biddingProcessPlan.id),
      take(1),
      switchMap((procurementPlanId) =>
        this.getComments(procurementPlanId, filters, viewType)
      )
    );
  }

  getCommentsProcess(
    planId: string,
    viewType: ProcurementCommentViewType,
    pageSize: number,
    page: number,
    filters: FilterComment
  ): Observable<ProcuremenProcessCommentsResponse> {
    const url = `${this.apiUrl}/api/biddingProcessPlan/${planId}/processComments`;
    let params = new HttpParams();
    params = params.set('viewType', viewType);
    params = params.set('index', page);
    params = params.set('size', pageSize);

    params = this.transformFilterToQuery(params, filters);

    return this.http.get<ProcuremenProcessCommentsResponse>(url, {
      params,
    });
  }

  getCommentsByProcess(
    planId: string,
    commentDomain: CommentsDomain,
    viewType: ProcurementCommentViewType,
    pageSize: number,
    page: number,
    filters: FilterComment
  ): Observable<ProcuremenProcessCommentsResponse> {
    const url = `${this.apiUrl}/api/biddingProcessPlan/${planId}/ProcessComments`;
    let params = new HttpParams();
    params = params.set('domain', commentDomain);
    params = params.set('viewType', viewType);
    params = params.set('index', page);
    params = params.set('size', pageSize);
    params = this.transformFilterToQuery(params, filters);

    const data = this.http.get<ProcuremenProcessCommentsResponse>(url, {
      params,
    });

    return data;
  }

  mapPostComments(
    commentForm: FormGroup<CommentProcurementFormGroup>
  ): AddComment[] {
    return [
      {
        id:
          commentForm.controls.id.value !== '' ||
          commentForm.controls.id.value !== null
            ? commentForm.controls.id.value
            : null,
        visibility: Number(commentForm.controls.visibility.value),
        status: commentForm.controls.status.value,
        text: commentForm.controls.text.value.trim(),
      },
    ];
  }

  mapUpdateComments(
    commentForm: FormGroup<CommentProcurementFormGroup>,
    parentId: string
  ): UpdateCommentsRquest {
    const request: UpdateCommentsRquest = {
      commentsParent: [
        {
          id: parentId,
          comment: {
            id: commentForm.controls.id.value,
            visibility: Number(commentForm.controls.visibility.value),
            text: commentForm.controls.text.value.trim(),
          },
        },
      ],
    };
    return request;
  }

  mapUpdateCommentsVisibilities(
    commentForm: FormArray<FormGroup<CommentProcurementFormGroup>>,
    selected: string[],
    parentId: string,
    newVisibility: string
  ): UpdateCommentsRquest {
    const request: UpdateCommentsRquest = {
      commentsParent: [],
    };
    commentForm.controls.forEach((c) => {
      if (selected.includes(c.controls.id.value)) {
        const re = {
          id: parentId,
          comment: {
            id: c.controls.id.value,
            visibility: Number(newVisibility),
            text: c.controls.text.value.trim(),
          },
        };
        request.commentsParent.push(re);
      }
    });

    return request;
  }

  transformFilterToQuery(params: HttpParams, data: FilterComment): HttpParams {
    if (!!data.user) params = params.set('user', data.user);

    if (!!data.visibility)
      params = params.set('commentVisibility', data.visibility);
    if (!!data.dateRange.initialDate)
      params = params.set(
        'startDate',
        data.dateRange.initialDate.toISOString()
      );
    if (!!data.dateRange.endDate)
      params = params.set('endDate', data.dateRange.endDate.toISOString());

    if (!!data.processId) params = params.set('processCode', data.processId);
    if (!!data.processName)
      params = params.set('processName', data.processName);
    if (!!data.marked) params = params.set('marked', data.marked);

    return params;
  }
}
