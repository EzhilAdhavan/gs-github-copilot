document.addEventListener("DOMContentLoaded", () => {
  const healthForm = document.getElementById("health-form");
  const messageDiv = document.getElementById("message");
  const recordsList = document.getElementById("records-list");

  // Set today's date as default
  const dateInput = document.getElementById("date");
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
  dateInput.max = today;

  // Function to fetch and display health statistics
  async function fetchStats() {
    try {
      const response = await fetch("/health/stats");
      const stats = await response.json();

      document.getElementById("stat-total").textContent = stats.total_records;
      document.getElementById("stat-steps").textContent = stats.avg_steps.toLocaleString();
      document.getElementById("stat-water").textContent = stats.avg_water_intake;
      document.getElementById("stat-sleep").textContent = stats.avg_sleep_hours;
      document.getElementById("stat-calories").textContent = stats.avg_calories.toLocaleString();
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  // Function to fetch and display health records
  async function fetchRecords() {
    try {
      const response = await fetch("/health");
      const records = await response.json();

      if (records.length === 0) {
        recordsList.innerHTML = "<p>No health records yet. Start logging your daily health data!</p>";
        return;
      }

      recordsList.innerHTML = "";

      // Sort records by date (newest first)
      records.sort((a, b) => new Date(b.date) - new Date(a.date));

      records.forEach((record) => {
        const recordCard = document.createElement("div");
        recordCard.className = "record-card";

        recordCard.innerHTML = `
          <div class="record-header">
            <h4>${new Date(record.date).toLocaleDateString()}</h4>
            <span class="record-id">#${record.id}</span>
          </div>
          <div class="record-details">
            <div class="detail-item">
              <span class="detail-label">Steps:</span>
              <span class="detail-value">${record.steps.toLocaleString()}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Water:</span>
              <span class="detail-value">${record.water_intake}L</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sleep:</span>
              <span class="detail-value">${record.sleep_hours} hrs</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Calories:</span>
              <span class="detail-value">${record.calories.toLocaleString()}</span>
            </div>
          </div>
        `;

        recordsList.appendChild(recordCard);
      });
    } catch (error) {
      recordsList.innerHTML = "<p>Failed to load health records. Please try again later.</p>";
      console.error("Error fetching records:", error);
    }
  }

  // Handle form submission
  healthForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const steps = parseInt(document.getElementById("steps").value);
    const water = parseFloat(document.getElementById("water").value);
    const sleep = parseFloat(document.getElementById("sleep").value);
    const calories = parseInt(document.getElementById("calories").value);

    const healthData = {
      date: date,
      steps: steps,
      water_intake: water,
      sleep_hours: sleep,
      calories: calories,
    };

    try {
      const response = await fetch("/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(healthData),
      });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        healthForm.reset();
        dateInput.value = today;

        // Refresh records and stats
        await fetchRecords();
        await fetchStats();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to log health data. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error logging health data:", error);
    }
  });

  // Initialize app
  fetchStats();
  fetchRecords();
});
