const root = document.documentElement;
const sidebar = document.querySelector('.sidebar');
const search = document.querySelector('#search');
const links = [...document.querySelectorAll('.utility-link')];
const utilities = [...document.querySelectorAll('.utility')];
const savedTheme = localStorage.getItem('doc-theme');
const theme =
  savedTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
root.dataset.theme = theme;
function setTheme(value) {
  root.dataset.theme = value;
  localStorage.setItem('doc-theme', value);
}
function toggleTheme() {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
}
document.querySelector('#theme-toggle').onclick = toggleTheme;
document.querySelector('#desktop-theme-toggle').onclick = toggleTheme;
document.querySelector('#menu-toggle').onclick = () => sidebar.classList.toggle('open');
document
  .querySelectorAll('.group-title')
  .forEach(
    (button) => (button.onclick = () => button.nextElementSibling.classList.toggle('hidden')),
  );
links.forEach(
  (link) =>
    (link.onclick = () => {
      utilities.forEach((item) => item.classList.remove('active'));
      links.forEach((item) => item.classList.remove('active'));
      document.querySelector('#utility-' + link.dataset.utility).classList.add('active');
      link.classList.add('active');
      sidebar.classList.remove('open');
    }),
);
document.querySelectorAll('.group-utilities').forEach((group) => group.classList.add('hidden'));
if (links[0]) links[0].click();
search.oninput = () => {
  const value = search.value.toLowerCase();
  links.forEach((link) => {
    const match = link.textContent.toLowerCase().includes(value);
    link.style.display = match ? '' : 'none';
  });
};
