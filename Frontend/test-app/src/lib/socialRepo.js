import { isSupabaseConfigured, supabase } from "./supabase"

const cleanText = (value, fallback = "") => {
  const text = `${value ?? ""}`.trim()
  return text || fallback
}

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "now"
  const ts = new Date(dateValue).getTime()
  if (!Number.isFinite(ts)) return "now"
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (diffSec < 60) return "now"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`
  return `${Math.floor(diffSec / 86400)}d`
}

export const listFeedPosts = async ({ userId, limit = 50 }) => {
  if (!isSupabaseConfigured) return { data: [], error: null }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (postsError) return { data: [], error: postsError }
  if (!posts || posts.length === 0) return { data: [], error: null }

  const postIds = posts.map((p) => p.id)

  const [{ data: likes, error: likesError }, { data: comments, error: commentsError }] = await Promise.all([
    supabase.from("post_likes").select("post_id,user_id").in("post_id", postIds),
    supabase.from("post_comments").select("post_id,id").in("post_id", postIds),
  ])

  if (likesError) return { data: [], error: likesError }
  if (commentsError) return { data: [], error: commentsError }

  const likeCountByPost = {}
  const likedByMe = {}
  ;(likes || []).forEach((row) => {
    likeCountByPost[row.post_id] = (likeCountByPost[row.post_id] || 0) + 1
    if (userId && row.user_id === userId) likedByMe[row.post_id] = true
  })

  const commentCountByPost = {}
  ;(comments || []).forEach((row) => {
    commentCountByPost[row.post_id] = (commentCountByPost[row.post_id] || 0) + 1
  })

  const mapped = posts.map((row) => ({
    id: row.id,
    author: cleanText(row.author, "User"),
    time: formatRelativeTime(row.created_at),
    title: cleanText(row.title, "Post"),
    body: cleanText(row.body),
    likes: likeCountByPost[row.id] || 0,
    replies: commentCountByPost[row.id] || 0,
    likedByMe: Boolean(likedByMe[row.id]),
    pinned: false,
  }))

  return { data: mapped, error: null }
}

export const createFeedPost = async ({ userId, author, title, body }) => {
  if (!isSupabaseConfigured || !userId) return { data: null, error: null }

  const payload = {
    user_id: userId,
    author: cleanText(author, "User"),
    title: cleanText(title, "Post"),
    body: cleanText(body),
  }

  const { data, error } = await supabase.from("posts").insert(payload).select("*").single()
  if (error || !data) return { data: null, error }

  return {
    data: {
      id: data.id,
      author: payload.author,
      time: "now",
      title: payload.title,
      body: payload.body,
      likes: 0,
      replies: 0,
      likedByMe: false,
      pinned: false,
    },
    error: null,
  }
}

export const setPostLike = async ({ userId, postId, liked }) => {
  if (!isSupabaseConfigured || !userId || !postId) return { error: null }

  if (liked) {
    const { error } = await supabase.from("post_likes").upsert(
      { post_id: postId, user_id: userId },
      { onConflict: "post_id,user_id", ignoreDuplicates: true }
    )
    return { error }
  }

  const { error } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId)
  return { error }
}

export const addPostComment = async ({ userId, postId, author, body }) => {
  if (!isSupabaseConfigured || !userId || !postId) return { error: null }
  const text = cleanText(body)
  if (!text) return { error: null }

  const payload = {
    post_id: postId,
    user_id: userId,
    author: cleanText(author, "User"),
    body: text,
  }

  const { error } = await supabase.from("post_comments").insert(payload)
  return { error }
}
