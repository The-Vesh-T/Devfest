import { useState } from "react";
import "../HomeScreen.css";

const feed = [
  { id: 1, name: "Aisha", action: "Workout", text: "Squats day. Kept it clean.", likes: 12, replies: 2, time: "1h", pinned: true },
  { id: 2, name: "Marco", action: "Food", text: "Protein goal hit ✅", likes: 5, replies: 1, time: "3h", pinned: false },
  { id: 3, name: "Priya", action: "Check-in", text: "Walked 20 mins. Small win.", likes: 7, replies: 3, time: "6h", pinned: false },
  { id: 4, name: "Leo", action: "Workout", text: "Hit a new PR today.", likes: 3, replies: 0, time: "1d", pinned: false },
  { id: 5, name: "Sam", action: "Food", text: "Nailed macros after dinner.", likes: 9, replies: 4, time: "2d", pinned: false },
];

const initialPosts = [
  {
    id: 1,
    author: "You",
    time: "2h",
    title: "Leg day felt strong",
    body: "Hit all sets and kept tempo tight. Feeling great.",
    likes: 18,
    replies: 3,
    pinned: true,
  },
  {
    id: 2,
    author: "Marco",
    time: "4h",
    title: "Meal prep win",
    body: "Protein goal hit early today. Chicken bowls for the week.",
    likes: 6,
    replies: 1,
    pinned: false,
  },
  {
    id: 3,
    author: "Priya",
    time: "1d",
    title: "Small wins",
    body: "Got my walk in and stretched. Consistency > intensity.",
    likes: 9,
    replies: 2,
    pinned: false,
  },
  {
    id: 4,
    author: "Aisha",
    time: "1d",
    title: "Cardio day",
    body: "Intervals felt tough but good. Recovery walk after.",
    likes: 4,
    replies: 0,
    pinned: false,
  },
];

