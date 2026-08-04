export const parseGooglePlace = (place) => {
  const addressComponents = place.address_components || [];

  const city =
    addressComponents.find((c) =>
      c.types.includes("locality")
    )?.long_name || "";

  const state =
    addressComponents.find((c) =>
      c.types.includes("administrative_area_level_1")
    )?.short_name || "";

  return {
    address: place.formatted_address,
    city,
    state,
    latitude: place.geometry.location.lat(),
    longitude: place.geometry.location.lng(),
  };
};