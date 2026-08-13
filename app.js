const root = document.documentElement
const theme = document.getElementById("theme")
if (localStorage.getItem("theme") === "light") root.classList.add("light")
theme.addEventListener("click", () => {
  root.classList.toggle("light")
  localStorage.setItem(
    "theme",
    root.classList.contains("light") ? "light" : "dark",
  )
})
document.getElementById("year").textContent = new Date().getFullYear()
