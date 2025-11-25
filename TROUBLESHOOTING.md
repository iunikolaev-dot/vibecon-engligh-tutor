# Troubleshooting VibeCon

## 🔧 NEW: Debug Panel

The latest version includes a **Debug Panel** that shows you exactly what's happening!

### How to Use Debug Panel:

1. Open the app: https://vibecon-tutor.vercel.app
2. Click "Start Conversation"
3. Click **"Show Debug"** button (top right of status box)
4. Watch the debug console to see real-time events

### What You Should See:

When everything works correctly, you'll see events like:

```
[time] 🔌 Starting connection...
[time] 📡 Requesting session token...
[time] ✅ Session token received
[time] 🔗 Creating WebRTC connection...
[time] 🎤 Requesting microphone access...
[time] ✅ Microphone connected
[time] 📋 Creating offer...
[time] 📡 Connecting to gpt-4o-realtime-preview-2024-12-17...
[time] ✅ WebRTC connection established
[time] ✅ Data channel opened!
[time] 📤 Sending session configuration...
[time] 👋 Requesting initial greeting...
[time] 📨 Event: session.created
[time] 📨 Event: session.updated
[time] 🤖 AI response started
[time] 🔊 AI started speaking
[time] 🗣️ AI transcript: "Hey Ilya! What would you like to focus on today?"
[time] ✅ AI response completed
```

Then when you speak:

```
[time] 🎤 You started speaking
[time] 🛑 You stopped speaking
[time] 📝 Your transcript: "Hi, let's practice business English"
[time] 🤖 AI response started
[time] 🔊 AI started speaking
...
```

## 📊 Status Indicators

The app now shows **color-coded status** with a pulsing dot:

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Ready/Idle | AI is ready, waiting for you to speak |
| 🔵 Blue (pulsing) | You Speaking | Your microphone is active, AI is listening |
| 🟠 Orange | Speech Ended | You stopped speaking, processing... |
| 🟣 Purple (pulsing) | AI Thinking | AI is analyzing and preparing response |
| 🔵 Indigo (pulsing) | AI Speaking | AI is responding with voice |
| 🟡 Yellow (pulsing) | Connecting | Establishing connection |
| 🔴 Red | Error | Something went wrong |

## ❌ Common Problems & Solutions

### Problem 1: Connection Fails

**Debug panel shows:**
```
❌ Connection failed: OpenAI API error: 401
```

**Solution:** 
- Your API key is invalid or expired
- Check in Vercel dashboard: Environment Variables
- Update `OPENAI_API_KEY` with a fresh key

---

### Problem 2: No Microphone Access

**Debug panel shows:**
```
🎤 Requesting microphone access...
❌ Connection failed: Permission denied
```

**Solution:**
- Browser blocked microphone
- Click the 🔒 lock icon in address bar
- Allow microphone access
- Refresh page and try again

---

### Problem 3: AI Connects but Doesn't Greet

**Debug panel shows:**
```
✅ Data channel opened!
📤 Sending session configuration...
👋 Requesting initial greeting...
📨 Event: session.created
📨 Event: session.updated
(then nothing...)
```

**Solution:**
- API might be rate-limited or having issues
- Check OpenAI status: https://status.openai.com
- Wait 30 seconds and click "End" then "Start Conversation" again

---

### Problem 4: You Speak but No Transcription

**Debug panel shows:**
```
✅ AI response completed
(you speak but no 🎤 event appears)
```

**Solutions:**

**A. Microphone not working:**
- Test your microphone in another app
- Make sure you're not muted in system settings
- Try a different browser (Chrome recommended)

**B. Voice Activity Detection too sensitive:**
- Speak louder and more clearly
- Speak for at least 2-3 seconds
- Make sure there's silence BEFORE you speak

**C. Speak longer:**
- The VAD (Voice Activity Detection) needs clear speech
- Try speaking for 5+ seconds continuously
- Background noise can interfere

---

### Problem 5: Transcript Shows But AI Doesn't Respond

**Debug panel shows:**
```
🎤 You started speaking
🛑 You stopped speaking
📝 Your transcript: "Hello"
(then nothing - no 🤖 AI response started)
```

