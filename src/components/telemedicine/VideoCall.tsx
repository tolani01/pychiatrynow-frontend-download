/**
 * Video Call Component - WebRTC telemedicine consultation interface
 * Provides video/audio communication with session management
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Types
interface VideoCallProps {
  sessionId: string;
  userRole: 'provider' | 'patient';
  token: string;
  onSessionEnd?: (reason: string) => void;
  onError?: (error: string) => void;
}

interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  error?: string;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'failed';
}

const VideoCall: React.FC<VideoCallProps> = ({
  sessionId,
  userRole,
  token,
  onSessionEnd,
  onError
}) => {
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // WebRTC objects
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  
  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'connecting'
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize WebRTC connection
  const initializeWebRTC = useCallback(async () => {
    try {
      setConnectionState({ status: 'connecting' });
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(rtcConfig);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });
      
      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage({
            type: 'ice_candidate',
            candidate: event.candidate
          });
        }
      };
      
      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current?.connectionState;
        if (state === 'connected') {
          setConnectionState({ status: 'connected', connectionQuality: 'excellent' });
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionState({ status: 'failed', error: 'Connection lost' });
        }
      };
      
      // Connect to signaling server
      connectSignalingServer();
      
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      setConnectionState({ status: 'failed', error: 'Failed to access camera/microphone' });
      onError?.('Failed to access camera/microphone. Please check permissions.');
    }
  }, [sessionId, token]);

  // Connect to signaling WebSocket
  const connectSignalingServer = useCallback(() => {
    const wsUrl = `ws://127.0.0.1:8000/api/v1/telemedicine/sessions/${sessionId}/signaling?token=${encodeURIComponent(token)}`;
    
    websocketRef.current = new WebSocket(wsUrl);
    
    websocketRef.current.onopen = () => {
      console.log('Signaling WebSocket connected');
      
      // Start the call (offerer goes first)
      if (userRole === 'provider') {
        createOffer();
      }
    };
    
    websocketRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      await handleSignalingMessage(message);
    };
    
    websocketRef.current.onclose = () => {
      console.log('Signaling WebSocket disconnected');
    };
    
    websocketRef.current.onerror = (error) => {
      console.error('Signaling WebSocket error:', error);
      setConnectionState({ status: 'failed', error: 'Signaling connection failed' });
    };
  }, [sessionId, token, userRole]);

  // Send signaling message
  const sendSignalingMessage = useCallback((message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Handle signaling messages
  const handleSignalingMessage = useCallback(async (message: any) => {
    if (!peerConnectionRef.current) return;
    
    switch (message.type) {
      case 'sdp_offer':
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        sendSignalingMessage({
          type: 'sdp_answer',
          sdp: answer
        });
        break;
        
      case 'sdp_answer':
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
        break;
        
      case 'ice_candidate':
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
        break;
        
      case 'session_ended':
        endCall('Session ended by other participant');
        break;
    }
  }, [sendSignalingMessage]);

  // Create offer
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) return;
    
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      sendSignalingMessage({
        type: 'sdp_offer',
        sdp: offer
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
      setConnectionState({ status: 'failed', error: 'Failed to create offer' });
    }
  }, [sendSignalingMessage]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [isVideoEnabled]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find(s => 
        s.track?.kind === 'video'
      );
      
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
      
      setIsScreenSharing(true);
      
      // Handle screen share end
      videoTrack.onended = () => {
        setIsScreenSharing(false);
      };
      
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
    }
  }, []);

  // End call
  const endCall = useCallback((reason: string = 'Call ended') => {
    // Clean up resources
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    
    setConnectionState({ status: 'disconnected' });
    onSessionEnd?.(reason);
  }, [onSessionEnd]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!localStreamRef.current) return;
    
    try {
      const mediaRecorder = new MediaRecorder(localStreamRef.current);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Upload recording to server
        uploadRecording(blob);
      };
      
      mediaRecorder.start();
      setRecordingStatus('recording');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  // Upload recording
  const uploadRecording = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('recording', blob);
    formData.append('session_id', sessionId);
    
    try {
      const response = await fetch('/api/v1/telemedicine/sessions/upload-recording', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        console.log('Recording uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload recording:', error);
    }
  };

  // Call duration timer
  useEffect(() => {
    if (connectionState.status === 'connected') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [connectionState.status]);

  // Initialize on mount
  useEffect(() => {
    initializeWebRTC();
    
    return () => {
      endCall('Component unmounted');
    };
  }, [initializeWebRTC, endCall]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${
            connectionState.status === 'connected' ? 'bg-green-500' :
            connectionState.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {connectionState.status === 'connected' ? 'Connected' :
             connectionState.status === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
          {connectionState.connectionQuality && (
            <span className="text-xs text-gray-400">
              Quality: {connectionState.connectionQuality}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
          <button
            onClick={() => endCall('User ended call')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            End Call
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex">
        {/* Remote Video (Main) */}
        <div className="flex-1 relative bg-gray-800">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {!remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-gray-400">Waiting for participant...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-20 right-4 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {!localVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="text-center">
                <div className="text-2xl mb-2">📹</div>
                <p className="text-xs text-gray-400">Your Camera</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-gray-800">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition-colors ${
            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isVideoEnabled ? '📹' : '📷'}
        </button>
        
        <button
          onClick={startScreenShare}
          className={`p-3 rounded-full transition-colors ${
            isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {isScreenSharing ? '🖥️' : '📺'}
        </button>
        
        {userRole === 'provider' && (
          <button
            onClick={recordingStatus === 'recording' ? () => setRecordingStatus('stopped') : startRecording}
            className={`p-3 rounded-full transition-colors ${
              recordingStatus === 'recording' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {recordingStatus === 'recording' ? '⏹️' : '⏺️'}
          </button>
        )}
      </div>

      {/* Error Display */}
      {connectionState.error && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-red-600 p-6 rounded-lg text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-sm mb-4">{connectionState.error}</p>
            <button
              onClick={() => initializeWebRTC()}
              className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
