import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { VisibilityService } from '@core/services/view';
import { filter, map, Observable, startWith } from 'rxjs';
import { SpnService } from '../../services/bussiness/spn.service';

@Component({
  selector: 'fi-spn',
  templateUrl: './spn.component.html',
  styleUrls: ['./spn.component.scss'],
})
export class SpnComponent implements OnInit {
  private visibilityService = inject(VisibilityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  currentRoute$: Observable<string>;
  spnSvc = inject(SpnService);

  ngOnInit(): void {
    this.visibilityService.setVisiblityProjectHeader(false);
    this.visibilityService.setVisiblityProcessHeader(false);
    this.visibilityService.setVisibilityPackagesScreen(false);
    this.currentRoute$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url),
      startWith(this.router.url) // Seguro usar aquí
    );
    this.redirectIfNeeded(this.router.url);

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => this.redirectIfNeeded(event.urlAfterRedirects));
  }

  private redirectIfNeeded(url: string): void {
    if (url.endsWith('/register') || url.endsWith('/spn')) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }
}
