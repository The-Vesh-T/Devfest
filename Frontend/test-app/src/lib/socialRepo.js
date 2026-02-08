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
    supabase
      .from("post_comments")
      .select("id,post_id,user_id,author,body,created_at")
      .in("post_id", postIds)
      .order("created_at", { ascending: true }),
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
  const commentsByPost = {}
  ;(comments || []).forEach((row) => {
    commentCountByPost[row.post_id] = (commentCountByPost[row.post_id] || 0) + 1
    if (!commentsByPost[row.post_id]) commentsByPost[row.post_id] = []
    commentsByPost[row.post_id].push({
      id: row.id,
      userId: row.user_id,
      author: cleanText(row.author, "User"),
      body: cleanText(row.body),
      createdAt: row.created_at,
    })
  })

  const mapped = posts.map((row) => ({
    id: row.id,
    userId: row.user_id,
    author: cleanText(row.author, "User"),
    time: formatRelativeTime(row.created_at),
    createdAt: row.created_at,
    title: cleanText(row.title, "Post"),
    body: cleanText(row.body),
    likes: likeCountByPost[row.id] || 0,
    replies: commentCountByPost[row.id] || 0,
    comments: commentsByPost[row.id] || [],
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
      userId: payload.user_id,
      author: payload.author,
      time: "now",
      createdAt: data.created_at,
      title: payload.title,
      body: payload.body,
      likes: 0,
      replies: 0,
      comments: [],
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

export const ensureSeedSocialData = async () => {
  if (!isSupabaseConfigured) return { seeded: false, error: null }

  const { count, error: countError } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })

  if (countError) return { seeded: false, error: countError }
  if ((count || 0) > 0) return { seeded: false, error: null }

  const now = Date.now()
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString()

  const { data: createdPosts, error: postsError } = await supabase
    .from("posts")
    .insert([
      {
        user_id: "demo",
        author: "Aisha",
        title: "Leg day felt strong",
        body: "Hit all sets and kept tempo tight. Feeling great.",
        created_at: hoursAgo(2),
      },
      {
        user_id: "marco",
        author: "Marco",
        title: "Meal prep win",
        body: "Protein goal hit early today. Chicken bowls for the week.",
        created_at: hoursAgo(4),
      },
      {
        user_id: "priya",
        author: "Priya",
        title: "Small wins",
        body: "Got my walk in and stretched. Consistency > intensity.",
        created_at: hoursAgo(24),
      },
    ])
    .select("id,user_id")

  if (postsError || !createdPosts) return { seeded: false, error: postsError }

  const postByUser = {}
  createdPosts.forEach((p) => {
    postByUser[p.user_id] = p.id
  })

  const comments = []
  if (postByUser.marco) {
    comments.push({
      post_id: postByUser.marco,
      user_id: "demo",
      author: "Aisha",
      body: "Let us gooo 🔥",
      created_at: hoursAgo(1.5),
    })
  }
  if (postByUser.demo) {
    comments.push({
      post_id: postByUser.demo,
      user_id: "priya",
      author: "Priya",
      body: "Great consistency!",
      created_at: hoursAgo(1.3),
    })
    comments.push({
      post_id: postByUser.demo,
      user_id: "marco",
      author: "Marco",
      body: "Nice work",
      created_at: hoursAgo(1.1),
    })
  }
  if (comments.length > 0) {
    const { error: commentError } = await supabase.from("post_comments").insert(comments)
    if (commentError) return { seeded: false, error: commentError }
  }

  const likes = []
  if (postByUser.marco) likes.push({ post_id: postByUser.marco, user_id: "demo" })
  if (postByUser.priya) likes.push({ post_id: postByUser.priya, user_id: "demo" })
  if (postByUser.demo) {
    likes.push({ post_id: postByUser.demo, user_id: "marco" })
    likes.push({ post_id: postByUser.demo, user_id: "priya" })
  }
  if (likes.length > 0) {
    const { error: likeError } = await supabase
      .from("post_likes")
      .upsert(likes, { onConflict: "post_id,user_id", ignoreDuplicates: true })
    if (likeError) return { seeded: false, error: likeError }
  }

  return { seeded: true, error: null }
}
