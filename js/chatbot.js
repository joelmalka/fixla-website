// Fixla Chatbot Widget
(function() {
  // Create styles
  const styles = document.createElement('style');
  styles.textContent = `
    .fixla-chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .fixla-chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgb(55, 181, 38), rgb(34, 140, 25));
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(55, 181, 38, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .fixla-chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(55, 181, 38, 0.5);
    }

    .fixla-chat-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .fixla-chat-window {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 350px;
      max-width: calc(100vw - 40px);
      height: 450px;
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .fixla-chat-window.open {
      display: flex;
    }

    .fixla-chat-header {
      background: linear-gradient(135deg, rgb(55, 181, 38), rgb(34, 140, 25));
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .fixla-chat-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .fixla-chat-avatar {
      width: 36px;
      height: 36px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: rgb(55, 181, 38);
      font-size: 14px;
    }

    .fixla-chat-title {
      font-weight: 600;
      font-size: 15px;
    }

    .fixla-chat-subtitle {
      font-size: 11px;
      opacity: 0.9;
    }

    .fixla-chat-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
    }

    .fixla-chat-close:hover {
      opacity: 1;
    }

    .fixla-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fixla-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .fixla-message.bot {
      background: #f1f3f4;
      color: #333;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .fixla-message.user {
      background: rgb(55, 181, 38);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .fixla-message.typing {
      display: flex;
      gap: 4px;
      padding: 14px 18px;
    }

    .fixla-message.typing span {
      width: 8px;
      height: 8px;
      background: #999;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .fixla-message.typing span:nth-child(2) { animation-delay: 0.2s; }
    .fixla-message.typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    .fixla-chat-input-area {
      padding: 12px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
    }

    .fixla-chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }

    .fixla-chat-input:focus {
      border-color: rgb(55, 181, 38);
    }

    .fixla-chat-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgb(55, 181, 38);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
    }

    .fixla-chat-send:hover {
      background: rgb(34, 140, 25);
    }

    .fixla-chat-send:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .fixla-chat-send svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    .fixla-quick-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 16px 12px;
    }

    .fixla-quick-btn {
      padding: 6px 12px;
      border: 1px solid rgb(55, 181, 38);
      background: white;
      color: rgb(55, 181, 38);
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .fixla-quick-btn:hover {
      background: rgb(55, 181, 38);
      color: white;
    }

    @media (max-width: 480px) {
      .fixla-chat-window {
        width: calc(100vw - 20px);
        right: -10px;
        bottom: 70px;
        height: calc(100vh - 120px);
        max-height: none;
        border-radius: 16px 16px 0 0;
      }
    }
  `;
  document.head.appendChild(styles);

  // Create widget HTML
  const widget = document.createElement('div');
  widget.className = 'fixla-chat-widget';
  widget.innerHTML = `
    <div class="fixla-chat-window" id="fixla-chat-window">
      <div class="fixla-chat-header">
        <div class="fixla-chat-header-info">
          <div class="fixla-chat-avatar">F</div>
          <div>
            <div class="fixla-chat-title">Fixla Asiakaspalvelu</div>
            <div class="fixla-chat-subtitle">Vastaamme yleensä heti</div>
          </div>
        </div>
        <button class="fixla-chat-close" id="fixla-chat-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="fixla-chat-messages" id="fixla-chat-messages">
        <div class="fixla-message bot">Hei! Olen Fixlan avustaja. Voin auttaa sinua kaikissa palveluissamme - siivous, pihatyöt, lumityöt, koiran ulkoilutus ja muut. Kysy rohkeasti!</div>
      </div>
      <div class="fixla-quick-buttons" id="fixla-quick-buttons">
        <button class="fixla-quick-btn" data-question="Miten tilaan palvelun?">Miten tilaan</button>
        <button class="fixla-quick-btn" data-question="Mitä palveluita tarjoatte?">Mitä palveluita</button>
        <button class="fixla-quick-btn" data-question="Millä alueella toimitte?">Millä alueella</button>
        <button class="fixla-quick-btn" data-question="Mitkä ovat aukioloaikanne?">Aukiolo</button>
      </div>
      <div class="fixla-chat-input-area">
        <input type="text" class="fixla-chat-input" id="fixla-chat-input" placeholder="Kirjoita viesti..." maxlength="500">
        <button class="fixla-chat-send" id="fixla-chat-send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
    <button class="fixla-chat-button" id="fixla-chat-toggle">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
    </button>
  `;
  document.body.appendChild(widget);

  // State
  let isOpen = false;
  let isLoading = false;
  let history = [];

  // Elements
  const chatWindow = document.getElementById('fixla-chat-window');
  const chatToggle = document.getElementById('fixla-chat-toggle');
  const chatClose = document.getElementById('fixla-chat-close');
  const chatMessages = document.getElementById('fixla-chat-messages');
  const chatInput = document.getElementById('fixla-chat-input');
  const chatSend = document.getElementById('fixla-chat-send');
  const quickButtons = document.getElementById('fixla-quick-buttons');

  // Toggle chat
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    if (isOpen) {
      chatInput.focus();
    }
  }

  chatToggle.addEventListener('click', toggleChat);
  chatClose.addEventListener('click', toggleChat);

  // Add message to UI
  function addMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = `fixla-message ${isUser ? 'user' : 'bot'}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'fixla-message bot typing';
    typing.id = 'fixla-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('fixla-typing');
    if (typing) typing.remove();
  }

  // Send message
  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    // Hide quick buttons after first message
    quickButtons.style.display = 'none';

    addMessage(text, true);
    history.push({ role: 'user', content: text });
    chatInput.value = '';
    isLoading = true;
    chatSend.disabled = true;
    showTyping();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-6) })
      });

      const data = await response.json();
      hideTyping();

      if (response.ok) {
        addMessage(data.reply);
        history.push({ role: 'assistant', content: data.reply });
      } else {
        addMessage(data.error || 'Jokin meni pieleen. Yritä uudelleen.');
      }
    } catch (error) {
      hideTyping();
      addMessage('Yhteysvirhe. Tarkista internet-yhteys ja yritä uudelleen.');
    }

    isLoading = false;
    chatSend.disabled = false;
    chatInput.focus();
  }

  // Event listeners
  chatSend.addEventListener('click', () => sendMessage(chatInput.value));
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(chatInput.value);
  });

  // Quick buttons
  quickButtons.addEventListener('click', (e) => {
    if (e.target.classList.contains('fixla-quick-btn')) {
      sendMessage(e.target.dataset.question);
    }
  });
})();