**Solution:**
- This is a bug with the Realtime API
- The turn_detection might not be triggering response.create
- **Workaround:** Speak longer (10+ seconds) to give more content
- The initial greeting should work - if it does, the API is working

---

### Problem 6: Audio Plays But No Transcript Shown

**Debug panel shows:**
```
🔊 AI started speaking
(you hear the voice but no transcript appears)
```

**Solution:**
- The audio works but transcript events are missing
- This is normal for some responses
- The important part is you can HEAR the AI
- The transcript is a bonus for review

---

### Problem 7: API Rate Limit Error

**Debug panel shows:**
```
❌ Error: Rate limit exceeded
```

**Solution:**
- You've used up your OpenAI API quota
- Check usage at: https://platform.openai.com/usage
- Add credits to your OpenAI account
- Wait for your monthly reset

---

### Problem 8: Session Expires Mid-Conversation

**Debug panel shows:**
```
❌ Error: Session expired
```

**Solution:**
- Realtime API sessions have time limits
- Click "End Conversation"
- Click "Start Conversation" again
- Continue from where you left off

---

## 🎯 Testing the Connection

### Quick Test Sequence:

1. **Click "Start Conversation"**
   - Watch for: ✅ Data channel opened!
   - Status should show: "Connected! Waiting..."

2. **Wait for AI greeting (5-10 seconds)**
   - Watch for: 🤖 AI response started
   - Watch for: 🔊 AI started speaking
   - You should HEAR: "Hey Ilya! What would you like to focus on..."
   - Status should pulse purple → indigo → green

3. **Speak for 5+ seconds**
   - Watch for: 🎤 You started speaking (blue pulse)
   - Keep talking...
   - Then STOP and wait silently
   - Watch for: 🛑 You stopped speaking
   - Watch for: 📝 Your transcript
   - Wait for: 🤖 AI response started

4. **Listen to AI response**
   - Status should pulse purple (thinking) → indigo (speaking)
   - You should hear the voice
   - You should see the transcript appear

### If Any Step Fails:

- **Step 1 fails:** API/network issue → check internet, refresh
- **Step 2 fails:** API not responding → check OpenAI status, check API key
- **Step 3 fails:** Microphone issue → check permissions, try different browser
- **Step 4 fails:** Turn detection issue → speak longer, clearer

---

## 🔍 Advanced Debugging

### Browser Console (F12):

Open Developer Tools (F12) and check Console tab for:

- Red errors (show these to support/developer)
- Network tab → check `/api/session` call (should return 200)
- Look for WebRTC errors

### Network Check:

```bash
# Test if the API endpoint is accessible
curl https://vibecon-tutor.vercel.app/api/session
```

Should return JSON with `client_secret.value`

---

## 💰 Cost Monitoring

The Realtime API is expensive! Monitor your usage:

1. Go to: https://platform.openai.com/usage
2. Check "Realtime API" costs
3. Set up billing alerts

**Typical costs:**
- 1-minute conversation: ~$0.30
- 10-minute conversation: ~$3
- 1-hour practice: ~$18

---

## 🆘 Still Not Working?

If nothing works:

1. **Try in Chrome/Edge** (best WebRTC support)
2. **Try on a different device** (phone vs computer)
3. **Check OpenAI API status:** https://status.openai.com
4. **Share your debug log:**
   - Click "Show Debug"
   - Screenshot the debug console
   - Share with support

---

## ✅ Success Checklist

When everything works, you'll see:

- ✅ Green "Ready" status after connecting
- ✅ Blue pulse when you speak
- ✅ Your transcript appears in conversation
- ✅ Purple pulse while AI thinks
- ✅ Indigo pulse + voice when AI speaks
- ✅ AI transcript appears in conversation
- ✅ Back to green "Listening..." status

**This is the full working flow!**

---

## 📱 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Best | Recommended |
| Edge | ✅ Best | Chromium-based |
| Safari | ⚠️ Good | Some WebRTC quirks |
| Firefox | ⚠️ OK | Limited WebRTC support |
| Mobile Safari | ⚠️ Good | iOS 14.3+ |
| Mobile Chrome | ✅ Good | Android |

---

**Updated:** After version with comprehensive status tracking
**App:** https://vibecon-tutor.vercel.app

