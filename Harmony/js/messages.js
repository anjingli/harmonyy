$("#template-profile").css("display", "none");
$(".template-message").css("display", "none");

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

const focusChannel = (id, name) => {
  const messageContainer = $("#message-container");
  messageContainer.empty();
  const focusedPfp = $("#focused-pfp");
  const focusedName = $("#focused-name");
  focusedPfp.attr("src", "https://cdn.boop.pl/uploads/2020/07/4631.jpg");
  focusedName.html(name);
  $.ajax({
    type: "GET",
    url: `http://159.203.14.8/messages?channel=${id}`,
    headers: {"Authorization": token},
    success: (res) => {
      if (res.error !== 0) {
        alert("Could not fetch messages.");
        return;
      }
      for (const msg of res.messages) {
        if (msg.author === res.you) {
          const msgObject = $("#template-message-author").clone().css("display", "flex").removeAttr("id");
          msgObject.find(".message-content").append(msg.msg);
          msgObject.find(".send-date").html(msg.timestamp);
          messageContainer.prepend(msgObject);
        }
        else {
          const msgObject = $("#template-message-other").clone().css("display", "flex").removeAttr("id");
          msgObject.find(".message-content").append(msg.msg);
          msgObject.find(".send-date").html(msg.timestamp);
          msgObject.find(".sender-name").html(res.usernames.find((u) => u.id === msg.author).username || "Unknown");
          messageContainer.prepend(msgObject);
          console.log($("#template-message-other"));
        }
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
  for (const ch of res.channels) {
    const channel = $("#template-profile").clone().css("display", "block").removeAttr("id");
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
    url: "http://159.203.14.8/channels",
    headers: {"Authorization": token},
    success: dataLoader
  });
}