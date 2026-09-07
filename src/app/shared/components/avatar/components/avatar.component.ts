import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppStateWithContact } from '@core/store';
import { Subscription } from 'rxjs';
@Component({
  selector: 'fi-avatar',
  templateUrl: './avatar.component.html',
})
export class AvatarComponent implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();

  @Input() userNameInitials: string;

  loggedUser: string;

  constructor(readonly store: Store<AppStateWithContact>) {}

  ngOnInit(): void {
    this.userNameInitials = this.userNameInitials?.match(/\b(\w)/g).join('');
    this.getUserName();
  }

  getUserName(): void {
    this.subscription.add(
      this.store.select('contact').subscribe((res) => {
        this.loggedUser =
          res.contact.given_name.charAt(0) + res.contact.family_name.charAt(0);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
