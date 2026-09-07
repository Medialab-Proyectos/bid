import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorResponse } from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import {
  CommentsDomain,
  ProcurementCommentGetResponse,
  ProcurementCommentRequest,
} from '../models';
@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  constructor(readonly http: HttpClient) {}

  /**
   *
   * @param parentId Id of the entity to which the comments belong. Example: BiddingProcessDocumentPackagId
   * @param domain Enum: CommentDomain. Domain to which the comments belong.
   * @returns Comments of the respective entity
   */
  getComments(
    parentId: string,
    domain: CommentsDomain
  ): Observable<ProcurementCommentGetResponse | ErrorResponse> {
    const url = `${this.apiUrl}/api/comments?domain=${domain}&parentId=${parentId}`;
    return this.http.get<ProcurementCommentGetResponse>(url);
  }

  /**
   *
   * @param parentId Id of the entity to which the comments belong. Example: BiddingProcessDocumentPackagId
   * @param domain Enum: CommentDomain. Domain to which the comments belong.
   * @param comments
   * @returns The id of the comment created
   */
  postComments(
    parentId: string,
    domain: CommentsDomain,
    comments: ProcurementCommentRequest[]
  ): Observable<string | ErrorResponse> {
    const url = `${this.apiUrl}/api/comments?domain=${domain}&parentId=${parentId}`;
    return this.http.post<string>(url, comments);
  }
}
