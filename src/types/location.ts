export interface State {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

/** getAllCityByStateId wraps the cities of one state. */
export interface StateCities {
  all_city: City[];
}
