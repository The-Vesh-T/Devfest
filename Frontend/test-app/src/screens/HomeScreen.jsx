import { useEffect, useState } from "react";
import "../HomeScreen.css";
import profileAvatar from "../assets/profile-avatar.svg";
import femaleProfileAvatar from "../assets/profile-avatar-female.svg";

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

export default function HomeScreen({
  posts: externalPosts,
  onLogout,
  currentUser,
  selectedDate,
  onTogglePostLike,
  onAddPostReply,
  onToggleCommentLike,
  usePlaceholderPosts = true,
}) {
  const activeUser = currentUser ?? {
    name: "Aisha Patel",
    displayName: "Aisha",
    handle: "@aisha",
    email: "demo@devfest.app",
    password: "DemoPass123!",
    bio: "Strength + mobility. Learning to love rest days.",
  };
  const accountEmail = activeUser.email;
  const accountPassword = activeUser.password;
  const userAvatarSrc = activeUser.login === "user" ? profileAvatar : femaleProfileAvatar;
  const selfLabel = activeUser.displayName || activeUser.name || "You";
  const headerDate = (selectedDate ?? new Date()).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const [homeRange, setHomeRange] = useState("weekly");
  const [profileRange, setProfileRange] = useState("weekly");
  const [personalRange, setPersonalRange] = useState("weekly");
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePageUser, setProfilePageUser] = useState(null);
  const [followRequested, setFollowRequested] = useState({});
  const [activityOpen, setActivityOpen] = useState(null);
  const [activityLiked, setActivityLiked] = useState({});
  const [activityReplyDrafts, setActivityReplyDrafts] = useState({});
  const [activityRepliesByKey, setActivityRepliesByKey] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState({
    profile: false,
    biometrics: false,
    goals: false,
    micro: false,
  });
  const [userQuery, setUserQuery] = useState("");
  const [personalBio, setPersonalBio] = useState(activeUser.bio);

  useEffect(() => {
    setPersonalBio(activeUser.bio);
  }, [activeUser.bio]);

  useEffect(() => {
    if (!usePlaceholderPosts) {
      setPostRepliesById({});
      setRepliesById({});
    }
  }, [externalPosts, usePlaceholderPosts]);

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
  const toggleSettingsSection = (key) => {
    setSettingsExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerPulse = (type, id) => {
    setPulse((p) => ({ ...p, [type]: id }));
    setTimeout(() => {
      setPulse((p) => (p[type] === id ? { ...p, [type]: null } : p));
    }, 450);
  };

  const toggleLike = (id, postId, currentLiked) => {
    const nextLiked = !currentLiked;
    setLiked((prev) => ({ ...prev, [id]: nextLiked }));
    triggerPulse("like", id);
    if (postId) {
      onTogglePostLike?.(postId, nextLiked);
    }
  };

  const triggerPostPulse = (type, id) => {
    setPostPulse((p) => ({ ...p, [type]: id }));
    setTimeout(() => {
      setPostPulse((p) => (p[type] === id ? { ...p, [type]: null } : p));
    }, 450);
  };

  const togglePostLike = (id, currentLiked) => {
    const nextLiked = !currentLiked;
    setPostLiked((prev) => ({ ...prev, [id]: nextLiked }));
    triggerPostPulse("like", id);
    onTogglePostLike?.(id, nextLiked);
  };

  const sendReply = (id, postId) => {
    const text = (replyDrafts[id] || "").trim();
    if (!text) return;
    if (usePlaceholderPosts) {
      setRepliesById((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), text],
      }));
    }
    setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
    setReplyId(null);
    if (postId) {
      onAddPostReply?.(postId, text);
    }
  };

  const sendPostReply = (id) => {
    const text = (postReplyDrafts[id] || "").trim();
    if (!text) return;
    if (usePlaceholderPosts) {
      setPostRepliesById((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), text],
      }));
    }
    setPostReplyDrafts((prev) => ({ ...prev, [id]: "" }));
    setPostReplyId(null);
    onAddPostReply?.(id, text);
  };

  const toggleReplyLike = (key, currentLiked = false, commentId = null) => {
    const nextLiked = !currentLiked;
    setReplyLikes((prev) => ({ ...prev, [key]: nextLiked }));
    if (commentId) {
      onToggleCommentLike?.(commentId, nextLiked);
    }
  };

  const sendReplyToReply = (key, postId = null, parentCommentId = null) => {
    const text = (replyReplyDrafts[key] || "").trim();
    if (!text) return;
    if (postId && parentCommentId) {
      onAddPostReply?.(postId, text, parentCommentId);
    } else {
      setReplyRepliesByKey((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), text],
      }));
    }
    setReplyReplyDrafts((prev) => ({ ...prev, [key]: "" }));
    setReplyReplyOpen((prev) => ({ ...prev, [key]: false }));
  };

  const sendActivityReply = (key, postId = null) => {
    const text = (activityReplyDrafts[key] || "").trim();
    if (!text) return;
    if (postId) {
      onAddPostReply?.(postId, text);
    } else {
      setActivityRepliesByKey((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), text],
      }));
    }
    setActivityReplyDrafts((prev) => ({ ...prev, [key]: "" }));
  };

  const toReplyModel = (comment, fallbackAuthor) => ({
    id: comment?.id || null,
    author: comment?.author || fallbackAuthor || "User",
    text: comment?.body || "",
    likedByMe: Boolean(comment?.likedByMe),
    replies: (comment?.replies || []).map((nested) => toReplyModel(nested, fallbackAuthor)),
  });

  const getActivityPost = (user, activity) => {
    const userToken = `${user?.name || ""}`.trim().split(/\s+/)[0]?.toLowerCase() || "";
    return (
      mergedPosts.find((post) => {
        const authorToken = `${post?.author || ""}`.trim().split(/\s+/)[0]?.toLowerCase() || "";
        const titleMatch = `${post?.title || ""}`.trim() === `${activity?.title || ""}`.trim();
        return authorToken === userToken && titleMatch;
      }) || null
    );
  };

  const mergedPosts = usePlaceholderPosts
    ? externalPosts && externalPosts.length > 0
      ? [...externalPosts, ...initialPosts]
      : initialPosts
    : externalPosts || [];
  const feedFromPosts = mergedPosts
    .filter((post) => post.author && post.author !== selfLabel)
    .map((post) => ({
      id: post.id,
      postId: post.id,
      name: post.author,
      action: "Post",
      text: post.body,
      likes: post.likes ?? 0,
      replies: post.replies ?? 0,
      comments: post.comments || [],
      likedByMe: Boolean(post.likedByMe),
      time: post.time || "now",
      pinned: false,
    }));
  const baseFriendsFeed = usePlaceholderPosts ? feed : feedFromPosts;
  const sortedPosts = [...mergedPosts].sort((a, b) => {
    const aPinned = pinnedById[a.id] ?? a.pinned ?? false;
    const bPinned = pinnedById[b.id] ?? b.pinned ?? false;
    if (aPinned === bPinned) return 0;
    return aPinned ? -1 : 1;
  });
  const shownPosts = socialExpanded ? sortedPosts : sortedPosts.slice(0, 3);
  const sortedFriends = [...baseFriendsFeed].sort((a, b) => {
    const aPinned = friendPinnedById[a.id] ?? a.pinned ?? false;
    const bPinned = friendPinnedById[b.id] ?? b.pinned ?? false;
    if (aPinned === bPinned) return 0;
    return aPinned ? -1 : 1;
  });
  const shownFeed = friendsExpanded ? sortedFriends : sortedFriends.slice(0, 3);

  const steps = { current: 10500, goal: 10000 };
  const stepsComplete = steps.current >= steps.goal;

  const homeWeekly = [
    { label: "Mon", status: "green" },
    { label: "Tue", status: "yellow" },
    { label: "Wed", status: "green" },
    { label: "Thu", status: "yellow" },
    { label: "Fri", status: "red" },
    { label: "Sat", status: "green" },
    { label: "Sun", status: "yellow" },
  ];
  const homeMonthly = [
    { label: "Jan 1–7", status: "green" },
    { label: "Jan 8–14", status: "yellow" },
    { label: "Jan 15–21", status: "yellow" },
    { label: "Jan 22–28", status: "green" },
  ];
  const homeYearly = [
    { label: "Jan", status: "green" },
    { label: "Feb", status: "yellow" },
    { label: "Mar", status: "empty" },
    { label: "Apr", status: "empty" },
    { label: "May", status: "empty" },
    { label: "Jun", status: "empty" },
    { label: "Jul", status: "empty" },
    { label: "Aug", status: "empty" },
    { label: "Sep", status: "empty" },
    { label: "Oct", status: "empty" },
    { label: "Nov", status: "empty" },
    { label: "Dec", status: "empty" },
  ];
  const homeProgress =
    homeRange === "monthly" ? homeMonthly : homeRange === "yearly" ? homeYearly : homeWeekly;
  const goalTrackerTotal = homeProgress.filter((d) => d.status !== "empty").length;
  const goalTrackerDone = homeProgress.filter((d) => d.status === "green").length;
  const goalTrackerLabel =
    homeRange === "monthly" ? "monthly goals" : homeRange === "yearly" ? "yearly goals" : "weekly goals";
  const progressRangeLabel =
    homeRange === "monthly" ? "Monthly" : homeRange === "yearly" ? "Yearly" : "Weekly";

  const users = [
    {
      id: 2,
      name: "Marco Diaz",
      handle: "@marco",
      avatar: "M",
      bio: "Meal prep & hypertrophy split.",
      followers: 305,
      following: 221,
      streak: 9,
      workouts: 64,
      consistency: [
        { day: "Sat", status: "yellow" },
        { day: "Sun", status: "yellow" },
        { day: "Mon", status: "yellow" },
        { day: "Tue", status: "yellow" },
        { day: "Wed", status: "yellow" },
        { day: "Thu", status: "yellow" },
        { day: "Fri", status: "yellow" },
      ],
      weeklyHours: [
        { week: "Jan 20–26", hours: 6.2 },
        { week: "Jan 27–Feb 2", hours: 7.8 },
        { week: "Feb 3–9", hours: 5.4 },
      ],
      monthlyHours: [
        { week: "Jan 1–7", hours: 6.2 },
        { week: "Jan 8–14", hours: 7.8 },
        { week: "Jan 15–21", hours: 5.4 },
        { week: "Jan 22–28", hours: 6.9 },
      ],
      yearlyHours: [
        { week: "Jan 1–31", hours: 22.3 },
        { week: "Feb 1–28", hours: 19.4 },
        { week: "Mar 1–31", hours: 24.1 },
        { week: "Apr 1–30", hours: 18.6 },
      ],
      activity: [
        {
          type: "post",
          title: "Bench PR + accessories",
          body: "Hit 185x3 and finished with rows + core. Felt strong today.",
          time: "2h",
          likes: 14,
          replies: 3,
        },
        {
          type: "meal",
          title: "Meal prep",
          body: "Chicken bowls: 42g protein • 520 kcal per box.",
          time: "6h",
          likes: 22,
          replies: 5,
        },
      ],
    },
    {
      id: 3,
      name: "Priya Singh",
      handle: "@priya",
      avatar: "P",
      bio: "Walking daily and keeping it simple.",
      followers: 278,
      following: 310,
      streak: 6,
      workouts: 42,
      consistency: [
        { day: "Sat", status: "yellow" },
        { day: "Sun", status: "yellow" },
        { day: "Mon", status: "yellow" },
        { day: "Tue", status: "yellow" },
        { day: "Wed", status: "yellow" },
        { day: "Thu", status: "yellow" },
        { day: "Fri", status: "yellow" },
      ],
      weeklyHours: [
        { week: "Jan 20–26", hours: 3.8 },
        { week: "Jan 27–Feb 2", hours: 4.6 },
        { week: "Feb 3–9", hours: 5.1 },
      ],
      monthlyHours: [
        { week: "Jan 1–7", hours: 3.8 },
        { week: "Jan 8–14", hours: 4.6 },
        { week: "Jan 15–21", hours: 5.1 },
        { week: "Jan 22–28", hours: 4.2 },
      ],
      yearlyHours: [
        { week: "Jan 1–31", hours: 12.4 },
        { week: "Feb 1–28", hours: 15.1 },
        { week: "Mar 1–31", hours: 16.0 },
        { week: "Apr 1–30", hours: 13.8 },
      ],
      activity: [
        {
          type: "post",
          title: "Walk + stretch",
          body: "20 min walk and 10 min mobility. Keeping it consistent.",
          time: "3h",
          likes: 9,
          replies: 2,
        },
        {
          type: "meal",
          title: "Greek yogurt bowl",
          body: "Yogurt + berries + honey. Simple and hits protein.",
          time: "1d",
          likes: 6,
          replies: 1,
        },
      ],
    },
  ];
  const personalProfile = {
    name: activeUser.name,
    handle: activeUser.handle,
    bio: personalBio,
    followers: 412,
    following: 198,
    streak: 12,
    workouts: 86,
    avatar: (activeUser.displayName || activeUser.name || "A").charAt(0).toUpperCase(),
    avatarSrc: userAvatarSrc,
    consistency: [
      { day: "Sat", status: "yellow" },
      { day: "Sun", status: "green" },
      { day: "Mon", status: "yellow" },
      { day: "Tue", status: "green" },
      { day: "Wed", status: "yellow" },
      { day: "Thu", status: "red" },
      { day: "Fri", status: "green" },
    ],
    weeklyHours: [
      { week: "Jan 20–26", hours: 5.2 },
      { week: "Jan 27–Feb 2", hours: 6.8 },
      { week: "Feb 3–9", hours: 4.9 },
    ],
    monthlyHours: [
      { week: "Jan 1–7", hours: 5.2 },
      { week: "Jan 8–14", hours: 6.8 },
      { week: "Jan 15–21", hours: 4.9 },
      { week: "Jan 22–28", hours: 6.1 },
    ],
    yearlyHours: [
      { week: "Jan 1–31", hours: 20.4 },
      { week: "Feb 1–28", hours: 18.9 },
      { week: "Mar 1–31", hours: 0 },
      { week: "Apr 1–30", hours: 0 },
    ],
    activity: [
      {
        type: "post",
        title: "Lower body day",
        body: "Split squats + RDLs. Felt steady.",
        time: "1h",
        likes: 11,
        replies: 2,
      },
      {
        type: "meal",
        title: "High-protein lunch",
        body: "Chicken bowl: 38g protein • 480 kcal.",
        time: "5h",
        likes: 18,
        replies: 4,
      },
    ],
  };
  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.handle}`.toLowerCase().includes(userQuery.toLowerCase())
  );
  const renderAvatar = (user, className) => {
    if (user?.avatarSrc) {
      return (
        <div className={className}>
          <img src={user.avatarSrc} alt="" className="avatarImage" />
        </div>
      );
    }
    return <div className={className}>{user?.avatar || user?.name?.[0] || "U"}</div>;
  };

  return (
    <div className="screenBody">
      <div className="welcomeRow">
        <button
          className="welcomeAvatarBtn"
          aria-label="Your profile"
          onClick={() => {
            setProfileOpen((v) => !v);
            setDiscoverOpen(false);
            setSelectedUser(null);
          }}
        >
          <img src={userAvatarSrc} alt="" className="welcomeAvatar" />
        </button>
        <div className="welcomeText">
          <div className="welcomeDate">{headerDate}</div>
          <div className="welcomeTitle">Hi, {activeUser.displayName}</div>
        </div>
        <div className="welcomeActions">
          <button
            className="focusBtn iconBtn topIconBtn"
            aria-label="Discover"
            onClick={() => {
              setDiscoverOpen((v) => !v);
              setSelectedUser(null);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16.5 16.5 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="focusBtn iconBtn topIconBtn"
            aria-label="Settings"
            onClick={() => {
              setSettingsOpen(true);
              setDiscoverOpen(false);
              setProfileOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8 3.5a7.9 7.9 0 0 0-.1-1l2-1.5-2-3.4-2.4.9a8 8 0 0 0-1.7-1l-.3-2.6H9.5l-.3 2.6a8 8 0 0 0-1.7 1l-2.4-.9-2 3.4 2 1.5a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.4 2.4-.9c.5.4 1.1.7 1.7 1l.3 2.6h4.9l.3-2.6c.6-.3 1.2-.6 1.7-1l2.4.9 2-3.4-2-1.5c.1-.3.1-.7.1-1z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div className="settingsScreen" role="dialog" aria-modal="true">
          <div className="profileScreenHeader">
            <button className="backBtn" onClick={() => setSettingsOpen(false)} aria-label="Back">
              ←
            </button>
            <div className="profileScreenTitle">Settings</div>
            <div className="profileScreenSpacer" />
          </div>
          <div className="settingsBody">
            <div className={`settingsSection ${settingsExpanded.profile ? "expanded" : ""}`}>
              <button
                type="button"
                className="settingsHeader"
                aria-expanded={settingsExpanded.profile}
                onClick={() => toggleSettingsSection("profile")}
              >
                <span className="settingsIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="9" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 20c1.8-3 5-4.5 8-4.5s6.2 1.5 8 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="settingsTitle">Profile</span>
                <span className="settingsArrow">›</span>
              </button>
              {settingsExpanded.profile && (
                <div className="settingsContent">
                  <input
                    className="input"
                    type="email"
                    autoComplete="off"
                    value={accountEmail}
                    readOnly
                  />
                  <input
                    className="input"
                    type="password"
                    autoComplete="off"
                    value={accountPassword}
                    readOnly
                  />
                  <button
                    className="primaryBtn"
                    type="button"
                    onClick={() => {
                      setSettingsOpen(false);
                      onLogout?.();
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>

            <div className={`settingsSection ${settingsExpanded.biometrics ? "expanded" : ""}`}>
              <button
                type="button"
                className="settingsHeader"
                aria-expanded={settingsExpanded.biometrics}
                onClick={() => toggleSettingsSection("biometrics")}
              >
                <span className="settingsIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 4h12v16H6z" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M9 7h3M9 10h3M9 13h3M9 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="settingsTitle">Biometrics</span>
                <span className="settingsArrow">›</span>
              </button>
              {settingsExpanded.biometrics && (
                <div className="settingsContent">
                  <div className="row">
                    <input className="input" placeholder="Height (ft)" />
                    <input className="input" placeholder="in" />
                  </div>
                  <div className="row">
                    <input className="input" placeholder="Height (cm)" />
                    <input className="input" placeholder="Weight (lbs)" />
                  </div>
                  <div className="row">
                    <input className="input" placeholder="Weight (kg)" />
                  </div>
                </div>
              )}
            </div>

            <div className={`settingsSection ${settingsExpanded.goals ? "expanded" : ""}`}>
              <button
                type="button"
                className="settingsHeader"
                aria-expanded={settingsExpanded.goals}
                onClick={() => toggleSettingsSection("goals")}
              >
                <span className="settingsIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </span>
                <span className="settingsTitle">Goals</span>
                <span className="settingsArrow">›</span>
              </button>
              {settingsExpanded.goals && (
                <div className="settingsContent">
                  <input className="input" placeholder="Calories (kcal)" />
                  <div className="row">
                    <input className="input" placeholder="Protein (%)" />
                    <input className="input" placeholder="Carbs (%)" />
                  </div>
                  <div className="row">
                    <input className="input" placeholder="Fat (%)" />
                  </div>
                </div>
              )}
            </div>

            <div className={`settingsSection ${settingsExpanded.micro ? "expanded" : ""}`}>
              <button
                type="button"
                className="settingsHeader"
                aria-expanded={settingsExpanded.micro}
                onClick={() => toggleSettingsSection("micro")}
              >
                <span className="settingsIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M10 4h4M12 4v6l4.5 7.5a3 3 0 0 1-2.6 4.5h-3.8a3 3 0 0 1-2.6-4.5L12 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="settingsTitle">Micronutrients</span>
                <span className="settingsArrow">›</span>
              </button>
              {settingsExpanded.micro && (
                <div className="settingsContent">
                  <div className="row">
                    <input className="input" placeholder="Fiber (g)" />
                    <input className="input" placeholder="Sodium (mg)" />
                  </div>
                  <div className="row">
                    <input className="input" placeholder="Vitamin D (IU)" />
                    <input className="input" placeholder="Iron (mg)" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="profileScreen" role="dialog" aria-modal="true">
          <div className="profileScreenHeader">
            <button className="backBtn" onClick={() => setProfileOpen(false)} aria-label="Back">
              ←
            </button>
            <div className="profileScreenTitle">{selfLabel}</div>
            <div className="profileScreenSpacer" />
          </div>
          <div className="profileScreenBody">
            <div className="profileHeader">
              {renderAvatar(personalProfile, "profileAvatar")}
              <div>
                <div className="profileTitle">{personalProfile.name}</div>
                <div className="profileHandle">{personalProfile.handle}</div>
                <div className="profileEmail">{accountEmail}</div>
              </div>
            </div>
            <div className="profileBio">{personalProfile.bio}</div>
            <div className="profileSection">
              <div className="profileSectionTitle">Edit bio</div>
              <textarea
                className="input profileBioInput"
                value={personalBio}
                onChange={(e) => setPersonalBio(e.target.value)}
                rows={3}
                maxLength={180}
                placeholder="Tell people about your fitness goals"
              />
            </div>
            <div className="profileStats">
              <div className="profileStat">
                <div className="statNum">{personalProfile.followers}</div>
                <div className="statLabel">Followers</div>
              </div>
              <div className="profileStat">
                <div className="statNum">{personalProfile.following}</div>
                <div className="statLabel">Following</div>
              </div>
              <div className="profileStat">
                <div className="statNum">{personalProfile.workouts}</div>
                <div className="statLabel">Workouts</div>
              </div>
              <div className="profileStat">
                <div className="statNum">{personalProfile.streak}</div>
                <div className="statLabel">Streak</div>
              </div>
            </div>
            <div className="profileSection">
              <div className="profileSectionTitleRow">
                <div className="profileSectionTitle">Workout hours</div>
                <div className="rangeTabs">
                  <button className={`rangeTab ${personalRange === "weekly" ? "active" : ""}`} onClick={() => setPersonalRange("weekly")}>Weekly</button>
                  <button className={`rangeTab ${personalRange === "monthly" ? "active" : ""}`} onClick={() => setPersonalRange("monthly")}>Monthly</button>
                  <button className={`rangeTab ${personalRange === "yearly" ? "active" : ""}`} onClick={() => setPersonalRange("yearly")}>Yearly</button>
                </div>
              </div>
              <div className={`hoursChart ${personalRange}`}>
                {(personalRange === "monthly"
                  ? personalProfile.monthlyHours
                  : personalRange === "yearly"
                  ? personalProfile.yearlyHours
                  : personalProfile.weeklyHours
                ).map((h, i) => (
                  <div key={`ph-${i}`} className="hoursBar">
                    <div className="hoursValue">{h.hours.toFixed(1)}h</div>
                    <div className="hoursFill" style={{ height: `${Math.min(h.hours / 10, 1) * 100}%` }} />
                    <div className="hoursLabel">{h.week}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="profileSection">
              <div className="profileSectionTitle">Activity</div>
              <div className="activityFeed">
                {personalProfile.activity.map((a, i) => (
                  <button
                    key={`pa-${i}`}
                    className="activityCard"
                    onClick={() => {
                      const linkedPost = getActivityPost(personalProfile, a);
                      setActivityOpen({
                        user: personalProfile,
                        activity: a,
                        key: linkedPost?.id ? `act-post-${linkedPost.id}` : `act-me-${i}`,
                        postId: linkedPost?.id || null,
                      });
                    }}
                  >
                    <div className="activityHeader">
                      {renderAvatar(personalProfile, "activityAvatar")}
                      <div className="activityMeta">
                        <div className="activityName">{personalProfile.name}</div>
                        <div className="activityTime">{a.time}</div>
                      </div>
                    </div>
                    <div className="activityTitle">{a.title}</div>
                    <div className="activityText">{a.body}</div>
                    {a.type === "meal" && <div className="activityImage">Meal prep photo</div>}
                    <div className="activityStats">
                      <span>{a.likes} likes</span>
                      <span>{a.replies} replies</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {discoverOpen && (
        <>
          <div className="sectionTitle">Discover</div>
          <div className="discoverPanel">
            <div className="discoverSearch">
              <input
                className="discoverInput"
                placeholder="Search users..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>
            <div className="discoverList">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  className={`userCard ${selectedUser?.id === u.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedUser(u);
                    setProfilePageUser(u);
                  }}
                >
                  <div className="userAvatar">{u.name[0]}</div>
                  <div className="userInfo">
                    <div className="userName">{u.name}</div>
                    <div className="userHandle">{u.handle}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="profilePanel">
              {selectedUser ? (
                <>
                  <div className="profileHeader">
                    {renderAvatar(selectedUser, "profileAvatar")}
                    <div>
                      <div className="profileTitle">{selectedUser.name}</div>
                      <div className="profileHandle">{selectedUser.handle}</div>
                    </div>
                  </div>
                  <div className="profileBio">{selectedUser.bio}</div>
                  <div className="profileStats">
                    <div className="profileStat">
                      <div className="statNum">{selectedUser.followers}</div>
                      <div className="statLabel">Followers</div>
                    </div>
                    <div className="profileStat">
                      <div className="statNum">{selectedUser.following}</div>
                      <div className="statLabel">Following</div>
                    </div>
                    <div className="profileStat">
                      <div className="statNum">{selectedUser.streak}</div>
                      <div className="statLabel">Streak</div>
                    </div>
                    <div className="profileStat">
                      <div className="statNum">{selectedUser.workouts}</div>
                      <div className="statLabel">Workouts</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="profileEmpty">Select a user to view their profile</div>
              )}
            </div>
          </div>
        </>
      )}

      {profilePageUser && (
        <div className="profileScreen" role="dialog" aria-modal="true">
          <div className="profileScreenHeader">
            <button
              className="backBtn"
              onClick={() => setProfilePageUser(null)}
              aria-label="Back"
            >
              ←
            </button>
            <div className="profileScreenTitle">Profile</div>
            <div className="profileScreenSpacer" />
          </div>

          <div className="profileScreenBody">
            <div className="profileHeader">
              {renderAvatar(profilePageUser, "profileAvatar")}
              <div>
                <div className="profileTitle">{profilePageUser.name}</div>
                <div className="profileHandle">{profilePageUser.handle}</div>
              </div>
            </div>
            <div className="profileBio">{profilePageUser.bio}</div>

            <div className="profileStats">
              <div className="profileStat">
                <div className="statNum">{profilePageUser.followers}</div>
                <div className="statLabel">Followers</div>
              </div>
              <div className="profileStat">
                <div className="statNum">{profilePageUser.following}</div>
                <div className="statLabel">Following</div>
              </div>
              <div className="profileStat">
                <div className="statNum">{profilePageUser.workouts}</div>
                <div className="statLabel">Workouts</div>
              </div>
              <div className="profileStat">
                <div className="statNum">{profilePageUser.streak}</div>
                <div className="statLabel">Streak</div>
              </div>
            </div>

            <div className="profileSection">
              <div className="profileSectionTitleRow">
                <div className="profileSectionTitle">Workout hours</div>
                <div className="rangeTabs">
                  <button className={`rangeTab ${profileRange === "weekly" ? "active" : ""}`} onClick={() => setProfileRange("weekly")}>Weekly</button>
                  <button className={`rangeTab ${profileRange === "monthly" ? "active" : ""}`} onClick={() => setProfileRange("monthly")}>Monthly</button>
                  <button className={`rangeTab ${profileRange === "yearly" ? "active" : ""}`} onClick={() => setProfileRange("yearly")}>Yearly</button>
                </div>
              </div>
              <div className={`hoursChart ${profileRange}`}>
                {(profileRange === "monthly"
                  ? profilePageUser.monthlyHours
                  : profileRange === "yearly"
                  ? profilePageUser.yearlyHours
                  : profilePageUser.weeklyHours
                ).map((h, i) => (
                  <div key={`h-${i}`} className="hoursBar">
                    <div className="hoursValue">{h.hours.toFixed(1)}h</div>
                    <div className="hoursFill" style={{ height: `${Math.min(h.hours / 10, 1) * 100}%` }} />
                    <div className="hoursLabel">{h.week}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="profileSection">
              <div className="profileSectionTitle">Activity</div>
              <div className="activityFeed">
                {profilePageUser.activity.map((a, i) => (
                  <button
                    key={`a-${i}`}
                    className="activityCard"
                    onClick={() => {
                      const linkedPost = getActivityPost(profilePageUser, a);
                      setActivityOpen({
                        user: profilePageUser,
                        activity: a,
                        key: linkedPost?.id
                          ? `act-post-${linkedPost.id}`
                          : `act-${profilePageUser.id}-${i}`,
                        postId: linkedPost?.id || null,
                      });
                    }}
                  >
                    <div className="activityHeader">
                      {renderAvatar(profilePageUser, "activityAvatar")}
                      <div className="activityMeta">
                        <div className="activityName">{profilePageUser.name}</div>
                        <div className="activityTime">{a.time}</div>
                      </div>
                    </div>
                    <div className="activityTitle">{a.title}</div>
                    <div className="activityText">{a.body}</div>
                    {a.type === "meal" && (
                      <div className="activityImage">Meal prep photo</div>
                    )}
                    <div className="activityStats">
                      <span>{a.likes} likes</span>
                      <span>{a.replies} replies</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              className={`followBtn ${followRequested[profilePageUser.id] ? "requested" : ""}`}
              onClick={() =>
                setFollowRequested((prev) => ({
                  ...prev,
                  [profilePageUser.id]: !prev[profilePageUser.id],
                }))
              }
            >
              {followRequested[profilePageUser.id] ? "Requested" : "Follow"}
            </button>
          </div>
        </div>
      )}

      {activityOpen && (
        <div className="activityScreen" role="dialog" aria-modal="true">
          <div className="profileScreenHeader">
            <button
              className="backBtn"
              onClick={() => setActivityOpen(null)}
              aria-label="Back"
            >
              ←
            </button>
            <div className="profileScreenTitle">Post</div>
            <div className="profileScreenSpacer" />
          </div>
          <div className="profileScreenBody">
            <div className="activityCard detail">
              <div className="activityHeader">
                {renderAvatar(activityOpen.user, "activityAvatar")}
                <div className="activityMeta">
                  <div className="activityName">{activityOpen.user.name}</div>
                  <div className="activityTime">{activityOpen.activity.time}</div>
                </div>
              </div>
              <div className="activityTitle">{activityOpen.activity.title}</div>
              <div className="activityText">{activityOpen.activity.body}</div>
              {activityOpen.activity.type === "meal" && (
                <div className="activityImage">Meal prep photo</div>
              )}
              <div className="postStats">
                <span>
                  {(activityOpen.activity.likes ?? 0) + (activityLiked[activityOpen.key] ? 1 : 0)} likes
                </span>
                <span>
                  {(activityOpen.activity.replies ?? 0) +
                    (activityRepliesByKey[activityOpen.key]?.length || 0)}{" "}
                  replies
                </span>
              </div>
            </div>

            <div className="focusActions">
              <button
                className={`focusBtn iconBtn ${activityLiked[activityOpen.key] ? "liked" : ""}`}
                aria-label="Like"
                onClick={() => {
                  const nextLiked = !activityLiked[activityOpen.key];
                  setActivityLiked((prev) => ({ ...prev, [activityOpen.key]: nextLiked }));
                  if (activityOpen.postId) {
                    onTogglePostLike?.(activityOpen.postId, nextLiked);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 20s-7-4.35-7-9.2C5 7 6.9 5 9.3 5c1.6 0 2.7.9 2.7.9S13.1 5 14.7 5C17.1 5 19 7 19 10.8 19 15.65 12 20 12 20z"
                    fill={activityLiked[activityOpen.key] ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="replyBox">
              <input
                className="replyInput"
                placeholder="Write a reply..."
                value={activityReplyDrafts[activityOpen.key] || ""}
                onChange={(e) =>
                  setActivityReplyDrafts((prev) => ({ ...prev, [activityOpen.key]: e.target.value }))
                }
              />
              <button
                className="replySend"
                onClick={() => sendActivityReply(activityOpen.key, activityOpen.postId)}
              >
                Send
              </button>
            </div>

            {activityRepliesByKey[activityOpen.key]?.length > 0 && (
              <div className="replyList">
                {activityRepliesByKey[activityOpen.key].map((text, idx) => (
                  <div key={`${activityOpen.key}-${idx}`} className="replyItem">
                    <span className="replyAuthor">{selfLabel}</span>
                    <span className="replyText">{text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="homeHeader">
        <div className="streakBadge">
          <div className="streakNum">12</div>
          <div className="streakLabel">current streak</div>
        </div>
        <div className="streakBadge tracker">
          <div className="streakNum">
            {goalTrackerDone}/{goalTrackerTotal}
          </div>
          <div className="streakLabel">{goalTrackerLabel}</div>
        </div>
      </div>

      <div className="heroCard calendarCard">
        <div className="calendarHeader">
          <div>
            <div className="heroLabel">{progressRangeLabel} Progress</div>
            <div className="calendarTitle">Progress</div>
          </div>
          <div className="rangeTabs">
            <button className={`rangeTab ${homeRange === "weekly" ? "active" : ""}`} onClick={() => setHomeRange("weekly")}>Weekly</button>
            <button className={`rangeTab ${homeRange === "monthly" ? "active" : ""}`} onClick={() => setHomeRange("monthly")}>Monthly</button>
            <button className={`rangeTab ${homeRange === "yearly" ? "active" : ""}`} onClick={() => setHomeRange("yearly")}>Yearly</button>
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

        <div className={`calendarGrid ${homeRange}`} aria-label="Progress calendar">
          {homeProgress.map((d, i) => (
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
          const persistedReplies = (post.comments || [])
            .filter((comment) => comment?.body)
            .map((comment) => toReplyModel(comment, post.author || "User"));
          const localReplies = (postRepliesById[post.id] || []).map((text) => ({
            author: selfLabel,
            text,
          }));
          const combinedReplies = [...persistedReplies, ...localReplies];
          const isPinned = pinnedById[post.id] ?? post.pinned ?? false;
          const baselineLiked = Boolean(post.likedByMe);
          const localLiked = postLiked[post.id];
          const effectiveLiked = localLiked ?? baselineLiked;
          const likeDelta =
            localLiked == null
              ? 0
              : effectiveLiked === baselineLiked
              ? 0
              : effectiveLiked
              ? 1
              : -1;
          const postLikeCount =
            (post.likes ?? 0) +
            likeDelta +
            (postRepliesById[post.id]?.reduce((acc, _, idx) => {
              const key = `post-${post.id}-${idx}`;
              const nested = replyRepliesByKey[key]?.length || 0;
              return acc + nested;
            }, 0) || 0);
          const postReplyCount =
            (post.replies ?? 0) +
            localReplies.length +
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
              <div className="postAuthor">{post.author === "You" ? selfLabel : post.author}</div>
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
                    effectiveLiked ? "liked" : ""
                  }`}
                  aria-label="Like"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePostLike(post.id, effectiveLiked);
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 20s-7-4.35-7-9.2C5 7 6.9 5 9.3 5c1.6 0 2.7.9 2.7.9S13.1 5 14.7 5C17.1 5 19 7 19 10.8 19 15.65 12 20 12 20z"
                      fill={effectiveLiked ? "currentColor" : "none"}
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
            {combinedReplies.length > 0 && (
              <div className="replyList">
                {(postExpandedReplies[post.id]
                  ? combinedReplies
                  : combinedReplies.slice(0, 1)
                ).map((reply, idx) => (
                  <div key={`${post.id}-reply-${reply.id || idx}`} className="replyItem">
                    <span className="replyAuthor">
                      {reply.author === "You" ? selfLabel : reply.author}
                    </span>
                    <span className="replyText">{reply.text}</span>
                    {(() => {
                      const replyKey = reply.id ? `comment-${reply.id}` : `post-${post.id}-${idx}`;
                      const effectiveReplyLiked = replyLikes[replyKey] ?? Boolean(reply.likedByMe);
                      const nestedReplies = [
                        ...((reply.replies || []).map((nested) => ({
                          id: nested.id || null,
                          author: nested.author || selfLabel,
                          text: nested.text || nested.body || "",
                          likedByMe: Boolean(nested.likedByMe),
                        })) || []),
                        ...((replyRepliesByKey[replyKey] || []).map((text) => ({
                          id: null,
                          author: selfLabel,
                          text,
                          likedByMe: false,
                        })) || []),
                      ];
                      return (
                        <>
                          <div className="replyActionsRow">
                            <button
                              className={`replyActionBtn ${effectiveReplyLiked ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReplyLike(replyKey, effectiveReplyLiked, reply.id);
                              }}
                            >
                              ♥ {effectiveReplyLiked ? "Liked" : "Like"}
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
                                onClick={() => sendReplyToReply(replyKey, post.id, reply.id)}
                              >
                                Send
                              </button>
                            </div>
                          )}
                          {nestedReplies.length > 0 && (
                            <div className="replyThread">
                              {(postExpandedReplies[post.id]
                                ? nestedReplies
                                : nestedReplies.slice(0, 1)
                              ).map((r, rIdx) => {
                                const nestedKey = r.id ? `comment-${r.id}` : `${replyKey}-sub-${rIdx}`;
                                const nestedLiked = replyLikes[nestedKey] ?? Boolean(r.likedByMe);
                                return (
                                <div key={nestedKey} className="replyItem nested">
                                  <span className="replyAuthor">
                                    {r.author === "You" ? selfLabel : r.author}
                                  </span>
                                  <span className="replyText">{r.text}</span>
                                  <div className="replyActionsRow">
                                    <button
                                      className={`replyActionBtn ${
                                        nestedLiked ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleReplyLike(nestedKey, nestedLiked, r.id);
                                      }}
                                    >
                                      ♥ {nestedLiked ? "Liked" : "Like"}
                                    </button>
                                  </div>
                                </div>
                              )})}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ))}
                {combinedReplies.length > 1 && (
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
          const postId = p.postId || null;
          const persistedReplies = (p.comments || [])
            .filter((comment) => comment?.body)
            .map((comment) => toReplyModel(comment, p.name || "User"));
          const localReplies = (repliesById[p.id] || []).map((text) => ({
            author: selfLabel,
            text,
          }));
          const combinedReplies = [...persistedReplies, ...localReplies];
          const baselineLiked = Boolean(p.likedByMe);
          const localLiked = liked[p.id];
          const effectiveLiked = localLiked ?? baselineLiked;
          const likeDelta =
            localLiked == null
              ? 0
              : effectiveLiked === baselineLiked
              ? 0
              : effectiveLiked
              ? 1
              : -1;
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
                    likeDelta +
                    (repliesById[p.id]?.reduce((acc, _, idx) => {
                      const key = `feed-${p.id}-${idx}`;
                      const nested = replyRepliesByKey[key]?.length || 0;
                      return acc + nested;
                    }, 0) || 0)}{" "}
                  likes
                </span>
                <span>
                  {(p.replies ?? 0) +
                    localReplies.length +
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
                      effectiveLiked ? "liked" : ""
                    }`}
                    aria-label="Like"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(p.id, postId, effectiveLiked);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 20s-7-4.35-7-9.2C5 7 6.9 5 9.3 5c1.6 0 2.7.9 2.7.9S13.1 5 14.7 5C17.1 5 19 7 19 10.8 19 15.65 12 20 12 20z"
                        fill={effectiveLiked ? "currentColor" : "none"}
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
                  <button className="replySend" onClick={() => sendReply(p.id, postId)}>
                    Send
                  </button>
                </div>
              )}
              {combinedReplies.length > 0 && (
                <div className="replyList">
                {(expandedReplies[p.id]
                  ? combinedReplies
                  : combinedReplies.slice(0, 1)
                ).map((reply, idx) => (
                  <div key={`${p.id}-reply-${reply.id || idx}`} className="replyItem">
                    <span className="replyAuthor">
                      {reply.author === "You" ? selfLabel : reply.author}
                    </span>
                    <span className="replyText">{reply.text}</span>
                    {(() => {
                      const replyKey = reply.id ? `comment-${reply.id}` : `feed-${p.id}-${idx}`;
                      const effectiveReplyLiked = replyLikes[replyKey] ?? Boolean(reply.likedByMe);
                      const nestedReplies = [
                        ...((reply.replies || []).map((nested) => ({
                          id: nested.id || null,
                          author: nested.author || selfLabel,
                          text: nested.text || nested.body || "",
                          likedByMe: Boolean(nested.likedByMe),
                        })) || []),
                        ...((replyRepliesByKey[replyKey] || []).map((text) => ({
                          id: null,
                          author: selfLabel,
                          text,
                          likedByMe: false,
                        })) || []),
                      ];
                      return (
                        <>
                          <div className="replyActionsRow">
                            <button
                              className={`replyActionBtn ${effectiveReplyLiked ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReplyLike(replyKey, effectiveReplyLiked, reply.id);
                              }}
                            >
                              ♥ {effectiveReplyLiked ? "Liked" : "Like"}
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
                                onClick={() => sendReplyToReply(replyKey, postId, reply.id)}
                              >
                                Send
                              </button>
                            </div>
                          )}
                          {nestedReplies.length > 0 && (
                            <div className="replyThread">
                              {(expandedReplies[p.id]
                                ? nestedReplies
                                : nestedReplies.slice(0, 1)
                              ).map((r, rIdx) => {
                                const nestedKey = r.id ? `comment-${r.id}` : `${replyKey}-sub-${rIdx}`;
                                const nestedLiked = replyLikes[nestedKey] ?? Boolean(r.likedByMe);
                                return (
                                <div key={nestedKey} className="replyItem nested">
                                  <span className="replyAuthor">
                                    {r.author === "You" ? selfLabel : r.author}
                                  </span>
                                  <span className="replyText">{r.text}</span>
                                  <div className="replyActionsRow">
                                    <button
                                      className={`replyActionBtn ${
                                        nestedLiked ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleReplyLike(nestedKey, nestedLiked, r.id);
                                      }}
                                    >
                                      ♥ {nestedLiked ? "Liked" : "Like"}
                                    </button>
                                  </div>
                                </div>
                              )})}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ))}
                  {combinedReplies.length > 1 && (
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
