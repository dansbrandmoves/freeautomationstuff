// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    
    // DOM Elements
    const agentSelectBtn = document.getElementById('agentSelectBtn');
    const currentAgentName = document.getElementById('currentAgentName');
    const agentSelectorModal = document.getElementById('agentSelectorModal');
    const closeAgentSelector = document.getElementById('closeAgentSelector');
    const agentSelectorList = document.getElementById('agentSelectorList');
    const emptyAgentState = document.getElementById('emptyAgentState');
    const settingsBtn = document.getElementById('settingsBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    const closeSettings = document.getElementById('closeSettings');
    const settingsPanel = document.getElementById('settingsPanel');
    const addAgentBtn = document.getElementById('addAgentBtn');
    const addAgentFromSelector = document.getElementById('addAgentFromSelector');
    const addAgentModal = document.getElementById('addAgentModal');
    const closeAddAgent = document.getElementById('closeAddAgent');
    const cancelAddAgent = document.getElementById('cancelAddAgent');
    const saveAddAgent = document.getElementById('saveAddAgent');
    const newAgentName = document.getElementById('newAgentName');
    const newAgentWebhook = document.getElementById('newAgentWebhook');
    const savedAgentsDiv = document.getElementById('savedAgents');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const fileUploadBtn = document.getElementById('fileUploadBtn');
    const fileInput = document.getElementById('fileInput');
    const editModal = document.getElementById('editModal');
    const closeModal = document.getElementById('closeModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const deleteAgentBtn = document.getElementById('deleteAgentBtn');
    const editAgentName = document.getElementById('editAgentName');
    const editAgentWebhook = document.getElementById('editAgentWebhook');
    const packCodeInput = document.getElementById('packCodeInput');
    const installPackBtn = document.getElementById('installPackBtn');

    console.log('settingsBtn:', settingsBtn);
    console.log('agentSelectBtn:', agentSelectBtn);

    // Pack installer event listener
    if (installPackBtn) {
        installPackBtn.addEventListener('click', installAgentPack);
    }

    // State
    let agents = [];
    let currentAgent = null;
    let agentSessions = {}; // Track session IDs per agent
    let isDarkMode = false;
    let editingAgentId = null;
    let uploadedFile = null; // Store uploaded file

    // Initialize
    loadAgents();
    loadTheme();
    setupEventListeners();

    function setupEventListeners() {
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('Settings button clicked');
                settingsPanel.classList.toggle('hidden');
            });
        }

        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                settingsPanel.classList.add('hidden');
            });
        }

        // NEW: Refresh button replaces newSessionBtn
        if (refreshBtn) {
            refreshBtn.addEventListener('click', startNewSession);
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // NEW: Add Agent button opens modal
        if (addAgentBtn) {
            addAgentBtn.addEventListener('click', openAddAgentModal);
        }

        // NEW: Add Agent from Selector modal
        if (addAgentFromSelector) {
            addAgentFromSelector.addEventListener('click', () => {
                closeAgentSelectorModal();
                openAddAgentModal();
            });
        }

        // NEW: Add Agent modal controls
        if (closeAddAgent) {
            closeAddAgent.addEventListener('click', closeAddAgentModal);
        }
        if (cancelAddAgent) {
            cancelAddAgent.addEventListener('click', closeAddAgentModal);
        }
        if (saveAddAgent) {
            saveAddAgent.addEventListener('click', addAgentFromModal);
        }
        
        if (agentSelectBtn) {
            agentSelectBtn.addEventListener('click', () => {
                console.log('Agent select button clicked');
                openAgentSelector();
            });
        }
        
        if (closeAgentSelector) {
            closeAgentSelector.addEventListener('click', closeAgentSelectorModal);
        }

        sendBtn.addEventListener('click', sendMessage);
        
        // File upload button
        if (fileUploadBtn) {
            fileUploadBtn.addEventListener('click', () => {
                // If file is attached, clear it; otherwise open file picker
                if (uploadedFile) {
                    clearFile();
                } else {
                    fileInput.click();
                }
            });
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', handleFileUpload);
        }
        
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Auto-expand textarea as user types
        messageInput.addEventListener('input', () => {
            console.log('Input event fired');
            autoExpandTextarea();
        });

        closeModal.addEventListener('click', closeEditModal);
        cancelEditBtn.addEventListener('click', closeEditModal);
        saveEditBtn.addEventListener('click', saveAgentEdit);
        deleteAgentBtn.addEventListener('click', deleteAgentFromModal);

        // Close modal on outside click
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });

        agentSelectorModal.addEventListener('click', (e) => {
            if (e.target === agentSelectorModal) {
                closeAgentSelectorModal();
            }
        });

        addAgentModal.addEventListener('click', (e) => {
            if (e.target === addAgentModal) {
                closeAddAgentModal();
            }
        });
    }

    // Auto-expand textarea
    function autoExpandTextarea() {
        console.log('autoExpandTextarea called');
        
        // First check if we need to grow by temporarily removing height constraint
        const currentHeight = messageInput.offsetHeight;
        messageInput.style.height = '1px'; // Collapse to get true scrollHeight
        
        const scrollHeight = messageInput.scrollHeight;
        const maxHeight = 150; // Match CSS max-height
        const newHeight = Math.min(Math.max(scrollHeight, 24), maxHeight); // Between 24px and 150px
        
        console.log('Current height:', currentHeight);
        console.log('ScrollHeight:', scrollHeight);
        console.log('New height:', newHeight);
        
        messageInput.style.height = newHeight + 'px';
        
        // Show scrollbar if content exceeds max height
        if (scrollHeight > maxHeight) {
            messageInput.style.overflowY = 'auto';
        } else {
            messageInput.style.overflowY = 'hidden';
        }
    }

    // Session Management
    function generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    function getOrCreateSession(agentId) {
        if (!agentSessions[agentId]) {
            agentSessions[agentId] = {
                sessionId: generateSessionId(),
                startTime: Date.now()
            };
            console.log('Created new session:', agentSessions[agentId]);
        }
        return agentSessions[agentId];
    }

    function startNewSession() {
        if (!currentAgent) {
            alert('Please select an agent first');
            return;
        }

        // Clear the session for current agent
        agentSessions[currentAgent.id] = {
            sessionId: generateSessionId(),
            startTime: Date.now()
        };

        // Clear chat messages
        chatMessages.innerHTML = '';
        
        // Clear any uploaded file
        if (uploadedFile) {
            clearFile();
        }
        
        addSystemMessage(`Started new session with ${currentAgent.name}`);
        console.log('New session started:', agentSessions[currentAgent.id]);
    }

    // Theme Management
    function loadTheme() {
        chrome.storage.local.get(['darkMode'], (result) => {
            isDarkMode = result.darkMode || false;
            applyTheme();
        });
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        chrome.storage.local.set({ darkMode: isDarkMode });
        applyTheme();
    }

    function applyTheme() {
        const themeIcon = themeToggle.querySelector('.material-symbols-rounded');
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeIcon.textContent = 'light_mode';
            themeLabel.textContent = 'Light Mode';
            themeToggle.title = 'Switch to Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.textContent = 'dark_mode';
            themeLabel.textContent = 'Dark Mode';
            themeToggle.title = 'Switch to Dark Mode';
        }
    }

    // Agent Management
    function loadAgents() {
        chrome.storage.local.get(['agents'], (result) => {
            agents = result.agents || [];
            renderAgentSelect();
            renderSavedAgents();
            
            // Auto-select first agent if exists and no agent is currently selected
            if (agents.length > 0 && !currentAgent) {
                const firstAgent = agents[0];
                currentAgent = firstAgent;
                currentAgentName.textContent = firstAgent.name;
                
                // Get or create session
                const session = getOrCreateSession(firstAgent.id);
                updateStatus(`Connected to: ${firstAgent.name} (Session: ${session.sessionId.substr(0, 20)}...)`);
            } else if (agents.length === 0) {
                currentAgent = null;
                currentAgentName.textContent = 'Select Agent';
                updateStatus('No agent selected');
            }
        });
    }

    function saveAgents() {
        chrome.storage.local.set({ agents: agents }, () => {
            renderAgentSelect();
            renderSavedAgents();
            
            // If we just deleted all agents, reset the button
            if (agents.length === 0) {
                currentAgent = null;
                currentAgentName.textContent = 'Select Agent';
                updateStatus('No agent selected');
            }
        });
    }

    function addAgent() {
        const name = agentName.value.trim();
        const webhook = agentWebhook.value.trim();

        if (!name || !webhook) {
            alert('Please enter both agent name and webhook URL');
            return;
        }

        // Validate URL
        try {
            new URL(webhook);
        } catch (e) {
            alert('Please enter a valid webhook URL');
            return;
        }

        const agent = {
            id: Date.now().toString(),
            name: name,
            webhook: webhook
        };

        agents.push(agent);
        saveAgents();

        // Clear inputs
        agentName.value = '';
        agentWebhook.value = '';

        // Select the newly added agent
        selectAgent(agent.id);
        
        addSystemMessage(`Added agent: ${name}`);
    }

    function deleteAgent(agentId) {
        if (!confirm('Delete this agent?')) return;

        agents = agents.filter(a => a.id !== agentId);
        saveAgents();

        if (currentAgent?.id === agentId) {
            currentAgent = null;
            currentAgentName.textContent = 'Select Agent';
            updateStatus('No agent selected');
        }

        addSystemMessage('Agent deleted');
    }

    // Modal Management
    function openEditModal(agentId) {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        editingAgentId = agentId;
        editAgentName.value = agent.name;
        editAgentWebhook.value = agent.webhook;
        editModal.classList.remove('hidden');
        editAgentName.focus();
    }

    function closeEditModal() {
        editModal.classList.add('hidden');
        editingAgentId = null;
        editAgentName.value = '';
        editAgentWebhook.value = '';
    }

    function saveAgentEdit() {
        if (!editingAgentId) return;

        const name = editAgentName.value.trim();
        const webhook = editAgentWebhook.value.trim();

        if (!name || !webhook) {
            alert('Please enter both agent name and webhook URL');
            return;
        }

        // Validate URL
        try {
            new URL(webhook);
        } catch (e) {
            alert('Please enter a valid webhook URL');
            return;
        }

        const agentIndex = agents.findIndex(a => a.id === editingAgentId);
        if (agentIndex !== -1) {
            agents[agentIndex].name = name;
            agents[agentIndex].webhook = webhook;
            saveAgents();

            // Update current agent if it's the one being edited
            if (currentAgent?.id === editingAgentId) {
                currentAgent = agents[agentIndex];
                updateStatus(`Connected to: ${currentAgent.name}`);
            }

            addSystemMessage(`Updated agent: ${name}`);
            closeEditModal();
        }
    }

    function deleteAgentFromModal() {
        if (!editingAgentId) return;
        
        if (!confirm('Are you sure you want to delete this agent?')) return;

        deleteAgent(editingAgentId);
        closeEditModal();
    }

    // Add Agent Modal Functions
    function openAddAgentModal() {
        addAgentModal.classList.remove('hidden');
        newAgentName.value = '';
        newAgentWebhook.value = '';
        newAgentName.focus();
    }

    function closeAddAgentModal() {
        addAgentModal.classList.add('hidden');
        newAgentName.value = '';
        newAgentWebhook.value = '';
    }

    function addAgentFromModal() {
        const name = newAgentName.value.trim();
        const webhook = newAgentWebhook.value.trim();

        if (!name || !webhook) {
            alert('Please enter both agent name and webhook URL');
            return;
        }

        if (!webhook.startsWith('http://') && !webhook.startsWith('https://')) {
            alert('Please enter a valid webhook URL starting with http:// or https://');
            return;
        }

        const newAgent = {
            id: Date.now().toString(),
            name: name,
            webhook: webhook
        };

        agents.push(newAgent);
        chrome.storage.local.set({ agents: agents }, () => {
            renderSavedAgents();
            renderAgentSelect();
            closeAddAgentModal();
            
            // Auto-select the new agent
            currentAgent = newAgent;
            currentAgentName.textContent = newAgent.name;
            const session = getOrCreateSession(newAgent.id);
            updateStatus(newAgent.name);
            addSystemMessage(`Created and selected ${newAgent.name}`);
        });
    }

    // Thinking Indicator Functions
    function showThinkingIndicator() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'thinking-indicator';
        thinkingDiv.id = 'thinking-indicator';
        thinkingDiv.innerHTML = `
            <span class="material-symbols-rounded thinking-icon">autorenew</span>
            <span class="thinking-text">Thinking...</span>
        `;
        chatMessages.appendChild(thinkingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideThinkingIndicator() {
        const indicator = document.getElementById('thinking-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // File Upload Handler
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log(`File selected: ${file.name} (${file.type}, ${file.size} bytes)`);

        uploadedFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            text: null // Will store extracted text or base64
        };
        
        // Update file button to show X for clearing
        updateFileButton(true);
        
        // Show processing message
        addSystemMessage(`Processing file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)...`);
        
        try {
            // Extract text based on file type
            if (file.type === 'text/plain' || file.type === 'text/csv' || file.type.startsWith('text/')) {
                // Plain text files - extract directly
                uploadedFile.text = await file.text();
                console.log(`Text file: ${uploadedFile.text.length} characters`);
            } else if (file.type === 'application/pdf') {
                // PDF documents - send as base64 for backend processing
                console.log('Encoding PDF as base64 for backend...');
                uploadedFile.text = await extractTextFromPDF(file);
                console.log(`PDF encoded: ${uploadedFile.text.length} characters`);
            } else if (file.type === 'application/json') {
                // JSON files - pretty print
                const jsonText = await file.text();
                uploadedFile.text = JSON.stringify(JSON.parse(jsonText), null, 2);
                console.log(`JSON file: ${uploadedFile.text.length} characters`);
            } else {
                // Unsupported types
                console.warn(`Unsupported file type: ${file.type}`);
                uploadedFile.text = `[File: ${file.name}]\n\n⚠️ This file type (${file.type}) is not supported.\n\nSupported formats: PDF, TXT, CSV, JSON, MD\n\nPlease convert to a supported format or describe what you need help with.`;
            }
            
            addSystemMessage(`✓ File ready: ${file.name} (${uploadedFile.text.length} characters)`);
        } catch (error) {
            console.error('Error processing file:', error);
            addSystemMessage(`⚠️ Could not process ${file.name}`);
            addSystemMessage(`Error: ${error.message}`);
            uploadedFile.text = `[File: ${file.name} - processing failed: ${error.message}]`;
        }
        
        // Clear file input for next upload
        fileInput.value = '';
    }

    function updateFileButton(hasFile) {
        const icon = fileUploadBtn.querySelector('.material-symbols-rounded');
        if (hasFile) {
            icon.textContent = 'close';
            fileUploadBtn.style.background = 'hsl(var(--primary) / 0.2)';
            fileUploadBtn.style.color = 'hsl(var(--primary))';
            fileUploadBtn.title = 'Clear file';
        } else {
            icon.textContent = 'attach_file';
            fileUploadBtn.style.background = '';
            fileUploadBtn.style.color = '';
            fileUploadBtn.title = 'Upload file';
        }
    }

    function clearFile() {
        uploadedFile = null;
        updateFileButton(false);
        addSystemMessage('File cleared');
    }


    // Extract text from PDF - send as base64 to backend for processing
    async function extractTextFromPDF(file) {
        // Since PDF.js can't load in Chrome extensions due to CSP restrictions,
        // we'll send the PDF as base64 to the n8n workflow for backend processing
        try {
            console.log(`Encoding PDF as base64 for backend processing: ${file.name}`);
            
            const base64 = await fileToBase64(file);
            
            return `[PDF_BASE64]${base64}[/PDF_BASE64]\n[PDF_FILENAME]${file.name}[/PDF_FILENAME]\n[PDF_SIZE]${file.size}[/PDF_SIZE]`;
        } catch (error) {
            console.error('PDF encoding error:', error);
            return `[PDF Document: ${file.name}]\n\n❌ Error encoding PDF: ${error.message}\n\nPlease describe what you need help with regarding this document.`;
        }
    }

    // Convert file to base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function selectAgent(agentId) {
        currentAgent = agents.find(a => a.id === agentId);
        
        if (currentAgent) {
            // Update button text (hidden but kept for compatibility)
            currentAgentName.textContent = currentAgent.name;
            
            // Get or create session for this agent
            const session = getOrCreateSession(agentId);
            
            updateStatus(currentAgent.name);
            addSystemMessage(`Switched to ${currentAgent.name}`);
            
            // Close modal
            closeAgentSelectorModal();
        }
    }

    function openAgentSelector() {
        renderAgentSelectorList();
        agentSelectorModal.classList.remove('hidden');
    }

    function closeAgentSelectorModal() {
        agentSelectorModal.classList.add('hidden');
    }

    function renderAgentSelectorList() {
        if (agents.length === 0) {
            agentSelectorList.innerHTML = '';
            emptyAgentState.style.display = 'flex';
            return;
        }

        emptyAgentState.style.display = 'none';
        agentSelectorList.innerHTML = '';
        
        agents.forEach(agent => {
            const agentBtn = document.createElement('button');
            agentBtn.className = 'agent-selector-item';
            if (currentAgent?.id === agent.id) {
                agentBtn.classList.add('active');
            }
            agentBtn.innerHTML = `
                <span class="material-symbols-rounded">smart_toy</span>
                <span class="agent-selector-name">${agent.name}</span>
                ${currentAgent?.id === agent.id ? '<span class="material-symbols-rounded check">check_circle</span>' : ''}
            `;
            
            agentBtn.addEventListener('click', () => {
                selectAgent(agent.id);
            });
            
            agentSelectorList.appendChild(agentBtn);
        });
    }

    function renderAgentSelect() {
        // This function is no longer needed but kept for compatibility
        renderAgentSelectorList();
    }

    function renderSavedAgents() {
        if (agents.length === 0) {
            savedAgentsDiv.innerHTML = '<p style="color: hsl(var(--muted-foreground)); font-size: 13px;">No agents saved yet</p>';
            return;
        }

        savedAgentsDiv.innerHTML = '';
        
        agents.forEach(agent => {
            const agentDiv = document.createElement('div');
            agentDiv.className = 'agent-item';
            agentDiv.innerHTML = `
                <div class="agent-info">
                    <div class="agent-name">${agent.name}</div>
                </div>
                <div class="agent-actions">
                    <button class="edit-btn" data-id="${agent.id}">
                        <span class="material-symbols-rounded">edit</span>
                    </button>
                </div>
            `;
            
            agentDiv.querySelector('.edit-btn').addEventListener('click', (e) => {
                openEditModal(e.target.closest('button').dataset.id);
            });
            
            savedAgentsDiv.appendChild(agentDiv);
        });
    }

    // Chat Functions
    async function sendMessage() {
        if (!currentAgent) {
            alert('Please select an agent first');
            return;
        }

        const message = messageInput.value.trim();
        if (!message) return;

        // Disable input while sending and show thinking indicator
        messageInput.disabled = true;
        sendBtn.disabled = true;
        showThinkingIndicator();

        // Add user message to chat
        addMessage(message, 'user');
        messageInput.value = '';
        messageInput.style.height = '24px'; // Reset to min height after sending
        messageInput.style.overflowY = 'hidden';

        // Show thinking indicator
        showThinkingIndicator();

        try {
            updateStatus('Sending...');
            
            // Get current session
            const session = getOrCreateSession(currentAgent.id);
            
            // Add action query parameter that n8n Chat Trigger expects
            const webhookUrl = new URL(currentAgent.webhook);
            webhookUrl.searchParams.set('action', 'sendMessage');
            
            // Prepare request body
            const requestBody = { 
                chatInput: message,
                sessionId: session.sessionId
            };
            
            // If file is uploaded, include extracted text in the message
            if (uploadedFile && uploadedFile.text) {
                requestBody.chatInput = `[Attached file: ${uploadedFile.name}]\n\n${uploadedFile.text}\n\n---\n\nUser question: ${message}`;
                
                // Don't clear the file - let it persist for multiple messages
                // User can manually clear it with the X button
            }
            
            const response = await fetch(webhookUrl.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove thinking indicator
            hideThinkingIndicator();

            // Create empty assistant message bubble for streaming
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';
            chatMessages.appendChild(messageDiv);
            
            // Read response as stream for real-time updates
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullMessage = '';
            
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) break;
                    
                    // Decode chunk and add to buffer
                    buffer += decoder.decode(value, { stream: true });
                    
                    // Process complete lines (NDJSON format)
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer
                    
                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const data = JSON.parse(line);
                                // Extract content from streaming chunks
                                if (data.type === 'item' && data.content) {
                                    fullMessage += data.content;
                                    // Update UI in real-time
                                    messageDiv.innerHTML = parseMarkdown(fullMessage);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }
                            } catch (e) {
                                console.error('Error parsing line:', line, e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Streaming error:', error);
                if (!fullMessage) {
                    messageDiv.textContent = 'Error: Stream interrupted';
                    messageDiv.className = 'message error';
                }
            }
            
            // If no content was received, show error
            if (!fullMessage) {
                messageDiv.textContent = 'No response from agent';
                messageDiv.className = 'message error';
            } else {
                // Add action buttons after streaming completes
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'message-actions';
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'message-action-btn';
                copyBtn.innerHTML = '<span class="material-symbols-rounded">content_copy</span> Copy';
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(fullMessage);
                    copyBtn.innerHTML = '<span class="material-symbols-rounded">check</span> Copied';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<span class="material-symbols-rounded">content_copy</span> Copy';
                    }, 2000);
                };
                
                const retryBtn = document.createElement('button');
                retryBtn.className = 'message-action-btn';
                retryBtn.innerHTML = '<span class="material-symbols-rounded">refresh</span> Retry';
                retryBtn.onclick = () => {
                    // Find the user message immediately before this assistant message
                    let previousElement = messageDiv.previousElementSibling;
                    while (previousElement) {
                        if (previousElement.classList.contains('message') && 
                            previousElement.classList.contains('user')) {
                            const userText = previousElement.textContent;
                            messageInput.value = userText;
                            messageInput.focus();
                            autoExpandTextarea();
                            break;
                        }
                        previousElement = previousElement.previousElementSibling;
                    }
                };
                
                actionsDiv.appendChild(copyBtn);
                actionsDiv.appendChild(retryBtn);
                messageDiv.appendChild(actionsDiv);
            }
            
            const sessionData = agentSessions[currentAgent.id];
            updateStatus(currentAgent.name);

        } catch (error) {
            console.error('Error sending message:', error);
            hideThinkingIndicator();
            addMessage(`Error: ${error.message}`, 'error');
            updateStatus('Error sending message');
        } finally {
            hideThinkingIndicator();
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
        }
    }

    async function handleStreamingResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Create empty assistant message bubble
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        chatMessages.appendChild(messageDiv);
        
        let buffer = '';
        let fullText = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                // Decode the chunk
                buffer += decoder.decode(value, { stream: true });
                
                // Process complete lines (SSE format: "data: {...}\n\n")
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6).trim();
                        
                        if (jsonStr === '[DONE]') {
                            continue;
                        }
                        
                        try {
                            const data = JSON.parse(jsonStr);
                            
                            // Extract text chunk - adjust based on your n8n response format
                            let chunk = '';
                            if (data.choices && data.choices[0]?.delta?.content) {
                                // OpenAI format
                                chunk = data.choices[0].delta.content;
                            } else if (data.delta && data.delta.text) {
                                // Anthropic format
                                chunk = data.delta.text;
                            } else if (data.content) {
                                // Simple format
                                chunk = data.content;
                            } else if (typeof data === 'string') {
                                chunk = data;
                            }
                            
                            if (chunk) {
                                fullText += chunk;
                                messageDiv.innerHTML = parseMarkdown(fullText);
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        } catch (e) {
                            // If JSON parsing fails, might be plain text
                            if (jsonStr) {
                                fullText += jsonStr;
                                messageDiv.innerHTML = parseMarkdown(fullText);
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Streaming error:', error);
            if (!fullText) {
                messageDiv.textContent = 'Error: Stream interrupted';
            }
        }
    }

    function extractMessageFromResponse(data) {
        if (typeof data === 'string') {
            return data;
        } else if (data.message) {
            return data.message;
        } else if (data.response) {
            return data.response;
        } else if (data.output) {
            return data.output;
        } else {
            return JSON.stringify(data, null, 2);
        }
    }

    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Parse markdown for assistant messages
        if (type === 'assistant') {
            messageDiv.innerHTML = parseMarkdown(text);
            
            // Add action buttons for assistant messages
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'message-action-btn';
            copyBtn.innerHTML = '<span class="material-symbols-rounded">content_copy</span> Copy';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(text);
                copyBtn.innerHTML = '<span class="material-symbols-rounded">check</span> Copied';
                setTimeout(() => {
                    copyBtn.innerHTML = '<span class="material-symbols-rounded">content_copy</span> Copy';
                }, 2000);
            };
            
            const retryBtn = document.createElement('button');
            retryBtn.className = 'message-action-btn';
            retryBtn.innerHTML = '<span class="material-symbols-rounded">refresh</span> Retry';
            retryBtn.onclick = () => {
                // Find the user message immediately before this assistant message
                let previousElement = messageDiv.previousElementSibling;
                while (previousElement) {
                    if (previousElement.classList.contains('message') && 
                        previousElement.classList.contains('user')) {
                        const userText = previousElement.textContent;
                        messageInput.value = userText;
                        messageInput.focus();
                        autoExpandTextarea();
                        break;
                    }
                    previousElement = previousElement.previousElementSibling;
                }
            };
            
            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(retryBtn);
            messageDiv.appendChild(actionsDiv);
        } else {
            messageDiv.textContent = text;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function parseMarkdown(text) {
        // Escape HTML first
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Bold (**text** or __text__)
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
        
        // Italic (*text* or _text_)
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');
        
        // Code (`code`)
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');
        
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    function addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    function updateStatus(text) {
        // Status bar removed - keeping function for compatibility
        console.log('Status:', text);
    }

    // Install Agent Pack function
    async function installAgentPack() {
        const packCode = packCodeInput.value.trim();
        
        if (!packCode) {
            alert('Please enter a pack code');
            return;
        }
        
        installPackBtn.disabled = true;
        installPackBtn.textContent = 'Installing...';
        
        try {
            console.log('Fetching pack:', packCode);
            
            const response = await fetch('https://www.brandmoveslabs.com/webhook/packs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: packCode
                })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Pack not found or invalid');
            }
            
            const data = await response.json();
            console.log('Pack data received:', data);
            
            if (!data.agents || data.agents.length === 0) {
                throw new Error('No agents found in pack');
            }
            
            let addedCount = 0;
            data.agents.forEach(agent => {
                const exists = agents.find(a => a.webhook === agent.webhook);
                if (!exists) {
                    agents.push({
                        id: agent.id || Date.now().toString() + Math.random(),
                        name: agent.name,
                        webhook: agent.webhook
                    });
                    addedCount++;
                }
            });
            
            saveAgents();
            renderSavedAgents();
            renderAgentSelectorList();
            
            if (addedCount > 0 && agents.length > 0) {
                const firstNewAgent = agents[agents.length - addedCount];
                selectAgent(firstNewAgent.id);
            }
            
            addSystemMessage(`✓ Installed "${data.pack_name}" (${addedCount} agents)`);
            packCodeInput.value = '';
            
            installPackBtn.disabled = false;
            installPackBtn.textContent = 'Install Pack';
            
        } catch (error) {
            console.error('Error installing pack:', error);
            alert('Error installing pack: ' + error.message);
            
            installPackBtn.disabled = false;
            installPackBtn.textContent = 'Install Pack';
        }
    }

}); // End DOMContentLoaded
