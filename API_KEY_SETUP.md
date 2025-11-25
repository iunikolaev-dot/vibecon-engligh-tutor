# Fixing the 401 Unauthorized Error

## 🔍 What the Error Means

```
❌ Connection failed: OpenAI API error: 401
```

**401 = Unauthorized** - This means your API key is either:
1. Invalid or expired
2. Doesn't have access to the Realtime API
3. Has billing issues (no credits)
4. Is being rejected by OpenAI for some other reason

---

## ✅ How to Fix

### Step 1: Check Your OpenAI Account

1. Go to: https://platform.openai.com/
2. Log in to your account
3. Check these things:

#### A. API Key Status
- Go to: https://platform.openai.com/api-keys
- Look for your key (starts with `sk-proj-...`)
- Check if it says "Active" or "Expired"
- If expired or missing → Create a new key

#### B. Billing & Credits
- Go to: https://platform.openai.com/usage
- Check if you have credits left
- Realtime API is expensive (~$0.36/minute)
- If no credits → Add payment method and credits

#### C. Realtime API Access
- The Realtime API requires:
  - ✅ Paid account (not free tier)
  - ✅ Active billing
  - ✅ API key with proper permissions
- Not all accounts have Realtime API access yet (it's in beta)

---

### Step 2: Create a Fresh API Key

**If your key is old or expired:**

1. Go to: https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it: "VibeCon Realtime API"
4. **Permissions:** Make sure "All" or "Realtime" is selected
5. Copy the key (starts with `sk-proj-...`)
6. **Save it securely** - you can't see it again!

---

### Step 3: Update the Key in Vercel

Once you have a new key:

```bash
cd /Users/ilyanikolaev/Desktop/Vibecon

# Remove old key
vercel env rm OPENAI_API_KEY production

# Add new key (paste your new key when prompted)
vercel env add OPENAI_API_KEY production

# Redeploy
vercel --prod
```

---

### Step 4: Test the Key Locally

Before deploying, test if your key works:

```bash
# Replace YOUR_KEY_HERE with your actual key
curl https://api.openai.com/v1/realtime/sessions \
  -H "Authorization: Bearer YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-realtime-preview-2024-12-17",
    "voice": "alloy"
  }'
```

**Expected response:** JSON with session info
**If 401:** Key is invalid or doesn't have Realtime API access

---

## 🔍 Specific Issues

### Issue 1: "Realtime API not available"

**Cause:** Your account doesn't have Realtime API access

**Solution:**
- The Realtime API is in beta
- Not all paid accounts have access
- You may need to join a waitlist or request access
- Check OpenAI's documentation for current availability

---

### Issue 2: Empty Error Message

```
{ "error": { "message": "", "type": "", "code": "", "param": "" } }
```

**Cause:** This usually means:
- The API key format is wrong
- The endpoint URL is incorrect
- Network/CORS issue
- Ephemeral token expired before use

**Solution:**
- Make sure you're using the full API key (starts with `sk-proj-`)
- Check that the model name is correct
- Try generating a fresh session token

---

### Issue 3: Key Works for Other APIs, Not Realtime

**Cause:** Your key has limited permissions

**Solution:**
1. Go to API keys settings
2. Check your key's permissions
3. Make sure "Realtime" or "All" is enabled
4. If not → Create a new key with correct permissions

---

## 📋 Quick Checklist

Before asking for help, check:

- [ ] I have a paid OpenAI account
- [ ] I have billing set up with credits
- [ ] My API key is active (not expired)
- [ ] My key has Realtime API permissions
- [ ] I can make OTHER API calls (like chat completions)
- [ ] The key is correctly set in Vercel environment variables
- [ ] I've deployed after updating the key

---

## 🚀 After Fixing

Once you have a valid key:

1. Update it in Vercel (Step 3 above)
2. Redeploy: `vercel --prod`
3. Wait 1 minute for deployment
4. Refresh the app in your browser
5. Try "Start Conversation" again

You should see better error messages now with the new logging!

---

## 🆘 Still Not Working?

### Check the new debug output:

After deploying the latest version, the debug panel will show:

```
📦 Session response: {"object":"realtime.session"...}
✅ Session token received: ek_abc123...
❌ SDP Response status: 401
❌ SDP Response body: {...actual error...}
❌ Request was to: https://api.openai.com/v1/realtime?model=...
❌ Auth header: Bearer ek_...
```

**Share this output** and I can see exactly what's failing!

---

## 💡 Alternative: Use a Different API

If Realtime API doesn't work, we could switch to:

**Option A: Text-based API**
- Use regular Chat Completions API (much cheaper)
- Type instead of speak
- Still get the English tutor functionality

**Option B: Separate Audio APIs**
- Whisper API for speech-to-text
- GPT-4 for analysis
- TTS API for responses
- More complex but more reliable

Let me know if you want to switch approaches!

---

**Updated:** After adding detailed error logging

