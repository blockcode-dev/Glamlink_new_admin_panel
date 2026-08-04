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
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { GenerateBusinessCard } from "../../services/Api/BusinessCardApi";
import LocationAutocomplete from "../../utils/LocationAutocomplete";
import { getAllCityByStateId, getAllState } from "../../services/Api/UserApi";
import { GetSpecialities } from "../../services/Api/SpecialitiesApi";
import ImageCropModal from "../../components/ImageCropModal";

/* =========================================================
   Scoped CSS for the media upload boxes.
   AntD's own picture-card list already gives us a native
   delete (trash) icon on hover — we just need the box size
   and image fit to be correct. Covers both old and new AntD
   classnames (ant-upload-list-item-thumbnail / -image) so it
   works regardless of exact antd version.
   ========================================================= */
const mediaUploadCSS = `
  .gl-profile-upload .ant-upload.ant-upload-select,
  .gl-profile-upload .ant-upload-list-picture-card-container {
    width: 104px !important;
    height: 104px !important;
  }

  .gl-gallery-upload .ant-upload.ant-upload-select,
  .gl-gallery-upload .ant-upload-list-picture-card-container {
    width: 160px !important;
    height: 90px !important;
  }

  .gl-video-thumb-upload .ant-upload.ant-upload-select,
  .gl-video-thumb-upload .ant-upload-list-picture-card-container {
    width: 100% !important;
    height: 120px !important;
  }

  .gl-profile-upload .ant-upload-list-item-thumbnail,
  .gl-profile-upload .ant-upload-list-item-image,
  .gl-gallery-upload .ant-upload-list-item-thumbnail,
  .gl-gallery-upload .ant-upload-list-item-image,
  .gl-video-thumb-upload .ant-upload-list-item-thumbnail,
  .gl-video-thumb-upload .ant-upload-list-item-image {
    width: 100% !important;
    height: 100% !important;
  }

  .gl-profile-upload .ant-upload-list-item-thumbnail img,
  .gl-profile-upload .ant-upload-list-item-image img,
  .gl-gallery-upload .ant-upload-list-item-thumbnail img,
  .gl-gallery-upload .ant-upload-list-item-image img,
  .gl-video-thumb-upload .ant-upload-list-item-thumbnail img,
  .gl-video-thumb-upload .ant-upload-list-item-image img {
    object-fit: cover !important;
    width: 100% !important;
    height: 100% !important;
  }
`;

