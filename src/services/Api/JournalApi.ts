/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, FlexibleList, Paged } from "../../types/api";
import type {
	ArticleMentions,
	Author,
	DiscoverEvent,
	Education,
	Journal,
	JournalCategory,
	JournalFaq,
	JournalFaqMapping,
	JournalTopic,
	JournalTopicMapping,
	ParagraphRow,
	Shop,
	TopicParagraph,
} from "../../types/journal";
import type { UploadMediaOptions } from "../../components/RichTextEditor";

type Id = number | string;

/** New display order for a drag-sorted list. */
type SortOrder<K extends string> = Record<K, { id: number }[]>;

export interface ShopCsvResult {
	inserted: number;
	totalRows: number;
	skipped?: { row: number }[];
}

// journal category api
export const GetJournalCategory = async () => {
	const res = await axios.get<ApiResponse<Paged<JournalCategory>>>(BASE_URL + "journalCategory/");
	return res.data;
};

export const UpdateJournalCategory = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<JournalCategory>>(BASE_URL + `journalCategory/${id}`, formData);
};

export const DeleteJournalCategory = async (category_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(`${BASE_URL}journalCategory/delete`, {
		category_id: category_id,
	});
};

export const AddJournalCategory = async (formData: FormData) => {
	return await axios.post<ApiResponse<JournalCategory>>(BASE_URL + "journalCategory", formData);
};

// authors api
export const GetAllAuthors = async () => {
	const res = await axios.get<ApiResponse<Paged<Author>>>(BASE_URL + "author/");
	return res.data;
};

export const UpdateAuthors = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<Author>>(BASE_URL + `author/${id}`, formData);
};

export const DeleteAuthors = async (author_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(`${BASE_URL}author/delete`, { author_id: author_id });
};

export const AddAuthors = async (formData: FormData) => {
	return await axios.post<ApiResponse<Author>>(BASE_URL + "author", formData);
};

// journal api

export const GetAllJournal = async () => {
	const res = await axios.get<ApiResponse<Paged<Journal>>>(BASE_URL + "journal/admin");
	return res.data;
};

export const GetJournalById = async (id: Id) => {
	return await axios.get<ApiResponse<Journal>>(BASE_URL + `journal/findJournalById/${id}`);
};

export const UpdateJournal = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<Journal>>(BASE_URL + `journal/${id}`, formData);
};

export const DeleteJournal = async (journal_id: Id | Id[]) => {
  const ids = Array.isArray(journal_id) ? journal_id : [journal_id];

  return await axios.post<ApiResponse<unknown>>(`${BASE_URL}journal/delete`, {
    journal_id: ids,
  });
};

export const CreateJournal = async (formData: FormData) => {
	return await axios.post<ApiResponse<Journal>>(BASE_URL + "journal", formData);
};

// Who an article features: its @handles (matched to pages and cards when read) and accounts added here.
// Each call answers the article's mentions as they now stand.

export const GetArticleMentions = async (journalId: Id) => {
	return axios.get<ApiResponse<ArticleMentions>>(`${BASE_URL}journal/${journalId}/mentions`);
};

/** Features a professional or brand account the article never @mentions. */
export const AddArticleMention = async (journalId: Id, userId: number) => {
	return axios.post<ApiResponse<ArticleMentions>>(`${BASE_URL}journal/${journalId}/mentions`, { user_id: userId });
};

/** Sets an @handle aside (it stays in the text and stays aside when the article is saved again), or back. */
export const SetArticleMentionExcluded = async (journalId: Id, mentionId: number, excluded: boolean) => {
	return axios.put<ApiResponse<ArticleMentions>>(`${BASE_URL}journal/${journalId}/mentions/${mentionId}`, { excluded });
};

/** Removes an added account (an @handle is set aside instead). */
export const RemoveArticleMention = async (journalId: Id, mentionId: number) => {
	return axios.delete<ApiResponse<ArticleMentions>>(`${BASE_URL}journal/${journalId}/mentions/${mentionId}`);
};

export const UpdateJournalSortOrder = async (data: SortOrder<"journals">) => {
  const res = await axios.post<ApiResponse<unknown>>(BASE_URL + "journal/sort-order", data);
  return res.data;
};

// ======================= EDUCATION API =======================

