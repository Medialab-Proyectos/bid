import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@fiduciary-interface/environments/environment';
import { HttpRequestController } from '@fiduciary-interface-test';

import { CommentsService } from './comments.service';
import { CommentsDomain, ProcurementCommentRequest } from '../models';

describe('CommentsService', () => {
  let service: CommentsService;
  let httpMock: HttpRequestController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(CommentsService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  const apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getComments', () => {
    it('get comments of BIDDINGPROCESSPLAN domain', () => {
      const responseMock = 'response';
      const domain = CommentsDomain.BIDDINGPROCESSPLAN;
      const parentId = 'id';

      service.getComments(parentId, domain).subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

      const url = `${apiUrl}/api/comments?domain=${domain}&parentId=${parentId}`;
      httpMock.mockRequest(url, 'get', responseMock);
    });
  });

  describe('getComments', () => {
    it('get comments of BIDDINGPROCESSPLAN domain', () => {
      const domain = CommentsDomain.BIDDINGPROCESSPLAN;
      const parentId = 'id';
      const comments: ProcurementCommentRequest[] = [
        {
          text: 'text',
          visibility: 0,
        },
      ];
      service.postComments(parentId, domain, comments).subscribe((response) => {
        expect(response).toEqual(comments);
      });

      const url = `${apiUrl}/api/comments?domain=${domain}&parentId=${parentId}`;
      httpMock.mockRequest(url, 'post', comments);
    });
  });
});
