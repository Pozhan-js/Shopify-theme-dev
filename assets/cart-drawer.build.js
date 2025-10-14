import { C as Cart } from "./cart-f2100073.js";
const action = () => {
  window.themeCore.Cart = window.themeCore.Cart || Cart();
  window.themeCore.utils.register(window.themeCore.Cart, "cart-drawer");
};
if (window.themeCore && window.themeCore.loaded) {
  action();
} else {
  document.addEventListener("theme:all:loaded", action, { once: true });
}
