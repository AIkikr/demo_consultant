import { useState, useEffect } from "react";
import { Mic, MicOff, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MicrophoneDiagnosticProps {
  onMicrophoneReady?: (isReady: boolean) => void;
}

export function MicrophoneDiagnostic({ onMicrophoneReady }: MicrophoneDiagnosticProps) {
  const [microphoneStatus, setMicrophoneStatus] = useState<'unknown' | 'checking' | 'allowed' | 'denied' | 'unavailable'>('unknown');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [testRecording, setTestRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    checkMicrophonePermissions();
    listAudioDevices();
  }, []);

  const checkMicrophonePermissions = async () => {
    setMicrophoneStatus('checking');
    
    try {
      // Check current permission status
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('Permission state:', permission.state);
      
      if (permission.state === 'granted') {
        setMicrophoneStatus('allowed');
        onMicrophoneReady?.(true);
      } else if (permission.state === 'denied') {
        setMicrophoneStatus('denied');
        onMicrophoneReady?.(false);
      } else {
        // Try to request permission
        await testMicrophone();
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setMicrophoneStatus('unavailable');
      onMicrophoneReady?.(false);
    }
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      setMicrophoneStatus('allowed');
      onMicrophoneReady?.(true);
      
      // Test audio levels
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      const checkLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        
        if (testRecording) {
          requestAnimationFrame(checkLevel);
        }
      };
      
      setTestRecording(true);
      checkLevel();
      
      // Stop after 3 seconds
      setTimeout(() => {
        setTestRecording(false);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      }, 3000);
      
    } catch (error) {
      console.error('Microphone test failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setMicrophoneStatus('denied');
        } else {
          setMicrophoneStatus('unavailable');
        }
      }
      onMicrophoneReady?.(false);
    }
  };

  const listAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
      
      if (audioInputs.length > 0 && !selectedDevice) {
        setSelectedDevice(audioInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  };

  const getStatusIcon = () => {
    switch (microphoneStatus) {
      case 'allowed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
      case 'unavailable':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Mic className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (microphoneStatus) {
      case 'allowed':
        return 'マイクが正常に動作しています';
      case 'denied':
        return 'マイクアクセスが拒否されています。ブラウザの設定で許可してください。';
      case 'unavailable':
        return 'マイクが見つかりません。マイクが接続されているか確認してください。';
      case 'checking':
        return 'マイクをテスト中...';
      default:
        return 'マイクをテストしてください';
    }
  };

  const openBrowserSettings = () => {
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    
    if (isChrome || isEdge) {
      window.open('chrome://settings/content/microphone', '_blank');
    } else if (isFirefox) {
      window.open('about:preferences#privacy', '_blank');
    } else {
      alert('ブラウザの設定からマイクの許可を有効にしてください。');
    }
  };

  return (
    <Card className="w-full insight-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>マイク診断</span>
        </CardTitle>
        <CardDescription>
          Windows環境での音声録音を確認します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status Display */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="text-sm">{getStatusMessage()}</span>
          {microphoneStatus === 'unknown' && (
            <Button onClick={testMicrophone} size="sm">
              テスト開始
            </Button>
          )}
        </div>

        {/* Audio Level Test */}
        {testRecording && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Mic className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">音声レベルをテスト中... 何か話してください</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-150" 
                style={{ width: `${Math.min(audioLevel, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Device Selection */}
        {audioDevices.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">利用可能なマイク:</label>
            <select 
              value={selectedDevice} 
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `マイク ${device.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Troubleshooting Tips */}
        {microphoneStatus === 'denied' || microphoneStatus === 'unavailable' ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-medium text-amber-800 mb-2">トラブルシューティング:</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• ブラウザのアドレスバーにあるマイクアイコンをクリックして許可する</li>
              <li>• マイクが他のアプリケーションで使用されていないか確認する</li>
              <li>• Windowsの音声設定でマイクが有効になっているか確認する</li>
              <li>• ブラウザを再起動してみる</li>
            </ul>
            <Button 
              onClick={openBrowserSettings} 
              size="sm" 
              variant="outline" 
              className="mt-2"
            >
              <Settings className="w-3 h-3 mr-1" />
              ブラウザ設定を開く
            </Button>
          </div>
        ) : null}

        {/* Browser Compatibility Info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <strong>推奨ブラウザ:</strong> Chrome, Edge, Firefox (最新版)<br/>
          <strong>OS:</strong> Windows 10/11 での動作を確認済み
        </div>
        
      </CardContent>
    </Card>
  );
}