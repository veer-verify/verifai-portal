import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

export interface Country {
  name: string;
  isoCode: string;
  flag: string;
  phonecode: string;
  currency: string;
  latitude: string;
  longitude: string;
  timezones: Timezone[];
}

export interface Timezone {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

export interface State {
  name: string;
  isoCode: string;
  countryCode: string;
  latitude: string | null;
  longitude: string | null;
}

export interface City {
  name: string;
  countryCode: string;
  stateCode: string;
  latitude: string;
  longitude: string;
}

type CityTuple = [string, string, string, string, string];

@Injectable({ providedIn: 'root' })
export class LocationDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'assets/location-data';

  private readonly countries$ = this.http
    .get<Country[]>(`${this.baseUrl}/country.json`)
    .pipe(shareReplay(1));

  private readonly states$ = this.http
    .get<State[]>(`${this.baseUrl}/state.json`)
    .pipe(shareReplay(1));

  private readonly cities$ = this.http
    .get<CityTuple[]>(`${this.baseUrl}/city.json`)
    .pipe(
      map((cities) =>
        cities.map(([name, countryCode, stateCode, latitude, longitude]) => ({
          name,
          countryCode,
          stateCode,
          latitude,
          longitude,
        })),
      ),
      shareReplay(1),
    );

  getAllCountries(): Observable<Country[]> {
    return this.countries$;
  }

  getStatesOfCountry(countryCode: string): Observable<State[]> {
    return this.states$.pipe(
      map((states) => states.filter((state) => state.countryCode === countryCode)),
    );
  }

  getCitiesOfState(countryCode: string, stateCode: string): Observable<City[]> {
    return this.cities$.pipe(
      map((cities) =>
        cities.filter(
          (city) =>
            city.countryCode === countryCode && city.stateCode === stateCode,
        ),
      ),
    );
  }
}
