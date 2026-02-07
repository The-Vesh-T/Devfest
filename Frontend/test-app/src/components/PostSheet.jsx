import { useState } from "react";

export default function PostSheet({ open, onClose, onPost }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  if (!open) return null;

  const submit = () => {
    if (onPost) {
      onPost({
        title: title.trim() || "Post",
        body: body.trim(),
      });
    }
    setTitle("");
    setBody("");
    onClose();
  };

  return (
    <div className="sheetBackdrop" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheetHandle" />
        <div className="sheetHeader">
          <div className="sheetTitle">Create post</div>
          <button className="xBtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <input
          className="input"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input"
          rows={4}
          placeholder="Share your update..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="primaryBtn" onClick={submit}>
          Post
        </button>
      </div>
    </div>
  );
}
