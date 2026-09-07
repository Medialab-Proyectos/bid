import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'fi-beneficiary-detail',
  templateUrl: './beneficiary-detail.component.html',
})
export class BeneficiaryDetailComponent implements OnInit {
  @Input() detail: any;
  @Input() id: number;
  @Input() sectionKey: string;

  sectionKeys: string[];
  sectionLiterals: string[] = [];
  sectionTitle: string;

  ngOnInit(): void {
    this.getLiterals();
  }

  getLiterals(): void {
    this.sectionTitle = `ANT_TRANSACTION.BENEFICIARY.${this.sectionKey.toUpperCase()}.TH`;
    this.sectionKeys = Object.keys(this.detail);
    this.sectionKeys.forEach((name) => {
      this.sectionLiterals.push(
        `ANT_TRANSACTION.BENEFICIARY.${this.sectionKey.toUpperCase()}.${name.toUpperCase()}`
      );
    });
  }
}
