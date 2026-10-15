/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

// journal category api
export const GetJournalCategory = async () => {
	const res = await axios.get(BASE_URL + "journalCategory/");
	return res.data;
};

export const UpdateJournalCategory = async (id, formData) => {
	return await axios.put(BASE_URL + `journalCategory/${id}`, formData);
};

export const DeleteJournalCategory = async (category_id) => {
	return await axios.post(`${BASE_URL}journalCategory/delete`, {
		category_id: category_id,
	});
};

export const AddJournalCategory = async (formData) => {
	return await axios.post(BASE_URL + "journalCategory", formData, {});
};

// authors api
export const GetAllAuthors = async () => {
	const res = await axios.get(BASE_URL + "author/");
	return res.data;
};

export const UpdateAuthors = async (id, formData) => {
	return await axios.put(BASE_URL + `author/${id}`, formData);
};

export const DeleteAuthors = async (author_id) => {
	return await axios.post(`${BASE_URL}author/delete`, { author_id: author_id });
};

export const AddAuthors = async (formData) => {
	return await axios.post(BASE_URL + "author", formData, {});
};

// journal api

export const GetAllJournal = async () => {
	const res = await axios.get(BASE_URL + "journal/admin");
	return res.data;
};

export const GetJournalById = async (id) => {
	return await axios.get(BASE_URL + `journal/findJournalById/${id}`);
};

export const UpdateJournal = async (id, formData) => {
	return await axios.put(BASE_URL + `journal/${id}`, formData);
};

export const DeleteJournal = async (journal_id) => {
  const ids = Array.isArray(journal_id) ? journal_id : [journal_id];

  return await axios.post(`${BASE_URL}journal/delete`, {
    journal_id: ids,
  });
};

export const CreateJournal = async (formData) => {
	return await axios.post(BASE_URL + "journal", formData, {});
};

export const UpdateJournalSortOrder = async (data) => {
  const res = await axios.post(BASE_URL + "journal/sort-order", data);
  return res.data;
};

// ======================= EDUCATION API =======================

export const GetAllEducation = async () => {
  const res = await axios.get(BASE_URL + "discover/education/admin");
  return res.data;
};

export const GetEducationById = async (id) => {
  return await axios.get(BASE_URL + `discover/education/findById/${id}`);
};

export const UpdateEducation = async (id, formData) => {
  return await axios.put(BASE_URL + `discover/education/${id}`, formData);
};

export const DeleteEducation = async (ids) => {
  ids = Array.isArray(ids) ? ids : [ids];

  return await axios.post(BASE_URL + "discover/education/delete", {
    ids,
  });
};

export const CreateEducation = async (formData) => {
  return await axios.post(BASE_URL + "discover/education", formData);
};

export const UpdateEducationSortOrder = async (data) => {
  const res = await axios.post(
    BASE_URL + "discover/education/sort-order",
    data,
  );
  return res.data;
};

// ======================= EVENT API =======================

export const GetAllEvents = async () => {
  const res = await axios.get(BASE_URL + "discover/event/admin");
  return res.data;
};

export const GetEventById = async (id) => {
  return await axios.get(BASE_URL + `discover/event/findById/${id}`);
};

export const UpdateEvent = async (id, formData) => {
  return await axios.put(BASE_URL + `discover/event/${id}`, formData);
};

export const DeleteEvent = async (ids) => {
  ids = Array.isArray(ids) ? ids : [ids];

  return await axios.post(BASE_URL + "discover/event/delete", {
    ids,
  });
};

export const CreateEvent = async (formData) => {
  return await axios.post(BASE_URL + "discover/event", formData);
};

export const UpdateEventSortOrder = async (data) => {
  const res = await axios.post(BASE_URL + "discover/event/sort-order", data);
  return res.data;
};

// ======================= SHOP API =======================

export const GetAllShop = async () => {
  const res = await axios.get(BASE_URL + "discover/shop/admin");
  return res.data;
};

