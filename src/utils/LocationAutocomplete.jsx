import React, { useEffect, useRef } from "react";
import { Input } from "antd";

const LocationAutocomplete = ({
  form,
  locationIndex,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!window.google?.maps?.places) return;
    if (!inputRef.current?.input) return;

    const autocomplete =
      new window.google.maps.places.Autocomplete(
        inputRef.current.input
      );

    autocomplete.addListener(
      "place_changed",
      () => {
        const place =
          autocomplete.getPlace();

        if (!place.geometry) return;

        const city =
          place.address_components?.find(
            (c) =>
              c.types.includes(
                "locality"
              )
          )?.long_name || "";

        const state =
          place.address_components?.find(
            (c) =>
              c.types.includes(
                "administrative_area_level_1"
              )
          )?.short_name || "";

        form.setFieldValue(
          [
            "locations",
            locationIndex,
            "address",
          ],
          place.formatted_address
        );

        form.setFieldValue(
          [
            "locations",
            locationIndex,
            "city",
          ],
          city
        );

        form.setFieldValue(
          [
            "locations",
            locationIndex,
            "state",
          ],
          state
        );

        form.setFieldValue(
          [
            "locations",
            locationIndex,
            "latitude",
          ],
          place.geometry.location.lat()
        );

        form.setFieldValue(
          [
            "locations",
            locationIndex,
            "longitude",
          ],
          place.geometry.location.lng()
        );
      }
    );
  }, [form, locationIndex]);

  return (
   <Input
  ref={inputRef}
  value={
    form.getFieldValue([
      "locations",
      locationIndex,
      "address",
    ]) || ""
  }
  onChange={(e) => {
    form.setFieldValue(
      [
        "locations",
        locationIndex,
        "address",
      ],
      e.target.value
    );
  }}
  placeholder="Search address"
/>
  );
};

export default LocationAutocomplete;