const getCookie = (cname) => {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for(let i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
$("#user-name").html(getCookie("username"));
let x;
let y;
let mode = 0;
let mousedown = false;
const canvas = $("#canvas");
canvas.mousedown(() => mousedown = true);
canvas.mouseup(() => mousedown = false);
canvas[0].width = canvas[0].offsetWidth;
canvas[0].height = canvas[0].offsetHeight;
const gc = canvas[0].getContext("2d");
$("#mode-1").click(() => {
  mode = 0;
  gc.fillStyle = "black";
});
$("#mode-2").click(() => {
  mode = 1;
  gc.fillStyle = "white";
});
$("#mode-3").click(() => {
  mode = 2;
  gc.fillStyle = "white";
})
canvas.mousemove((ev) => {
  const relX = ev.pageX - $("#canvas").offset().left;
  const relY = ev.pageY - $("#canvas").offset().top;
  x = relX;
  y = relY;
  if (x < 0 || y < 0) return;
  if (mousedown) {
    if (mode === 0 || mode === 1) {
      gc.beginPath();
      gc.arc(x, y, 3, 0, 2 * Math.PI);
      gc.fill();
    }
    if (mode === 2) {
      gc.fillRect(0, 0, canvas[0].width, canvas[0].height);
    }
  }
});
// TODO: Server integration
/*

const token = getCookie("token");
const ws = new WebSocket("wss://harmonyy.me:443/draw");
let authed = false;
ws.addEventListener("open", () => ws.send(JSON.stringify({token, draw: true})));
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.confirmed) {
    authed = true;
    return;
  }
  console.log(msg);
});
*/