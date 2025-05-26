# 🔒 Focus Guard

**Focus Guard** is a Chrome extension designed to help students stay focused by monitoring and filtering YouTube videos. It automatically flags or closes tabs containing content unrelated to competitive exams like **JEE** or **NEET**, helping users avoid distractions and stay productive.

## 🎯 Features

- 🔍 Analyzes YouTube video titles in real-time.
- ✅ Allows only JEE/NEET-related content.
- 🚫 Flags or closes irrelevant YouTube tabs.
- ⚙️ Runs in the background with minimal system usage.

## 🧠 Use Case

Ideal for:
- Students preparing for JEE/NEET.
- Parents or mentors managing children's online study habits.
- Productivity-focused Chrome users.

## 🚀 Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode**.
4. Click **Load Unpacked** and select the extension folder.
5. The Focus Guard icon will appear in your toolbar.

## 📝 How It Works

Focus Guard uses a list of keywords and basic natural language filtering to:
- Check if the video title contains exam-related terms.
- Automatically act on tabs not matching the criteria.

You can customize the keywords list by modifying the `allowed_keywords` in the source code.

## 📷 Screenshots

*(Add screenshots of your extension UI and example filtered tabs here)*

## 🛠️ Tech Stack

- JavaScript
- Chrome Extensions API
- Regex-based filtering
- (Optional: AI keyword matching planned in future)

## 📄 License

