document.addEventListener("DOMContentLoaded", () => {
  // Force font load trick for Chart.js
  const preload = document.createElement("span");
  preload.style.fontFamily = "'Henny Penny', cursive";
  preload.style.visibility = "hidden";
  preload.style.position = "absolute";
  preload.textContent = ".";
  document.body.appendChild(preload);

  const buttons = document.querySelectorAll(".buttonss .button");

  // Restore saved focus and draw chart
  chrome.storage.local.get(["selectedExam", "youtubeClosedCounts"], (data) => {
    // Restore selected exam button
    const savedExam = data.selectedExam;
    if (savedExam) {
      const savedButton = document.getElementById(savedExam);
      if (savedButton) {
        savedButton.classList.add("active");
      }
    }

    const storedCounts = data.youtubeClosedCounts || {};
    const defaultCounts = {
      'Sun': 0,
      'Mon': 0,
      'Tue': 0,
      'Wed': 0,
      'Thu': 0,
      'Fri': 0,
      'Sat': 0
    };

    // Merge so that all days appear on the graph, even if zero count
    const counts = { ...defaultCounts, ...storedCounts };

    const labels = Object.keys(counts);
    const values = Object.values(counts);

    const ctx = document.getElementById('myChart').getContext('2d');

    // Wait for fonts to load before drawing the chart
    document.fonts.ready.then(() => {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'YouTube Closed Count',
            data: values,
            borderColor: 'rgb(0, 128, 128)',
            backgroundColor: 'rgba(0, 128, 128, 0.3)',
            pointStyle: 'circle',
            pointRadius: 6,
            pointHoverRadius: 10,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'YouTube Tab Closures Over Days',
              font: {
                family: "'Henny Penny', cursive",
                size: 22,
                weight: '400'
              },
              color: '#003333'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  if (Number.isInteger(value)) {
                    return value;
                  }
                },
                stepSize: 1,
                precision: 0,
              }
            }
          }
        }
      });
    });
  });

  // Handle exam button clicks
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Save selected exam
      chrome.storage.local.set({ selectedExam: button.id });

      // Notify background script if needed
      chrome.runtime.sendMessage(
        { type: "setExam", exam: button.id },
        (response) => {
          if (response?.status === "ok") {
            console.log("Exam updated to", button.id);
          }
        }
      );
    });
  });
});
