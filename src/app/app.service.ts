import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LngLatLike } from 'mapbox-gl';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const DEFAULT_COUNTRY_CODE = 'ZA';

export interface MapBoxResponse {
  type: string;
  query: string[];
  features: Feature[];
  attribution: string;
}

export interface Feature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: Properties;
  text: string;
  place_name: string;
  center: LngLatLike;
  geometry: Geometry;
  address: string;
  context: Context[];
}

export interface Properties {
  accuracy: string;
  mapbox_id: string;
  'override:postcode'?: string;
}

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface Context {
  id: string;
  mapbox_id: string;
  text: string;
  wikidata?: string;
  short_code?: string;
}

export interface City {
  cityCode: string;
  countryCode: string;
  languageCode: string;
  cityName: string;
  citySort: string;
  cityExt: string;
  provinceCode: string;
  streetCode: string;
  boxCode: string;
  dateCreated: Date;
  dateModified: Date;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  readonly #MAP_BOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

  readonly #http = inject(HttpClient);

  searchCity(cityName: string): Observable<City[]> {
    const URL =
      '/api/';

    let params = new HttpParams().set('cityName', cityName);

    return this.#http.get<City[]>(`${URL}City/search`, { params });
  }

  searchMapBox(query: string): Observable<MapBoxResponse> {
    return this.#http.get<MapBoxResponse>(
      `${this.#MAP_BOX_URL}${query}.json?types=address&access_token=${
        environment.mapbox.accessToken
      }&country=${DEFAULT_COUNTRY_CODE}`
    );
  }
}
