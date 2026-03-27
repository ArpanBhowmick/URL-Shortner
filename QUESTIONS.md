# Q2222

## Question

When deleting shortened URLs from history, both "Delete from the History" and "URL not found (may have expired)" toasts appear at the same time.

## Root Cause

In `FrontEnd/url_shortner/src/components/History.jsx`, the `handleDelete` function was missing a `return` statement after the 404 error case. This caused the code to continue executing and show both error and success toasts.

**Original buggy code:**

```javascript
if (!res.ok) {
  if (res.status === 404) {
    toast.error("URL not found (may have expired)");
    // ❌ Missing return - code continues to run below
  } else {
    toast.error("Failed to delete from server");
    return;
  }
}

const updatedHistory = history.filter((_, i) => i !== index);
setHistory(updatedHistory);
localStorage.setItem("shortedHistory", JSON.stringify(updatedHistory));
toast.success("Deleted from history!");  // ← This also executes
```

## How to Fix

Update the `handleDelete` function in `History.jsx` with proper branching:

```javascript
if (!res.ok) {
  toast.error("URL not found (may have expired)");
} else {
  toast.success("Deleted from history!");
}

const updatedHistory = history.filter((_, i) => i !== index);
setHistory(updatedHistory);
localStorage.setItem("shortedHistory", JSON.stringify(updatedHistory));
```

This ensures:
- **404 case**: Shows error toast, removes from local history
- **Success case**: Shows success toast, removes from local history

Both cases clean up the local history (removing stale entries) but show only one appropriate toast message.

---

## Code Review

### Current Code Status: ✅ MOSTLY CORRECT (Minor Improvements Recommended)

The main bug has been fixed. However, there are minor improvements recommended below.

### Current Code

```javascript
if (!res.ok) {
  toast.error("URL not found (may have expired)");
} else {
  toast.success("Deleted from history!");
}

const updatedHistory = history.filter((_, i) => i !== index);
setHistory(updatedHistory);
localStorage.setItem("shortedHistory", JSON.stringify(updatedHistory));
```

### Verification

| Issue | Status | Notes |
|-------|--------|-------|
| Both toasts showing | ✅ Fixed | Only one toast now shows based on response |
| History removal | ✅ Correct | Both success and error cases remove from local history |
| LocalStorage sync | ✅ Correct | `shortedHistory` key updated after state change |

---

## Recommended Improvements

### 1. Error Message Handling

**Issue:** The error message "URL not found (may have expired)" is shown for any non-OK response, but the server might return other status codes (like 500 - Server Error).

**Current code:**
```javascript
if (!res.ok) {
  toast.error("URL not found (may have expired)");
}
```

**Recommended fix:**
```javascript
if (!res.ok) {
  const errorMessages = {
    404: "URL not found (may have expired)",
    500: "Server error - please try again",
    503: "Service unavailable - please try again later",
  };
  const message = errorMessages[res.status] || "Failed to delete from server";
  toast.error(message);
}
```

---

### 2. ShortCode Extraction (Already Good)

**Current code (lines 17-20):**
```javascript
const shortCode = new URL(shortUrl).pathname
  .split("/")
  .filter(Boolean)
  .pop();
```

This is already robust and handles edge cases better than `shortUrl.split("/").pop()`. **No change needed.**

---

## Summary of Recommended Fix

Replace the toast section in `handleDelete` with:

```javascript
const res = await fetch(
  `${import.meta.env.VITE_API_URL}/delete/${shortCode}`,
  {
    method: "DELETE",
  },
);

if (!res.ok) {
  const errorMessages = {
    404: "URL not found (may have expired)",
    500: "Server error - please try again",
    503: "Service unavailable - please try again later",
  };
  const message = errorMessages[res.status] || "Failed to delete from server";
  toast.error(message);
} else {
  toast.success("Deleted from history!");
}

const updatedHistory = history.filter((_, i) => i !== index);
setHistory(updatedHistory);
localStorage.setItem("shortedHistory", JSON.stringify(updatedHistory));
```

This provides user-friendly, status-specific error messages while keeping the same behavior.
