import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalContent } from '@core/models';
import { TranslateService } from '@ngx-translate/core';
import { textRequired } from '../../../dialog-comments/services/comment-form.service';

@Component({
  selector: 'fi-dialog-with-comment',
  templateUrl: './dialog-with-comment.component.html',
})
export class DialogWithCommentComponent implements OnInit {
  _commentsForm: FormGroup;
  @Input() content: ModalContent[];

  constructor(
    private readonly translate: TranslateService,
    private fb: FormBuilder
  ) {}

  translateKey(content: ModalContent): ModalContent {
    content.text = this.translate.instant(content.key);
    return content;
  }

  ngOnInit(): void {
    this._commentsForm = this.fb.group({
      comment: ['', [Validators.required, textRequired()]],
    });

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

  get comment() {
    return this._commentsForm.controls.comment.value;
  }
}
