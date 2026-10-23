import React, { useEffect, useRef } from "react";
import { Input, type FormInstance, type InputRef } from "antd";
import { loadGoogleMaps } from "./googleMaps";

interface LocationAutocompleteProps {
  form: FormInstance;
  locationIndex: number;
}

const LocationAutocomplete = ({
  form,
  locationIndex,
}: LocationAutocompleteProps) => {
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    const input = inputRef.current?.input;
    if (!input) return;

    let autocomplete: google.maps.places.Autocomplete | undefined;
    let cancelled = false;
    const field = (name: string) => ["locations", locationIndex, name];

    loadGoogleMaps()
      .then(() => {
        if (cancelled) return;
        const places = new window.google.maps.places.Autocomplete(input);
        autocomplete = places;

        places.addListener("place_changed", () => {
          const place = places.getPlace();

          const location = place.geometry?.location;
          if (!location) return;

          const city =
            place.address_components?.find((c) => c.types.includes("locality"))?.long_name || "";

          const state =
            place.address_components?.find((c) => c.types.includes("administrative_area_level_1"))
              ?.short_name || "";

          form.setFieldValue(field("address"), place.formatted_address);
          form.setFieldValue(field("city"), city);
          form.setFieldValue(field("state"), state);
          form.setFieldValue(field("latitude"), location.lat());
          form.setFieldValue(field("longitude"), location.lng());
        });
      })
      .catch((error: unknown) => console.error("Address search is unavailable:", error));

    return () => {
      cancelled = true;
      if (autocomplete) window.google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [form, locationIndex]);

  return (
    <Input
      ref={inputRef}
      value={form.getFieldValue(["locations", locationIndex, "address"]) || ""}
      onChange={(e) => {
        form.setFieldValue(["locations", locationIndex, "address"], e.target.value);
      }}
      placeholder="Search address"
    />
  );
};

export default LocationAutocomplete;