const CreateBusinessCard = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [specialtyOptions, setSpecialtyOptions] = useState([]);

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const res = await GetSpecialities(localStorage.getItem("adminToken"), {
        page: 1,
        limit: 1000,
        sortBy: "asc",
      });

      const data = res?.data?.rows || [];

      setSpecialtyOptions(
        data.map((item) => ({
          label: item.title,
          value: item.title,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };

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

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const formData = new FormData();

      /* ================= SOCIAL MEDIA ================= */
      const social_media = {
        facebook: values.facebook || null,
        linkedin: values.linkedin || null,
        youtube: values.youtube || null,
        tiktok: values.tiktok || null,
      };

      (values.instagram_links || []).forEach((link, index) => {
        if (!link?.trim()) return;

        social_media[index === 0 ? "instagram" : `instagram${index}`] =
          link.trim();
      });
      formData.append("social_media", JSON.stringify(social_media));

      /* ================= BUSINESS HOURS ================= */
      const formattedHours = (values.business_hour || [])
        .map((h) => {
          const val = (h?.value || "").trim();

          if (!val) return null;

          return {
            note: val,
          };
        })
        .filter(Boolean);

      if (formattedHours.length === 0) {
        formData.append(
          "business_hour",
          JSON.stringify([
            {
              note: "Appointment on request",
            },
          ]),
        );
      } else {
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
      const otherLinks = (values.other_links || []).filter((item) =>
        item?.url?.trim(),
      );

      formData.append("other_links", JSON.stringify(otherLinks));

      const bookingLink =
        values.booking_link?.trim() || values.website?.trim() || "";

      /* ================= BASIC FIELDS ================= */
      const basicFields = [
        "name",
        "business_name",
        "email",
        "phone",
        "professional_title",
        "bio",
        "website",
        "is_phone_visible",
        // "booking_link",
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

      formData.append("is_phone_visible", values.is_phone_visible !== false);

      formData.append(
        "preferred_booking_method",
        JSON.stringify(values.preferred_booking_method || []),
      );

      if (bookingLink) {
        formData.append("booking_link", bookingLink);
      }

      /* ================= FILES ================= */
      if (profileImage[0]?.originFileObj) {
        formData.append("profile_image", profileImage[0].originFileObj);
      }

      images.forEach((img) => {
        if (img.originFileObj) formData.append("images", img.originFileObj);
      });

      for (const item of videos) {
        if (!item.video) {
          message.error("Video is missing.");
          setLoading(false);
          return;
        }

        if (!item.thumbnail) {
          message.error("Please upload a thumbnail for every video.");
          setLoading(false);
          return;
        }
      }

      videos.forEach((item) => {
        formData.append("videos", item.video.originFileObj);

        formData.append("video_thumbnails", item.thumbnail.originFileObj);
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
      <style>{mediaUploadCSS}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3 className="page-title" style={{ margin: 0, fontWeight: 700 }}>
            Create Access Card
          </h3>
          <p
            className="page-sub-title"
            style={{ margin: "4px 0 0 0", color: "#666" }}
          >
            Create your GlamLink Access Card and share your profile, services,
            booking options, locations, and social links in one place.
          </p>
        </div>

        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/digital-card")}
          >
            Back
          </Button>
        </div>
      </div>
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
                  // rules={[{ required: true, message: "Phone is required" }]}
                >
                  <Input placeholder="123-456-7890" />
                </Form.Item>
                <Form.Item
                  name="is_phone_visible"
                  valuePropName="checked"
                  initialValue={true}
                  style={{ marginTop: -8 }}
                >
                  <Checkbox>
                    Display phone number publicly on my Access Card
                  </Checkbox>
                </Form.Item>
              </Col>
              {/* <Col xs={24}>
                <Form.Item
                  name="custom_handle"
                  label="Claim Your Custom Handle"
                >
                  <Input placeholder="luxebeauty" />
                </Form.Item>
              </Col> */}
              <Col xs={24}>
                <Form.Item name="website" label="Website">
                  <Input
                    placeholder="https://luxebeauty.com"
                    onChange={(e) => {
                      if (
                        (
                          form.getFieldValue("preferred_booking_method") || []
                        ).includes("GO_TO_BOOKING_LINK")
                      ) {
                        form.setFieldValue("booking_link", e.target.value);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" plain style={{ margin: "12px 0" }}>
              Social Profiles
            </Divider>

            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.List name="instagram_links">
                  {(fields, { add, remove }) => (
                    <Form.Item label="Instagram Profiles">
                      {fields.map(({ key, name }) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Form.Item name={name} noStyle>
                            <Input placeholder="https://instagram.com/username" />
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
                        icon={<PlusOutlined />}
                        onClick={() => add()}
                      >
                        Add Instagram Profile
                      </Button>
                    </Form.Item>
                  )}
                </Form.List>
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
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Form.Item name={[name, "title"]} noStyle>
                          <Input
                            placeholder="Link Title"
                            style={{ width: "180px" }}
                          />
                        </Form.Item>

                        <Form.Item name={[name, "url"]} noStyle>
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
                      onClick={() =>
                        add({
                          title: "",
                          url: "",
                        })
                      }
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
                  label="Ways To Connect"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select booking methods..."
                    onChange={(values) => {
                      if (values.includes("GO_TO_BOOKING_LINK")) {
                        form.setFieldValue(
                          "booking_link",
                          form.getFieldValue("website") || "",
                        );
                      }
                    }}
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
              </Col>
              <Col xs={24}>
                <Form.Item
                  shouldUpdate={(p, c) =>
                    p.preferred_booking_method !== c.preferred_booking_method
                  }
                  noStyle
                >
                  {({ getFieldValue }) =>
                    (getFieldValue("preferred_booking_method") || []).includes(
                      "GO_TO_BOOKING_LINK",
                    ) && (
                      <Form.Item name="booking_link" label="Booking Link">
                        <Input
                          placeholder="https://..."
                          value={form.getFieldValue("website")}
                        />
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
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Additional Specialties" name="specialties">
              <Select
                mode="tags"
                placeholder="Select or type specialties"
                options={specialtyOptions}
                allowClear
                showSearch
                tokenSeparators={[","]}
              />
            </Form.Item>
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

      {/* MEDIA ASSETS */}
      <Card title="Media Assets" style={{ marginBottom: 32 }}>
        <Row gutter={[24, 16]}>
          {/* ---- PROFILE IMAGE ---- */}
          <Col xs={24} md={8}>
            <Form.Item label="Profile Image">
              <div className="gl-profile-upload">
                <ImageCropModal
                  fileList={profileImage}
                  setFileList={setProfileImage}
                  aspect={1}
                  maxCount={1}
                  accept=".jpg,.jpeg,.png,.webp"
                  listType="picture-card"
                  uploadText="Upload"
                />
              </div>
            </Form.Item>
          </Col>

          {/* ---- GALLERY IMAGES ---- */}
          <Col xs={24} md={16}>
            <Form.Item label="Gallery Images">
              <div className="gl-gallery-upload">
                <ImageCropModal
                  aspect={16 / 9}
                  fileList={images}
                  setFileList={setImages}
                  multiple
                  maxCount={20}
                  accept=".jpg,.jpeg,.png,.webp"
                  uploadText="Upload"
                />
              </div>
            </Form.Item>
          </Col>

          {/* ---- VIDEOS ---- */}
          <Col span={24}>
            <Form.Item label="Videos">
              <Upload
                accept=".mp4"
                showUploadList={false}
                multiple
                customRequest={({ file, onSuccess }) => {
                  setVideos((prev) => [
                    ...prev,
                    {
                      uid: file.uid,
                      video: {
                        originFileObj: file,
                        url: URL.createObjectURL(file),
                      },
                      thumbnail: null,
                    },
                  ]);

                  onSuccess("ok");
                }}
              >
                <Button icon={<PlusOutlined />}>Select Video File</Button>
              </Upload>

              <div
                style={{
                  marginTop: 12,
                  marginBottom: 18,
                  padding: "12px 16px",
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 8,
                  color: "#389e0d",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <strong>Video Requirements</strong>
                <br />• Upload only <strong>.mp4</strong> videos.
                <br />• Video duration must be{" "}
                <strong>less than 60 seconds</strong>.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                {videos.map((item, index) => (
                  <Card
                    key={item.uid}
                    size="small"
                    style={{ width: 260 }}
                    cover={
                      <video
                        width="100%"
                        height="120"
                        controls
                        src={item.video?.url}
                      />
                    }
                  >
                    <div
                      className="gl-video-thumb-upload"
                      style={{ marginBottom: 12 }}
                    >
                      <ImageCropModal
                        aspect={16 / 9}
                        fileList={item.thumbnail ? [item.thumbnail] : []}
                        setFileList={(files) => {
                          setVideos((prev) =>
                            prev.map((video, i) =>
                              i === index
                                ? {
                                    ...video,
                                    thumbnail: files[0] || null,
                                  }
                                : video,
                            ),
                          );
                        }}
                        maxCount={1}
                        uploadText="Thumbnail"
                      />
                    </div>

                    <Button
                      danger
                      block
                      onClick={() =>
                        setVideos(videos.filter((v) => v.uid !== item.uid))
                      }
                    >
                      Remove Video
                    </Button>
                  </Card>
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
