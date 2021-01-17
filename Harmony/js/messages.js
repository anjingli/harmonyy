$("#template-profile").css("display", "none");
$(".template-message").css("display", "none");

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let focused = 0;
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

const token = getCookie("token");

let res;
const renderMessage = (msg) => {
  const d = new Date(msg.timestamp);
  const now = Date.now();
  let set;
  if (now - d < 1000 * 60 * 60 * 24) set = `${d.getHours() % 12}:${d.getMinutes() < 10 ? "0" : ""}${d.getMinutes()} ${d.getHours() > 12 ? "PM" : "AM"}`;
  else set = `${months[d.getMonth()]} ${d.getDate()}`;
  if (msg.author === res.you) {
    const msgObject = $("#template-message-author").clone().css("display", "flex").removeAttr("id");
    msgObject.find(".message-content").append(msg.msg);
    msgObject.find(".send-date").html(set);
    $("#message-container").append(msgObject);
  }
  else {
    const msgObject = $("#template-message-other").clone().css("display", "flex").removeAttr("id");
    msgObject.find(".message-content").append(msg.msg);
    msgObject.find(".send-date").html(set);
    msgObject.find(".sender-name").html(res.usernames.find((u) => u.id === msg.author).username || "Unknown");
    $("#message-container").append(msgObject);
  }
}

const focusChannel = (id, name) => {
  focused = id;
  const messageContainer = $("#message-container");
  messageContainer.empty();
  const focusedPfp = $("#focused-pfp");
  const focusedName = $("#focused-name");
  focusedPfp.attr("src", "https://cdn.boop.pl/uploads/2020/07/4631.jpg");
  focusedName.html(name);
  $.ajax({
    type: "GET",
    url: `https://harmonyy.me/messages?channel=${id}`,
    headers: {"Authorization": token},
    success: (cd) => {
      res = cd;
      if (cd.error !== 0) {
        alert("Could not fetch messages.");
        return;
      }
      cd.messages.reverse();
      for (const msg of cd.messages) {
        renderMessage(msg);
      }
    }
  });
  /*
  <div class="chat-message-right pb-4">
    <div>
        <img src="https://yorkdale.com/wp-content/uploads/2019/09/White-Square.jpg" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
        <div class="text-muted small text-nowrap mt-2 send-date"></div>
    </div>
    <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
        <div class="font-weight-bold mb-1">You</div>
        
    </div>
</div>

<div class="chat-message-left pb-4">
    <div>
        <img src="https://yorkdale.com/wp-content/uploads/2019/09/White-Square.jpg" class="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40">
        <div class="text-muted small text-nowrap mt-2 send-date"></div>
    </div>
    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
        <div class="font-weight-bold mb-1 sender-name"></div>
        
    </div>
</div>
*/
};

const dataLoader = (res) => {
  const container = $("#channel-container");
  $(".supp-channel").remove();
  for (const ch of res.channels) {
    const channel = $("#template-profile").clone().css("display", "block").removeAttr("id").addClass("supp-channel");
    container.after(channel);
    channel.find(".name-field").html(ch.name);
    channel.find("img").attr("src", "https://cdn.boop.pl/uploads/2020/07/4631.jpg");
    channel.click(() => focusChannel(ch.id, ch.name));
  }

};

if (!token) window.location.replace("./index.html");
else {
  $.ajax({
    type: "GET",
    url: "https://harmonyy.me/channels",
    headers: {"Authorization": token},
    success: dataLoader
  });
}

let you;
const ws = new WebSocket("wss://harmonyy.me:443/messages");
ws.addEventListener("open", () => ws.send(JSON.stringify({token})));
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id) {
    you = msg.id;
    console.log(`Authenticated ID ${you}`);
    return;
  }
  if (msg.close) {
    alert("Your session has been terminated.");
    return;
  }
  if (msg.newChannel) {
    $.ajax({
      type: "GET",
      url: "https://harmonyy.me/channels",
      headers: {"Authorization": token},
      success: dataLoader
    });
  }
  if (msg.channel !== focused) return;
  renderMessage(msg)
  $(".chat-messages").each(function() {this.scrollTop = 9999});
});

$("#to-send").keypress((e) => {
  if (e.which !== 13) return;
  $("#send-message").trigger("click");
});

$("#send-message").click(() => {
  if (focused === 0) return;
  const text = $("#to-send").val();
  console.log(JSON.stringify({text, channel: focused}));
  ws.send(JSON.stringify({text, channel: focused}));
  $("#to-send").val("").focus();
});

$("#open-dm").keypress((e) => {
  console.log("yes");
  if (e.which !== 13) return;
  const username = $("#open-dm").val();
  $.ajax({
    type: "POST",
    url: "https://harmonyy.me/create",
    headers: {"Authorization": token},
    data: {usernames: [username]},
    success: (res) => {
      if (res.error !== 0) alert(`Unable to open DM channel. Code ${res.error}`);
    }
  });
});

$("#logout-button").click(() => {
  document.cookie = "token=\"\";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  window.location.replace("./index.html");
})