export const GetAllEducation = async () => {
  const res = await axios.get<ApiResponse<Paged<Education>>>(BASE_URL + "discover/education/admin");
  return res.data;
};

export const GetEducationById = async (id: Id) => {
  return await axios.get<ApiResponse<Education>>(BASE_URL + `discover/education/findById/${id}`);
};

export const UpdateEducation = async (id: Id, formData: FormData) => {
  return await axios.put<ApiResponse<Education>>(BASE_URL + `discover/education/${id}`, formData);
};

export const DeleteEducation = async (ids: Id | Id[]) => {
  ids = Array.isArray(ids) ? ids : [ids];

  return await axios.post<ApiResponse<unknown>>(BASE_URL + "discover/education/delete", {
    ids,
  });
};

export const CreateEducation = async (formData: FormData) => {
  return await axios.post<ApiResponse<Education>>(BASE_URL + "discover/education", formData);
};

export const UpdateEducationSortOrder = async (data: SortOrder<"items">) => {
  const res = await axios.post<ApiResponse<unknown>>(
    BASE_URL + "discover/education/sort-order",
    data,
  );
  return res.data;
};

// ======================= EVENT API =======================

export const GetAllEvents = async () => {
  const res = await axios.get<ApiResponse<Paged<DiscoverEvent>>>(BASE_URL + "discover/event/admin");
  return res.data;
};

export const GetEventById = async (id: Id) => {
  return await axios.get<ApiResponse<DiscoverEvent>>(BASE_URL + `discover/event/findById/${id}`);
};

export const UpdateEvent = async (id: Id, formData: FormData) => {
  return await axios.put<ApiResponse<DiscoverEvent>>(BASE_URL + `discover/event/${id}`, formData);
};

export const DeleteEvent = async (ids: Id | Id[]) => {
  ids = Array.isArray(ids) ? ids : [ids];

  return await axios.post<ApiResponse<unknown>>(BASE_URL + "discover/event/delete", {
    ids,
  });
};

export const CreateEvent = async (formData: FormData) => {
  return await axios.post<ApiResponse<DiscoverEvent>>(BASE_URL + "discover/event", formData);
};

export const UpdateEventSortOrder = async (data: SortOrder<"items">) => {
  const res = await axios.post<ApiResponse<unknown>>(BASE_URL + "discover/event/sort-order", data);
  return res.data;
};

// ======================= SHOP API =======================

export const GetAllShop = async () => {
  const res = await axios.get<ApiResponse<Paged<Shop>>>(BASE_URL + "discover/shop/admin");
  return res.data;
};

export const GetShopById = async (id: Id) => {
  return await axios.get<ApiResponse<Shop>>(BASE_URL + `discover/shop/findById/${id}`);
};

export const UpdateShop = async (id: Id, formData: FormData) => {
  return await axios.put<ApiResponse<Shop>>(BASE_URL + `discover/shop/${id}`, formData);
};

export const DeleteShop = async (ids: Id | Id[]) => {
  ids = Array.isArray(ids) ? ids : [ids];

  return await axios.post<ApiResponse<unknown>>(BASE_URL + "discover/shop/delete", {
    ids,
  });
};

export const CreateShop = async (formData: FormData) => {
  // The page also reads a top-level id in case the API returns the record bare.
  return await axios.post<ApiResponse<Shop> & { id?: number }>(BASE_URL + "discover/shop", formData);
};

export const UpdateShopSortOrder = async (data: SortOrder<"items">) => {
  const res = await axios.post<ApiResponse<unknown>>(BASE_URL + "discover/shop/sort-order", data);
  return res.data;
};

// Uploads an image or video used inside journal / topic content and returns its URL.
export const UploadJournalMedia = async (file: File, { onProgress, signal }: UploadMediaOptions = {}) => {
  const formData = new FormData();
  formData.append("images", file, file.name);
  const res = await axios.post<ApiResponse<{ location?: string }>>(`${BASE_URL}journal/upload`, formData, {
    signal,

    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    }
  });
  const location = res.data?.data?.location;
  if (!location) throw new Error("Invalid response format from server");
  return location;
};

export const BulkUploadShopCsv = async (formData: FormData) => {
  return await axios.post<ApiResponse<ShopCsvResult>>(BASE_URL + "discover/shop/csv-upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
  });
};

