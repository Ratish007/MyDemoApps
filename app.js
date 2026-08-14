const root = document.documentElement
const theme = document.getElementById("theme")

if (localStorage.getItem("theme") === "light") {
  root.classList.add("light")
}

if (theme) {
  theme.addEventListener("click", () => {
    root.classList.toggle("light")
    localStorage.setItem(
      "theme",
      root.classList.contains("light") ? "light" : "dark",
    )
  })
}

const yearElement = document.getElementById("year")
if (yearElement) {
  yearElement.textContent = new Date().getFullYear()
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error)
    })
  })
}
