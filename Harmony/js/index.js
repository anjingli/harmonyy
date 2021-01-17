$("#login").click(() => {
  const username = $("#username-field").val();
  const password = $("#password-field").val();
  const error = $("#status-message");
  const errorBlock = $("#error");
  if (!username.length || !password.length) {
    error.html("Error: No username or password provided.");
    errorBlock.css("display", "block");
    return;
  }
  $.ajax({
    type: "GET",
    url: `https://harmonyy.me/login?username=${username}&password=${password}`,
    success: (res) => {
      if (res.error === 1) {
        error.html("Error: Invalid username or password.");
        errorBlock.css("display", "block");
        return;
      }
      if (res.error !== 0) {
        error.html(`Error: Unknown error, code ${res.error}.`);
        errorBlock.css("display", "block");
        return;
      }
      document.cookie = `token=${res.token}`;
      window.location.replace("./messages.html");
    }
  });
});