// ==============================
// Journal Topic Shop Mapping
// ==============================

export const UpdateJournalTopicShops = async (topicId: Id, data: { shop_ids: number[] }) => {
  return axios.put<ApiResponse<unknown>>(`${BASE_URL}journal/topic/${topicId}/shops`, data);
};

// ==============================
// Journal Topic Podcast Mapping
// ==============================

export const UpdateJournalTopicPodcasts = async (topicId: Id, data: { podcast_ids: number[] }) => {
  return axios.put<ApiResponse<unknown>>(`${BASE_URL}journal/topic/${topicId}/podcasts`, data);
};

// ==============================
// Journal FAQ
// ==============================

export const CreateJournalFaq = async (data: Omit<JournalFaq, "id">) => {
  return axios.post<ApiResponse<JournalFaq>>(`${BASE_URL}journal/faq`, data);
};

export const GetAllJournalFaqs = async () => {
  return axios.get<FlexibleList<JournalFaq>>(`${BASE_URL}journal/faq`);
};

export const UpdateJournalFaq = async (id: Id, data: Omit<JournalFaq, "id">) => {
  return axios.put<ApiResponse<JournalFaq>>(`${BASE_URL}journal/faq/${id}`, data);
};

export const DeleteJournalFaq = async (ids: Id[]) => {
  return axios.post<ApiResponse<unknown>>(`${BASE_URL}journal/faq/delete`, {
    faq_id: ids,
  });
};

// ==============================
// Journal Topics
// ==============================

export const CreateJournalTopic = async (data: FormData) => {
  return axios.post<ApiResponse<JournalTopic>>(`${BASE_URL}journal/topic`, data);
};

export const GetAllJournalTopics = async () => {
  return axios.get<FlexibleList<JournalTopic>>(`${BASE_URL}journal/topic`);
};

export const GetJournalTopicById = async (id: Id) => {
  return axios.get<ApiResponse<JournalTopic>>(`${BASE_URL}journal/topic/${id}`);
};

export const UpdateJournalTopic = async (id: Id, data: FormData) => {
  return axios.put<ApiResponse<JournalTopic>>(`${BASE_URL}journal/topic/${id}`, data);
};

export const DeleteJournalTopic = async (ids: Id[]) => {
  return axios.post<ApiResponse<unknown>>(`${BASE_URL}journal/topic/delete`, {
    topic_id: ids,
  });
};

// ==============================
// Journal Topic Mapping
// ==============================

export const GetJournalTopicMappings = async (journalId: Id) => {
  return axios.get<ApiResponse<JournalTopicMapping[]>>(`${BASE_URL}journal/${journalId}/topics`);
};

export const UpdateJournalTopicMappings = async (journalId: Id, data: { topic_ids: number[] }) => {
  return axios.post<ApiResponse<unknown>>(`${BASE_URL}journal/${journalId}/topics`, data);
};

// ==============================
// Journal FAQ Mapping
// ==============================

export const GetJournalFaqMappings = async (journalId: Id) => {
  return axios.get<ApiResponse<JournalFaqMapping[]>>(`${BASE_URL}journal/${journalId}/faqs`);
};

export const UpdateJournalFaqMappings = async (journalId: Id, data: { faq_ids: number[] }) => {
  return axios.post<ApiResponse<unknown>>(`${BASE_URL}journal/${journalId}/faqs`, data);
};

// ==============================
// Journal Topic Paragraph Mapping
// ==============================

export const GetJournalTopicParagraphs = async (topicId: Id) => {
  return axios.get<ApiResponse<TopicParagraph[]>>(`${BASE_URL}journal/topic/${topicId}/paragraphs`);
};

export const UpdateJournalTopicParagraphs = async (
  topicId: Id,
  data: { paragraphs: ParagraphRow[] },
) => {
  return axios.put<ApiResponse<unknown>>(`${BASE_URL}journal/topic/${topicId}/paragraphs`, data);
};

// ==============================
// Journal Topic Professional Mapping
// ==============================

export const UpdateJournalTopicProfessionals = async (topicId: Id, data: { professional_ids: number[] }) => {
  return axios.put<ApiResponse<JournalTopic>>(`${BASE_URL}journal/topic/${topicId}/professionals`, data);
};
