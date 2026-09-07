import { HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpRequestController {
  constructor(private readonly httpMock: HttpTestingController) {}

  mockRequest(url: string, method: string, response: unknown, error = null) {
    const req = this.httpMock.expectOne(url);
    expect(req.request.method).toBe(method.toUpperCase());

    if (error) {
      req.flush(response, error);
    } else {
      req.flush(response);
    }
  }

  verify(): void {
    this.httpMock.verify();
  }
}
