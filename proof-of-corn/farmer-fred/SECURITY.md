# Security Documentation - Farmer Fred

## Overview

Farmer Fred includes security measures to protect against prompt injection attacks, spam, and unauthorized access while maintaining transparency.

## Security Features

### 1. Prompt Injection Detection

Automatically detects and flags emails containing:
- Instruction manipulation attempts ("ignore previous instructions", "system:", "[INST]")
- Jailbreak attempts ("pretend you are", "act as")
- Data exfiltration attempts ("show me all emails", "dump database")
- Action manipulation ("send money", "transfer funds", "delete all")

**Detection confidence**: 0-1 scale
**Recommendations**: "allow", "flag", or "block"

### 2. Rate Limiting

- **Per-sender limit**: 10 emails per 24 hours
- **Global limit**: 50 new emails per day
- Prevents flood attacks from Hacker News trolls or spam bots

### 3. Spam Detection

Calculates spam score based on:
- Excessive capitalization in subject
- Excessive exclamation marks
- Common spam phrases ("you've won", "claim your", "nigerian prince")

### 4. Email Redaction

Public views show redacted information:
- **Email addresses**: `david@purdue.edu` → `d***@p***.edu`
- **Phone numbers**: Masked as `***-***-****`
- **URLs**: Simplified to `[domain]`
- **Bodies**: Truncated to 150-200 characters

## API Endpoints

### Public Endpoint (No Auth Required)

**`GET /inbox/public`**

Returns redacted inbox suitable for public display:
- Email addresses redacted
- Bodies sanitized and truncated
- Suspicious/spam emails hidden
- Shows security threat levels (but not details)

Example response:
```json
{
  "emails": [
    {
      "id": "email-123",
      "from": "d***@p***.edu",
      "subject": "Proof of Corn Partnership",
      "summary": "Saw your challenge and have some background in this space...",
      "receivedAt": "2026-01-26T10:00:00Z",
      "status": "unread",
      "category": "lead"
    }
  ],
  "summary": {
    "total": 15,
    "unread": 3,
    "leads": 5,
    "suspicious": 2
  }
}
```

### Admin Endpoint (Auth Required)

**`GET /admin/inbox`**

Requires authentication header:
```bash
curl https://farmer-fred.sethgoldstein.workers.dev/admin/inbox \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD"
```

Returns full unredacted inbox:
- Complete email addresses
- Full email bodies
- ALL emails including suspicious/blocked ones
- Full security check details

Example response:
```json
{
  "emails": [
    {
      "id": "email-123",
      "from": "david@purdue.edu",
      "subject": "Proof of Corn Partnership",
      "body": "Full unredacted email body...",
      "receivedAt": "2026-01-26T10:00:00Z",
      "status": "unread",
      "category": "lead",
      "securityCheck": {
        "isSafe": true,
        "threat": "none",
        "confidence": 0,
        "flaggedPatterns": [],
        "recommendation": "allow"
      }
    }
  ],
  "summary": {
    "total": 15,
    "unread": 3,
    "leads": 5,
    "suspicious": 2,
    "blocked": 1
  }
}
```

## Setup Instructions

### 1. Set Admin Password

The admin password is stored as a Cloudflare Worker secret (never in code):

```bash
# Production
cd farmer-fred
wrangler secret put ADMIN_PASSWORD
# Enter a strong password when prompted

# Development (.dev.vars file)
echo "ADMIN_PASSWORD=your-dev-password-here" >> .dev.vars
```

### 2. Grant Admin Access

Share the admin password with:
- Seth Goldstein (sethgoldstein@gmail.com)
- Fred Wilson (if he wants behind-the-scenes access)
- Other trusted team members as needed

**Do not**:
- Commit the password to git
- Share it publicly
- Include it in website code

### 3. Accessing Admin Dashboard

From the browser:
```javascript
// In browser console or via admin dashboard UI
const response = await fetch('https://farmer-fred.sethgoldstein.workers.dev/admin/inbox', {
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_PASSWORD'
  }
});
const data = await response.json();
console.log(data);
```

From command line:
```bash
curl https://farmer-fred.sethgoldstein.workers.dev/admin/inbox \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD"
```

## Security Best Practices

### What's Public vs Private

**✅ Public (Transparent)**:
- Email count and categories
- Redacted sender addresses (d***@p***.edu)
- Sanitized email summaries
- Fred's categorization reasoning
- Response status (replied, pending)
- General security threat counts

**❌ Private (Admin Only)**:
- Full email addresses
- Complete email bodies
- Personal phone numbers
- Suspicious email content
- Specific injection patterns detected
- Raw security check results

### Handling Suspicious Emails

When Fred flags an email as suspicious:
1. **Email is hidden** from public view
2. **Email is shown** in admin dashboard with full security details
3. **Fred won't auto-respond** until human approves
4. **Logged** for security monitoring

Admin can then:
- **Approve**: Mark as safe, allow Fred to respond
- **Block**: Permanently ignore sender
- **Report**: Flag as actual attack attempt

## Monitoring

Check for security incidents:

```bash
# View all suspicious emails (admin only)
curl https://farmer-fred.sethgoldstein.workers.dev/admin/inbox \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" \
  | jq '.emails[] | select(.category == "suspicious")'
```

## Future Enhancements

Planned security improvements:
- [ ] Email domain validation (SPF/DKIM checks)
- [ ] Throwaway email detection
- [ ] Multi-factor authentication for admin access
- [ ] Security incident notifications (email/Slack)
- [ ] IP-based rate limiting
- [ ] Machine learning spam classifier

## Security Disclosure

If you find a security vulnerability:
1. **Do not** post publicly on Hacker News or GitHub Issues
2. **Email**: sethgoldstein@gmail.com with subject "Proof of Corn Security"
3. Include: Vulnerability description, reproduction steps, impact assessment
4. We'll respond within 48 hours

Responsible disclosure is appreciated! 🙏
