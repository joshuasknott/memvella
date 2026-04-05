self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = typeof data.title === "string" ? data.title : "Memvella update";
  const body = typeof data.body === "string" ? data.body : "";
  const deepLink = typeof data.deepLink === "string" ? data.deepLink : "/circle";
  const tag = typeof data.tag === "string" ? data.tag : "memvella-notification";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      data: {
        deepLink,
      },
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  const deepLink =
    event.notification && event.notification.data
      ? event.notification.data.deepLink
      : "/circle";

  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && client.url.includes("/circle")) {
          client.navigate(deepLink);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(deepLink);
      }

      return undefined;
    }),
  );
});
