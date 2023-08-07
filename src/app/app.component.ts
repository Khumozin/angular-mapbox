import { AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxChange } from '@angular/material/checkbox';
import * as figlet from 'figlet';
import { LngLatLike } from 'mapbox-gl';
import { debounceTime, distinctUntilChanged, fromEvent, map, switchMap } from 'rxjs';

import { AppService, City, Feature } from './app.service';
import { standard } from './fonts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('searchCtrl') searchCtrl!: ElementRef<HTMLInputElement>;
  @ViewChild('suburb') suburb!: ElementRef<HTMLInputElement>;
  @ViewChild('postalCode') postalCode!: ElementRef<HTMLInputElement>;

  #appService = inject(AppService);
  #destroyRef = inject(DestroyRef);

  addresses: Feature[] = [];
  cities: City[] = [];
  center: LngLatLike | undefined;
  showMap = false;

  ngAfterViewInit(): void {
    figlet.parseFont('Standard', standard);

    figlet('v1.0.0', 'Standard', function (err, text) {
      if (err) {
        console.log('something went wrong...');
        return;
      }
      console.clear();
      console.log(text);
    });

    this.onSearch();
  }

  onSelectAddress(id: string): void {
    const selectedAddress = this.addresses.find((a) => a.id === id);

    this.center = selectedAddress?.center;
    this.postalCode.nativeElement.value = '';

    this.suburb.nativeElement.value = selectedAddress?.context.find(
      (ctx) => ctx.id.includes('locality') || ctx.id.includes('place')
    )?.text as string;

    this.#appService
      .searchCity(this.suburb.nativeElement.value.toUpperCase())
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (cities) => (this.cities = cities),
        error: (e) => console.log(e),
      });
  }

  onSelectUserCity(city: City): void {
    this.postalCode.nativeElement.value = city.streetCode;
  }

  displayFn(address: Feature): string {
    let street = address.place_name;

    address.context.forEach((ctx) => {
      street = street.replace(ctx.text, '');

      street = street.replace(',', '');

      street = street.trim();
    });

    return street;
  }

  onShowMap(matCheck: MatCheckboxChange): void {
    this.showMap = matCheck.checked;
  }

  onSearch(): void {
    fromEvent(this.searchCtrl.nativeElement, 'keyup')
      .pipe(
        map((e) => {
          return (e.target as HTMLInputElement).value;
        }),
        debounceTime(750),
        distinctUntilChanged(),
        switchMap((query) => this.#appService.searchMapBox(query)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: ({ features }) => {
          this.addresses = features;
        },
        error: (e) => console.log(e),
      });
  }
}
