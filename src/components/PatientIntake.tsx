import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatBubble } from './foundation/ChatBubble';
import { CustomButton } from './foundation/Button';
import { CustomInput } from './foundation/Input';

interface ChatMessage {
  type: 'patient' | 'system';
  content: string;
  timestamp: string;
  options?: Array<{label: string; value: string}>;
  pdf_report?: string; // Base64 encoded PDF
  isHistorical?: boolean; // Flag for messages from before pause
}

export default function PatientIntake() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resumeToken, setResumeToken] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [completedScreeners, setCompletedScreeners] = useState<string[]>([]);
  const [reportGenerationFailed, setReportGenerationFailed] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pausedSessionInfo, setPausedSessionInfo] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  
  const sessionRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUserName = localStorage.getItem('user_name') || '';
    setIsAuthenticated(!!token);
    setUserName(storedUserName);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  useEffect(() => {
    // Check for paused session first
    const pausedSessionData = localStorage.getItem('paused_session');
    if (pausedSessionData) {
      try {
        const parsed = JSON.parse(pausedSessionData);
        const expiresAt = new Date(parsed.expires_at);
        const now = new Date();
        
        // Check if session hasn't expired
        if (expiresAt > now && parsed.resume_token) {
          // Check if coming from dashboard's "Resume" button
          const autoResume = location.state?.autoResume;
          
          if (autoResume) {
            // User clicked Resume button - auto-resume silently
            sessionRef.current = parsed.session_token;
            setSessionId(parsed.session_token.slice(0, 8));
            setResumeToken(parsed.resume_token);
            setExpiresAt(parsed.expires_at);
            setPaused(true);
            setCompletedScreeners(parsed.completed_screeners || []);
            resumeSession(parsed.resume_token);
            return; // Don't init new session
          } else {
            // User navigated here accidentally - show modal to ask what they want
            setPausedSessionInfo(parsed);
            setShowResumeModal(true);
            return; // Don't init new session yet, wait for user choice
          }
        } else {
          // Session expired, clear it
          localStorage.removeItem('paused_session');
        }
      } catch (e) {
        console.error('Error parsing paused session:', e);
        localStorage.removeItem('paused_session');
      }
    }
    
    // No paused session or user chose to start fresh
    initSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitialGreeting = async () => {
    if (!sessionRef.current) return;
    
    const token = localStorage.getItem('access_token');
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://psychnow-api.onrender.com');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${apiBase}/api/v1/intake/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_token: sessionRef.current,
          prompt: '', // Empty prompt triggers initial greeting
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get initial greeting');
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
                // Update the last message with streaming content
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.type === 'system') {
                    lastMessage.content = fullResponse;
                  } else {
                    // Create new message if none exists
                    newMessages.push({
                      type: 'system',
                      content: fullResponse,
                      timestamp: new Date().toISOString(),
                    });
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.warn('Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting initial greeting:', error);
      pushSys('⚠️ Failed to get initial greeting. Please refresh the page.', new Date().toISOString());
    }
  };

  const initSession = async () => {
    const token = localStorage.getItem('access_token');
    let userId = localStorage.getItem('user_id');
    
    // Show initialization message
    setIsInitializing(true);
    
    // Get user name from localStorage (for authenticated users) or navigation state
    const userName = localStorage.getItem('user_name') || (location.state as any)?.userName || null;
    
    // Allow anonymous sessions - generate temp ID if not logged in
    if (!userId) {
      userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('temp_user_id', userId);
      console.log('Starting anonymous session with temp ID:', userId);
    }
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://psychnow-api.onrender.com');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${apiBase}/api/v1/intake/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          patient_id: userId,
          user_name: userName  // Pass user name to skip name question
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to start session');
      }
      
      const data = await res.json();
      sessionRef.current = data.session_token;
      setSessionId(data.session_token.slice(0, 8));
      
      // Get the real initial greeting from the backend
      await getInitialGreeting();
      setIsInitializing(false);
      
    } catch (err) {
      console.error('Failed to start session:', err);
      setIsInitializing(false);
      pushSys('⚠️ Failed to start session. Please refresh the page.', new Date().toISOString());
    }
  };

  const pushSys = (content: string, timestamp: string) => {
    setMessages(prev => [...prev, {
      type: 'system',
      content,
      timestamp,
    }]);
  };

  const pushPatient = (content: string) => {
    setMessages(prev => [...prev, {
      type: 'patient',
      content,
      timestamp: new Date().toISOString(),
    }]);
  };

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || busy) return;
    
    // Don't display :finish commands to the patient
    if (prompt.trim() !== ":finish") {
      pushPatient(prompt);
    }
    
    setBusy(true);

    await sendMessageToBackend(prompt);
  };

  const sendMessageWithoutAddingUser = async (prompt: string) => {
    if (!prompt.trim() || busy) return;
    
    setBusy(true);
    await sendMessageToBackend(prompt);
  };

  const sendMessageToBackend = async (prompt: string) => {

    const token = localStorage.getItem('access_token');
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://psychnow-api.onrender.com');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${apiBase}/api/v1/intake/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_token: sessionRef.current,
          prompt: prompt
        })
      });
      
      // Handle rate limiting specifically
      if (res.status === 429) {
        pushSys('⏱️ You\'re responding very quickly! Please wait a few seconds and try again. Your progress is saved.', new Date().toISOString());
        setBusy(false);
        return; // Don't throw, just return
      }
      
      if (!res.ok) {
        throw new Error('Backend request failed');
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      if (reader) {
        let fullResponse = '';
        let isFirstChunk = true;

      while (true) {
          const { done, value } = await reader.read();
        if (done) {
          setBusy(false);
          break;
        }

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullResponse += data.content;
                  
                  // For the first chunk, create a new message
                  if (isFirstChunk) {
                    setMessages(prev => [...prev, {
                      type: 'system',
                      content: data.content,
                      timestamp: new Date().toISOString(),
                    }]);
                    isFirstChunk = false;
                  } else {
                    // Update the last message with streaming content
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.type === 'system') {
                        lastMessage.content = fullResponse;
                      }
                      return newMessages;
                    });
                  }
                }
                
                // Handle options if provided
                if (data.options) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.type === 'system') {
                      lastMessage.options = data.options;
                    }
                    return newMessages;
                  });
                }
                
                // Handle PDF report if provided
                if (data.pdf_report) {
                  console.log('📄 PDF report received, attaching to message');
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.type === 'system') {
                      lastMessage.pdf_report = data.pdf_report;
                    }
                    return newMessages;
                  });
                }
                
                // Capture report ID for anonymous users
                if (data.content && data.content.startsWith('REPORT_ID:')) {
                  const reportId = data.content.replace('REPORT_ID:', '');
                  console.log('📋 Report generated with ID:', reportId);
                  localStorage.setItem('last_report_id', reportId);
                  localStorage.setItem('last_report_date', new Date().toISOString());
                  // Don't display this technical message to user
                  return;
                }
                
                if (data.done) {
                  setBusy(false);
                  
                  // Check if this was a report generation completion
                  if (fullResponse.includes('Assessment complete') || fullResponse.includes('Assessment Summary')) {
                    setFinished(true);
                    localStorage.removeItem('paused_session');
                  }
                  
                  // Check for report generation error
                  if (fullResponse.includes('error while generating your report') || 
                      fullResponse.includes('Error generating report')) {
                    setReportGenerationFailed(true);
                  }
                }
    } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Backend error:', error);
      pushSys('⚠️ Sorry, I encountered an error. Please try again.', new Date().toISOString());
      setBusy(false);
    }
  };

  const downloadPDF = (pdfBase64: string, patientName: string = 'Patient') => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PsychNow_Assessment_${patientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const pauseSession = async () => {
    if (!sessionRef.current || busy) return;
    
    const token = localStorage.getItem('access_token');
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://psychnow-api.onrender.com');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBase}/api/v1/intake/pause`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_token: sessionRef.current,
          prompt: '' // Not needed for pause
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaused(true);
        setResumeToken(data.resume_token);
        setExpiresAt(data.expires_at);
        setCompletedScreeners(data.completed_screeners || []);
        
        // Persist to localStorage for recovery
        localStorage.setItem('paused_session', JSON.stringify({
          session_token: sessionRef.current,
          resume_token: data.resume_token,
          expires_at: data.expires_at,
          paused_at: new Date().toISOString(),
          completed_screeners: data.completed_screeners || []
        }));
        
        // Show pause confirmation message
        pushSys("Your assessment has been paused. You can continue anytime within 24 hours. Your progress has been saved.", new Date().toISOString());
      } else {
        const errorData = await response.json();
        pushSys(`Unable to pause session: ${errorData.detail || 'Unknown error'}`, new Date().toISOString());
      }
    } catch (error) {
      console.error('Error pausing session:', error);
      pushSys('Unable to pause session. Please try again.', new Date().toISOString());
    }
  };

  const resumeSession = async (token?: string) => {
    const tokenToUse = token || resumeToken;
    if (!tokenToUse) return;
    
    const authToken = localStorage.getItem('access_token');
    const userName = localStorage.getItem('user_name');
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://psychnow-api.onrender.com');
      
      // Build headers - only add Authorization if token exists
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${apiBase}/api/v1/intake/resume`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resume_token: tokenToUse,
          user_name: userName  // Pass user name when resuming
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Resume successful! Response data:', {
          session_token: data.session_token,
          history_length: data.conversation_history?.length || 0,
          completed_screeners: data.completed_screeners,
          has_welcome_message: !!data.welcome_message
        });
        
        setPaused(false);
        setResumeToken('');
        setExpiresAt('');
        setSessionId(data.session_token);
        sessionRef.current = data.session_token;
        setCompletedScreeners(data.completed_screeners || []);
        
        // Clear paused session from localStorage (now resumed)
        localStorage.removeItem('paused_session');
        
        // Restore full conversation history
        if (data.conversation_history && data.conversation_history.length > 0) {
          console.log('📜 Restoring conversation history:', data.conversation_history.length, 'messages');
          
          const historicalMessages: ChatMessage[] = data.conversation_history.map((msg: any, idx: number) => {
            // Map backend roles to frontend types
            const type = msg.role === 'user' ? 'patient' : 'system';
            console.log(`  ${idx + 1}. [${msg.role}] → [${type}]:`, msg.content?.substring(0, 60));
            
            return {
              type,
              content: msg.content || '',
              timestamp: msg.timestamp || new Date().toISOString(),
              isHistorical: true, // Mark as historical for styling
              options: msg.options
            };
          });
          
          console.log('✅ Mapped', historicalMessages.length, 'historical messages');
          
          // Add visual divider
          const dividerMessage: ChatMessage = {
            type: 'system',
            content: `━━━━━ Session Resumed ${new Date().toLocaleString()} ━━━━━`,
            timestamp: new Date().toISOString(),
            isHistorical: false
          };
          
          // Set all messages: history + divider + welcome back
          const allMessages = [...historicalMessages, dividerMessage];
          
          if (data.welcome_message) {
            allMessages.push({
              type: 'system',
              content: data.welcome_message,
              timestamp: new Date().toISOString()
            });
          }
          
          setMessages(allMessages);
        } else if (data.welcome_message) {
          // No history, just show welcome message
          pushSys(data.welcome_message, new Date().toISOString());
        }
      } else if (response.status === 410) {
        console.log('⏱️ Session expired (410)');
        pushSys('Your paused session has expired. Please start a new assessment.', new Date().toISOString());
        setPaused(false);
        setResumeToken('');
        setExpiresAt('');
        localStorage.removeItem('paused_session');
      } else if (response.status === 404) {
        console.log('🔍 Session not found (404) - session may have been already resumed or deleted');
        const errorData = await response.json().catch(() => ({ detail: 'Session not found' }));
        pushSys(`Unable to resume: ${errorData.detail}. Please refresh the page or start a new assessment.`, new Date().toISOString());
        setPaused(false);
        setResumeToken('');
        setExpiresAt('');
        localStorage.removeItem('paused_session');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('❌ Resume failed:', response.status, errorData);
        pushSys(`Unable to resume session: ${errorData.detail || 'Unknown error'}. Please try again or start a new assessment.`, new Date().toISOString());
        setPaused(false);
        setResumeToken('');
        setExpiresAt('');
        localStorage.removeItem('paused_session');
      }
    } catch (error) {
      console.error('💥 Error resuming session:', error);
      pushSys('Unable to resume session. Please check your connection and try again.', new Date().toISOString());
      setPaused(false);
      setResumeToken('');
      setExpiresAt('');
      localStorage.removeItem('paused_session');
    }
  };

  const retryReportGeneration = () => {
    // Send :finish command to retry report generation
    // This keeps all chat history intact
    setReportGenerationFailed(false);
    sendMessageWithoutAddingUser(':finish');
  };

  const handleFinish = async () => {
    if (finished) return;
    
    // Use the chat endpoint with :finish command instead
    // This allows for retry functionality
    sendMessageWithoutAddingUser(':finish');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !busy) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleOptionClick = (option: string) => {
    if (!busy) {
      // Don't display :finish commands to the patient
      if (option !== ":finish") {
        // Add user's selection to messages
        setMessages(prev => [...prev, {
          type: 'patient',
          content: option,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        // For :finish, show a user-friendly message instead
        setMessages(prev => [...prev, {
          type: 'patient',
          content: "Complete Assessment",
          timestamp: new Date().toISOString(),
        }]);
      }
      
      // Send the selection to the backend (but don't add to messages again)
      sendMessageWithoutAddingUser(option);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleResumeFromModal = () => {
    if (pausedSessionInfo) {
      console.log('🔄 Resuming from modal with token:', pausedSessionInfo.resume_token);
      console.log('📊 Session info:', {
        session_token: pausedSessionInfo.session_token,
        completed_screeners: pausedSessionInfo.completed_screeners,
        paused_at: pausedSessionInfo.paused_at,
        expires_at: pausedSessionInfo.expires_at
      });
      
      // Set up session info for resuming
      sessionRef.current = pausedSessionInfo.session_token;
      setSessionId(pausedSessionInfo.session_token.slice(0, 8));
      setResumeToken(pausedSessionInfo.resume_token);
      setExpiresAt(pausedSessionInfo.expires_at);
      setCompletedScreeners(pausedSessionInfo.completed_screeners || []);
      setShowResumeModal(false);
      // Resume the session (this will set paused to false and restore messages)
      resumeSession(pausedSessionInfo.resume_token);
    }
  };

  const handleStartFreshFromModal = () => {
    // Clear the paused session and start fresh
    localStorage.removeItem('paused_session');
    setPausedSessionInfo(null);
    setShowResumeModal(false);
    // Reset all session state
    setMessages([]);
    setSessionId('');
    setResumeToken('');
    setExpiresAt('');
    setPaused(false);
    setFinished(false);
    setCompletedScreeners([]);
    sessionRef.current = null;
    // Initialize new session
    initSession();
  };
  
  const handleSignup = async (signupData: {name: string; email: string; phone: string; state: string; password: string}) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://psychnow-api.onrender.com');
      
      // Step 1: Create account
      const signupRes = await fetch(`${apiBase}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          name: signupData.name,
          phone: signupData.phone,
          state: signupData.state,
          role: 'patient'
        })
      });
      
      if (!signupRes.ok) {
        const error = await signupRes.json();
        alert(`Signup failed: ${error.detail || 'Unknown error'}`);
        return;
      }
      
      const signupResult = await signupRes.json();
      
      // Step 2: Login to get token
      const loginRes = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: signupData.email,
          password: signupData.password
        })
      });
      
      if (!loginRes.ok) {
        alert('Account created but login failed. Please sign in manually.');
        setShowSignupModal(false);
        return;
      }
      
      const loginResult = await loginRes.json();
      
      // Step 3: Store credentials
      localStorage.setItem('access_token', loginResult.access_token);
      localStorage.setItem('user_id', signupResult.id);
      localStorage.setItem('user_name', signupData.name);
      localStorage.removeItem('temp_user_id');
      
      // Step 4: Transfer anonymous session to new account
      if (sessionRef.current) {
        try {
          const transferRes = await fetch(`${apiBase}/api/v1/intake/transfer-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginResult.access_token}`
            },
            body: JSON.stringify({
              session_token: sessionRef.current,
              new_user_id: signupResult.id,
              user_name: signupData.name
            })
          });
          
          if (transferRes.ok) {
            console.log('✅ Session transferred to new account');
          } else {
            console.warn('⚠️ Session transfer failed, but account created');
          }
        } catch (err) {
          console.error('Error transferring session:', err);
        }
      }
      
      // Step 5: Update UI state
      setIsAuthenticated(true);
      setUserName(signupData.name);
      setShowSignupModal(false);
      
      // Step 6: Notify Ava to use the new name
      pushSys(`✅ Account created successfully! Welcome, ${signupData.name}. Your assessment progress has been saved.`, new Date().toISOString());
      
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b px-3 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm md:text-base">A</span>
              </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-semibold text-gray-900 truncate">Ava - Mental Health Assessment</h1>
              <p className="text-xs md:text-sm text-gray-500 truncate">Session ID: {sessionId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!finished && (
              <CustomButton
                onClick={pauseSession}
                variant="secondary"
                disabled={loading || busy}
                className="text-xs md:text-sm px-3 md:px-4 py-2 font-medium"
              >
                Take a Break
              </CustomButton>
            )}
            <CustomButton
              onClick={() => navigate('/patient-dashboard')}
              variant="secondary"
              className="text-xs md:text-sm px-3 md:px-4 py-2 font-medium"
            >
              Dashboard
            </CustomButton>

            {/* User Context / Account Actions (always at extreme right) */}
            {(!isAuthenticated || !userName) ? (
              <CustomButton
                onClick={() => setShowSignupModal(true)}
                variant="primary"
                className="text-xs md:text-sm px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                <span className="flex items-center gap-2">💾 Create Account</span>
              </CustomButton>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xs md:text-sm font-bold">
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                      {userName}
                    </span>
                    <span className="text-[10px] md:text-xs text-blue-700 leading-tight">
                      Logged In
                    </span>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500">{localStorage.getItem('user_email')}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate('/patient-dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Request Appointment
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={() => {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user_id');
                        localStorage.removeItem('user_name');
                        localStorage.removeItem('user_email');
                        localStorage.removeItem('user_role');
                        setIsAuthenticated(false);
                        setUserName('');
                        setShowUserDropdown(false);
                        navigate('/patient-signin');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>

      {/* Pause Status */}
      {paused && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-800 font-medium">Assessment Paused</p>
              <p className="text-xs text-blue-600">
                Expires: {new Date(expiresAt).toLocaleString()}
              </p>
            </div>
            <CustomButton
              onClick={() => resumeSession()}
              variant="primary"
            >
              Continue Assessment
            </CustomButton>
          </div>
                  </div>
                )}

      {/* Progress Indicator */}
      {completedScreeners.length > 0 && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-2">
          <p className="text-xs text-green-700">
            Completed: {completedScreeners.join(', ')}
          </p>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-3 md:p-6 flex flex-col gap-3 md:gap-4">
          {isInitializing && (
            <div className="text-center text-gray-600 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Preparing your mental health assessment...</p>
              <p className="text-sm text-gray-500 mt-2">Ava will be ready shortly</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className="flex">
              <div className={msg.type === 'patient' ? 'max-w-[95%] md:max-w-[85%] ml-auto mr-2 md:mr-4' : 'max-w-[95%] md:max-w-[85%] ml-2 md:ml-4'}>
                <ChatBubble type={msg.type} isHistorical={msg.isHistorical}>
                {/* Add speaker label for historical messages */}
                {msg.isHistorical && (
                  <div className="text-xs font-semibold mb-1 opacity-70">
                    {msg.type === 'patient' ? 'You:' : 'Ava:'}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.options && msg.type === 'system' && (
                  <div className="mt-3 space-y-2">
                    {msg.options.map((option: any, optionIdx: number) => (
                      <button
                        key={optionIdx}
                        onClick={() => handleOptionClick(option.value)}
                        className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-800 font-medium transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                {msg.pdf_report && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800">📄 Assessment Report Generated</h4>
                        <p className="text-sm text-green-600 mt-1">Your comprehensive report is ready for download</p>
                      </div>
                      <button
                        onClick={() => downloadPDF(msg.pdf_report!)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                )}
                {msg.timestamp && (
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </ChatBubble>
              </div>
            </div>
          ))}
          {busy && (
            <div>
            <ChatBubble type="system">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Ava is thinking...</span>
                </div>
            </ChatBubble>
            </div>
          )}
          
          {/* Retry Report Generation Button */}
          {reportGenerationFailed && !busy && (
            <div className="flex justify-center my-4">
              <CustomButton
                onClick={retryReportGeneration}
                variant="primary"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg shadow-lg"
              >
                🔄 Retry Report Generation
              </CustomButton>
            </div>
          )}
          
          <div ref={messagesEndRef} />
      </div>

        {/* Input Area */}
        <div className="border-t bg-white p-3 md:p-4">
          {!finished && !paused ? (
            <form onSubmit={handleSubmit} className="flex flex-row gap-2 md:gap-3 items-center">
              <CustomInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here..."
                disabled={busy}
                className="flex-1 text-base md:text-lg h-[48px] md:h-[50px] px-4"
              />
              <CustomButton
                type="submit"
                variant="primary"
                disabled={!input.trim() || busy}
                className="flex-shrink-0 w-auto min-w-[80px] md:min-w-[100px] h-[48px] md:h-[50px] px-4 md:px-6 text-base md:text-lg font-medium"
              >
                Send
              </CustomButton>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Assessment completed. Thank you for your time.</p>
            </div>
          )}
          <div className="text-xs text-gray-400 mt-2 text-center">
            {!finished ? "Ava will guide you through the assessment. Use 'Take a Break' if you need to pause." : "Assessment complete"}
          </div>
        </div>
      </div>
      
      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Account</h2>
            <p className="text-sm text-gray-600 mb-6">
              Save your assessment progress and access it anytime. Your current session will be linked to your new account.
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const password = formData.get('password') as string;
              const confirmPassword = formData.get('confirmPassword') as string;
              
              if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
              }
              
              if (!formData.get('agreeToTerms')) {
                alert('You must agree to the Terms of Service and Privacy Policy');
                return;
              }
              
              handleSignup({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                state: formData.get('state') as string,
                password: password
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address*
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State of residence*
                  </label>
                  <select
                    name="state"
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select your state</option>
                    <option value="AL">AL</option>
                    <option value="AK">AK</option>
                    <option value="AZ">AZ</option>
                    <option value="AR">AR</option>
                    <option value="CA">CA</option>
                    <option value="CO">CO</option>
                    <option value="CT">CT</option>
                    <option value="DE">DE</option>
                    <option value="FL">FL</option>
                    <option value="GA">GA</option>
                    <option value="HI">HI</option>
                    <option value="ID">ID</option>
                    <option value="IL">IL</option>
                    <option value="IN">IN</option>
                    <option value="IA">IA</option>
                    <option value="KS">KS</option>
                    <option value="KY">KY</option>
                    <option value="LA">LA</option>
                    <option value="ME">ME</option>
                    <option value="MD">MD</option>
                    <option value="MA">MA</option>
                    <option value="MI">MI</option>
                    <option value="MN">MN</option>
                    <option value="MS">MS</option>
                    <option value="MO">MO</option>
                    <option value="MT">MT</option>
                    <option value="NE">NE</option>
                    <option value="NV">NV</option>
                    <option value="NH">NH</option>
                    <option value="NJ">NJ</option>
                    <option value="NM">NM</option>
                    <option value="NY">NY</option>
                    <option value="NC">NC</option>
                    <option value="ND">ND</option>
                    <option value="OH">OH</option>
                    <option value="OK">OK</option>
                    <option value="OR">OR</option>
                    <option value="PA">PA</option>
                    <option value="RI">RI</option>
                    <option value="SC">SC</option>
                    <option value="SD">SD</option>
                    <option value="TN">TN</option>
                    <option value="TX">TX</option>
                    <option value="UT">UT</option>
                    <option value="VT">VT</option>
                    <option value="VA">VA</option>
                    <option value="WA">WA</option>
                    <option value="WV">WV</option>
                    <option value="WI">WI</option>
                    <option value="WY">WY</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Create password*
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a secure password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm password*
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>
                
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSignupModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume or Start Fresh Modal */}
      {showResumeModal && pausedSessionInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment In Progress</h2>
              <p className="text-gray-600">
                You have a paused mental health assessment. Would you like to continue where you left off?
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Paused:</span>
                  <span className="text-gray-900">
                    {pausedSessionInfo.paused_at 
                      ? new Date(pausedSessionInfo.paused_at).toLocaleString()
                      : 'Recently'
                    }
                  </span>
                </div>
                {pausedSessionInfo.completed_screeners?.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Progress:</span>
                    <span className="text-gray-900">
                      {pausedSessionInfo.completed_screeners.length} screeners completed
                    </span>
                  </div>
                )}
                {pausedSessionInfo.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Expires:</span>
                    <span className="text-gray-900">
                      {new Date(pausedSessionInfo.expires_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResumeFromModal}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Continue Assessment
              </button>
              
              <button
                onClick={handleStartFreshFromModal}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Start Fresh Assessment
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Starting fresh will permanently delete your paused assessment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}