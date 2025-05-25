import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Save, Trash2, Edit3, Check, X, Share2, Download } from 'lucide-react';

const VolleyballPlayRecorder = () => {
  const [homeTeam, setHomeTeam] = useState([
    { id: 1, x: 680, y: 750, position: '1', name: 'Player 1' },
    { id: 2, x: 680, y: 540, position: '2', name: 'Player 2' },
    { id: 3, x: 400, y: 540, position: '3', name: 'Player 3' },
    { id: 4, x: 120, y: 540, position: '4', name: 'Player 4' },
    { id: 5, x: 120, y: 750, position: '5', name: 'Player 5' },
    { id: 6, x: 400, y: 750, position: '6', name: 'Player 6' }
  ]);

  const [awayTeam, setAwayTeam] = useState([
    { id: 7, x: 120, y: 210, position: '1', name: 'Player 1' },
    { id: 8, x: 120, y: 420, position: '2', name: 'Player 2' },
    { id: 9, x: 400, y: 420, position: '3', name: 'Player 3' },
    { id: 10, x: 680, y: 420, position: '4', name: 'Player 4' },
    { id: 11, x: 680, y: 210, position: '5', name: 'Player 5' },
    { id: 12, x: 400, y: 210, position: '6', name: 'Player 6' }
  ]);

  const [ball, setBall] = useState({ x: 400, y: 480, visible: true });
  const [movementArrows, setMovementArrows] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState([]);
  const [savedPlays, setSavedPlays] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [playName, setPlayName] = useState('');
  const [playDescription, setPlayDescription] = useState('');
  const [currentPlay, setCurrentPlay] = useState(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [shareDialogPlay, setShareDialogPlay] = useState(null);
  const [showShareCodeDialog, setShowShareCodeDialog] = useState(false);
  const [showLoadCodeDialog, setShowLoadCodeDialog] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [loadCode, setLoadCode] = useState('');
  const [loadCodeError, setLoadCodeError] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [tempName, setTempName] = useState('');
  const [showPlayerDrawer, setShowPlayerDrawer] = useState(false);
  const [showPlaysDrawer, setShowPlaysDrawer] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isCreatingArrow, setIsCreatingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState(null);
  const [currentArrow, setCurrentArrow] = useState(null);
  
  const [animationPositions, setAnimationPositions] = useState({
    homeTeam: [...homeTeam],
    awayTeam: [...awayTeam],
    ball: { ...ball }
  });

  const courtWidth = 800;
  const courtHeight = 960;

  // Save plays to localStorage whenever savedPlays changes
  useEffect(() => {
    try {
      const playsData = JSON.stringify(savedPlays);
      sessionStorage.setItem('volleyballSavedPlays', playsData);
    } catch (error) {
      console.error('Error saving plays:', error);
    }
  }, [savedPlays]);

  // Load saved plays from localStorage on component mount
  useEffect(() => {
    try {
      const savedPlaysData = sessionStorage.getItem('volleyballSavedPlays');
      if (savedPlaysData) {
        const parsedPlays = JSON.parse(savedPlaysData);
        setSavedPlays(parsedPlays);
      }
    } catch (error) {
      console.error('Error loading saved plays:', error);
    }
  }, []);

  // Update animation positions when not replaying
  useEffect(() => {
    if (!isReplaying) {
      setAnimationPositions({
        homeTeam: [...homeTeam],
        awayTeam: [...awayTeam],
        ball: { ...ball }
      });
    }
  }, [homeTeam, awayTeam, ball, isReplaying]);

  const handleMouseDown = (e, item, type) => {
    if (isReplaying) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const svg = e.currentTarget.closest('svg');
    const rect = svg.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    if (isRecording) {
      // Recording mode - create arrows
      const existingArrowIndex = movementArrows.findIndex(arrow => 
        arrow.type === type && arrow.id === item.id
      );
      
      if (existingArrowIndex !== -1) {
        setMovementArrows(prev => prev.filter((_, index) => index !== existingArrowIndex));
      }
      
      setIsCreatingArrow(true);
      setArrowStart({ 
        ...item, 
        type, 
        startX: item.x, 
        startY: item.y,
        screenX: clientX - rect.left,
        screenY: clientY - rect.top
      });
    } else {
      // Setup mode - drag to move
      setDraggedItem({ ...item, type });
    }
  };

  const handleMouseMove = (e) => {
    if (isReplaying) return;
    
    e.preventDefault();
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const svgX = clientX - rect.left;
    const svgY = clientY - rect.top;
    
    const scaleX = courtWidth / rect.width;
    const scaleY = courtHeight / rect.height;
    
    const scaledX = svgX * scaleX;
    const scaledY = svgY * scaleY;
    
    let constrainedX = Math.max(30, Math.min(courtWidth - 30, scaledX));
    let constrainedY = Math.max(30, Math.min(courtHeight - 30, scaledY));
    
    if (draggedItem) {
      if (draggedItem.type === 'home') {
        constrainedY = Math.max(courtHeight/2 + 20, constrainedY);
      } else if (draggedItem.type === 'away') {
        constrainedY = Math.min(courtHeight/2 - 20, constrainedY);
      }
    }
    
    if (isRecording && isCreatingArrow && arrowStart) {
      setCurrentArrow({
        ...arrowStart,
        endX: constrainedX,
        endY: constrainedY
      });
    } else if (!isRecording && draggedItem) {
      const newX = constrainedX;
      const newY = constrainedY;

      if (draggedItem.type === 'home') {
        setHomeTeam(prev => prev.map(player => 
          player.id === draggedItem.id ? { ...player, x: newX, y: newY } : player
        ));
      } else if (draggedItem.type === 'away') {
        setAwayTeam(prev => prev.map(player => 
          player.id === draggedItem.id ? { ...player, x: newX, y: newY } : player
        ));
      } else if (draggedItem.type === 'ball') {
        setBall(prev => ({ ...prev, x: newX, y: newY }));
      }
    }
  };

  const handleMouseUp = () => {
    if (isReplaying) return;
    
    if (isRecording && isCreatingArrow && currentArrow) {
      const distance = Math.sqrt(
        Math.pow(currentArrow.endX - currentArrow.startX, 2) + 
        Math.pow(currentArrow.endY - currentArrow.startY, 2)
      );
      
      if (distance > 10) {
        setMovementArrows(prev => [...prev, { 
          ...currentArrow, 
          uniqueId: Date.now() + Math.random() 
        }]);
      }
      
      setIsCreatingArrow(false);
      setArrowStart(null);
      setCurrentArrow(null);
    } else if (!isRecording && draggedItem) {
      setDraggedItem(null);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordedSteps([]);
    setMovementArrows([]);
  };

  const saveStep = () => {
    if (movementArrows.length === 0) return;
    
    const currentPositions = {
      homeTeam: [...homeTeam],
      awayTeam: [...awayTeam],
      ball: { ...ball }
    };
    
    // Calculate end positions based on movement arrows
    const endPositions = {
      homeTeam: currentPositions.homeTeam.map(player => {
        const arrow = movementArrows.find(a => a.type === 'home' && a.id === player.id);
        return arrow ? { ...player, x: arrow.endX, y: arrow.endY } : player;
      }),
      awayTeam: currentPositions.awayTeam.map(player => {
        const arrow = movementArrows.find(a => a.type === 'away' && a.id === player.id);
        return arrow ? { ...player, x: arrow.endX, y: arrow.endY } : player;
      }),
      ball: { ...currentPositions.ball }
    };
    
    // Update ball position if there's a ball arrow
    const ballArrow = movementArrows.find(a => a.type === 'ball');
    if (ballArrow) {
      endPositions.ball = {
        ...currentPositions.ball,
        x: ballArrow.endX,
        y: ballArrow.endY
      };
    }
    
    const step = {
      id: Date.now(),
      movements: [...movementArrows],
      startPositions: currentPositions,
      endPositions: endPositions
    };
    
    setRecordedSteps(prev => [...prev, step]);
    
    // Actually move the players to their new positions
    setHomeTeam([...endPositions.homeTeam]);
    setAwayTeam([...endPositions.awayTeam]);
    setBall({ ...endPositions.ball });
    
    // Clear arrows for next step
    setMovementArrows([]);
  };

  const stopRecording = () => {
    if (recordedSteps.length > 0) {
      // Don't automatically show save dialog - let user preview first
      setIsRecording(false);
      setMovementArrows([]);
    } else {
      setIsRecording(false);
      setMovementArrows([]);
    }
  };

  const savePlay = () => {
    if (!playName.trim()) return;
    
    const play = {
      id: Date.now(),
      name: playName.trim(),
      description: playDescription.trim(),
      steps: [...recordedSteps],
      author: 'You',
      createdAt: new Date().toLocaleString()
    };
    
    setSavedPlays(prev => [...prev, play]);
    setPlayName('');
    setPlayDescription('');
    setShowSaveDialog(false);
    setIsRecording(false);
    setRecordedSteps([]);
    setMovementArrows([]);
  };

  const loadPlay = (play) => {
    setCurrentPlay(play);
    setRecordedSteps([...play.steps]);
    
    if (play.steps.length > 0) {
      const firstStep = play.steps[0];
      setHomeTeam([...firstStep.startPositions.homeTeam]);
      setAwayTeam([...firstStep.startPositions.awayTeam]);
      setBall({ ...firstStep.startPositions.ball });
      
      // Update animation positions
      setAnimationPositions({
        homeTeam: [...firstStep.startPositions.homeTeam],
        awayTeam: [...firstStep.startPositions.awayTeam],
        ball: { ...firstStep.startPositions.ball }
      });
    }
  };

  const deletePlay = (playId) => {
    setSavedPlays(prev => prev.filter(play => play.id !== playId));
    if (currentPlay && currentPlay.id === playId) {
      setCurrentPlay(null);
    }
  };

  const sharePlay = (play) => {
    try {
      // Create a simple, minimal version
      const simplePlay = {
        name: play.name,
        description: play.description || '',
        steps: play.steps.map(step => ({
          movements: step.movements.map(mov => ({
            id: mov.id,
            type: mov.type,
            startX: Math.round(mov.startX),
            startY: Math.round(mov.startY),
            endX: Math.round(mov.endX),
            endY: Math.round(mov.endY)
          })),
          startPositions: {
            homeTeam: step.startPositions.homeTeam.map(p => ({
              id: p.id,
              x: Math.round(p.x),
              y: Math.round(p.y),
              name: p.name,
              position: p.position
            })),
            awayTeam: step.startPositions.awayTeam.map(p => ({
              id: p.id,
              x: Math.round(p.x),
              y: Math.round(p.y),
              name: p.name,
              position: p.position
            })),
            ball: {
              x: Math.round(step.startPositions.ball.x),
              y: Math.round(step.startPositions.ball.y),
              visible: step.startPositions.ball.visible
            }
          }
        }))
      };
      
      // Simple JSON stringify and base64 encode
      const jsonStr = JSON.stringify(simplePlay);
      const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      
      // Store backup with a simple code
      const shortCode = encoded.slice(0, 8).toUpperCase();
      sessionStorage.setItem(`play_${shortCode}`, JSON.stringify(play));
      
      const currentUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${currentUrl}?share=${encoded}`;
      
      setShareCode(shareUrl);
      setShowShareCodeDialog(true);
      setShareDialogPlay(null);
      
      console.log('Generated share URL:', shareUrl);
      console.log('Short code backup:', shortCode);
      
    } catch (error) {
      console.error('Error sharing play:', error);
      alert('Error creating share link: ' + error.message);
    }
  };

  const loadPlayFromCode = () => {
    setLoadCodeError('');
    if (!loadCode.trim()) {
      setLoadCodeError('Please enter a share URL or code');
      return;
    }

    try {
      let playData = null;
      const cleanCode = loadCode.trim();
      
      // Try new ultra-compressed format
      if (cleanCode.includes('?v=')) {
        const url = new URL(cleanCode);
        const encodedPlay = url.searchParams.get('v');
        if (encodedPlay) {
          try {
            // Reverse the compression process
            const restored = encodedPlay
              .split('')
              .map(c => {
                const code = c.charCodeAt(0);
                return code > 96 ? String.fromCharCode(code - 32) : c;
              })
              .join('')
              .replace(/-/g, '+')
              .replace(/_/g, '/');
            
            const padding = '='.repeat((4 - restored.length % 4) % 4);
            const decodedData = atob(restored + padding);
            const decompressed = decompressLZ77(decodedData);
            
            // Restore JSON format
            let jsonStr = decompressed
              .replace(/~/g, 'null')
              .replace(/n:/g, '"n":')
              .replace(/d:/g, '"d":')
              .replace(/s:/g, '"s":')
              .replace(/'/g, '"');
            
            const ultraMinimal = JSON.parse(jsonStr);
            
            // Reconstruct full play from ultra-minimal data
            const fullPlay = {
              id: Date.now(),
              name: ultraMinimal.n,
              description: ultraMinimal.d,
              author: 'Shared',
              createdAt: new Date().toLocaleString(),
              steps: []
            };
            
            // Default positions (volleyball court standard)
            let currentHome = [
              { id: 1, x: 680, y: 750, position: '1', name: 'Player 1' },
              { id: 2, x: 680, y: 540, position: '2', name: 'Player 2' },
              { id: 3, x: 400, y: 540, position: '3', name: 'Player 3' },
              { id: 4, x: 120, y: 540, position: '4', name: 'Player 4' },
              { id: 5, x: 120, y: 750, position: '5', name: 'Player 5' },
              { id: 6, x: 400, y: 750, position: '6', name: 'Player 6' }
            ];
            
            let currentAway = [
              { id: 7, x: 120, y: 210, position: '1', name: 'Player 1' },
              { id: 8, x: 120, y: 420, position: '2', name: 'Player 2' },
              { id: 9, x: 400, y: 420, position: '3', name: 'Player 3' },
              { id: 10, x: 680, y: 420, position: '4', name: 'Player 4' },
              { id: 11, x: 680, y: 210, position: '5', name: 'Player 5' },
              { id: 12, x: 400, y: 210, position: '6', name: 'Player 6' }
            ];
            
            let currentBall = { x: 400, y: 480, visible: true };
            
            ultraMinimal.s.forEach((stepData, stepIndex) => {
              const movements = stepData[0];
              const positions = stepData[1]; // Only exists for first step
              
              // If this is first step and has position data, use it
              if (positions && stepIndex === 0) {
                currentHome = positions[0].map((p, i) => ({
                  id: i + 1,
                  x: p[0] * 10, // Scale back up
                  y: p[1] * 10,
                  name: p[2],
                  position: String(i + 1)
                }));
                
                currentAway = positions[1].map((p, i) => ({
                  id: i + 7,
                  x: p[0] * 10,
                  y: p[1] * 10,
                  name: p[2],
                  position: String(i + 1)
                }));
                
                currentBall = {
                  x: positions[2][0] * 10,
                  y: positions[2][1] * 10,
                  visible: positions[2][2] === 1
                };
              }
              
              const startPositions = {
                homeTeam: [...currentHome],
                awayTeam: [...currentAway],
                ball: { ...currentBall }
              };
              
              // Apply movements to get end positions
              const endHome = [...currentHome];
              const endAway = [...currentAway];
              let endBall = { ...currentBall };
              
              const fullMovements = movements.map((mov, i) => {
                const id = mov[0];
                const type = mov[1] === 0 ? 'home' : mov[1] === 1 ? 'away' : 'ball';
                const endX = mov[2] * 10; // Scale back up
                const endY = mov[3] * 10;
                
                // Find start position
                let startX, startY;
                if (type === 'home') {
                  const player = currentHome.find(p => p.id === id);
                  startX = player ? player.x : endX;
                  startY = player ? player.y : endY;
                  const endPlayer = endHome.find(p => p.id === id);
                  if (endPlayer) {
                    endPlayer.x = endX;
                    endPlayer.y = endY;
                  }
                } else if (type === 'away') {
                  const player = currentAway.find(p => p.id === id);
                  startX = player ? player.x : endX;
                  startY = player ? player.y : endY;
                  const endPlayer = endAway.find(p => p.id === id);
                  if (endPlayer) {
                    endPlayer.x = endX;
                    endPlayer.y = endY;
                  }
                } else { // ball
                  startX = currentBall.x;
                  startY = currentBall.y;
                  endBall = { ...currentBall, x: endX, y: endY };
                }
                
                return {
                  id,
                  type,
                  startX,
                  startY,
                  endX,
                  endY,
                  uniqueId: `${Date.now()}_${i}`
                };
              });
              
              const step = {
                id: Date.now() + stepIndex,
                movements: fullMovements,
                startPositions,
                endPositions: {
                  homeTeam: endHome,
                  awayTeam: endAway,
                  ball: endBall
                }
              };
              
              fullPlay.steps.push(step);
              
              // Update current positions for next step
              currentHome = endHome;
              currentAway = endAway;
              currentBall = endBall;
            });
            
            playData = JSON.stringify(fullPlay);
          } catch (e) {
            console.error('Decompression error:', e);
            throw new Error('Failed to decompress ultra format');
          }
        }
      }
      // Try previous format
      else if (cleanCode.includes('?p=')) {
        const url = new URL(cleanCode);
        const encodedPlay = url.searchParams.get('p');
        if (encodedPlay) {
          const restored = encodedPlay.replace(/-/g, '+').replace(/_/g, '/');
          const padding = '='.repeat((4 - restored.length % 4) % 4);
          const decodedData = atob(restored + padding);
          const minimalPlay = JSON.parse(decodedData);
          
          // Reconstruct from previous minimal format
          const fullPlay = {
            id: Date.now(),
            name: minimalPlay.n,
            description: minimalPlay.d,
            author: 'Shared',
            createdAt: new Date().toLocaleString(),
            steps: minimalPlay.s.map((step, index) => ({
              id: Date.now() + index,
              movements: step.m.map((mov, movIndex) => ({
                id: mov[0],
                type: mov[1],
                startX: mov[2],
                startY: mov[3],
                endX: mov[4],
                endY: mov[5],
                uniqueId: `${Date.now()}_${movIndex}`
              })),
              startPositions: {
                homeTeam: step.sp.h.map(p => ({ id: p[0], x: p[1], y: p[2], name: p[3], position: String(p[0]) })),
                awayTeam: step.sp.a.map(p => ({ id: p[0], x: p[1], y: p[2], name: p[3], position: String(p[0] - 6) })),
                ball: { x: step.sp.b[0], y: step.sp.b[1], visible: step.sp.b[2] }
              }
            }))
          };
          
          playData = JSON.stringify(fullPlay);
        }
      }
      // Try legacy URL format and other fallbacks...
      else if (cleanCode.includes('?play=')) {
        const url = new URL(cleanCode);
        const encodedPlay = url.searchParams.get('play');
        if (encodedPlay) {
          const decodedData = decodeURIComponent(escape(atob(encodedPlay)));
          playData = decodedData;
        }
      }
      else if (cleanCode.length <= 12) {
        const upperCode = cleanCode.toUpperCase();
        playData = sessionStorage.getItem(`play_${upperCode}`);
      }
      else {
        try {
          const decodedData = decodeURIComponent(escape(atob(cleanCode)));
          playData = decodedData;
        } catch (e) {
          const upperCode = cleanCode.toUpperCase();
          playData = sessionStorage.getItem(`play_${upperCode}`);
        }
      }
      
      if (!playData) {
        setLoadCodeError('Share URL/code not found. Make sure you copied the complete link or code.');
        return;
      }

      const play = JSON.parse(playData);
      loadPlay(play);
      setShowLoadCodeDialog(false);
      setLoadCode('');
      setShowPlaysDrawer(false);
      
      alert(`Successfully loaded "${play.name}"!`);
    } catch (error) {
      console.error('Load error:', error);
      setLoadCodeError('Invalid share URL or code format');
    }
  };

  const copyShareCode = () => {
    navigator.clipboard.writeText(shareCode).then(() => {
      alert('Share URL copied to clipboard!');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = shareCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share URL copied to clipboard!');
    });
  };

  const startEditingPlayer = (player, team) => {
    setEditingPlayer({ ...player, team });
    setTempName(player.name);
  };

  const savePlayerName = () => {
    if (!editingPlayer || !tempName.trim()) return;
    
    if (editingPlayer.team === 'home') {
      setHomeTeam(prev => prev.map(player => 
        player.id === editingPlayer.id ? { ...player, name: tempName.trim() } : player
      ));
    } else {
      setAwayTeam(prev => prev.map(player => 
        player.id === editingPlayer.id ? { ...player, name: tempName.trim() } : player
      ));
    }
    
    setEditingPlayer(null);
    setTempName('');
  };

  // Replay functionality
  const animateStep = (step, duration = 2000) => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startPositions = step.startPositions;
      const endPositions = step.endPositions;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeInOut = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const currentPositions = {
          homeTeam: startPositions.homeTeam.map(player => {
            const endPlayer = endPositions.homeTeam.find(p => p.id === player.id);
            return {
              ...player,
              x: player.x + (endPlayer.x - player.x) * easeInOut,
              y: player.y + (endPlayer.y - player.y) * easeInOut
            };
          }),
          awayTeam: startPositions.awayTeam.map(player => {
            const endPlayer = endPositions.awayTeam.find(p => p.id === player.id);
            return {
              ...player,
              x: player.x + (endPlayer.x - player.x) * easeInOut,
              y: player.y + (endPlayer.y - player.y) * easeInOut
            };
          }),
          ball: {
            ...startPositions.ball,
            x: startPositions.ball.x + (endPositions.ball.x - startPositions.ball.x) * easeInOut,
            y: startPositions.ball.y + (endPositions.ball.y - startPositions.ball.y) * easeInOut
          }
        };
        
        setAnimationPositions(currentPositions);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  };

  const replayPlay = async () => {
    if (recordedSteps.length === 0) return;
    
    setIsReplaying(true);
    setReplayProgress(0);
    
    // Set to initial positions
    const initialStep = recordedSteps[0];
    setAnimationPositions(initialStep.startPositions);
    
    // Animate through each step
    for (let i = 0; i < recordedSteps.length; i++) {
      setReplayProgress(i);
      await animateStep(recordedSteps[i]);
      // Pause between steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsReplaying(false);
    setReplayProgress(0);
  };

  const resetPlay = () => {
    setIsRecording(false);
    setIsReplaying(false);
    setRecordedSteps([]);
    setMovementArrows([]);
    setCurrentPlay(null);
    setBall({ x: 400, y: 480, visible: true });
    
    const defaultHome = [
      { id: 1, x: 680, y: 750, position: '1', name: 'Player 1' },
      { id: 2, x: 680, y: 540, position: '2', name: 'Player 2' },
      { id: 3, x: 400, y: 540, position: '3', name: 'Player 3' },
      { id: 4, x: 120, y: 540, position: '4', name: 'Player 4' },
      { id: 5, x: 120, y: 750, position: '5', name: 'Player 5' },
      { id: 6, x: 400, y: 750, position: '6', name: 'Player 6' }
    ];
    
    const defaultAway = [
      { id: 7, x: 120, y: 210, position: '1', name: 'Player 1' },
      { id: 8, x: 120, y: 420, position: '2', name: 'Player 2' },
      { id: 9, x: 400, y: 420, position: '3', name: 'Player 3' },
      { id: 10, x: 680, y: 420, position: '4', name: 'Player 4' },
      { id: 11, x: 680, y: 210, position: '5', name: 'Player 5' },
      { id: 12, x: 400, y: 210, position: '6', name: 'Player 6' }
    ];
    
    setHomeTeam(defaultHome);
    setAwayTeam(defaultAway);
  };

  // Use animation positions for display when replaying, otherwise use current positions
  const displayPositions = isReplaying ? animationPositions : {
    homeTeam,
    awayTeam,
    ball
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 rounded-xl sm:rounded-2xl shadow-2xl">
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-1 sm:mb-2">
          Volleyball Play Designer
        </h1>
        <p className="text-gray-300 text-sm sm:text-base lg:text-lg">Professional Play Recording & Analysis Tool</p>
      </div>
      
      <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap px-2">
        {/* Recording Controls */}
        {!isRecording && !isReplaying && (
          <button
            onClick={startRecording}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Start Recording</span>
            <span className="sm:hidden">Record</span>
          </button>
        )}
        
        {isRecording && (
          <>
            <button
              onClick={saveStep}
              disabled={movementArrows.length === 0}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:transform-none transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Save size={14} className="sm:w-4 sm:h-4" />
              Save Step
            </button>
            
            <button
              onClick={() => setMovementArrows([])}
              disabled={movementArrows.length === 0}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-amber-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:transform-none transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            {recordedSteps.length > 0 && (
              <button
                onClick={() => {
                  const lastStep = recordedSteps[recordedSteps.length - 1];
                  setRecordedSteps(prev => prev.slice(0, -1));
                  
                  // Restore positions to the previous step or initial positions
                  if (recordedSteps.length > 1) {
                    const previousStep = recordedSteps[recordedSteps.length - 2];
                    setHomeTeam([...previousStep.endPositions.homeTeam]);
                    setAwayTeam([...previousStep.endPositions.awayTeam]);
                    setBall({ ...previousStep.endPositions.ball });
                  } else {
                    // Go back to first step's start positions
                    setHomeTeam([...lastStep.startPositions.homeTeam]);
                    setAwayTeam([...lastStep.startPositions.awayTeam]);
                    setBall({ ...lastStep.startPositions.ball });
                  }
                }}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Undo Step</span>
                <span className="sm:hidden">Undo</span>
              </button>
            )}
            
            <button
              onClick={stopRecording}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Square size={12} fill="white" className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          </>
        )}
        
        {/* Playback Controls */}
        {!isRecording && !isReplaying && recordedSteps.length > 0 && (
          <>
            <button
              onClick={replayPlay}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Play size={14} className="sm:w-4 sm:h-4" />
              Replay
            </button>

            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Save size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Save Play</span>
              <span className="sm:hidden">Save</span>
            </button>
          </>
        )}
        
        {isReplaying && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-900/30 text-blue-200 rounded-lg border border-blue-800/50 backdrop-blur-sm text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">🎬</span>
            <span className="font-bold">Replaying step {replayProgress + 1} of {recordedSteps.length}</span>
          </div>
        )}
        
        <button
          onClick={resetPlay}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-slate-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          <RotateCcw size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Management Controls - Separate Row */}
      <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap px-2">
        {!isRecording && !isReplaying && (
          <>
            <button
              onClick={() => setShowPlayerDrawer(!showPlayerDrawer)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Edit3 size={14} className="sm:w-4 sm:h-4" />
              <span>Players</span>
            </button>

            <button
              onClick={() => setShowPlaysDrawer(!showPlaysDrawer)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <span>Plays</span>
            </button>
          </>
        )}
      </div>

      <div className="text-center mb-4 sm:mb-6 px-2">
        {isRecording && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-900/30 text-red-200 rounded-lg border border-red-800/50 backdrop-blur-sm animate-pulse text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">🔴</span>
            <span className="font-bold">RECORDING</span>
            <span className="text-red-300 hidden lg:inline">- Drag from players/ball to create movement arrows ({movementArrows.length} movements ready)</span>
            <span className="text-red-300 lg:hidden">({movementArrows.length} movements)</span>
          </div>
        )}
        {!isRecording && !isReplaying && recordedSteps.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-900/30 text-emerald-200 rounded-lg border border-emerald-800/50 backdrop-blur-sm text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">✅</span>
            <span className="font-bold">Play recorded ({recordedSteps.length} steps)</span>
            <span className="text-emerald-300 hidden sm:inline">- Preview with Replay or Save</span>
          </div>
        )}
      </div>

      {/* Save Dialog - Same layer as drawer */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl border border-slate-700 shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Save Your Play</h3>
            <p className="text-gray-300 text-sm mb-4 text-center">
              Give your play a name and description for easy identification
            </p>
            <input
              type="text"
              value={playName}
              onChange={(e) => setPlayName(e.target.value)}
              placeholder="Enter play name (e.g., 'Quick Attack', 'Serve Receive')"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mb-3"
              autoFocus
            />
            <textarea
              value={playDescription}
              onChange={(e) => setPlayDescription(e.target.value)}
              placeholder="Optional: Add a description of the play strategy..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mb-4 resize-none"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setIsRecording(false);
                  setRecordedSteps([]);
                  setMovementArrows([]);
                }}
                className="flex-1 px-4 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-lg transition-colors"
              >
                Don't Save
              </button>
              <button
                onClick={savePlay}
                disabled={!playName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
              >
                Save Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Code Dialog - Same layer as drawer */}
      {showShareCodeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl border border-slate-700 shadow-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 text-center">Share URL Generated!</h3>
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">Share this URL via text, email, or social media:</p>
              <div className="text-xs sm:text-sm font-mono text-emerald-400 bg-slate-800/50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border break-all">
                {shareCode}
              </div>
            </div>
            <p className="text-xs text-gray-300 mb-3 sm:mb-4 text-center">
              Anyone with this URL can click it to instantly load your play. Works across all devices and browsers!
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowShareCodeDialog(false)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                Close
              </button>
              <button
                onClick={copyShareCode}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all text-sm sm:text-base"
              >
                📋 Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Code Dialog - Same layer as drawer with mobile optimization */}
      {showLoadCodeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl border border-slate-700 shadow-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 text-center">Load Shared Play</h3>
            <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 text-center">
              Enter a share URL (from social media/text) or paste it directly to load a play
            </p>
            <input
              type="text"
              value={loadCode}
              onChange={(e) => setLoadCode(e.target.value)}
              placeholder="Paste share URL or enter code here..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mb-3 text-xs sm:text-sm"
              autoFocus
            />
            {loadCodeError && (
              <p className="text-red-400 text-xs sm:text-sm mb-3 text-center">{loadCodeError}</p>
            )}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowLoadCodeDialog(false);
                  setLoadCode('');
                  setLoadCodeError('');
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={loadPlayFromCode}
                disabled={!loadCode.trim()}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
              >
                Load Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Play Dialog - Higher z-index to be in front of drawer */}
      {shareDialogPlay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl border border-slate-700 shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Generate Share Code</h3>
            <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <h4 className="font-semibold text-white text-base mb-1">{shareDialogPlay.name}</h4>
              <p className="text-sm text-gray-400">{shareDialogPlay.steps.length} steps</p>
              {shareDialogPlay.description && (
                <p className="text-sm text-gray-300 mt-2">{shareDialogPlay.description}</p>
              )}
            </div>
            <p className="text-gray-300 text-sm mb-4 text-center">
              Generate a share URL that others can use to load this play on any device.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShareDialogPlay(null)}
                className="flex-1 px-4 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => sharePlay(shareDialogPlay)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all"
              >
                <Share2 size={16} />
                Generate URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Management Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-br from-slate-800/95 to-gray-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        showPlayerDrawer ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h3 className="font-bold text-xl text-white">Player Management</h3>
          <button
            onClick={() => setShowPlayerDrawer(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto h-full pb-24">
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">Home Team</h4>
            {homeTeam.map(player => (
              <div key={player.id} className="flex items-center gap-3 mb-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-base font-bold text-white">{player.position}</span>
                </div>
                {editingPlayer?.id === player.id ? (
                  <>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="flex-1 px-3 py-3 text-base bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none backdrop-blur-sm min-w-0"
                      autoFocus
                      placeholder="Enter player name"
                    />
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={savePlayerName}
                        className="p-3 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors min-w-0 touch-manipulation"
                        disabled={!tempName.trim()}
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className="p-3 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors min-w-0 touch-manipulation"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-white font-medium text-base truncate min-w-0">{player.name}</span>
                    <button
                      onClick={() => startEditingPlayer(player, 'home')}
                      className="p-3 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                    >
                      <Edit3 size={18} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wide">Away Team</h4>
            {awayTeam.map(player => (
              <div key={player.id} className="flex items-center gap-3 mb-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-base font-bold text-white">{player.position}</span>
                </div>
                {editingPlayer?.id === player.id ? (
                  <>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="flex-1 px-3 py-3 text-base bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none backdrop-blur-sm min-w-0"
                      autoFocus
                      placeholder="Enter player name"
                    />
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={savePlayerName}
                        className="p-3 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors min-w-0 touch-manipulation"
                        disabled={!tempName.trim()}
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className="p-3 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors min-w-0 touch-manipulation"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-white font-medium text-base truncate min-w-0">{player.name}</span>
                    <button
                      onClick={() => startEditingPlayer(player, 'away')}
                      className="p-3 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                    >
                      <Edit3 size={18} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Plays Drawer with Load Code button */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-gradient-to-br from-slate-800/95 to-gray-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        showPlaysDrawer ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h3 className="font-bold text-xl text-white">My Saved Plays</h3>
          <button
            onClick={() => setShowPlaysDrawer(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Load Code Button within drawer - REMOVED */}
        
        <div className="p-6 overflow-y-auto h-full pb-24">
          {savedPlays.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏐</div>
              <p className="text-gray-400 text-lg">No saved plays yet</p>
              <p className="text-gray-500 text-sm mt-2">Record and save plays to build your playbook</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedPlays.map(play => (
                <div key={play.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-base truncate">{play.name}</h4>
                      <p className="text-sm text-gray-400">{play.steps.length} steps • {play.createdAt}</p>
                      {play.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{play.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        loadPlay(play);
                        setShowPlaysDrawer(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                    >
                      <Play size={16} />
                      Load
                    </button>
                    <button
                      onClick={() => deletePlay(play.id)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                      title="Delete play"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for drawers */}
      {(showPlayerDrawer || showPlaysDrawer) && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            setShowPlayerDrawer(false);
            setShowPlaysDrawer(false);
          }}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-4xl">
            <svg
              width="100%"
              height="auto"
              viewBox={`0 0 ${courtWidth} ${courtHeight}`}
              className={`border-2 sm:border-4 border-slate-600 rounded-xl sm:rounded-2xl shadow-2xl bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-600 ${
                isRecording ? 'cursor-crosshair' : 'cursor-default'
              } max-h-screen`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              onTouchCancel={handleMouseUp}
              style={{ 
                userSelect: 'none', 
                touchAction: 'none', 
                aspectRatio: `${courtWidth}/${courtHeight}`,
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                KhtmlUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              <defs>
                <g id="modernVolleyball">
                  {/* Simple white volleyball with thick black outline */}
                  <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#000000" strokeWidth="4"/>
                </g>
              </defs>
              
              <rect width={courtWidth} height={courtHeight} fill="transparent"/>
              
              {/* Court boundaries */}
              <rect x="60" y="60" width={courtWidth-120} height={courtHeight-120} 
                    fill="none" stroke="white" strokeWidth="8" rx="16"/>
              
              {/* Net */}
              <line x1="60" y1={courtHeight/2} x2={courtWidth-60} y2={courtHeight/2} 
                    stroke="white" strokeWidth="8"/>
              
              {/* Attack lines */}
              <line x1="60" y1={courtHeight/2 - 150} x2={courtWidth-60} y2={courtHeight/2 - 150} 
                    stroke="white" strokeWidth="5" strokeDasharray="15,8" opacity="0.9"/>
              <line x1="60" y1={courtHeight/2 + 150} x2={courtWidth-60} y2={courtHeight/2 + 150} 
                    stroke="white" strokeWidth="5" strokeDasharray="15,8" opacity="0.9"/>
              
              {/* Net post */}
              <rect x="60" y={courtHeight/2 - 6} width={courtWidth-120} height="12" 
                    fill="#1e293b" rx="6"/>
              
              {/* Team labels */}
              <text x="90" y="45" fill="white" fontSize="24" fontWeight="bold">AWAY TEAM</text>
              <text x="90" y={courtHeight - 15} fill="white" fontSize="24" fontWeight="bold">HOME TEAM</text>

              {/* Movement arrows */}
              {movementArrows.map(arrow => (
                <g key={arrow.uniqueId}>
                  <defs>
                    <marker
                      id={`arrowhead-${arrow.uniqueId}`}
                      markerWidth="12"
                      markerHeight="8"
                      refX="11"
                      refY="4"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 12 4, 0 8"
                        fill={arrow.type === 'ball' ? '#f59e0b' : arrow.type === 'home' ? '#3b82f6' : '#ef4444'}
                      />
                    </marker>
                  </defs>
                  <line
                    x1={arrow.startX}
                    y1={arrow.startY}
                    x2={arrow.endX}
                    y2={arrow.endY}
                    stroke={arrow.type === 'ball' ? '#f59e0b' : arrow.type === 'home' ? '#3b82f6' : '#ef4444'}
                    strokeWidth="4"
                    markerEnd={`url(#arrowhead-${arrow.uniqueId})`}
                    opacity="0.9"
                  />
                </g>
              ))}

              {/* Current arrow being drawn */}
              {currentArrow && (
                <line
                  x1={currentArrow.startX}
                  y1={currentArrow.startY}
                  x2={currentArrow.endX}
                  y2={currentArrow.endY}
                  stroke={currentArrow.type === 'ball' ? '#f59e0b' : currentArrow.type === 'home' ? '#3b82f6' : '#ef4444'}
                  strokeWidth="5"
                  strokeDasharray="10,5"
                  opacity="0.8"
                />
              )}

              {/* Away Team Players */}
              {displayPositions.awayTeam.map(player => (
                <g key={player.id} 
                   className="cursor-grab hover:brightness-110 transition-all duration-200"
                   onMouseDown={(e) => !isReplaying && handleMouseDown(e, player, 'away')}
                   onTouchStart={(e) => !isReplaying && handleMouseDown(e, player, 'away')}
                   style={{ userSelect: 'none' }}>
                  <circle
                    cx={player.x}
                    cy={player.y}
                    r="35"
                    fill="transparent"
                    className="sm:hidden"
                  />
                  <circle
                    cx={player.x}
                    cy={player.y}
                    r="26"
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="4"
                  />
                  <text
                    x={player.x}
                    y={player.y + 4}
                    textAnchor="middle"
                    fontSize="18"
                    fontWeight="bold"
                    fill="white"
                    pointerEvents="none"
                  >
                    {player.position}
                  </text>
                  <text
                    x={player.x}
                    y={player.y + 48}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="white"
                    pointerEvents="none"
                  >
                    {player.name}
                  </text>
                </g>
              ))}

              {/* Home Team Players */}
              {displayPositions.homeTeam.map(player => (
                <g key={player.id}
                   className="cursor-grab hover:brightness-110 transition-all duration-200"
                   onMouseDown={(e) => !isReplaying && handleMouseDown(e, player, 'home')}
                   onTouchStart={(e) => !isReplaying && handleMouseDown(e, player, 'home')}
                   style={{ userSelect: 'none' }}>
                  <circle
                    cx={player.x}
                    cy={player.y}
                    r="35"
                    fill="transparent"
                    className="sm:hidden"
                  />
                  <circle
                    cx={player.x}
                    cy={player.y}
                    r="26"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="4"
                  />
                  <text
                    x={player.x}
                    y={player.y + 4}
                    textAnchor="middle"
                    fontSize="18"
                    fontWeight="bold"
                    fill="white"
                    pointerEvents="none"
                  >
                    {player.position}
                  </text>
                  <text
                    x={player.x}
                    y={player.y + 48}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="white"
                    pointerEvents="none"
                  >
                    {player.name}
                  </text>
                </g>
              ))}

              {/* Ball */}
              {displayPositions.ball.visible && (
                <g className="cursor-grab hover:brightness-110 transition-all duration-200"
                   onMouseDown={(e) => !isReplaying && handleMouseDown(e, displayPositions.ball, 'ball')}
                   onTouchStart={(e) => !isReplaying && handleMouseDown(e, displayPositions.ball, 'ball')}
                   style={{ userSelect: 'none' }}>
                  <circle
                    cx={displayPositions.ball.x}
                    cy={displayPositions.ball.y}
                    r="30"
                    fill="transparent"
                    className="sm:hidden"
                  />
                  <use
                    href="#modernVolleyball"
                    x={displayPositions.ball.x}
                    y={displayPositions.ball.y}
                  />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-800 to-gray-900 rounded-xl sm:rounded-2xl border border-slate-700 shadow-2xl">
        <h3 className="font-bold text-lg sm:text-xl text-white mb-3 sm:mb-4 text-center">How to Create Professional Volleyball Plays</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2 sm:mb-3 text-sm sm:text-base">Setup & Recording</h4>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
              <li><strong className="text-white">Initial Setup:</strong> <span className="hidden sm:inline">Drag players and ball to starting positions</span><span className="sm:hidden">Touch & drag players to position</span></li>
              <li><strong className="text-white">Player Names:</strong> Click "Players" to customize team rosters</li>
              <li><strong className="text-white">Start Recording:</strong> Click the red record button to begin</li>
              <li><strong className="text-white">Create Movements:</strong> <span className="hidden sm:inline">Drag from players/ball to show movement paths</span><span className="sm:hidden">Touch & drag from players to create arrows</span></li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-2 sm:mb-3 text-sm sm:text-base">Advanced Features</h4>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300" start="5">
              <li><strong className="text-white">Save Steps:</strong> Build plays step by step with multiple movements</li>
              <li><strong className="text-white">Name & Save:</strong> Give plays memorable names for easy replay</li>
              <li><strong className="text-white">Play Library:</strong> Build a collection of saved volleyball plays</li>
              <li><strong className="text-white">Professional Replay:</strong> Watch smooth animated playback anytime</li>
            </ol>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-600">
          <p className="text-xs text-slate-400 text-center">
            <strong className="text-slate-300">Pro Tip:</strong> <span className="hidden sm:inline">Each player can only have one movement arrow per step. Save each sequence to build complex multi-step plays for comprehensive team analysis.</span><span className="sm:hidden">One arrow per player/ball per step. Save plays for later replay.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolleyballPlayRecorder;
