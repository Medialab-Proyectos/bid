import { Component, Input, OnInit } from '@angular/core';
import { UBOBidderResponse } from '@core/models/responses/ubo-response.model';

@Component({
  selector: 'fi-ubo-modal-status',
  templateUrl: './ubo-modal-status.component.html',
  styleUrls: [],
})
export class UboModalStatusComponent implements OnInit {
  @Input() bidders: UBOBidderResponse[];
  @Input() selectedLang: string;

  constructor() {}
  ngOnInit(): void {}

  getCellClasses(index: number): string[] {
    return index === 0
      ? ['border-0', 'pt-0', 'pb-3', 'px-3']
      : ['px-3', 'py-3'];
  }
}
