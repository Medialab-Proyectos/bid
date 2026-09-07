import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { VisibilityService } from '@core/services/view';
import { BreadcrumbService } from 'xng-breadcrumb';

@Component({
  selector: 'fi-eoi',
  templateUrl: './eoi.component.html',
  styleUrls: ['./eoi.component.scss'],
})
export class EoiComponent implements OnInit {
  isAddingAmendment: boolean;
  editingAmendment: boolean;
  documentTitle: string;

  private visibilityService = inject(VisibilityService);
  private breadcrumbService = inject(BreadcrumbService);
  private router = inject(Router);

  ngOnInit(): void {
    this.visibilityService.setVisiblityProcessHeader(false);
    this.breadcrumbService.set('@eoi', 'DOCUMENT_NAME.EOI');
    const url = this.router.url;
    this.isAddingAmendment = url.endsWith('register-amendment');
    this.editingAmendment = url.endsWith('update-amendment');
    this.documentTitle =
      'DOCUMENT_NAME.EOI' +
      (this.isAddingAmendment
        ? '.ADD_AMENDMENT'
        : this.editingAmendment
        ? '.EDIT_AMENDMENT'
        : '');
  }
}
