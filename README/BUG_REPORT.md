# URL Shortener - Complete Bug Report

## Bug #1: TTL Index Not Working

### Severity: HIGH
### Status: BROKEN

**Description:**
The MongoDB TTL (Time-To-Live) index is incorrectly configured, causing URLs to never expire even when expiry date is set.

**Location:** `BackEnd/Models/Url.js:17-23`

**Current Code:**
```javascript
expireAt: {
  type: Date,
  default: null,
  expires: 0,  // BUG: Wrong configuration
},
```

**Problem:**
- `expires: 0` tells MongoDB to delete documents 0 seconds after creation
- This ignores the `expireAt` field entirely
- Documents with `expireAt = null` are never touched by TTL

**Fix:**
```javascript
expireAt: {
  type: Date,
  default: null,
  index: { expires: 'expireAt' }  // MongoDB deletes when time passes this value
},
```

**Verification:**
```bash
# Check if TTL index exists
mongosh
> use URL_Shortner
> db.url_shortners.getIndexes()
# Should show: { "expireAt": 1 } with expireAfterSeconds
```

---

## Bug #2: Variable Name Mismatch

### Severity: CRITICAL
### Status: CRASH

**Description:**
The `getOriginalUrl` function uses an undefined variable, causing crashes on errors.

**Location:** `BackEnd/Controller/urlController.js:95-98`

**Current Code:**
```javascript
} catch (error) {
  console.error(err);  // 'err' is not defined!
  res.status(500).json({ message: "Server error" });
}
```

**Problem:**
- Parameter is named `error`
- Code uses `err`
- JavaScript throws `ReferenceError: err is not defined`

**Fix:**
```javascript
} catch (error) {
  console.error(error);  // Use correct variable name
  res.status(500).json({ message: "Server error" });
}
```

---

## Bug #3: Expired URLs Still Redirect

### Severity: HIGH
### Status: BROKEN

**Description:**
Expired URLs are still accessible and redirect users to potentially outdated content.

**Location:** `BackEnd/Controller/urlController.js:82-94`

**Current Code:**
```javascript
export const getOriginalUrl = async (req, res) => {
  const shortCode = req.params.shortCode;
  
  const originalUrl = await Url.findOne({ shortCode });

  if (originalUrl) {
    res.redirect(originalUrl.longUrl);  // No expiry check!
  } else {
    res.status(404).json({ message: "Invalid shortcode" });
  }
};
```

**Problem:**
- Never checks `expireAt` field
- Redirects even if URL has expired
- Users see outdated content

**Fix:**
```javascript
export const getOriginalUrl = async (req, res) => {
  try {
    const shortCode = req.params.shortCode;
    
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    // Check if URL has expired
    if (url.expireAt && new Date() > url.expireAt) {
      return res.status(410).json({ message: "This link has expired" });
    }

    res.redirect(url.longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
```

---

## Bug #4: NPM Script Wrong Path

### Severity: MEDIUM
### Status: BROKEN

**Description:**
The root package.json points to wrong folder name.

**Location:** `package.json:6`

**Current Code:**
```json
"server": "cd backend && nodemon server.js"
```

**Problem:**
- Folder is named `BackEnd` (capital B)
- Command uses `backend` (lowercase)
- Works on Mac/Linux, fails on Windows

**Fix:**
```json
"server": "cd BackEnd && nodemon server.js"
```

---

## Bug #5: API Errors Not Handled

### Severity: MEDIUM
### Status: BROKEN

**Description:**
API service swallows errors without returning them.

**Location:** `FrontEnd/url_shortner/src/components/services/api.js:28-31`

**Current Code:**
```javascript
} catch (err) {
  console.error(err);
  // Nothing returned or thrown!
}
```

**Problem:**
- Calling code can't tell if API failed
- User sees generic error even for specific issues
- No retry logic possible

**Fix:**
```javascript
} catch (err) {
  console.error(err);
  throw err;  // Re-throw so caller can handle
}
```

---

## Bug #6: Delete Doesn't Check Response

### Severity: MEDIUM
### Status: BROKEN

**Description:**
History delete removes item from UI even if server delete failed.

**Location:** `FrontEnd/url_shortner/src/components/History.jsx:22-31`

**Current Code:**
```javascript
const res = await fetch(`${import.meta.env.VITE_API_URL}/${shortCode}`, {
  method: "DELETE",
});

// No res.ok check!
const updatedHistory = history.filter((_, i) => i !== index);
setHistory(updatedHistory);
```

**Problem:**
- Item removed from localStorage and UI
- Server might have failed to delete
- Data inconsistency

**Fix:**
```javascript
const res = await fetch(`${import.meta.env.VITE_API_URL}/${shortCode}`, {
  method: "DELETE",
});

if (!res.ok) {
  const error = await res.json();
  throw new Error(error.message || "Failed to delete");
}

const updatedHistory = history.filter((_, i) => i !== index);
setHistory(updatedHistory);
localStorage.setItem("shortedHistory", JSON.stringify(updatedHistory));
```

---

## Bug #7: No URL Validation

### Severity: MEDIUM
### Status: BROKEN

**Description:**
No validation that `longUrl` is a valid URL format.

**Location:** `BackEnd/Controller/urlController.js:6-13`

**Current Code:**
```javascript
export const shortUrl = async (req, res) => {
  let { longUrl, customSlug, expiryDays } = req.body;
  longUrl = longUrl?.trim();

  if (!longUrl) return res.status(400).json({ message: "URL required" });
  
  // No format validation!
  // ...
};
```

**Problem:**
- Invalid URLs like "not-a-url" are stored
- Malicious URLs like "javascript:alert(1)" are accepted
- Database contains garbage data

**Fix:**
```javascript
// Add URL validation function
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_) {
    return false;
  }
};

export const shortUrl = async (req, res) => {
  let { longUrl, customSlug, expiryDays } = req.body;
  longUrl = longUrl?.trim();

  if (!longUrl) {
    return res.status(400).json({ message: "URL required" });
  }

  if (!isValidUrl(longUrl)) {
    return res.status(400).json({ message: "Invalid URL format" });
  }
  // ...
};
```

---

## Bug Summary

| # | Bug | Severity | Impact |
|---|-----|----------|--------|
| 1 | TTL Index | HIGH | URLs never expire |
| 2 | Variable Name | CRITICAL | Server crashes |
| 3 | No Expiry Check | HIGH | Expired URLs work |
| 4 | Wrong Path | MEDIUM | npm script fails |
| 5 | API Errors | MEDIUM | Poor UX |
| 6 | Delete Check | MEDIUM | Data inconsistency |
| 7 | No Validation | MEDIUM | Invalid data |

---

## Recommended Fix Order

1. **Bug #2** (Variable) - Prevents crashes
2. **Bug #1** (TTL) - Core feature broken
3. **Bug #3** (Expiry) - Security issue
4. **Bug #4** (Path) - Developer experience
5. **Bug #7** (Validation) - Security
6. **Bug #5** (API errors) - UX
7. **Bug #6** (Delete check) - Data integrity