export default function HomeScreen({ posts: externalPosts }) {
  const [postFocusedId, setPostFocusedId] = useState(null);
  const [postReplyId, setPostReplyId] = useState(null);
  const [postPulse, setPostPulse] = useState({ like: null });
  const [postLiked, setPostLiked] = useState({});
  const [postReplyDrafts, setPostReplyDrafts] = useState({});
  const [postRepliesById, setPostRepliesById] = useState({});
  const [postExpandedReplies, setPostExpandedReplies] = useState({});
  const [replyLikes, setReplyLikes] = useState({});
  const [replyReplyDrafts, setReplyReplyDrafts] = useState({});
  const [replyRepliesByKey, setReplyRepliesByKey] = useState({});
  const [replyReplyOpen, setReplyReplyOpen] = useState({});
  const [pinnedById, setPinnedById] = useState({});
  const [friendPinnedById, setFriendPinnedById] = useState({});
  const [focusedId, setFocusedId] = useState(null);
  const [replyId, setReplyId] = useState(null);
  const [pulse, setPulse] = useState({ like: null });
  const [liked, setLiked] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [repliesById, setRepliesById] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [socialExpanded, setSocialExpanded] = useState(false);
  const [friendsExpanded, setFriendsExpanded] = useState(false);

  const focusCard = (id) => setFocusedId((prev) => (prev === id ? null : id));
  const focusPost = (id) => setPostFocusedId((prev) => (prev === id ? null : id));
  const clearFocus = () => {
    setFocusedId(null);
    setReplyId(null);
  };
  const clearPostFocus = () => {
    setPostFocusedId(null);
    setPostReplyId(null);
  };

  const triggerPulse = (type, id) => {
    setPulse((p) => ({ ...p, [type]: id }));
    setTimeout(() => {
      setPulse((p) => (p[type] === id ? { ...p, [type]: null } : p));
    }, 450);
  };

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    triggerPulse("like", id);
  };

  const triggerPostPulse = (type, id) => {
    setPostPulse((p) => ({ ...p, [type]: id }));
    setTimeout(() => {
      setPostPulse((p) => (p[type] === id ? { ...p, [type]: null } : p));
    }, 450);
  };

  const togglePostLike = (id) => {
    setPostLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    triggerPostPulse("like", id);
  };

  const sendReply = (id) => {
    const text = (replyDrafts[id] || "").trim();
    if (!text) return;
    setRepliesById((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), text],
    }));
    setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
    setReplyId(null);
  };

  const sendPostReply = (id) => {
    const text = (postReplyDrafts[id] || "").trim();
    if (!text) return;
    setPostRepliesById((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), text],
    }));
    setPostReplyDrafts((prev) => ({ ...prev, [id]: "" }));
    setPostReplyId(null);
  };

  const toggleReplyLike = (key) => {
    setReplyLikes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sendReplyToReply = (key) => {
    const text = (replyReplyDrafts[key] || "").trim();
    if (!text) return;
    setReplyRepliesByKey((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), text],
    }));
    setReplyReplyDrafts((prev) => ({ ...prev, [key]: "" }));
    setReplyReplyOpen((prev) => ({ ...prev, [key]: false }));
  };

  const mergedPosts =
    externalPosts && externalPosts.length > 0
      ? [...externalPosts, ...initialPosts]
      : initialPosts;
  const sortedPosts = [...mergedPosts].sort((a, b) => {
    const aPinned = pinnedById[a.id] ?? a.pinned ?? false;
    const bPinned = pinnedById[b.id] ?? b.pinned ?? false;
    if (aPinned === bPinned) return 0;
    return aPinned ? -1 : 1;
  });
  const shownPosts = socialExpanded ? sortedPosts : sortedPosts.slice(0, 3);
  const sortedFriends = [...feed].sort((a, b) => {
    const aPinned = friendPinnedById[a.id] ?? a.pinned ?? false;
    const bPinned = friendPinnedById[b.id] ?? b.pinned ?? false;
    if (aPinned === bPinned) return 0;
    return aPinned ? -1 : 1;
  });
  const shownFeed = friendsExpanded ? sortedFriends : sortedFriends.slice(0, 3);

  const steps = { current: 10500, goal: 10000 };
  const stepsComplete = steps.current >= steps.goal;
  return (
    <div className="screenBody">
      <div className="homeHeader">
        <div>
          <div className="homeKicker">Good morning</div>
          <h2 className="screenTitle homeTitle">Aisha</h2>
        </div>
        <div className="streakBadge">
          <div className="streakNum">12</div>
          <div className="streakLabel">day streak</div>
        </div>
      </div>

      <div className="heroCard calendarCard">
        <div className="calendarHeader">
          <div>
            <div className="heroLabel">Weekly Progress</div>
            <div className="calendarTitle">This Week</div>
          </div>
          <div className="calendarLegend">
            <span className="legendItem">
              <span className="legendDot green" /> Complete
            </span>
            <span className="legendItem">
              <span className="legendDot yellow" /> Partial
            </span>
            <span className="legendItem">
              <span className="legendDot red" /> Lacking
            </span>
          </div>
        </div>

        <div className="calendarGrid weekly" aria-label="Weekly progress calendar">
          {[
            { label: "Mon", status: "green" },
            { label: "Tue", status: "yellow" },
            { label: "Wed", status: "red" },
            { label: "Thu", status: "green" },
            { label: "Fri", status: "yellow" },
            { label: "Sat", status: "green" },
            { label: "Sun", status: "yellow" },
          ].map((d, i) => (
            <div key={`day-${i}`} className={`dayCell ${d.status}`} aria-label={d.label}>
              <span className="dayNum">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sectionTitle">Today’s focus</div>
      <div className="cardList">
        <div className={`card simple focusCard ${stepsComplete ? "done" : "pending"}`}>
          <div className="cardTop">
            <div className="cardName">Steps</div>
            <span className={`pill ${stepsComplete ? "pillComplete" : "pillPending"}`}>
              {stepsComplete ? "Complete" : "In progress"}
            </span>
          </div>
          <div className="cardText">
            {steps.current.toLocaleString()} / {steps.goal.toLocaleString()} steps
          </div>
        </div>
      </div>

      <div className="sectionTitleRow">
        <div className="sectionTitle">Social</div>
        <button
          className="sectionAction"
          onClick={() => setSocialExpanded((s) => !s)}
        >
          {socialExpanded ? "Close forum" : "Explore forum"}
        </button>
      </div>
      <div className="cardList">
        {postFocusedId && <div className="feedBackdrop" onClick={clearPostFocus} />}
        {shownPosts.map((post) => {
          const isPinned = pinnedById[post.id] ?? post.pinned ?? false;
          const postLikeCount =
            (post.likes ?? 0) +
            (postLiked[post.id] ? 1 : 0) +
            (postRepliesById[post.id]?.reduce((acc, _, idx) => {
              const key = `post-${post.id}-${idx}`;
              const nested = replyRepliesByKey[key]?.length || 0;
              return acc + nested;
            }, 0) || 0);
          const postReplyCount =
            (post.replies ?? 0) +
            (postRepliesById[post.id]?.length || 0) +
            (postRepliesById[post.id]?.reduce((acc, _, idx) => {
              const key = `post-${post.id}-${idx}`;
              const nested = replyRepliesByKey[key]?.length || 0;
              return acc + nested;
            }, 0) || 0);
          return (
          <div
            key={post.id}
            className={`card simple postCard ${postFocusedId === post.id ? "focused" : ""}`}
            onClick={() => focusPost(post.id)}
          >
            <div className="postHeader">
              <div className="postAuthor">{post.author}</div>
              <div className="postMeta">
                <span className="postTime">{post.time}</span>
                <button
                  className={`pinBtn ${isPinned ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinnedById((prev) => ({ ...prev, [post.id]: !isPinned }));
                  }}
                  aria-label={isPinned ? "Unpin post" : "Pin post"}
                >
                  {isPinned ? "Pinned" : "Pin"}
                </button>
              </div>
            </div>
            <div className="postTitle">{post.title}</div>
            <div className="postBody">{post.body}</div>
            <div className="postStats">
              <span>{postLikeCount} likes</span>
              <span>{postReplyCount} replies</span>
            </div>
            {postFocusedId === post.id && (
              <div className="focusActions" onClick={(e) => e.stopPropagation()}>
                <button
                  className={`focusBtn iconBtn ${postPulse.like === post.id ? "pulse" : ""} ${
                    postLiked[post.id] ? "liked" : ""
                  }`}
                  aria-label="Like"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePostLike(post.id);
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 20s-7-4.35-7-9.2C5 7 6.9 5 9.3 5c1.6 0 2.7.9 2.7.9S13.1 5 14.7 5C17.1 5 19 7 19 10.8 19 15.65 12 20 12 20z"
                      fill={postLiked[post.id] ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  className="focusBtn iconBtn"
                  aria-label="Reply"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPostReplyId((prev) => (prev === post.id ? null : post.id));
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4 6h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            )}
            {postReplyId === post.id && (
              <div className="replyBox" onClick={(e) => e.stopPropagation()}>
                <input
                  className="replyInput"
                  placeholder="Write a reply..."
                  autoFocus
                  value={postReplyDrafts[post.id] || ""}
                  onChange={(e) =>
                    setPostReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                  }
                />
                <button className="replySend" onClick={() => sendPostReply(post.id)}>
                  Send
                </button>
              </div>
            )}
            {postRepliesById[post.id]?.length > 0 && (
              <div className="replyList">
                {(postExpandedReplies[post.id]
                  ? postRepliesById[post.id]
                  : postRepliesById[post.id].slice(0, 1)
                ).map((text, idx) => (
                  <div key={`${post.id}-reply-${idx}`} className="replyItem">
                    <span className="replyAuthor">You</span>
                    <span className="replyText">{text}</span>
                    {(() => {
                      const replyKey = `post-${post.id}-${idx}`;
                      return (
                        <>
                          <div className="replyActionsRow">
                            <button
                              className={`replyActionBtn ${replyLikes[replyKey] ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReplyLike(replyKey);
                              }}
                            >
                              ♥ {replyLikes[replyKey] ? "Liked" : "Like"}
                            </button>
                            <button
                              className="replyActionBtn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyReplyOpen((prev) => ({
                                  ...prev,
                                  [replyKey]: !prev[replyKey],
                                }));
                              }}
                            >
                              Reply
                            </button>
                          </div>
                          {replyReplyOpen[replyKey] && (
                            <div className="replyBox nested" onClick={(e) => e.stopPropagation()}>
                              <input
                                className="replyInput"
                                placeholder="Reply to this..."
                                autoFocus
                                value={replyReplyDrafts[replyKey] || ""}
                                onChange={(e) =>
                                  setReplyReplyDrafts((prev) => ({
                                    ...prev,
                                    [replyKey]: e.target.value,
                                  }))
                                }
                              />
                              <button
                                className="replySend"
                                onClick={() => sendReplyToReply(replyKey)}
                              >
                                Send
                              </button>
                            </div>
                          )}
                          {replyRepliesByKey[replyKey]?.length > 0 && (
                            <div className="replyThread">
                              {(postExpandedReplies[post.id]
                                ? replyRepliesByKey[replyKey]
                                : replyRepliesByKey[replyKey].slice(0, 1)
                              ).map((r, rIdx) => (
                                <div key={`${replyKey}-sub-${rIdx}`} className="replyItem nested">
                                  <span className="replyAuthor">You</span>
                                  <span className="replyText">{r}</span>
                                  <div className="replyActionsRow">
                                    <button
                                      className={`replyActionBtn ${
                                        replyLikes[`${replyKey}-sub-${rIdx}`] ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleReplyLike(`${replyKey}-sub-${rIdx}`);
                                      }}
                                    >
                                      ♥ {replyLikes[`${replyKey}-sub-${rIdx}`] ? "Liked" : "Like"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ))}
                {postRepliesById[post.id].length > 1 && (
                  <button
                    className="replyToggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPostExpandedReplies((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }));
                    }}
                  >
                    {postExpandedReplies[post.id] ? "Hide replies" : "View more replies"}
                  </button>
                )}
              </div>
            )}
          </div>
        )})}
      </div>

      <div className="sectionTitleRow">
        <div className="sectionTitle">Friends</div>
        <button
          className="sectionAction"
          onClick={() => setFriendsExpanded((s) => !s)}
        >
          {friendsExpanded ? "Close list" : "See all"}
        </button>
      </div>
      <div className="cardList">
        {focusedId && <div className="feedBackdrop" onClick={clearFocus} />}
        {shownFeed.map((p) => {
          const isPinned = friendPinnedById[p.id] ?? p.pinned ?? false;
          return (
          <div
            key={p.id}
            className={`card feedCard ${focusedId === p.id ? "focused" : ""}`}
            onClick={() => focusCard(p.id)}
          >
            <div className="avatar">{p.name[0]}</div>

            <div className="cardMain">
              <div className="cardTop">
                <div className="cardName">{p.name}</div>
                <span className="pill">{p.action}</span>
              </div>
              <div className="feedMeta">
                <span className="postTime">{p.time} ago</span>
                <button
                  className={`pinBtn ${isPinned ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFriendPinnedById((prev) => ({ ...prev, [p.id]: !isPinned }));
                  }}
                  aria-label={isPinned ? "Unpin post" : "Pin post"}
                >
                  {isPinned ? "Pinned" : "Pin"}
                </button>
              </div>
              <div className="cardText">{p.text}</div>
              <div className="feedStats">
                <span>
                  {(p.likes ?? 0) +
                    (liked[p.id] ? 1 : 0) +
                    (repliesById[p.id]?.reduce((acc, _, idx) => {
                      const key = `feed-${p.id}-${idx}`;
                      const nested = replyRepliesByKey[key]?.length || 0;
                      return acc + nested;
                    }, 0) || 0)}{" "}
                  likes
                </span>
                <span>
                  {(p.replies ?? 0) +
                    (repliesById[p.id]?.length || 0) +
                    (repliesById[p.id]?.reduce((acc, _, idx) => {
                      const key = `feed-${p.id}-${idx}`;
                      const nested = replyRepliesByKey[key]?.length || 0;
                      return acc + nested;
                    }, 0) || 0)}{" "}
                  replies
                </span>
              </div>

              {focusedId === p.id && (
                <div className="focusActions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`focusBtn iconBtn ${pulse.like === p.id ? "pulse" : ""} ${
                      liked[p.id] ? "liked" : ""
                    }`}
                    aria-label="Like"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(p.id);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 20s-7-4.35-7-9.2C5 7 6.9 5 9.3 5c1.6 0 2.7.9 2.7.9S13.1 5 14.7 5C17.1 5 19 7 19 10.8 19 15.65 12 20 12 20z"
                        fill={liked[p.id] ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="focusBtn iconBtn"
                    aria-label="Reply"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyId((prev) => (prev === p.id ? null : p.id));
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 6h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {replyId === p.id && (
                <div className="replyBox" onClick={(e) => e.stopPropagation()}>
                  <input
                    className="replyInput"
                    placeholder="Write a reply..."
                    autoFocus
                    value={replyDrafts[p.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                  />
                  <button className="replySend" onClick={() => sendReply(p.id)}>
                    Send
                  </button>
                </div>
              )}
              {repliesById[p.id]?.length > 0 && (
                <div className="replyList">
                {(expandedReplies[p.id]
                  ? repliesById[p.id]
                  : repliesById[p.id].slice(0, 1)
                ).map((text, idx) => (
                  <div key={`${p.id}-reply-${idx}`} className="replyItem">
                    <span className="replyAuthor">You</span>
                    <span className="replyText">{text}</span>
                    {(() => {
                      const replyKey = `feed-${p.id}-${idx}`;
                      return (
                        <>
                          <div className="replyActionsRow">
                            <button
                              className={`replyActionBtn ${replyLikes[replyKey] ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReplyLike(replyKey);
                              }}
                            >
                              ♥ {replyLikes[replyKey] ? "Liked" : "Like"}
                            </button>
                            <button
                              className="replyActionBtn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyReplyOpen((prev) => ({
                                  ...prev,
                                  [replyKey]: !prev[replyKey],
                                }));
                              }}
                            >
                              Reply
                            </button>
                          </div>
                          {replyReplyOpen[replyKey] && (
                            <div className="replyBox nested" onClick={(e) => e.stopPropagation()}>
                              <input
                                className="replyInput"
                                placeholder="Reply to this..."
                                autoFocus
                                value={replyReplyDrafts[replyKey] || ""}
                                onChange={(e) =>
                                  setReplyReplyDrafts((prev) => ({
                                    ...prev,
                                    [replyKey]: e.target.value,
                                  }))
                                }
                              />
                              <button
                                className="replySend"
                                onClick={() => sendReplyToReply(replyKey)}
                              >
                                Send
                              </button>
                            </div>
                          )}
                          {replyRepliesByKey[replyKey]?.length > 0 && (
                            <div className="replyThread">
                              {(expandedReplies[p.id]
                                ? replyRepliesByKey[replyKey]
                                : replyRepliesByKey[replyKey].slice(0, 1)
                              ).map((r, rIdx) => (
                                <div key={`${replyKey}-sub-${rIdx}`} className="replyItem nested">
                                  <span className="replyAuthor">You</span>
                                  <span className="replyText">{r}</span>
                                  <div className="replyActionsRow">
                                    <button
                                      className={`replyActionBtn ${
                                        replyLikes[`${replyKey}-sub-${rIdx}`] ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleReplyLike(`${replyKey}-sub-${rIdx}`);
                                      }}
                                    >
                                      ♥ {replyLikes[`${replyKey}-sub-${rIdx}`] ? "Liked" : "Like"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ))}
                  {repliesById[p.id].length > 1 && (
                    <button
                      className="replyToggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedReplies((prev) => ({
                          ...prev,
                          [p.id]: !prev[p.id],
                        }));
                      }}
                    >
                      {expandedReplies[p.id] ? "Hide replies" : "View more replies"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
