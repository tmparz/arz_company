(() => {
  "use strict";

  const lang = document.body.dataset.lang === "en" ? "en" : "zh";
  const words = {
    zh: {
      today: "今天", tomorrow: "明天", dayAfter: "後天",
      initial: "選好時段後，按下按鈕看看。",
      booked: "示範完成！這是一張預約小卡，沒有建立真實訂單。",
      available: "示範狀態：開放預約",
      paused: "示範狀態：暫停預約",
      availableMessage: "示範店家現在開放接受預約。",
      pausedMessage: "示範店家現在暫停接受新預約。"
    },
    en: {
      today: "Today", tomorrow: "Tomorrow", dayAfter: "In 2 days",
      initial: "Choose a date and time to try the flow.",
      booked: "Demo complete! No real reservation was created.",
      available: "Demo status: Accepting bookings",
      paused: "Demo status: Paused",
      availableMessage: "This sample business is now accepting bookings.",
      pausedMessage: "This sample business is not accepting new bookings."
    }
  }[lang];

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (menuButton && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    };
    menuButton.addEventListener("click", () => {
      const opened = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(opened));
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const serviceButtons = document.querySelectorAll(".service-option");
  const dateButtons = document.querySelectorAll(".date-option");
  const timeButtons = document.querySelectorAll(".time-option");
  const summaryService = document.getElementById("summary-service");
  const summaryDate = document.getElementById("summary-date");
  const summaryTime = document.getElementById("summary-time");
  const guestStatus = document.getElementById("guest-status");
  const bookButton = document.getElementById("book-action");

  let selectedService = serviceButtons[0]?.textContent.trim() || "";
  let selectedOffset = 0;
  let selectedTime = timeButtons[0]?.textContent.trim() || "";

  const sampleDate = (offset) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "zh-TW", {
      month: "short", day: "numeric", weekday: "short"
    }).format(date);
  };

  const dateText = (offset) => [words.today, words.tomorrow, words.dayAfter][offset] + " · " + sampleDate(offset);
  dateButtons.forEach((button) => {
    const offset = Number(button.dataset.offset);
    button.textContent = dateText(offset);
  });

  function refreshSummary(resetMessage = true) {
    if (summaryService) summaryService.textContent = selectedService;
    if (summaryDate) summaryDate.textContent = sampleDate(selectedOffset);
    if (summaryTime) summaryTime.textContent = selectedTime;
    if (resetMessage && guestStatus) guestStatus.textContent = words.initial;
  }
  function wireChoices(buttons, onChange) {
    buttons.forEach((button) => button.addEventListener("click", () => {
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      onChange(button);
      refreshSummary();
    }));
  }
  wireChoices(serviceButtons, (button) => { selectedService = button.textContent.trim(); });
  wireChoices(dateButtons, (button) => { selectedOffset = Number(button.dataset.offset); });
  wireChoices(timeButtons, (button) => { selectedTime = button.textContent.trim(); });
  refreshSummary(false);
  if (bookButton && guestStatus) {
    bookButton.addEventListener("click", () => {
      guestStatus.textContent = words.booked;
    });
  }

  const guestTab = document.getElementById("tab-guest");
  const managerTab = document.getElementById("tab-manager");
  const guestPanel = document.getElementById("panel-guest");
  const managerPanel = document.getElementById("panel-manager");
  const guestCards = document.querySelectorAll(".demo-guest");

  function setTab(which, moveFocus = false) {
    if (!guestTab || !managerTab || !guestPanel || !managerPanel) return;
    const manager = which === "manager";
    guestTab.setAttribute("aria-selected", String(!manager));
    managerTab.setAttribute("aria-selected", String(manager));
    guestTab.tabIndex = manager ? -1 : 0;
    managerTab.tabIndex = manager ? 0 : -1;
    guestCards.forEach((card) => { card.classList.toggle("is-hidden", manager); });
    managerPanel.hidden = !manager;
    managerPanel.classList.toggle("is-active", manager);
    if (moveFocus) (manager ? managerTab : guestTab).focus();
  }
  if (guestTab && managerTab) {
    guestTab.addEventListener("click", () => setTab("guest"));
    managerTab.addEventListener("click", () => setTab("manager"));
    [guestTab, managerTab].forEach((tab) => {
      tab.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          setTab(tab === guestTab ? "manager" : "guest", true);
        }
      });
    });
    setTab("guest");
  }

  const availabilityButton = document.getElementById("availability-toggle");
  const managerStatus = document.getElementById("manager-status");
  if (availabilityButton && managerStatus) {
    availabilityButton.addEventListener("click", () => {
      const next = availabilityButton.getAttribute("aria-pressed") !== "true";
      availabilityButton.setAttribute("aria-pressed", String(next));
      availabilityButton.textContent = next ? words.available : words.paused;
      managerStatus.textContent = next ? words.availableMessage : words.pausedMessage;
    });
  }
})();