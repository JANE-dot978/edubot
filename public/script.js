const messagesDiv = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.innerText = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendQuestion() {
  const question = input.value.trim();
  if (!question) return;

  addMessage(question, "user");
  input.value = "";

  addMessage("EduBot is typing...", "bot");

  try {
    const res = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await res.json();

    const lastMsg = messagesDiv.querySelector(".bot:last-child");
    if (lastMsg && lastMsg.innerText === "EduBot is typing...") {
      messagesDiv.removeChild(lastMsg);
    }

    addMessage(data.answer, "bot");
  } catch (err) {
    addMessage("Unable to connect to EduBot server.", "bot");
  }
}

sendBtn.addEventListener("click", sendQuestion);
input.addEventListener("keypress", e => { if (e.key === "Enter") sendQuestion(); });