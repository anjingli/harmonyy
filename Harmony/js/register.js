$("#register").click(() => {
  const error = $("#status-message");
  const errorBlock = $("#error");
  const username = $("#username-field").val();
  const password = $("#password-field").val();
  const confirmPassword = $("#repeat-password-field").val();
  if (password !== confirmPassword) {
    error.html("Error: Passwords do not match.");
    errorBlock.css("display", "block");
    return;
  }

  if (!password.length || !username.length) {
    error.html("Error: No username or password provided.");
    errorBlock.css("display", "block");
    return;
  }

  $.ajax({
    type: "POST",
    url: "https://harmonyy.me/register",
    data: {username, password},
    success: (res) => {
      if (res.error === 1) {
        error.html("Error: Username already taken.");
        errorBlock.css("display", "block");
        return;
      }
      if (res.error !== 0) {
        error.html(`Error: Unknown error, code ${res.error}`);
        errorBlock.css("display", "block");
        return;
      }
      error.html("Success! Taking you to login page...");
      errorBlock.css("display", "block");
      setTimeout(() => window.location.replace("./index.html"), 2000);
    }
  });
});