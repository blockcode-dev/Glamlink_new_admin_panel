import type { Attachment, UserRef } from "./user";

export interface Post {
  id: number;
  content: string | null;
  /** Spelled this way by the API. */
  attachements: Attachment[];
  created_by: UserRef;
  likes_count: number;
  comment_count: number;
  created_at: string;
}

/** A short video ("reel" in the API). */
export interface Clip {
  id: number;
  description: string | null;
  file_name: string;
  thumbnail_file_name?: string | null;
  reel_user: UserRef;
  likes_count: number;
  comment_count: number;
  created_at: string;
}

export interface PostLike {
  id: number;
  created_at: string;
  liked_by: UserRef;
}

export interface PostComment {
  id: number;
  comment: string;
  created_at: string;
  commented_by: UserRef;
}

export interface ClipLike {
  id: number;
  created_at: string;
  reel_liked_by: UserRef;
}

export interface ClipComment {
  id: number;
  comment: string;
  created_at: string;
  reel_commented_by: UserRef;
}

/** Likes and comments a user made, with the post or clip they were on. */
export interface UserPostLike extends PostLike {
  user_like_post_post: Post;
}

export interface UserPostComment extends PostComment {
  comment_post: Post;
}

export interface UserClipLike extends ClipLike {
  reel_like_reel: Clip;
}

export interface UserClipComment extends ClipComment {
  reel_comment_reel: Clip;
}
