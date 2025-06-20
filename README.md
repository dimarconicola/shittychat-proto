# shittychat
ShittyChat is a real-time conversational intelligence app designed to help people navigate emotionally charged or difficult conversations, both during and after they occur.

# Project Overview

## 1️⃣ The Problem It Addresses

We often don’t realize how we sound in the moment, leading to relationship breakdowns, workplace tension, and missed coaching opportunities.

## 2️⃣ Key Features

### Real-time feedback:
- Tone "thermometer" (e.g. heated vs calm)
- Stats: talk-time balance, interruptions, acknowledgment frequency
- Subtle haptic or visual nudges during live conversations

### Post-conversation analysis:
- Emotional timeline
- Highlighted emotionally intense moments
- Reflection prompts without judgment or scoring

### Gamification elements:
- Badges, empathy streaks, clarity points
- Avoids competition — fully private and opt-out capable

### Multiple user flows:
- Solo reflection
- Partner mode (mutual consent)
- Coaching and therapy support
- Possible future extensions: role-play, journaling, asynchronous review, etc.

## 3️⃣ Target Audience

- **Primary**: emotionally self-aware individuals & couples (25-45), therapists, coaches
- **Secondary**: HR professionals, educators, DEI trainers
- **Tertiary**: wellness startups, research institutions, B2B platforms

## 4️⃣ Market Position

- Sits at the intersection of:
  - Mental wellness apps (Calm, Headspace, Paired)
  - Coaching platforms
  - Early-stage voice-based emotional AI (largely underserved)
- No strong existing mainstream competitor currently analyzing live spoken conversations in this way

## 5️⃣ Business Models

- **Model 1**: Freemium consumer app + B2B licensing for coaches/therapists
- **Model 2**: Pay-per-minute usage model, especially for infrequent or episodic users
- Flexible hybrid monetization depending on user behavior

## 6️⃣ Technology Stack

- **Speech-to-text**: Whisper (on-device), fallback cloud STT for older devices
- **Emotion analysis**: Hugging Face models, fine-tuned sentiment models, GPT-4 for nuanced reflection
- **Prosody features**: openSMILE for non-verbal audio markers
- **App stack**: React Native + real-time charting libraries
- **Privacy focus**: local processing default, no storage unless opted-in

## 7️⃣ Roadmap

**18-month phased approach:**
1. MVP with local analysis and post-chat reflection
2. Live real-time nudges
3. Therapist/coach collaborative tools
4. Platform integrations and B2B expansion
