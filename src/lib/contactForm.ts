/** Any "Get in touch" button reveals the contact form and details, which stay hidden until then. */
const OPEN = 'contact-form:open';

export const openContactForm = () => window.dispatchEvent(new Event(OPEN));

export function onOpenContactForm(handler: () => void) {
  window.addEventListener(OPEN, handler);
  return () => window.removeEventListener(OPEN, handler);
}
