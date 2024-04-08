import CanvasDrawer from "./canvas.js";

(async () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const clear = document.getElementById("clear") as HTMLButtonElement;

  const canvasDrawer = new CanvasDrawer(canvas, clear);

  // const registerServiceWorker = async () => {
  //   if ("serviceWorker" in navigator) {
  //     try {
  //       console.log("registering service worker...");
  //       const registration = await navigator.serviceWorker.register(
  //         "./dist/service-worker.js"
  //       );
  //       if (registration.installing) {
  //         console.log("Service worker installing");
  //       } else if (registration.waiting) {
  //         console.log("Service worker installed");
  //       } else if (registration.active) {
  //         console.log("Service worker active");
  //       }
  //     } catch (error) {
  //       console.error(`Registration failed with ${error}`);
  //     }
  //   }
  // };
  // await registerServiceWorker();
})();
