/** @format */

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Switch,
  Card,
  message,
  Space,
  Checkbox,
  Radio,
  Typography,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Box } from "@material-ui/core";
import {
  UpdateBusinessCard,
  GetBusinessCardById,
} from "../../services/Api/BusinessCardApi";
import LocationAutocomplete from "../../utils/LocationAutocomplete";
import { getAllState, getAllCityByStateId } from "../../services/Api/UserApi";

const { Title, Paragraph } = Typography;

const STATE_CODE_MAP = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const safeParse = (val) => {
  try {
    if (!val) return [];
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return [];
  }
};

const EditBusinessCard = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [profileImage, setProfileImage] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [citiesByLocation, setCitiesByLocation] = useState({});
  const [states, setStates] = useState([]);

  const loadStates = async () => {
    try {
      const res = await getAllState();
      setStates(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (states.length) {
      fetchData();
    }
  }, [states, id]);

  const mapExcites = (arr = []) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
      if (item.includes("Discover"))
        return "Clients ability to discover pros nearby and check out their services, work, reviews, etc";
      if (item.includes("Seamless"))
        return "Seamless booking inside Glamlink either in app or goes directly to your booking link";
      if (item.includes("E-commerce")) return "Pro shops & e-commerce";
      return item;
    });
  };

  const bookingMethodLabel = {
    GO_TO_BOOKING_LINK: "Go to Booking Link",
    CALL_TEXT: "Call / Text",
    DM_INSTAGRAM: "DM on Instagram",
  };

  const mapPainPoints = (arr = []) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
      if (item.includes("No-shows")) return "No shows";
      if (item.includes("Too many platforms"))
        return "Juggling too many platforms (booking, social media, e-commerce, etc)";
      if (item.includes("Low conversion")) return "Posting but no conversions";
      return item;
    });
  };

  const fetchData = async () => {
    try {
      const res = await GetBusinessCardById(id);
      const data = res.data?.data;
      const cityMap = {};

      const locations = await Promise.all(
        (data.locations || []).map(async (loc, index) => {
          const stateName = STATE_CODE_MAP[loc.state] || loc.state;
          const stateObj = states.find((s) => s.name === stateName);

          if (stateObj?.id) {
            try {
              const cityRes = await getAllCityByStateId(stateObj.id);
              cityMap[index] = cityRes?.data?.data?.all_city || [];
            } catch (err) {
              console.log(err);
            }
          }

          return {
            ...loc,
            state_id: stateObj?.id,
          };
        }),
      );

      setCitiesByLocation(cityMap);
      const social = safeParse(data.social_media);
      const bookingMethodMap = {
        Go_to_Booking_Link: "GO_TO_BOOKING_LINK",
        Call_Text: "CALL_TEXT",
        DM_Instagram: "DM_INSTAGRAM",
      };

      form.setFieldsValue({
        ...data,
        preferred_booking_method:
          bookingMethodMap[data.preferred_booking_method] ||
          data.preferred_booking_method,
        excites_about_glamlink: mapExcites(
          safeParse(data.excites_about_glamlink),
        ),
        other_links: safeParse(data.other_links),
        biggest_pain_points: mapPainPoints(safeParse(data.biggest_pain_points)),
        important_info: safeParse(data.important_info),
        specialties: safeParse(data.specialties),
        instagram: social?.instagram || "",
        tiktok: social?.tiktok || "",
        linkedin: social?.linkedin || "",
        youtube: social?.youtube || "",
        facebook: social?.facebook || "",
        locations,
        business_hour:
          data.business_hour?.map((h) => {
            if (h.note) return { value: h.note };
            if (h.is_closed) return { value: `${h.day}: Closed` };
            return { value: `${h.day}: ${h.open_time} - ${h.close_time}` };
          }) || [],
      });

      if (data.profile_image) {
        setProfileImage([
          { uid: "-1", url: data.profile_image, status: "done" },
        ]);
      }

      if (data.images?.length) {
        const imgs = [];
        const vids = [];
        data.images.forEach((m) => {
          const fileObj = {
            uid: m.id,
            url: m.file_uri,
            status: "done",
            is_thumbnail: m.is_thumbnail,
          };
          if (m.file_type === "image") {
            imgs.push(fileObj);
          } else {
            vids.push({ ...fileObj, thumbUrl: m.thumbnail_uri });
          }
        });
        setImages(imgs);
        setVideos(vids);
      }
    } catch (error) {
      message.error("Failed to load business card data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpload =
    (setter) =>
    ({ file, onSuccess }) => {
      const newFile = {
        uid: file.uid,
        url: URL.createObjectURL(file),
        status: "done",
        originFileObj: file,
      };
      setter((prev) => [...prev, newFile]);
      onSuccess("ok");
    };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const formData = new FormData();

      const social_media = {
        instagram: values.instagram || null,
        tiktok: values.tiktok || null,
        linkedin: values.linkedin || null,
        youtube: values.youtube || null,
        facebook: values.facebook || null,
      };
      formData.append("social_media", JSON.stringify(social_media));

      if (values.business_hour) {
        const formattedHours = values.business_hour.map((h) => {
          const val = h.value?.trim();
          if (!val) return { note: "" };
          if (val.startsWith("Availability")) return { note: val };

          const match = val.match(/^(.+?)[,:]\s*(.+?)\s*-\s*(.+)$/);
          if (!match) return { note: val };

          return {
            day: match[1].trim(),
            open_time: match[2].trim(),
            close_time: match[3].trim(),
            closed: false,
          };
        });
        formData.append("business_hour", JSON.stringify(formattedHours));
      }

      formData.append("specialties", JSON.stringify(values.specialties || []));
      formData.append(
        "important_info",
        JSON.stringify(values.important_info || []),
      );
      formData.append(
        "excites_about_glamlink",
        JSON.stringify(values.excites_about_glamlink || []),
      );
      formData.append(
        "biggest_pain_points",
        JSON.stringify(values.biggest_pain_points || []),
      );
      formData.append("locations", JSON.stringify(values.locations || []));
      formData.append("other_links", JSON.stringify(values.other_links || []));

      const existingImageIds = images
        .filter((img) => !img.originFileObj)
        .map((img) => img.uid);
      formData.append("existing_image_ids", JSON.stringify(existingImageIds));

      const existingVideoIds = videos
        .filter((v) => !v.originFileObj)
        .map((v) => v.uid);
      formData.append("existing_video_ids", JSON.stringify(existingVideoIds));

      const gallery_meta = images.map((img, idx) => ({
        is_thumbnail: img.is_thumbnail || false,
        sort_order: idx + 1,
      }));
      formData.append("gallery_meta", JSON.stringify(gallery_meta));

      if (profileImage[0]?.originFileObj) {
        formData.append("profile_image", profileImage[0].originFileObj);
      }

      images.forEach((i) => {
        if (i.originFileObj) formData.append("images", i.originFileObj);
      });

      videos.forEach((v) => {
        if (v.originFileObj) formData.append("videos", v.originFileObj);
      });

      const basicFields = [
        "name",
        "business_name",
        "professional_title",
        "bio",
        "email",
        "phone",
        "website",
        "custom_handle",
        "preferred_booking_method",
        "booking_link",
        "primary_specialty",
        "offer_promotion",
        "promotion_details",
        "elite_setup",
      ];

      basicFields.forEach((key) => {
        if (values[key] !== undefined) {
          formData.append(key, values[key] ?? "");
        }
      });

      await UpdateBusinessCard(id, formData);
      message.success("Business Card Updated Successfully");
      navigate("/digital-card");
    } catch (error) {
      console.error(error);
      message.error("Failed to update business card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ padding: "4px" }}>
      {/* Brand Aligned Header Panel */}
      <Box marginBottom="24px">
        <h3 className="page-title" style={{ margin: 0, fontWeight: 700 }}>
          Digital Business Cards
        </h3>
        <p
          className="page-sub-title"
          style={{ margin: "4px 0 0 0", color: "#666" }}
        >
          Modify and configure professional details for this digital business
          profile card workspace.
        </p>
      </Box>

      <Form form={form} layout="vertical">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <Card
            title="Basic Info"
            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <Form.Item name="name" label="Name">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>
            <Form.Item name="business_name" label="Business Name">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>
            <Form.Item name="professional_title" label="Title">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>
            <Form.Item name="bio" label="Bio">
              <CKEditor
                editor={ClassicEditor}
                data={form.getFieldValue("bio") || ""}
                onChange={(event, editor) => {
                  form.setFieldValue("bio", editor.getData());
                }}
              />
            </Form.Item>
          </Card>

          <Card
            title="Contact & Social"
            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <Form.Item name="email" label="Email">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>
            <Form.Item name="website" label="Website">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>
            <Form.Item name="instagram" label="Instagram">
              <Input
                placeholder="https://instagram.com/..."
                style={{ borderRadius: "6px", height: "40px" }}
              />
            </Form.Item>
            <Form.Item name="linkedin" label="LinkedIn">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>

            <Form.Item name="youtube" label="YouTube">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>

            <Form.Item name="facebook" label="Facebook">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>
            <Form.Item name="tiktok" label="TikTok">
              <Input
                placeholder="https://tiktok.com/..."
                style={{ borderRadius: "6px", height: "40px" }}
              />
            </Form.Item>
            <Form.List name="other_links">
              {(fields, { add, remove }) => (
                <>
                  <label
                    style={{
                      fontWeight: 500,
                      display: "block",
                      marginBottom: 10,
                    }}
                  >
                    Press / Articles / Other Links
                  </label>

                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <Form.Item
                        name={name}
                        style={{
                          flex: 1,
                          marginBottom: 0,
                        }}
                      >
                        <Input
                          placeholder="https://..."
                          style={{ borderRadius: "6px", height: "40px" }}
                        />
                      </Form.Item>

                      <Button
                        danger
                        onClick={() => remove(name)}
                        style={{ height: "40px" }}
                      >
                        X
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="dashed"
                    block
                    onClick={() => add()}
                    style={{ borderRadius: "6px", height: "40px" }}
                  >
                    + Add Link
                  </Button>
                </>
              )}
            </Form.List>
            <Form.Item
              name="preferred_booking_method"
              label="Preferred Booking Method"
              style={{ marginTop: "24px" }}
            >
              <Select
                style={{ height: "40px" }}
                options={[
                  {
                    label: "Go to Booking Link",
                    value: "GO_TO_BOOKING_LINK",
                  },
                  {
                    label: "Call / Text",
                    value: "CALL_TEXT",
                  },
                  {
                    label: "DM on Instagram",
                    value: "DM_INSTAGRAM",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              shouldUpdate={(p, c) =>
                p.preferred_booking_method !== c.preferred_booking_method
              }
              noStyle
            >
              {({ getFieldValue }) =>
                getFieldValue("preferred_booking_method") ===
                  "GO_TO_BOOKING_LINK" && (
                  <Form.Item name="booking_link" label="Booking Link">
                    <Input style={{ borderRadius: "6px", height: "40px" }} />
                  </Form.Item>
                )
              }
            </Form.Item>
            <Form.Item name="custom_handle" label="Handle">
              <Input style={{ borderRadius: "6px", height: "40px" }} />
            </Form.Item>
          </Card>
        </div>

        <Card
          title="Specialties & Info"
          style={{
            marginBottom: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Form.Item name="primary_specialty" label="Primary Specialty">
            <Input style={{ borderRadius: "6px", height: "40px" }} />
          </Form.Item>
          <Form.List name="specialties">
            {(fields, { add, remove }) => (
              <>
                <label
                  style={{ fontWeight: 500, display: "block", marginBottom: 8 }}
                >
                  Specialties
                </label>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                      gap: 10,
                    }}
                  >
                    <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                      <Input
                        placeholder="Enter specialty"
                        style={{ borderRadius: "6px", height: "40px" }}
                      />
                    </Form.Item>
                    <Button
                      danger
                      onClick={() => remove(name)}
                      style={{ height: "40px" }}
                    >
                      X
                    </Button>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  style={{ borderRadius: "6px", height: "40px", marginTop: 4 }}
                >
                  + Add Specialty
                </Button>
              </>
            )}
          </Form.List>

          <Form.List name="important_info">
            {(fields, { add, remove }) => (
              <>
                <label
                  style={{
                    fontWeight: 500,
                    marginTop: 24,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Important Information
                </label>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                      gap: 10,
                    }}
                  >
                    <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                      <Input
                        placeholder="Enter info"
                        style={{ borderRadius: "6px", height: "40px" }}
                      />
                    </Form.Item>
                    <Button
                      danger
                      onClick={() => remove(name)}
                      style={{ height: "40px" }}
                    >
                      X
                    </Button>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  style={{ borderRadius: "6px", height: "40px", marginTop: 4 }}
                >
                  + Add Important Info
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card
          title="Glamlink Integration"
          style={{
            marginBottom: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Form.Item
            name="excites_about_glamlink"
            label="What excites you about Glamlink?"
          >
            <Checkbox.Group style={{ width: "100%" }}>
              <Space direction="vertical">
                <Checkbox value="Clients ability to discover pros nearby and check out their services, work, reviews, etc">
                  Discovery Nearby
                </Checkbox>
                <Checkbox value="Seamless booking inside Glamlink either in app or goes directly to your booking link">
                  Seamless Booking
                </Checkbox>
                <Checkbox value="Pro shops & e-commerce">
                  Pro shops & e-commerce
                </Checkbox>
                <Checkbox value="The Glamlink Edit magazine & spotlights">
                  Magazine & Spotlights
                </Checkbox>
                <Checkbox value="AI powered discovery & smart recommendations (coming soon)">
                  AI Discovery
                </Checkbox>
                <Checkbox value="Community & networking with other pros">
                  Community
                </Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="biggest_pain_points" label="Biggest pain points">
            <Checkbox.Group style={{ width: "100%" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Checkbox value="Posting but no conversions">
                  No conversions
                </Checkbox>
                <Checkbox value="DMs - too much back and forth">
                  Too many DMs
                </Checkbox>
                <Checkbox value="No shows">No shows</Checkbox>
                <Checkbox value="Juggling too many platforms (booking, social media, e-commerce, etc)">
                  Too many platforms
                </Checkbox>
                <Checkbox value="Inventory not tied to treatments">
                  Inventory management
                </Checkbox>
                <Checkbox value="Client notes/consents all over the place the place">
                  Disorganized notes
                </Checkbox>
                <Checkbox value="Finding new clients">Finding clients</Checkbox>
                <Checkbox value="None of the above">None</Checkbox>
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            name="offer_promotion"
            valuePropName="checked"
            style={{ marginTop: "24px" }}
          >
            <Checkbox>I would like to offer a promotion</Checkbox>
          </Form.Item>
          <Form.Item
            shouldUpdate={(p, c) => p.offer_promotion !== c.offer_promotion}
            noStyle
          >
            {({ getFieldValue }) =>
              getFieldValue("offer_promotion") && (
                <Form.Item name="promotion_details" label="Promotion Details">
                  <Input.TextArea
                    placeholder="Enter details..."
                    rows={4}
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item name="elite_setup" valuePropName="checked">
            <Checkbox>
              <strong>The Elite Setup</strong>: Let the team build my profile.
            </Checkbox>
          </Form.Item>
        </Card>

        <Card
          title="Locations"
          style={{
            marginBottom: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Form.List name="locations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{
                      marginBottom: 16,
                      background: "#fafafa",
                      borderRadius: 6,
                    }}
                    title={`Location Profile #${name + 1}`}
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="middle"
                    >
                      <Form.Item
                        name={[name, "location_type"]}
                        label="Type"
                        initialValue="exact_address"
                        style={{ marginBottom: 4 }}
                      >
                        <Radio.Group>
                          <Radio value="exact_address">Exact Address</Radio>
                          <Radio value="city_only">City Only</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item
                        name={[name, "label"]}
                        label="Display Label"
                        style={{ marginBottom: 4 }}
                      >
                        <Input
                          style={{ borderRadius: "6px", height: "40px" }}
                        />
                      </Form.Item>
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          const locationType = getFieldValue([
                            "locations",
                            name,
                            "location_type",
                          ]);

                          return (
                            <>
                              {locationType === "exact_address" && (
                                <>
                                  <Form.Item
                                    name={[name, "address"]}
                                    label="Address"
                                    style={{ marginBottom: 4 }}
                                  >
                                    <LocationAutocomplete
                                      form={form}
                                      locationIndex={name}
                                    />
                                  </Form.Item>

                                  <Form.Item name={[name, "latitude"]} hidden>
                                    <Input />
                                  </Form.Item>

                                  <Form.Item name={[name, "longitude"]} hidden>
                                    <Input />
                                  </Form.Item>

                                  <Form.Item name={[name, "city"]} hidden>
                                    <Input />
                                  </Form.Item>

                                  <Form.Item name={[name, "state"]} hidden>
                                    <Input />
                                  </Form.Item>
                                </>
                              )}

                              {locationType === "city_only" && (
                                <>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 16,
                                      padding: "16px",
                                      background: "#f8fafc",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: 8,
                                      marginBottom: 12,
                                    }}
                                  >
                                    <Form.Item
                                      name={[name, "state_id"]}
                                      label="State"
                                      style={{ flex: 1, marginBottom: 4 }}
                                    >
                                      <Select
                                        showSearch
                                        placeholder="Search State"
                                        placeholder="Search State"
                                        style={{ height: "40px" }}
                                        placeholder="Select State"
                                        onChange={async (stateId) => {
                                          const res =
                                            await getAllCityByStateId(stateId);
                                          const cities =
                                            res?.data?.data?.all_city || [];

                                          setCitiesByLocation((prev) => ({
                                            ...prev,
                                            [name]: cities,
                                          }));

                                          const selectedState = states.find(
                                            (s) => s.id === stateId,
                                          );
                                          form.setFieldValue(
                                            ["locations", name, "state"],
                                            selectedState?.name,
                                          );
                                          form.setFieldValue(
                                            ["locations", name, "city"],
                                            undefined,
                                          );
                                        }}
                                        options={states.map((state) => ({
                                          label: state.name,
                                          value: state.id,
                                        }))}
                                      />
                                    </Form.Item>

                                    <Form.Item
                                      name={[name, "city"]}
                                      label="City"
                                      style={{ flex: 1, marginBottom: 4 }}
                                    >
                                      <Select
                                        showSearch
                                        style={{ height: "40px" }}
                                        placeholder="Select City"
                                        options={(
                                          citiesByLocation[name] || []
                                        ).map((city) => ({
                                          label: city.name,
                                          value: city.name,
                                        }))}
                                      />
                                    </Form.Item>
                                  </div>

                                  <Form.Item
                                    name={[name, "address"]}
                                    label="Address"
                                    style={{ marginBottom: 4 }}
                                  >
                                    <LocationAutocomplete
                                      form={form}
                                      locationIndex={name}
                                    />
                                  </Form.Item>

                                  <Form.Item name={[name, "latitude"]} hidden>
                                    <Input />
                                  </Form.Item>

                                  <Form.Item name={[name, "longitude"]} hidden>
                                    <Input />
                                  </Form.Item>

                                  <Form.Item name={[name, "state"]} hidden>
                                    <Input />
                                  </Form.Item>
                                </>
                              )}
                            </>
                          );
                        }}
                      </Form.Item>
                      <Button
                        danger
                        outlined
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        style={{ marginTop: 8 }}
                      >
                        Remove Location
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      location_type: "exact_address",
                      is_primary: fields.length === 0,
                    })
                  }
                  block
                  style={{ borderRadius: "6px", height: "40px" }}
                >
                  + Add Location
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card
          title="Business Hours"
          style={{
            marginBottom: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Form.List name="business_hour">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Form.Item
                      name={[name, "value"]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input
                        placeholder="e.g. Mon: 10am - 7pm"
                        style={{ borderRadius: "6px", height: "40px" }}
                      />
                    </Form.Item>
                    <Button
                      type="link"
                      danger
                      onClick={() => remove(name)}
                      style={{ height: "40px" }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="primary"
                  style={{
                    background: "#ff4d8d",
                    border: "none",
                    borderRadius: "6px",
                    height: "38px",
                    marginTop: 4,
                  }}
                  onClick={() => add()}
                >
                  + Add Hours
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card
          title="Media Layout"
          style={{
            marginBottom: 32,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Form.Item label="Profile Image">
            <Upload
              listType="picture-card"
              fileList={profileImage}
              customRequest={handleUpload(setProfileImage)}
              onRemove={() => setProfileImage([])}
            >
              {profileImage.length < 1 && <PlusOutlined />}
            </Upload>
          </Form.Item>
          <Form.Item label="Images Gallery">
            <Upload
              listType="picture-card"
              fileList={images}
              customRequest={handleUpload(setImages)}
              multiple
              onRemove={(file) =>
                setImages(images.filter((i) => i.uid !== file.uid))
              }
            >
              <PlusOutlined />
            </Upload>
          </Form.Item>

          <Form.Item label="Production Videos">
            <Upload
              fileList={videos}
              customRequest={handleUpload(setVideos)}
              multiple
              showUploadList={false}
            >
              <Button
                icon={<PlusOutlined />}
                style={{ borderRadius: "6px", height: "40px" }}
              >
                Upload Video Material
              </Button>
            </Upload>

            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              {videos.map((video) => (
                <div
                  key={video.uid}
                  style={{
                    width: 220,
                    background: "#f9f9f9",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #eee",
                  }}
                >
                  <video
                    width="204"
                    height="130"
                    controls
                    style={{ borderRadius: 4, background: "#000" }}
                  >
                    <source src={video.url} type="video/mp4" />
                  </video>

                  <Button
                    danger
                    size="small"
                    block
                    style={{ marginTop: 8, borderRadius: 4 }}
                    onClick={() =>
                      setVideos(videos.filter((v) => v.uid !== video.uid))
                    }
                  >
                    Remove Video
                  </Button>
                </div>
              ))}
            </div>
          </Form.Item>
        </Card>

        {/* Primary Action Call */}
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleSubmit}
          icon={<SaveOutlined />}
          style={{
            marginTop: 20,
            marginBottom: 40,
            height: "48px",
            borderRadius: "6px",
            background: "#23b8cb",
            borderColor: "#23b8cb",
            fontWeight: 600,
            fontSize: "15px",
          }}
        >
          Update Business Card
        </Button>
      </Form>
    </Box>
  );
};

export default EditBusinessCard;
