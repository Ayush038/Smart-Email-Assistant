export function notifyEmailSent() {
  window.dispatchEvent(new Event("email:sent"));
}

export function subscribeEmailSent(callback) {
  window.addEventListener("email:sent", callback);
  return () => window.removeEventListener("email:sent", callback);
}