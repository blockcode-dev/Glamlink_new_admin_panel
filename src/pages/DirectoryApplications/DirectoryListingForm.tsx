import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  message,
  type FormRule,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Panel } from "../../components/PageHeader";
import {
  CreateDirectoryListing,
  GetListingSpecialties,
  UpdateDirectoryListing,
} from "../../services/Api/DirectoryApplicationsApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import type { DirectoryApplication } from "../../types/directoryApplication";
import {
  BOOKING_METHODS,
  BUSINESS_HOUR_PRESETS,
  EXCITES_OPTIONS,
  LOCATION_TYPES,
  PAIN_POINT_OPTIONS,
  SOCIAL_PLATFORMS,
  blankLocation,
  changedFields,
  fieldsOf,
  hasPhotoChanges,
  photoChangesOf,
  toFormValues,
  type ListingFormValues,
  type LocationFields,
} from "./listing";
import { GalleryField, MAX_PHOTOS, ProfilePhotoField } from "./ListingPhotos";
import styles from "./DirectoryApplications.module.scss";

const MAX_LOCATIONS = 10;

// Where the API's refusals land on this form, when it names the field differently.
const FIELD_NAMES: Record<string, string> = {
  images: "gallery",
  gallery_meta: "gallery",
  remove_photos: "gallery",
  createAccessCard: "wants_access_card",
};

// The API's checks, so most mistakes show before saving.
const phoneRule: FormRule = {
  validator: async (_, value?: string) => {
    if (value?.trim() && value.replace(/\D/g, "").length < 7) throw new Error("Enter a valid phone number (7 digits or more)");
  },
};
const atMost = (max: number): FormRule => ({ max, message: `At most ${max} characters` });

const options = (values: string[]) => values.map((value) => ({ value, label: value }));

