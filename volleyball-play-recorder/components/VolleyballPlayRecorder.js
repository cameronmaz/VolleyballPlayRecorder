import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Save, Trash2, Edit3, Check, X, Share2, Heart, Download, Tag } from 'lucide-react';

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
  const [communityPlays, setCommunityPlays] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [playName, setPlayName] = useState('');
  const [playDescription, setPlayDescription] = useState('');
  const [currentPlay, setCurrentPlay] = useState(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [isCreatingArrow, setIsCreatingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState(null);
  const [currentArrow, setCurrentArrow] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('saved');
  const [shareDialogPlay, setShareDialogPlay] = useState(null);
  
  const [animationPositions, setAnimationPositions] = useState({
    homeTeam: [...homeTeam],
    awayTeam: [...awayTeam],
    ball: { ...ball }
  });

  const [editingPlayer, setEditingPlayer] = useState(null);
  const [tempName, setTempName] = useState('');
  const [showPlayerDrawer, setShowPlayerDrawer] = useState(false);
  const [showPlaysDrawer, setShowPlaysDrawer] = useState(false);

  const courtWidth = 800;
  const courtHeight = 960;

  // Initialize community plays with some sample data
  useEffect(() => {
    const sampleCommunityPlays = [
      {
        id: 'community-1',
        name: 'Quick Attack Set',
        description: 'Fast-paced offensive play targeting the weak side',
        steps: [
          {
            id: Date.now() + 1,
            movements: [
              { id: 3, type: 'home', startX: 400, startY: 540, endX: 450, endY: 480, uniqueId: 'sample-1' },
              { id: 1, type: 'home', startX: 680, startY: 750, endX: 600, endY: 650, uniqueId: 'sample-2' }
            ],
            startPositions: {
              homeTeam: [
                { id: 1, x: 680, y: 750, position: '1', name: 'Setter' },
                { id: 2, x: 680, y: 540, position: '2', name: 'Outside' },
                { id: 3, x: 400, y: 540, position: '3', name: 'Middle' },
                { id: 4, x: 120, y: 540, position: '4', name: 'Opposite' },
                { id: 5, x: 120, y: 750, position: '5', name: 'Libero' },
                { id: 6, x: 400, y: 750, position: '6', name: 'Back Row' }
              ],
              awayTeam: [
                { id: 7, x: 120, y: 210, position: '1', name: 'Player 1' },
                { id: 8, x: 120, y: 420, position: '2', name: 'Player 2' },
                { id: 9, x: 400, y: 420, position: '3', name: 'Player 3' },
                { id: 10, x: 680, y: 420, position: '4', name: 'Player 4' },
                { id: 11, x: 680, y: 210, position: '5', name: 'Player 5' },
                { id: 12, x: 400, y: 210, position: '6', name: 'Player 6' }
              ],
              ball: { x: 400, y: 480, visible: true }
            }
          }
        ],
        author: 'Coach Martinez',
        shared: true,
        createdAt: '2025-05-20 10:30 AM',
        likes: 24,
        category: 'Offense'
      },
      {
        id: 'community-2',
        name: 'Defensive Rotation',
        description: 'Coordinated defensive movement against cross-court attack',
        steps: [
          {
            id: Date.now() + 2,
            movements: [
              { id: 7, type: 'away', startX: 120, startY: 210, endX: 200, endY: 300, uniqueId: 'sample-3' },
              { id: 9, type: 'away', startX: 400, startY: 420, endX: 350, endY: 380, uniqueId: 'sample-4' }
            ],
            startPositions: {
              homeTeam: [
                { id: 1, x: 680, y: 750, position: '1', name: 'Player 1' },
                { id: 2, x: 680, y: 540, position: '2', name: 'Player 2' },
                { id: 3, x: 400, y: 540, position: '3', name: 'Player 3' },
                { id: 4, x: 120, y: 540, position: '4', name: 'Player 4' },
                { id: 5, x: 120, y: 750, position: '5', name: 'Player 5' },
                { id: 6, x: 400, y: 750, position: '6', name: 'Player 6' }
              ],
              awayTeam: [
                { id: 7, x: 120, y: 210, position: '1', name: 'Setter' },
                { id: 8, x: 120, y: 420, position: '2', name: 'Libero' },
                { id: 9, x: 400, y: 420, position: '3', name: 'Middle' },
                { id: 10, x: 680, y: 420, position: '4', name: 'Outside' },
                { id: 11, x: 680, y: 210, position: '5', name: 'Opposite' },
                { id: 12, x: 400, y: 210, position: '6', name: 'Back Row' }
              ],
              ball: { x: 400, y: 480, visible: false }
            }
          }
        ],
        author: 'Team Captain Sarah',
        shared: true,
        createdAt: '2025-05-22 2:15 PM',
        likes: 18,
        category: 'Defense'
      }
    ];
    setCommunityPlays(sampleCommunityPlays);
  }, []);

  // Load saved plays from localStorage on component mount
  useEffect(() => {
    try {
      const savedPlaysData = localStorage.getItem('volleyballSavedPlays');
      if (savedPlaysData) {
        const parsedPlays = JSON.parse(savedPlaysData);
        setSavedPlays(parsedPlays);
      }
    } catch (error) {
      console.error('Error loading saved plays:', error);
    }
  }, []);

  // Load player names from localStorage on component mount
  useEffect(() => {
    try {
      const savedPlayerData = localStorage.getItem('volleyballPlayerNames');
      if (savedPlayerData) {
        const { homeTeam: savedHomeTeam, awayTeam: savedAwayTeam } = JSON.parse(savedPlayerData);
        setHomeTeam(savedHomeTeam);
        setAwayTeam(savedAwayTeam);
      }
    } catch (error) {
      console.error('Error loading player names:', error);
    }
  }, []);

  // Save plays to localStorage whenever savedPlays changes
  useEffect(() => {
    try {
      localStorage.setItem('volleyballSavedPlays', JSON.stringify(savedPlays));
    } catch (error) {
      console.error('Error saving plays:', error);
    }
  }, [savedPlays]);

  // Save player names to localStorage whenever teams change
  useEffect(() => {
    try {
      localStorage.setItem('volleyballPlayerNames', JSON.stringify({
        homeTeam,
        awayTeam
      }));
    } catch (error) {
      console.error('Error saving player names:', error);
    }
  }, [homeTeam, awayTeam]);

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

  const cancelEditingPlayer = () => {
    setEditingPlayer(null);
    setTempName('');
  };

  const handleMouseDown = (e, item, type) => {
    if (isReplaying) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const svg = e.currentTarget.closest('svg');
    const rect = svg.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    if (isRecording) {
      // Check if this player/ball already has an arrow
      const existingArrowIndex = movementArrows.findIndex(arrow => 
        arrow.type === type && arrow.id === item.id
      );
      
      // If there's an existing arrow, remove it (we'll create a new one)
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
      setDraggedItem({ ...item, type });
      setDragOffset({
        x: clientX - rect.left - item.x,
        y: clientY - rect.top - item.y
      });
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
        setAnimationPositions(prev => ({
          ...prev,
          homeTeam: prev.homeTeam.map(player => 
            player.id === draggedItem.id ? { ...player, x: newX, y: newY } : player
          )
        }));
      } else if (draggedItem.type === 'away') {
        setAwayTeam(prev => prev.map(player => 
          player.id === draggedItem.id ? { ...player, x: newX, y: newY } : player
        ));
        setAnimationPositions(prev => ({
          ...prev,
          awayTeam: prev.awayTeam.map(player => 
            player.id === draggedItem.id ? { ...player, x: newX, y: newY } : player
          )
        }));
      } else if (draggedItem.type === 'ball') {
        setBall(prev => ({ ...prev, x: newX, y: newY }));
        setAnimationPositions(prev => ({
          ...prev,
          ball: { ...prev.ball, x: newX, y: newY }
        }));
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
    
    const step = {
      id: Date.now(),
      movements: [...movementArrows],
      startPositions: currentPositions
    };
    
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
    
    const ballArrow = movementArrows.find(a => a.type === 'ball');
    if (ballArrow) {
      endPositions.ball = {
        ...currentPositions.ball,
        x: ballArrow.endX,
        y: ballArrow.endY
      };
    }
    
    step.endPositions = endPositions;
    setRecordedSteps(prev => [...prev, step]);
    
    setHomeTeam([...endPositions.homeTeam]);
    setAwayTeam([...endPositions.awayTeam]);
    setBall({ ...endPositions.ball });
    
    setMovementArrows([]);
  };

  const clearArrows = () => {
    setMovementArrows([]);
  };

  const stopRecording = () => {
    if (recordedSteps.length > 0) {
      setShowSaveDialog(true);
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
      shared: false,
      createdAt: new Date().toLocaleString(),
      likes: 0,
      category: 'Custom'
    };
    
    setSavedPlays(prev => [...prev, play]);
    setPlayName('');
    setPlayDescription('');
    setShowSaveDialog(false);
    setIsRecording(false);
    setRecordedSteps([]);
    setMovementArrows([]);
  };

  const cancelSave = () => {
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
    }
  };

  const deletePlay = (playId) => {
    setSavedPlays(prev => prev.filter(play => play.id !== playId));
    if (currentPlay && currentPlay.id === playId) {
      setCurrentPlay(null);
    }
  };

  const sharePlay = (play) => {
    const sharedPlay = {
      ...play,
      id: `community-${Date.now()}`,
      shared: true,
      likes: 0,
      createdAt: new Date().toLocaleString()
    };
    setCommunityPlays(prev => [sharedPlay, ...prev]);
    setShareDialogPlay(null);
  };

  const saveFromCommunity = (communityPlay) => {
    const savedPlay = {
      ...communityPlay,
      id: Date.now(),
      shared: false,
      author: `From ${communityPlay.author}`,
      createdAt: new Date().toLocaleString()
    };
    setSavedPlays(prev => [...prev, savedPlay]);
  };

  const likePlay = (playId) => {
    setCommunityPlays(prev => prev.map(play => 
      play.id === playId 
        ? { ...play, likes: play.likes + 1 }
        : play
    ));
  };

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
    
    const initialStep = recordedSteps[0];
    setAnimationPositions(initialStep.startPositions);
    
    for (let i = 0; i < recordedSteps.length; i++) {
      setReplayProgress(i);
      await animateStep(recordedSteps[i]);
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
    setAnimationPositions({
      homeTeam: defaultHome,
      awayTeam: defaultAway,
      ball: { x: 400, y: 480, visible: true }
    });
  };

  const toggleBall = () => {
    setBall(prev => ({ ...prev, visible: !prev.visible }));
  };

  const displayPositions = isReplaying ? animationPositions : {
    homeTeam,
    awayTeam,
    ball
  };

  useEffect(() => {
    if (!isReplaying) {
      setAnimationPositions({
        homeTeam: [...homeTeam],
        awayTeam: [...awayTeam],
        ball: { ...ball }
      });
    }
  }, [homeTeam, awayTeam, ball, isReplaying]);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 rounded-xl sm:rounded-2xl shadow-2xl">
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-1 sm:mb-2">
          Volleyball Play Designer
        </h1>
        <p className="text-gray-300 text-sm sm:text-base lg:text-lg">Professional Play Recording & Analysis Tool</p>
      </div>
      
      <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap px-2">
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
              <span className="hidden lg:inline">Save Step ({movementArrows.length})</span>
              <span className="lg:hidden">Save ({movementArrows.length})</span>
            </button>
            
            <button
              onClick={clearArrows}
              disabled={movementArrows.length === 0}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-amber-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:transform-none transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            
            <button
              onClick={stopRecording}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Square size={12} fill="white" className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          </>
        )}
        
        {!isRecording && !isReplaying && recordedSteps.length > 0 && (
          <button
            onClick={replayPlay}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <Play size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">Replay {currentPlay ? `"${currentPlay.name}"` : `(${recordedSteps.length} steps)`}</span>
            <span className="lg:hidden">Replay ({recordedSteps.length})</span>
          </button>
        )}
        
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
        
        <button
          onClick={resetPlay}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-slate-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          <RotateCcw size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div className="text-center mb-4 sm:mb-6 px-2">
        {!isRecording && !isReplaying && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800/80 text-slate-200 rounded-lg border border-slate-700/50 backdrop-blur-sm text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">⚙️</span>
            <span className="font-medium">SETUP MODE</span>
            <span className="text-slate-400 hidden sm:inline">- Drag players and ball to position them</span>
          </div>
        )}
        {isRecording && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-900/30 text-red-200 rounded-lg border border-red-800/50 backdrop-blur-sm animate-pulse text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">🔴</span>
            <span className="font-bold">RECORDING</span>
            <span className="text-red-300 hidden lg:inline">- Drag from players/ball to create movement arrows ({movementArrows.length} movements ready)</span>
            <span className="text-red-300 lg:hidden">({movementArrows.length} movements)</span>
          </div>
        )}
        {isReplaying && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-900/30 text-blue-200 rounded-lg border border-blue-800/50 backdrop-blur-sm text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">🎬</span>
            <span className="font-bold">REPLAYING</span>
            <span className="text-blue-300">- Step {replayProgress + 1} of {recordedSteps.length}</span>
          </div>
        )}
        {!isRecording && !isReplaying && recordedSteps.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-900/30 text-emerald-200 rounded-lg border border-emerald-800/50 backdrop-blur-sm text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">✅</span>
            <span className="font-bold">Play recorded ({recordedSteps.length} steps)</span>
            <span className="text-emerald-300 hidden sm:inline">- Ready to replay</span>
          </div>
        )}
      </div>

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && playName.trim()) {
                  if (!playDescription.trim()) {
                    document.querySelector('textarea').focus();
                  } else {
                    savePlay();
                  }
                }
                if (e.key === 'Escape') cancelSave();
              }}
            />
            <textarea
              value={playDescription}
              onChange={(e) => setPlayDescription(e.target.value)}
              placeholder="Optional: Add a description of the play strategy..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mb-4 resize-none"
              rows="3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && playName.trim()) savePlay();
                if (e.key === 'Escape') cancelSave();
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={cancelSave}
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

      {/* Share Play Dialog */}
      {shareDialogPlay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl border border-slate-700 shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Share Play with Community</h3>
            <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <h4 className="font-semibold text-white text-base mb-1">{shareDialogPlay.name}</h4>
              <p className="text-sm text-gray-400">{shareDialogPlay.steps.length} steps</p>
              {shareDialogPlay.description && (
                <p className="text-sm text-gray-300 mt-2">{shareDialogPlay.description}</p>
              )}
            </div>
            <p className="text-gray-300 text-sm mb-4 text-center">
              Share this play with the volleyball community so others can learn from your strategy!
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
                Share Play
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') savePlayerName();
                        if (e.key === 'Escape') cancelEditingPlayer();
                      }}
                      onBlur={() => {
                        if (tempName.trim()) savePlayerName();
                        else cancelEditingPlayer();
                      }}
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
                        onClick={cancelEditingPlayer}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') savePlayerName();
                        if (e.key === 'Escape') cancelEditingPlayer();
                      }}
                      onBlur={() => {
                        if (tempName.trim()) savePlayerName();
                        else cancelEditingPlayer();
                      }}
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
                        onClick={cancelEditingPlayer}
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

          <div className="mt-6 pt-4 border-t border-slate-600">
            <button
              onClick={() => {
                const resetHome = homeTeam.map(player => ({ ...player, name: `Player ${player.position}` }));
                const resetAway = awayTeam.map(player => ({ ...player, name: `Player ${player.position}` }));
                setHomeTeam(resetHome);
                setAwayTeam(resetAway);
              }}
              className="w-full px-4 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-lg transition-colors"
            >
              Reset All Names
            </button>
          </div>
        </div>
      </div>

      {/* Saved Plays Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-gradient-to-br from-slate-800/95 to-gray-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        showPlaysDrawer ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h3 className="font-bold text-xl text-white">Volleyball Plays</h3>
          <button
            onClick={() => setShowPlaysDrawer(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'saved'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            My Saved
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'community'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/20'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            Play Library
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto h-full pb-24">
          {activeTab === 'saved' && (
            <>
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
                          onClick={() => setShareDialogPlay(play)}
                          className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors"
                          title="Share to community"
                        >
                          <Share2 size={16} />
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
            </>
          )}

          {activeTab === 'community' && (
            <>
              {communityPlays.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌟</div>
                  <p className="text-gray-400 text-lg">No community plays yet</p>
                  <p className="text-gray-500 text-sm mt-2">Be the first to share a play with the community!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {communityPlays.map(play => (
                    <div key={play.id} className="p-4 rounded-lg bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/30 hover:border-slate-500/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white text-base truncate">{play.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              play.category === 'Offense' ? 'bg-orange-500/20 text-orange-300' :
                              play.category === 'Defense' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-purple-500/20 text-purple-300'
                            }`}>
                              {play.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            by {play.author} • {play.steps.length} steps
                          </p>
                          {play.description && (
                            <p className="text-xs text-gray-300 mt-2 line-clamp-3">{play.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => likePlay(play.id)}
                            className="flex items-center gap-1 px-2 py-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Heart size={14} />
                            <span className="text-xs">{play.likes}</span>
                          </button>
                          <span className="text-xs text-gray-500">{play.createdAt}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              loadPlay(play);
                              setShowPlaysDrawer(false);
                            }}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm"
                          >
                            <Play size={14} />
                            Preview
                          </button>
                          <button
                            onClick={() => saveFromCommunity(play)}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors text-sm"
                            title="Save to my plays"
                          >
                            <Download size={14} />
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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
                <linearGradient id="modernNetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a"/>
                  <stop offset="50%" stopColor="#1e293b"/>
                  <stop offset="100%" stopColor="#0f172a"/>
                </linearGradient>

                <g id="modernVolleyball">
                  <circle cx="0" cy="0" r="18" fill="url(#ballGradient)" stroke="#f59e0b" strokeWidth="3"/>
                  <path d="M-14,-14 Q0,-18 14,-14" stroke="#f59e0b" strokeWidth="2" fill="none"/>
                  <path d="M-14,14 Q0,18 14,14" stroke="#f59e0b" strokeWidth="2" fill="none"/>
                  <path d="M-14,-14 Q-18,0 -14,14" stroke="#f59e0b" strokeWidth="2" fill="none"/>
                  <path d="M14,-14 Q18,0 14,14" stroke="#f59e0b" strokeWidth="2" fill="none"/>
                  <line x1="-14" y1="-14" x2="14" y2="14" stroke="#f59e0b" strokeWidth="2"/>
                  <line x1="14" y1="-14" x2="-14" y2="14" stroke="#f59e0b" strokeWidth="2"/>
                </g>

                <radialGradient id="ballGradient" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#fbbf24"/>
                  <stop offset="100%" stopColor="#f59e0b"/>
                </radialGradient>
              </defs>
              
              <rect width={courtWidth} height={courtHeight} fill="transparent"/>
              
              <rect x="60" y="60" width={courtWidth-120} height={courtHeight-120} 
                    fill="none" stroke="white" strokeWidth="8" rx="16"/>
              
              <line x1="60" y1={courtHeight/2} x2={courtWidth-60} y2={courtHeight/2} 
                    stroke="white" strokeWidth="8"/>
              
              <line x1="60" y1={courtHeight/2 - 150} x2={courtWidth-60} y2={courtHeight/2 - 150} 
                    stroke="white" strokeWidth="5" strokeDasharray="15,8" opacity="0.9"/>
              <line x1="60" y1={courtHeight/2 + 150} x2={courtWidth-60} y2={courtHeight/2 + 150} 
                    stroke="white" strokeWidth="5" strokeDasharray="15,8" opacity="0.9"/>
              
              <rect x="60" y={courtHeight/2 - 6} width={courtWidth-120} height="12" 
                    fill="url(#modernNetGradient)" rx="6"/>
              
              <text x="90" y="45" fill="white" fontSize="24" fontWeight="bold">AWAY TEAM</text>
              <text x="90" y={courtHeight - 15} fill="white" fontSize="24" fontWeight="bold">HOME TEAM</text>

              {movementArrows.map(arrow => (
                <g key={arrow.uniqueId}>
                  <defs>
                    <marker
                      id={`modernArrowhead-${arrow.uniqueId}`}
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
                    markerEnd={`url(#modernArrowhead-${arrow.uniqueId})`}
                    opacity="0.9"
                  />
                </g>
              ))}

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

              {displayPositions.awayTeam.map(player => (
                <g key={player.id} 
                   className="cursor-grab hover:brightness-110 transition-all duration-200"
                   onMouseDown={(e) => !isReplaying && handleMouseDown(e, player, 'away')}
                   onTouchStart={(e) => !isReplaying && handleMouseDown(e, player, 'away')}
                   style={{ userSelect: 'none' }}>
                  <defs>
                    <radialGradient id={`modernAwayGradient-${player.id}`} cx="25%" cy="25%">
                      <stop offset="0%" stopColor="#F87171"/>
                      <stop offset="70%" stopColor="#EF4444"/>
                      <stop offset="100%" stopColor="#DC2626"/>
                    </radialGradient>
                  </defs>
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
                    fill={`url(#modernAwayGradient-${player.id})`}
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

              {displayPositions.homeTeam.map(player => (
                <g key={player.id}
                   className="cursor-grab hover:brightness-110 transition-all duration-200"
                   onMouseDown={(e) => !isReplaying && handleMouseDown(e, player, 'home')}
                   onTouchStart={(e) => !isReplaying && handleMouseDown(e, player, 'home')}
                   style={{ userSelect: 'none' }}>
                  <defs>
                    <radialGradient id={`modernHomeGradient-${player.id}`} cx="25%" cy="25%">
                      <stop offset="0%" stopColor="#60A5FA"/>
                      <stop offset="70%" stopColor="#3B82F6"/>
                      <stop offset="100%" stopColor="#1E40AF"/>
                    </radialGradient>
                  </defs>
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
                    fill={`url(#modernHomeGradient-${player.id})`}
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
              <li><strong className="text-white">Player Names:</strong> Click "Edit<span className="hidden sm:inline"> Players</span>" to customize team rosters</li>
              <li><strong className="text-white">Start Recording:</strong> Click the red record button to begin</li>
              <li><strong className="text-white">Create Movements:</strong> <span className="hidden sm:inline">Drag from players/ball to show movement paths (one per player)</span><span className="sm:hidden">Touch & drag from players to create arrows</span></li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-2 sm:mb-3 text-sm sm:text-base">Community & Sharing</h4>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300" start="5">
              <li><strong className="text-white">Save Steps:</strong> Build plays step by step with multiple movements</li>
              <li><strong className="text-white">Share Plays:</strong> Share your strategies with the volleyball community</li>
              <li><strong className="text-white">Browse Library:</strong> Discover and save plays from other coaches</li>
              <li><strong className="text-white">Professional Replay:</strong> Watch smooth animated playback anytime</li>
            </ol>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-600">
          <p className="text-xs text-slate-400 text-center">
            <strong className="text-slate-300">Pro Tip:</strong> <span className="hidden sm:inline">Each player can only have one movement arrow per step. Save plays with descriptions, share them with the community, and build your coaching library by saving plays from other users.</span><span className="sm:hidden">One arrow per player/ball per step. Share and discover plays in the community library.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolleyballPlayRecorder;