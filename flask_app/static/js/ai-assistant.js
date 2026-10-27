
document.addEventListener("DOMContentLoaded", () => {
    const launcher = document.getElementById("aiLauncher");
    const chatWindow = document.getElementById("aiChatWindow");
    const closeButton = document.getElementById("aiClose");
    const chatForm = document.getElementById("aiChatForm");
    const userInput = document.getElementById("aiUserInput");
    const messages = document.getElementById("aiMessages");
    const quickQuestions = document.getElementById("aiQuickQuestions");
    const sendButton = document.getElementById("aiSendButton");

    // Check that the required HTML elements exist.
    if (!launcher || !chatWindow) {
        console.error(
            "AI Assistant: aiLauncher or aiChatWindow is missing from index.html."
        );
        return;
    }

    // Open the chatbot.
    function openChat() {
        chatWindow.classList.add("ai-open");
        chatWindow.setAttribute("aria-hidden", "false");
        launcher.setAttribute("aria-expanded", "true");

        if (userInput) {
            userInput.focus();
        }
    }

    // Close the chatbot.
    function closeChat() {
        chatWindow.classList.remove("ai-open");
        chatWindow.setAttribute("aria-hidden", "true");
        launcher.setAttribute("aria-expanded", "false");
    }

    // Toggle chatbot using the floating button.
    launcher.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (chatWindow.classList.contains("ai-open")) {
            closeChat();
        } else {
            openChat();
        }
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeChat);
    }

    // Close using Escape.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeChat();
        }
    });

    // Add a message to the chat.
    function addMessage(text, sender) {
        if (!messages) return null;

        const wrapper = document.createElement("div");
        wrapper.className =
            sender === "user"
                ? "ai-message ai-message-user"
                : "ai-message ai-message-bot";

        if (sender !== "user") {
            const avatar = document.createElement("div");
            avatar.className = "ai-message-avatar";
            avatar.textContent = "✦";
            wrapper.appendChild(avatar);
        }

        const content = document.createElement("div");
        content.className = "ai-message-content";

        const senderLabel = document.createElement("span");
        senderLabel.className = "ai-sender";
        senderLabel.textContent =
            sender === "user" ? "You" : "Bhavesh AI";

        const paragraph = document.createElement("p");
        paragraph.textContent = text;

        content.appendChild(senderLabel);
        content.appendChild(paragraph);
        wrapper.appendChild(content);
        messages.appendChild(wrapper);

        messages.scrollTop = messages.scrollHeight;

        return wrapper;
    }

    // Send a question to the Flask backend.
    async function sendMessage(question) {
        const text = (question || "").trim();

        if (!text || !messages) return;

        openChat();
        addMessage(text, "user");

        if (userInput) userInput.value = "";
        if (sendButton) sendButton.disabled = true;

        const loadingMessage = addMessage("Thinking...", "bot");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.error || `Server error (${response.status})`
                );
            }

            const answer =
                data.response ||
                data.reply ||
                data.answer ||
                "I couldn't generate a response. Please try again.";

            if (loadingMessage) loadingMessage.remove();
            addMessage(answer, "bot");

        } catch (error) {
            console.error("AI Assistant error:", error);

            if (loadingMessage) loadingMessage.remove();

            addMessage(
                "Sorry, I couldn't connect to the AI service. " +
                "Please check the Flask server and try again.",
                "bot"
            );
        } finally {
            if (sendButton) sendButton.disabled = false;
            if (userInput) userInput.focus();
        }
    }

    // Handle the message form.
    if (chatForm) {
        chatForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (userInput) {
                sendMessage(userInput.value);
            }
        });
    }

    // Handle the suggested question buttons.
    if (quickQuestions) {
        quickQuestions.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-question]");

            if (button) {
                sendMessage(button.dataset.question);
            }
        });
    }

    console.log("AI Assistant initialized successfully.");
});