const Heading = ({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) => (
  <>
    <h4 className={styles.sectionTitle}>{children}</h4>
    {hint && <p className={styles.sectionHint}>{hint}</p>}
  </>
);

interface DirectoryListingFormProps {
  /** The listing to edit; without it, the form adds one. */
  listing?: DirectoryApplication;
  /** Saved: the listing as the API answered it. */
  onSaved: (listing: DirectoryApplication) => void;
  onCancel: () => void;
}

/**
 * Adds or edits a directory listing: the website form's fields, its photos and, for a new listing, its status and
 * account type. An edit sends only what changed; photos go with it as multipart.
 */
const DirectoryListingForm = ({ listing, onSaved, onCancel }: DirectoryListingFormProps) => {
  const [form] = Form.useForm<ListingFormValues>();
  const initial = useMemo(() => toFormValues(listing), [listing]);
  const [saving, setSaving] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const status = Form.useWatch("status", form) ?? initial.status;
  const locations: LocationFields[] = Form.useWatch("locations", form) ?? initial.locations;
  const editing = listing !== undefined;

  // The specialties the website's form offers; any other can be typed.
  useEffect(() => {
    let current = true;
    GetListingSpecialties()
      .then((res) => {
        if (current) setSpecialties([...new Set(res.data.data.rows.map((row) => row.title).filter(Boolean))]);
      })
      .catch((err) => console.error("Couldn't load the specialties:", err));
    return () => {
      current = false;
    };
  }, []);

  const save = async () => {
    // Every value the form holds, the saved objects' other keys too (onFinish only has the fields shown).
    const values: ListingFormValues = form.getFieldsValue(true);
    const fields = changedFields(fieldsOf(values), fieldsOf(editing ? initial : toFormValues()));
    const photos = photoChangesOf(values, listing?.gallery ?? null);
    if (editing && !Object.keys(fields).length && !hasPhotoChanges(photos)) {
      message.info("Nothing has changed");
      return;
    }
    setSaving(true);
    try {
      const res = editing
        ? await UpdateDirectoryListing(listing.id, fields, photos)
        : await CreateDirectoryListing(
            {
              ...fields,
              name: values.name.trim(),
              email: values.email.trim(),
              status: values.status,
              ...(values.status === "approved" ? { professional_type: values.professional_type } : {}),
            },
            photos,
          );
      onSaved(res.data.data);
    } catch (err) {
      message.error(showFieldError(form, err, FIELD_NAMES) ?? (apiErrorMessage(err) || "Couldn't save the listing"));
    } finally {
      setSaving(false);
    }
  };

  // From the form's store, not the watched copy, so nothing just typed is lost.
  const storedLocations = (): LocationFields[] => form.getFieldValue("locations") ?? [];

  const makeMain = (index: number) =>
    form.setFieldValue(
      "locations",
      storedLocations().map((l, i) => ({ ...l, is_primary: i === index })),
    );

  const removeLocation = (index: number, remove: (index: number) => void) => {
    const wasMain = storedLocations()[index]?.is_primary;
    remove(index);
    const rest = storedLocations();
    if (wasMain && rest.length) form.setFieldValue("locations", rest.map((l, i) => ({ ...l, is_primary: i === 0 })));
  };

  return (
    <Form<ListingFormValues>
      form={form}
      layout="vertical"
      initialValues={initial}
      onFinish={save}
      onFinishFailed={() => message.error("Check the highlighted fields")}
      scrollToFirstError
    >
      {listing?.status === "approved" && (
        <Alert
          className={styles.notice}
          type="info"
          showIcon
          title="This listing is live: what you save shows on the website at once."
        />
      )}

      <Panel>
        <Heading>Profile</Heading>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, whitespace: true, message: "Enter the name" }, atMost(100)]}
            >
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="professional_title" label="Professional title" rules={[atMost(100)]}>
              <Input maxLength={100} placeholder="Makeup Artist" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              extra={
                listing?.user_id
                  ? "The listing stays linked to its account: changing the email here doesn't change the account or how they sign in."
                  : "Approval finds or makes the account for this email."
              }
              rules={[
                { required: true, whitespace: true, message: "Enter the email" },
                { type: "email", message: "Enter a valid email" },
                atMost(200),
              ]}
            >
              <Input maxLength={200} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="phone" label="Phone" rules={[phoneRule, atMost(30)]}>
              <Input maxLength={30} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="custom_handle" label="Handle" rules={[atMost(60)]}>
              <Input maxLength={60} placeholder="@katesue" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="website" label="Website" rules={[atMost(500)]}>
              <Input maxLength={500} placeholder="https://" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="bio" label="Bio" extra="Plain text, as the website's form takes it." rules={[atMost(2000)]}>
              <Input.TextArea rows={5} maxLength={2000} showCount />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="profile_image" label="Profile photo">
          <ProfilePhotoField current={listing?.profile_image ?? null} />
        </Form.Item>
      </Panel>

      <Panel>
        <Heading>Specialties and booking</Heading>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="primary_specialty" label="Primary specialty" rules={[atMost(100)]}>
              <Input maxLength={100} placeholder="Makeup" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="specialties" label="Specialties">
              <Select mode="tags" maxCount={20} options={options(specialties)} placeholder="Pick or type" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="preferred_booking_method" label="Booking method" rules={[atMost(60)]}>
              <AutoComplete options={options(BOOKING_METHODS)} placeholder="Pick or type" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="booking_link" label="Booking link" rules={[atMost(500)]}>
              <Input maxLength={500} placeholder="https://" />
            </Form.Item>
          </Col>
        </Row>
      </Panel>

      <Panel>
        <Heading hint="The main location's business, city and state are the listing's: the directory finds it there, and a brand goes by that business's name.">
          Locations and hours
        </Heading>
        <Form.List name="locations">
          {(items, { add, remove }, { errors }) => (
            <>
              {items.map(({ key, name }) => (
                <div key={key} className={styles.locationCard}>
                  <div className={styles.locationHeader}>
                    <span>
                      Location {name + 1} {locations[name]?.is_primary && <Tag color="blue">Main</Tag>}
                    </span>
                    <Space>
                      {!locations[name]?.is_primary && (
                        <Button size="small" onClick={() => makeMain(name)}>
                          Make main
                        </Button>
                      )}
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={`Remove location ${name + 1}`}
                        onClick={() => removeLocation(name, remove)}
                      />
                    </Space>
                  </div>
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item name={[name, "label"]} label="Label">
                        <Input placeholder="Luxe Beauty Studio - Las Vegas" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name={[name, "location_type"]} label="Type">
                        <Radio.Group options={LOCATION_TYPES} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name={[name, "business_name"]} label="Business name" rules={[atMost(150)]}>
                        <Input maxLength={150} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name={[name, "phone"]} label="Business phone">
                        <Input maxLength={30} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name={[name, "address"]}
                        label="Address"
                        extra="The website shows it for an exact address only."
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name={[name, "city"]} label="City" rules={[atMost(100)]}>
                        <Input maxLength={100} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name={[name, "state"]} label="State" rules={[atMost(50)]}>
                        <Input maxLength={50} placeholder="NV" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name={[name, "description"]} label="Notes">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button
                icon={<PlusOutlined />}
                onClick={() => add(blankLocation(items.length === 0))}
                disabled={items.length >= MAX_LOCATIONS}
                style={{ marginTop: items.length ? 12 : 0 }}
              >
                Add location
              </Button>
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
        <Form.Item name="business_hours" label="Business hours" style={{ marginTop: 16 }}>
          <Select mode="tags" maxCount={20} options={options(BUSINESS_HOUR_PRESETS)} placeholder="Pick or type a line" />
        </Form.Item>
      </Panel>

      <Panel>
        <Heading>Social media and offer</Heading>
        <Row gutter={16}>
          {SOCIAL_PLATFORMS.map(({ key, label }) => (
            <Col xs={24} md={12} key={key}>
              <Form.Item name={["social_media", key]} label={label}>
                <Input maxLength={500} placeholder="https://" />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Form.Item name="offer_promotion" label="Runs an offer" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={18}>
            <Form.Item name="promotion_details" label="Offer details" rules={[atMost(500)]}>
              <Input maxLength={500} placeholder="20% off the first booking" />
            </Form.Item>
          </Col>
        </Row>
      </Panel>

      <Panel>
        <Heading hint={`Up to ${MAX_PHOTOS} photos. They're uploaded when you save.`}>Gallery</Heading>
        <Form.Item name="gallery">
          <GalleryField saved={listing?.gallery ?? null} />
        </Form.Item>
      </Panel>

      <Panel>
        <Heading hint="What the applicant answered on the website's form.">Answers on the form</Heading>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="excites_about_glamlink" label="What excites them about Glamlink">
              <Select mode="tags" maxCount={20} options={options(EXCITES_OPTIONS)} placeholder="Pick or type" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="biggest_pain_points" label="Biggest pain points">
              <Select mode="tags" maxCount={20} options={options(PAIN_POINT_OPTIONS)} placeholder="Pick or type" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="elite_setup"
              label="The Elite Setup"
              valuePropName="checked"
              extra="The concierge team may build their profile from their public social media."
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="wants_access_card"
              label="Wants the free digital card"
              valuePropName="checked"
              extra="Approval makes no card: they make it from their dashboard."
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="place_id"
              label="Google listing claimed (place ID)"
              extra="Approved, the listing leaves the Google results on the directory."
              rules={[atMost(255)]}
            >
              <Input maxLength={255} />
            </Form.Item>
          </Col>
        </Row>
      </Panel>

      {!editing && (
        <Panel>
          <Heading>Review</Heading>
          <Form.Item name="status" label="Status">
            <Radio.Group
              options={[
                { value: "approved", label: "Approved" },
                { value: "pending", label: "Pending: review it later" },
              ]}
            />
          </Form.Item>
          {status === "approved" && (
            <>
              <Form.Item
                name="professional_type"
                label="Account"
                extra="A brand goes by the business name at the main location. An account that is already a professional's keeps its type."
              >
                <Radio.Group
                  options={[
                    { value: "individual", label: "A professional" },
                    { value: "brand", label: "A brand" },
                  ]}
                />
              </Form.Item>
              <Alert
                type="info"
                showIcon
                title="Adding it approved lists it on the directory, finds or makes the account for the email, links it, and emails them how to sign in. It makes no Access card."
              />
            </>
          )}
        </Panel>
      )}

      <div className={styles.formActions}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={saving}>
          {editing ? "Save" : "Add listing"}
        </Button>
      </div>
    </Form>
  );
};

export default DirectoryListingForm;
