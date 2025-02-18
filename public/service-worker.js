self.addEventListener("fetch", (event) => {
    event.respondWith(
      fetch(event.request) // 🔥 Siempre hace la petición en línea
        .catch(() => {
          return new Response("No hay conexión a internet", {
            status: 503,
            statusText: "Offline",
            headers: new Headers({ "Content-Type": "text/plain" })
          });
        })
    );
  });
  