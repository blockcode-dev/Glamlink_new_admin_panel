/** @format */

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Card,
  message,
  Space,
  Checkbox,
  Radio,
  Row,
  Col,
  Divider,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { GenerateBusinessCard } from "../../services/Api/BusinessCardApi";
import LocationAutocomplete from "../../utils/LocationAutocomplete";
import { getAllCityByStateId, getAllState } from "../../services/Api/UserApi";

const CreateBusinessCard = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const res = await getAllState();
      setStates(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= FILE HANDLER ================= */
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const formData = new FormData();

      /* ================= SOCIAL MEDIA ================= */
      const social_media = {
        instagram: values.instagram || null,
        facebook: values.facebook || null,
        linkedin: values.linkedin || null,
        youtube: values.youtube || null,
        tiktok: values.tiktok || null,
      };
      formData.append("social_media", JSON.stringify(social_media));

      /* ================= BUSINESS HOURS ================= */
      if (values.business_hour) {
        const formattedHours = values.business_hour
          .map((h) => {
            const val = (h?.value || "").trim();
            if (!val) return null;

            if (!val.match(/\d{1,2}:\d{2}/)) {
              return { note: val };
            }

            const [dayPart, timePart] = val.split(":");
            if (!timePart) return { note: val };

            if (timePart.toLowerCase().includes("closed")) {
              return { day: dayPart.trim(), closed: true };
            }

            const [open, close] = timePart.split("-");
            return {
              day: dayPart.trim(),
              open_time: open?.trim(),
              close_time: close?.trim(),
              closed: false,
            };
          })
          .filter(Boolean);
        formData.append("business_hour", JSON.stringify(formattedHours));
      }

      /* ================= LOCATIONS ================= */
      if (values.locations) {
        const formattedLocations = values.locations.map((loc, index) => ({
          ...loc,
          sort_order: index + 1,
          is_primary: !!loc.is_primary,
        }));
        formData.append("locations", JSON.stringify(formattedLocations));
      }

      /* ================= GALLERY META ================= */
      const gallery_meta = images.map((img, index) => ({
        is_thumbnail: index === 0,
        sort_order: index + 1,
        caption: null,
      }));
      formData.append("gallery_meta", JSON.stringify(gallery_meta));

      /* ================= ARRAYS & SPECIAL FIELDS ================= */
      const cleanArray = (arr) =>
        Array.isArray(arr) ? arr.filter((i) => i && i.trim() !== "") : [];

      formData.append(
        "specialties",
        JSON.stringify(cleanArray(values.specialties)),
      );
      formData.append(
        "important_info",
        JSON.stringify(cleanArray(values.important_info)),
      );
      formData.append(
        "excites_about_glamlink",
        JSON.stringify(values.excites_about_glamlink || []),
      );
      formData.append(
        "biggest_pain_points",
        JSON.stringify(values.biggest_pain_points || []),
      );
      formData.append(
        "other_links",
        JSON.stringify((values.other_links || []).filter(Boolean)),
      );

      /* ================= BASIC FIELDS ================= */
      const basicFields = [
        "name",
        "business_name",
        "email",
        "phone",
        "professional_title",
        "bio",
        "website",
        "preferred_booking_method",
        "booking_link",
        "primary_specialty",
        "offer_promotion",
        "promotion_details",
        "elite_setup",
        "custom_handle",
      ];

      basicFields.forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      /* ================= FILES ================= */
      if (profileImage[0]?.originFileObj) {
        formData.append("profile_image", profileImage[0].originFileObj);
      }

      images.forEach((img) => {
        if (img.originFileObj) formData.append("images", img.originFileObj);
      });

      videos.forEach((vid) => {
        if (vid.originFileObj) formData.append("videos", vid.originFileObj);
      });

      /* ================= API CALL ================= */
      await GenerateBusinessCard(formData);

      message.success("Business Card Created Successfully");
      navigate("/digital-card");
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      const errorMsg =
        err?.errorFields?.[0]?.errors?.[0] || "Something went wrong";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* BASIC INFORMATION */}
        <Col xs={24} lg={12}>
          <Card
            title="Basic Information"
            variant="bordered"
            style={{ height: "100%" }}
          >
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input placeholder="Sophia Martinez" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="business_name" label="Business Name">
                  <Input placeholder="Enter business name" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="professional_title" label="Professional Title">
                  <Input placeholder="Master Hair Stylist & Colorist" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="bio" label="Professional Bio">
                  <div
                    style={{
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <CKEditor
                      editor={ClassicEditor}
                      data={form.getFieldValue("bio") || ""}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        form.setFieldsValue({ bio: data });
                      }}
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* SERVICES & BOOKING & SOCIALS */}
        <Col xs={24} lg={12}>
          <Card title="Services, Booking & Contact" variant="bordered">
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, message: "Email is required" }]}
                >
                  <Input placeholder="sophia@luxebeauty.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: "Phone is required" }]}
                >
                  <Input placeholder="123-456-7890" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="custom_handle"
                  label="Claim Your Custom Handle"
                >
                  <Input placeholder="luxebeauty" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="website" label="Website">
                  <Input placeholder="https://luxebeauty.com" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" plain style={{ margin: "12px 0" }}>
              Social Profiles
            </Divider>

            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="instagram" label="Instagram">
                  <Input placeholder="@yourusername or full URL" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="linkedin" label="LinkedIn">
                  <Input placeholder="https://linkedin.com/in/yourprofile" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="youtube" label="YouTube">
                  <Input placeholder="https://youtube.com/@yourchannel" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="facebook" label="Facebook">
                  <Input placeholder="https://facebook.com/yourpage" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="tiktok" label="TikTok">
                  <Input placeholder="@yourusername or full URL" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" plain style={{ margin: "12px 0" }}>
              Press & Booking
            </Divider>

            <Form.List name="other_links">
              {(fields, { add, remove }) => (
                <>
                  <Form.Item
                    label="Press / Articles / Other Links"
                    style={{ marginBottom: 8 }}
                  >
                    {fields.map(({ key, name }) => (
                      <div
                        key={key}
                        style={{ display: "flex", gap: 8, marginBottom: 8 }}
                      >
                        <Form.Item name={name} noStyle>
                          <Input placeholder="https://vogue.com/article/your-feature" />
                        </Form.Item>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      block
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Add Link
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="preferred_booking_method"
                  label="Preferred Booking Method"
                >
                  <Select
                    placeholder="Select booking method..."
                    options={[
                      {
                        label: "Go to Booking Link",
                        value: "Go to Booking Link",
                      },
                      { label: "Call / Text", value: "Call / Text" },
                      { label: "DM on Instagram", value: "DM on Instagram" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  shouldUpdate={(p, c) =>
                    p.preferred_booking_method !== c.preferred_booking_method
                  }
                  noStyle
                >
                  {({ getFieldValue }) =>
                    getFieldValue("preferred_booking_method") ===
                      "Go to Booking Link" && (
                      <Form.Item name="booking_link" label="Booking Link">
                        <Input placeholder="https://..." />
                      </Form.Item>
                    )
                  }
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* SPECIALTIES & INFO */}
      <Card title="Services & Specialties" style={{ marginBottom: 24 }}>
        <Form.Item
          name="primary_specialty"
          label="Primary Specialty"
          rules={[{ required: true, message: "Primary Specialty is required" }]}
        >
          <Input placeholder="e.g. Hair Styling & Color" />
        </Form.Item>

        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.List name="specialties">
              {(fields, { add, remove }) => (
                <Form.Item label="Additional Specialties">
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      style={{ display: "flex", gap: 8, marginBottom: 8 }}
                    >
                      <Form.Item name={name} noStyle>
                        <Input placeholder="e.g. Balayage, Extensions, Bridal Makeup" />
                      </Form.Item>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Specialty
                  </Button>
                </Form.Item>
              )}
            </Form.List>
          </Col>

          <Col xs={24} md={12}>
            <Form.List name="important_info">
              {(fields, { add, remove }) => (
                <Form.Item label="Important Information">
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      style={{ display: "flex", gap: 8, marginBottom: 8 }}
                    >
                      <Form.Item name={name} noStyle>
                        <Input placeholder="Enter important details" />
                      </Form.Item>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Important Info
                  </Button>
                </Form.Item>
              )}
            </Form.List>
          </Col>
        </Row>
      </Card>

      {/* GLAMLINK INTEGRATION QUESTIONS */}
      <Card title="Glamlink Integration" style={{ marginBottom: 24 }}>
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
            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12} md={6}>
                <Checkbox value="Posting but no conversions">
                  No conversions
                </Checkbox>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Checkbox value="DMs - too much back and forth">
                  Too many DMs
                </Checkbox>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Checkbox value="No shows">No shows</Checkbox>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Checkbox value="Juggling too many platforms (booking, social media, e-commerce, etc)">
                  Too many platforms
                </Checkbox>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Checkbox value="Inventory not tied to treatments">
                  Inventory management
                </Checkbox>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Checkbox value="Client notes/consents all over the place">
                  Client notes
                </Checkbox>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Checkbox value="Finding new clients">Finding clients</Checkbox>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Checkbox value="None of the above">None</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item name="offer_promotion" valuePropName="checked">
          <Checkbox>I would like to offer a promotion</Checkbox>
        </Form.Item>
        <Form.Item
          shouldUpdate={(p, c) => p.offer_promotion !== c.offer_promotion}
          noStyle
        >
          {({ getFieldValue }) =>
            getFieldValue("offer_promotion") && (
              <Form.Item
                name="promotion_details"
                label="Promotion Details"
                rules={[
                  { required: true, message: "Promotion details are required" },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter your promotion details..."
                />
              </Form.Item>
            )
          }
        </Form.Item>

        <Form.Item name="elite_setup" valuePropName="checked">
          <Checkbox>
            <strong>The Elite Setup:</strong> I agree to let Glamlink build my
            profile.
          </Checkbox>
        </Form.Item>
      </Card>

      {/* BUSINESS LOCATIONS */}
      <Card title="Business Locations" style={{ marginBottom: 24 }}>
        <Form.List name="locations">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Card
                  key={key}
                  size="small"
                  style={{ marginBottom: 16, backgroundColor: "#fafafa" }}
                  actions={[
                    <Button
                      type="link"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    >
                      Remove Location
                    </Button>,
                  ]}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <Form.Item
                      name={[name, "location_type"]}
                      label="Location Type"
                      initialValue="exact_address"
                    >
                      <Radio.Group optionType="button" buttonStyle="solid">
                        <Radio.Button value="exact_address">
                          Exact Address
                        </Radio.Button>
                        <Radio.Button value="city_only">
                          City / Area Only
                        </Radio.Button>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item name={[name, "label"]} label="Display Label">
                      <Input placeholder="e.g. Luxe Beauty Studio" />
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
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <Form.Item
                                      name={[name, "state_id"]}
                                      label="State"
                                    >
                                      <Select
                                      showSearch
                                        optionFilterProp="label"
                                        size="large"
                                        placeholder="Search State"
                                        onChange={async (stateId) => {
                                          const res =
                                            await getAllCityByStateId(stateId);
                                          setCities(
                                            res?.data?.data?.all_city || [],
                                          );
                                          const selectedState = states.find(
                                            (s) => s.id === stateId,
                                          );
                                          form.setFieldValue(
                                            ["locations", name, "state"],
                                            selectedState?.name,
                                          );
                                        }}
                                        options={states.map((state) => ({
                                          label: state.name,
                                          value: state.id,
                                        }))}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      name={[name, "city"]}
                                      label="City"
                                    >
                                      <Select
                                        showSearch
                                        optionFilterProp="label"
                                        size="large"
                                        placeholder="Search City"
                                        options={cities.map((city) => ({
                                          label: city.name,
                                          value: city.name,
                                        }))}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>

                                <Form.Item
                                  name={[name, "address"]}
                                  label="Exact Address"
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
                icon={<PlusOutlined />}
              >
                Add Business Location
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      {/* BUSINESS HOURS */}
      <Card title="Business Hours" style={{ marginBottom: 24 }}>
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
                    rules={[{ required: true, message: "Field is required" }]}
                  >
                    <Input placeholder="e.g. Mon-Fri: 10:00 - 19:00 OR By Appointment Only" />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="dashed"
                style={{ color: "#ff4d8d", borderColor: "#ff4d8d" }}
                onClick={() => add()}
                icon={<PlusOutlined />}
              >
                Add Hours
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      {/* MEDIA MEDIA */}
      <Card title="Media Assets" style={{ marginBottom: 32 }}>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <Form.Item label="Profile Image">
              <Upload
                listType="picture-card"
                fileList={profileImage}
                customRequest={handleUpload(setProfileImage)}
                onRemove={() => setProfileImage([])}
                maxCount={1}
              >
                {profileImage.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>

          <Col xs={24} md={16}>
            <Form.Item label="Gallery Images">
              <Upload
                listType="picture-card"
                fileList={images}
                customRequest={handleUpload(setImages)}
                multiple
                onRemove={(file) =>
                  setImages(images.filter((i) => i.uid !== file.uid))
                }
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Videos">
              <Upload
                fileList={videos}
                customRequest={handleUpload(setVideos)}
                multiple
                showUploadList={false}
              >
                <Button icon={<PlusOutlined />}>Select Video File</Button>
              </Upload>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                {videos.map((video) => (
                  <Card
                    key={video.uid}
                    size="small"
                    cover={
                      <video
                        width="100%"
                        height="120"
                        controls
                        src={video.url}
                        style={{ objectFit: "cover" }}
                      />
                    }
                    style={{ width: 200 }}
                    actions={[
                      <Button
                        type="link"
                        danger
                        size="small"
                        onClick={() =>
                          setVideos(videos.filter((v) => v.uid !== video.uid))
                        }
                      >
                        Remove Video
                      </Button>,
                    ]}
                  />
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* CTA BUTTON */}
      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        onClick={handleSubmit}
        style={{
          marginBottom: 60,
          height: 50,
          background: "#23b8cb",
          borderColor: "#23b8cb",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        Create Business Card
      </Button>
    </Form>
  );
};

export default CreateBusinessCard;
