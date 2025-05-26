let selectedExam = "JEE"; // Default exam, updated via message

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "setExam") {
    selectedExam = message.exam;
    sendResponse({ status: "ok" });
  }
});

let youtubeClosedCount = 0;

function saveCount() {
  chrome.storage.local.set({ youtubeClosedCount });
}

function loadCount() {
  chrome.storage.local.get("youtubeClosedCount", (result) => {
    if (result.youtubeClosedCount !== undefined)
      youtubeClosedCount = result.youtubeClosedCount;
  });
}
loadCount();

function isYouTubeVideoUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("youtube.com") && parsed.pathname === "/watch";
  } catch (e) {
    return false;
  }
}

async function checkWithAI(title, exam) {
  const prompt = `
You are an expert educational assistant. Your task is to answer strictly "yes" or "no".

Is the following YouTube video relevant for students preparing for the "${exam}" exam?

- Answer "yes" if the topic is part of the ${exam} syllabus, even if it also mentions other exams like NEET.
- Answer "no" only if the topic is completely unrelated to the ${exam} syllabus.
- Do not explain your answer.

Title: "${title}"
`.trim();



  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 1,
        max_tokens: 20,
        stream: false
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim().toLowerCase();
    console.log("📺 Title:", title);
    console.log("🤖 AI Response:", reply);

    return reply?.startsWith("yes");
  } catch (err) {
    console.error("❌ Groq API error:", err);
    return false;
  }
}

async function checkYouTubeTabs() {
  const tabs = await chrome.tabs.query({ url: "*://*.youtube.com/*" });

  for (const tab of tabs) {
    if (!tab.title || !isYouTubeVideoUrl(tab.url)) continue;

    const isRelated = await checkWithAI(tab.title, selectedExam);
    if (!isRelated) {
      console.log(`🚫 Closing unrelated tab: ${tab.title}`);
      try {
        await chrome.tabs.remove(tab.id);
        incrementClosedCount();
      } catch (e) {
        console.warn("⚠️ Failed to close tab:", e);
      }
    } else {
      console.log(`✅ Kept tab: ${tab.title}`);
    }
  }
}

function incrementClosedCount() {
  youtubeClosedCount++;
  saveCount();

  chrome.storage.local.get("youtubeClosedCounts", (data) => {
    const counts = data.youtubeClosedCounts || {};
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    counts[today] = (counts[today] || 0) + 1;
    chrome.storage.local.set({ youtubeClosedCounts: counts });
  });
}

let youtubeTabs = new Set();

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url && tab.url.includes("youtube.com")) {
    youtubeTabs.add(tab.id);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (changeInfo.url.includes("youtube.com")) {
      youtubeTabs.add(tabId);
    } else {
      youtubeTabs.delete(tabId);
    }
  }

  if (tab.url && isYouTubeVideoUrl(tab.url) && changeInfo.title) {
    const title = changeInfo.title.trim();
    const skipTitles = ["YouTube", "Home", "Shorts", "Watch", "Subscriptions"];
    const isTooGeneric = skipTitles.includes(title) || title.length < 10;

    if (isTooGeneric) return;

    (async () => {
      const isRelated = await checkWithAI(title, selectedExam);
      if (!isRelated) {
        console.log(`🚫 Closing (onUpdated): ${title}`);
        try {
          await chrome.tabs.remove(tabId);
          incrementClosedCount();
        } catch (e) {
          console.warn("⚠️ Failed to close tab (onUpdated):", e);
        }
      } else {
        console.log(`✅ Kept (onUpdated): ${title}`);
      }
    })();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (youtubeTabs.has(tabId)) {
    youtubeTabs.delete(tabId);
    incrementClosedCount();
  }
});

setInterval(checkYouTubeTabs, 5 * 60 * 1000);
