# SigndUp

**Disposable inboxes for those pesky one-time signups. Keep your main inbox clean and your credentials organized.**

![SigndUp Banner](https://raw.githubusercontent.com/your-repo/path-to-banner.png)

## Demo

> [!NOTE]
> *User-provided video placeholder goes here. The video demonstrates the seamless flow of generating an inbox, receiving an OTP, and saving credentials.*

<!-- Replace with your video file -->
<!-- <video src="path/to/your/video.mp4" controls width="100%"></video> -->

---

## Why SigndUp?

### 1. Purpose: Kill the Spam
We've all been there—a site forces you to sign up just to see one thing. SigndUp gives you **instant disposable inboxes** so you never have to give away your real email again. No more marketing spam, no more data breaches in your main account.

### 2. USP: Credentials Without the Headache
Unlike other temporary mail services where you lose access once the tab is closed, SigndUp **saves your credentials**. Your temporary email and generated password are tied to your unique User ID, allowing you to "log back in" to those one-time accounts whenever you need.

### 3. Convenience: Stay in the Flow
SigndUp is **site-aware**. You don't need to leave the page or switch tabs to manage your disposable accounts. The extension automatically detects the website you're on and surfaces the relevant saved credentials or lets you generate a new one instantly.

---

## Features

- **Instant Inbox Generation**: Powered by [Mail.tm](https://mail.tm/), get a working email address in seconds.
- **OTP Auto-Detection**: Our built-in OTP listener automatically extracts codes from incoming emails—no need to scroll through raw text.
- **Encrypted Storage**: Your credentials (email + password) are encrypted locally and stored securely in [Supabase](https://supabase.com/).
- **User ID Session**: Use a simple User ID to sync your data across sessions. No complex password resets or email verifications needed.
- **Premium UI/UX**: A minimalist, clean interface built with React and Tailwind CSS.

---

## Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Email API**: [Mail.tm](https://mail.tm/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/SigndUp.git
   cd SigndUp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_USERID_SALT=your_random_salt_for_encryption
   ```

4. **Build the extension:**
   ```bash
   npm run build
   ```

5. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (top right).
   - Click **Load unpacked** and select the `dist` folder.

---

## Security & Privacy

We value your privacy. Your passwords are encrypted before they ever leave your browser, using your User ID as part of the derivation key. Only you can access your saved credentials.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Built with ❤️ for a cleaner web.*