export const GetShopById = async (id) => {
  return await axios.get(BASE_URL + `discover/shop/findById/${id}`);
};

export const UpdateShop = async (id, formData) => {
  return await axios.put(BASE_URL + `discover/shop/${id}`, formData);
};

export const DeleteShop = async (ids) => {
  ids = Array.isArray(ids) ? ids : [ids];

  return await axios.post(BASE_URL + "discover/shop/delete", {
    ids,
  });
};

export const CreateShop = async (formData) => {
  return await axios.post(BASE_URL + "discover/shop", formData);
};

export const UpdateShopSortOrder = async (data) => {
  const res = await axios.post(BASE_URL + "discover/shop/sort-order", data);
  return res.data;
};

export const BulkUploadShopCsv = async (formData) => {
  return await axios.post(BASE_URL + "discover/shop/csv-upload", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

// ==============================
// Journal Topic Shop Mapping
// ==============================

export const UpdateJournalTopicShops = async (topicId, data) => {
  return axios.put(
    `${BASE_URL}/journal/topic/${topicId}/shops`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

// ==============================
// Journal Topic Podcast Mapping
// ==============================

export const UpdateJournalTopicPodcasts = async (topicId, data) => {
  return axios.put(
    `${BASE_URL}/journal/topic/${topicId}/podcasts`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

// ==============================
// Journal FAQ
// ==============================

export const CreateJournalFaq = async (data) => {
  return axios.post(
    `${BASE_URL}/journal/faq`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const GetAllJournalFaqs = async () => {
  return axios.get(
    `${BASE_URL}/journal/faq`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const UpdateJournalFaq = async (id, data) => {
  return axios.put(
    `${BASE_URL}/journal/faq/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const DeleteJournalFaq = async (ids) => {
  return axios.post(
    `${BASE_URL}/journal/faq/delete`,
    {
      faq_id: ids,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

// ==============================
// Journal Topics
// ==============================

export const CreateJournalTopic = async (data) => {
  return axios.post(
    `${BASE_URL}/journal/topic`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const GetAllJournalTopics = async () => {
  return axios.get(
    `${BASE_URL}/journal/topic`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const GetJournalTopicById = async (id) => {
  return axios.get(
    `${BASE_URL}/journal/topic/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const UpdateJournalTopic = async (id, data) => {
  return axios.put(
    `${BASE_URL}/journal/topic/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const DeleteJournalTopic = async (ids) => {
  return axios.post(
    `${BASE_URL}/journal/topic/delete`,
    {
      topic_id: ids,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

// ==============================
// Journal Topic Mapping
// ==============================

export const GetJournalTopicMappings = async (journalId) => {
  return axios.get(
    `${BASE_URL}/journal/${journalId}/topics`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const UpdateJournalTopicMappings = async (journalId, data) => {
  return axios.post(
    `${BASE_URL}/journal/${journalId}/topics`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

// ==============================
// Journal FAQ Mapping
// ==============================

export const GetJournalFaqMappings = async (journalId) => {
  return axios.get(
    `${BASE_URL}/journal/${journalId}/faqs`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const UpdateJournalFaqMappings = async (journalId, data) => {
  return axios.post(
    `${BASE_URL}/journal/${journalId}/faqs`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

// ==============================
// Journal Topic Paragraph Mapping
// ==============================

export const GetJournalTopicParagraphs = async (topicId) => {
  return axios.get(
    `${BASE_URL}/journal/topic/${topicId}/paragraphs`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

export const UpdateJournalTopicParagraphs = async (topicId, data) => {
  return axios.put(
    `${BASE_URL}/journal/topic/${topicId}/paragraphs`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};

// ==============================
// Journal Topic Professional Mapping
// ==============================

export const UpdateJournalTopicProfessionals = async (topicId, data) => {
  return axios.put(
    `${BASE_URL}/journal/topic/${topicId}/professionals`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    },
  );
};
