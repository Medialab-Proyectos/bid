import { Component, Input, OnInit } from '@angular/core';
import { ModalContent } from '@core/models/modal.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fiduciary-interface-dialog-request',
  templateUrl: './dialog-request.component.html',
})
export class DialogRequestComponent implements OnInit {
  constructor(private readonly translate: TranslateService) {}
  @Input() content: ModalContent[];

  translateKey(content: ModalContent): ModalContent {
    content.text = this.translate.instant(content.key);
    return content;
  }

  ngOnInit(): void {
    this.content.forEach((el) => {
      this.translateKey(el);
      const list = document.getElementById('list');
      if (el.bold) {
        list.innerHTML += ` <span class="sf700">${el.text}</span> `;
      } else {
        list.innerHTML += ` <span>${el.text}</span> `;
      }
    });
  }
}
