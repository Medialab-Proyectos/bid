import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-spn-preview',
  templateUrl: './spn-preview.component.html',
  styleUrls: ['./spn-preview.component.scss'],
})
export class SpnPreviewComponent implements OnInit, OnDestroy {
  sub: Subscription = new Subscription();

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
