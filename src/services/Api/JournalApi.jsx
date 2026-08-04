/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

// journal category api
export const GetJournalCategory = async () => {
	const res = await axios.get(BASE_URL + "journalCategory/");
	return res.data;
};

export const GetJournalCategoryById = async (id) => {
	return await axios.get(BASE_URL + `journalCategory/${id}`);
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

export const GetAuthorsById = async (id) => {
	return await axios.get(BASE_URL + `author/${id}`);
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
