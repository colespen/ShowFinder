export const userDataInitial = {
  dateRange: {
    maxDate: "",
    minDate: "",
  },
  lat: 0,
  lng: 0,
  currentAddress: {
    address: {},
    boundingbox: [],
    display_name: "",
    importance: 0,
    lat: "",
    licence: "",
    lon: "",
    osm_id: "",
    osm_type: "",
    place_id: "",
  },
  newCity: "",
};

export const transitionInitial: {
  opacity: number;
  type: string;
} = {
  opacity: 1,
  type: "initial",
};

export const centerInitial: [number, number] = [
  47.51983881388099, 19.032783326057594,
];

export const centerStateInitial: { lat: number; lng: number } = {
  lat: 47.51983881388099,
  lng: 19.032783326057594,
};
