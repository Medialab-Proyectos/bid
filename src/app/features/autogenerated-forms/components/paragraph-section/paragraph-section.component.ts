import { Component, Input } from '@angular/core';
import { ParagraphData, ParagraphTypeEnum } from '../../models';

@Component({
  selector: 'fi-paragraph-section',
  templateUrl: './paragraph-section.component.html',
  styleUrls: ['./paragraph-section.component.scss'],
})
export class ParagraphSectionComponent {
  numberOp = 'No. IDB-2229-07/24';

  paragraphTypeEnums = ParagraphTypeEnum

  @Input() texts: ParagraphData[] = [
    {
      key: 'Este llamado de licictacion se emite en seguimiento de Aviso General de Adquisiciones que para este Proyecto fuese publicado en el sitio de internet',

    },
    {
      key: this.numberOp,

    },
    {
      key: 'GPN.FORM.SECTION_1.PARAGRAPH_2',

    },
    {
      key: 'GPN.FORM.SECTION_1.PARAGRAPH_3',

    },
  ];
}
