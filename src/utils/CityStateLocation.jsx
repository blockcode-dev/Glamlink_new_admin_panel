import React, { useEffect, useState } from "react";
import { Form, Select, Input } from "antd";

import LocationAutocomplete from "./LocationAutocomplete";
import { getAllCityByStateId,getAllState } from "../services/Api/UserApi";

const CityStateLocation = ({ form, locationIndex }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  /* ================= STATES ================= */
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const res = await getAllState();

      setStates(
        res?.data?.data ||
          res?.data ||
          []
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= STATE CHANGE ================= */
  const handleStateChange = async (stateId) => {
    try {
      form.setFieldValue(
        ["locations", locationIndex, "city"],
        null
      );

      const res = await getAllCityByStateId(stateId);

      setCities(
        res?.data?.all_city ||
          res?.data?.data?.all_city ||
          []
      );

      const selectedState = states.find(
        (s) => s.id === stateId
      );

      form.setFieldValue(
        ["locations", locationIndex, "state"],
        selectedState?.name || ""
      );

      form.setFieldValue(
        ["locations", locationIndex, "state_id"],
        stateId
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= CITY CHANGE ================= */
  const handleCityChange = (cityName) => {
    form.setFieldValue(
      ["locations", locationIndex, "city"],
      cityName
    );
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <Form.Item
          label="State"
          name={[
            locationIndex,
            "state_id",
          ]}
          style={{ flex: 1 }}
        >
          <Select
            placeholder="Select State"
            onChange={handleStateChange}
            options={states.map((state) => ({
              label: state.name,
              value: state.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="City"
          name={[
            locationIndex,
            "city",
          ]}
          style={{ flex: 1 }}
        >
          <Select
            placeholder="Select City"
            onChange={handleCityChange}
            options={cities.map((city) => ({
              label: city.name,
              value: city.name,
            }))}
          />
        </Form.Item>
      </div>

      <Form.Item
        label="Address"
        name={[
          locationIndex,
          "address",
        ]}
      >
        <LocationAutocomplete
          form={form}
          locationIndex={locationIndex}
        />
      </Form.Item>

      <Form.Item
        hidden
        name={[
          locationIndex,
          "latitude",
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        hidden
        name={[
          locationIndex,
          "longitude",
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        hidden
        name={[
          locationIndex,
          "state",
        ]}
      >
        <Input />
      </Form.Item>
    </>
  );
};

export default CityStateLocation;