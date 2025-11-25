# How VibeCon Works

## ✅ What It Does NOW (Updated Version)

Your app is a **real-time voice English tutor** that:

1. **Listens to you speak** in English via your microphone
2. **Transcribes your speech** using OpenAI Whisper (embedded in the Realtime API)
3. **Analyzes your speech** using your custom tutor instructions
4. **Responds with voice** using OpenAI's text-to-speech
5. **Shows the conversation** on screen as you talk
6. **Saves the dialog** - you can download it as a text file

## 🎯 How to Use It

### Step 1: Open the App
Go to: **https://vibecon-tutor.vercel.app**

### Step 2: Start Conversation
- Click the **"Start Conversation"** button
- Allow microphone access when your browser asks
- Wait for status to say **"Connected! Listening..."**

### Step 3: Speak!
- Just start talking in English
- The app will automatically detect when you stop speaking (Voice Activity Detection)
- Your speech will appear as text in the conversation history
- The AI tutor will respond with:
  - Voice feedback (you'll hear it)
  - Text transcript (you'll see it)
  - Corrections and tips
  - Phrasal verbs and suggestions

### Step 4: Continue the Dialog
- Keep speaking when the tutor finishes
- The conversation flows naturally
- Everything is logged on screen

### Step 5: Save Your Progress
- Click **"📥 Download"** to save the conversation as a text file
- Click **"🗑 Clear"** to start fresh

## 🔊 Voice Controls

- **🎤 Mute** - Temporarily mute your microphone (AI can't hear you)
- **⏹ End** - Stop the conversation and disconnect

## 🧠 What the AI Tutor Does

Based on your instructions, the tutor will:

- **Correct your mistakes** (grammar, vocabulary, pronunciation)
- **Teach phrasal verbs** in context
- **Give natural expressions** for business and lifestyle topics
- **Ask follow-up questions** to keep you talking
- **Provide examples** of how to use new words/phrases
- **Focus on business English** (marketing, product, analytics, growth)
- **Practice lifestyle topics** (travel, health, relationships, hobbies)

## 🎓 Sample Conversation Flow

**You:** "Hi! I want to practice my English today..."

**AI Tutor (voice):** "Hey Ilya! Great to hear from you. What would you like to focus on today - business and marketing stuff, or more lifestyle topics like travel or daily life?"

**You:** "Let's do some business English..."

**AI Tutor:** "Perfect! Let me ask you this - when was the last time you had to pitch an idea to your team? Tell me about what happened and how it went. Try to speak for about a minute..."

*(Conversation continues with corrections and tips)*

## 🔧 Technical Details

### What's Happening Under the Hood:

1. **WebRTC Connection** - Direct peer-to-peer audio streaming to OpenAI
2. **OpenAI Realtime API** - Handles voice recognition and generation in real-time
3. **Whisper Transcription** - Converts your speech to text automatically
4. **GPT-4o-realtime** - The AI model that understands and responds
5. **Server VAD** - Voice Activity Detection (knows when you stop talking)
6. **Event Stream** - Real-time events for transcripts, responses, and status

### API Key Security:
- Your OpenAI API key is stored securely in Vercel environment variables
- Never exposed to the browser
- Only used server-side to generate session tokens

## 🐛 Troubleshooting

### "Not answering" or "Nothing happens"?

**Check these:**

1. **Microphone Permission** - Make sure you allowed access
2. **Browser Console** - Press F12 and check for errors
3. **HTTPS Required** - The app only works over HTTPS (Vercel handles this)
4. **Speak Clearly** - The Voice Activity Detection needs clear audio
5. **Wait for Status** - Make sure it says "Listening..." before you speak

### Common Issues:

**Issue:** Connection fails
- **Fix:** Check your internet connection
- **Fix:** Try refreshing the page
- **Fix:** Check OpenAI API key is valid and has credits

**Issue:** AI doesn't respond
- **Fix:** Speak louder or longer (VAD needs to detect speech)
- **Fix:** Check browser console for errors (F12)
- **Fix:** Make sure status says "Listening..." not "Connecting..."

**Issue:** No transcripts showing
- **Fix:** This was fixed in the latest version! Refresh the page.

## 📱 Browser Compatibility

**Best Experience:**
- Chrome/Edge (latest versions)
- Desktop or mobile

**Supported:**
- Safari (macOS/iOS)
- Firefox

**Requirements:**
- WebRTC support
- HTTPS connection
- Microphone access

## 💾 Conversation Storage

- Conversations are stored **in browser memory only**
- When you refresh the page, they're gone
- Use the **Download** button to save permanently
- Downloaded as `.txt` file with timestamps

## 🚀 What's Next?

Possible improvements:
- Save conversations to a database
- Add voice selection (different AI voices)
- Add language detection for Russian responses
- Speaking speed control
- Vocabulary tracking
- Progress reports

## 📊 Cost Estimate

Using OpenAI Realtime API:
- ~$0.06 per minute of audio input
- ~$0.24 per minute of audio output
- A 10-minute conversation costs roughly **$3**

Make sure your OpenAI account has sufficient credits!

---

**Built for Ilya | Deployed on Vercel | Powered by OpenAI Realtime API**

