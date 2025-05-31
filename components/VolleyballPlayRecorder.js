import React, { useState, useEffect } from 'react';
import { RotateCcw, Edit3, Check, X, Palette, Save, Trash2, Play, Square, ChevronDown } from 'lucide-react';

const VolleyballPlayRecorder = () => {
  const [homeTeam, setHomeTeam] = useState([
    { id: 1, x: 680, y: 750, position: '1', name: 'Player 1', color: '#3B82F6' },
    { id: 2, x: 680, y: 540, position: '2', name: 'Player 2', color: '#3B82F6' },
    { id: 3, x: 400, y: 540, position: '3', name: 'Player 3', color: '#3B82F6' },
    { id: 4, x: 120, y: 540, position: '4', name: 'Player 4', color: '#3B82F6' },
    { id: 5, x: 120, y: 750, position: '5', name: 'Player 5', color: '#3B82F6' },
    { id: 6, x: 400, y: 750, position: '6', name: 'Player 6', color: '#3B82F6' }
  ]);

  const [awayTeam, setAwayTeam] = useState([
    { id: 7, x: 120, y: 210, position: '1', name: 'Player 1', color: '#EF4444' },
    { id: 8, x: 120, y: 420, position: '2', name: 'Player 2', color: '#EF4444' },
    { id: 9, x: 400, y: 420, position: '3', name: 'Player 3', color: '#EF4444' },
    { id: 10, x: 680, y: 420, position: '4', name: 'Player 4', color: '#EF4444' },
    { id: 11, x: 680, y: 210, position: '5', name: 'Player 5', color: '#EF4444' },
    { id: 12, x: 400, y: 210, position: '6', name: 'Player 6', color: '#EF4444' }
  ]);

  const [ball, setBall] = useState({ x: 400, y: 480, visible: true });
  const [movementArrows, setMovementArrows] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState([]);
  const [savedPlays, setSavedPlays] = useState([]);
  const [currentPlay, setCurrentPlay] = useState(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [isCreatingArrow, setIsCreatingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState(null);
  const [currentArrow, setCurrentArrow] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [playName, setPlayName] = useState('');
  const [playDescription, setPlayDescription] = useState('');
  const [showPlaysDrawer, setShowPlaysDrawer] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [animationPositions, setAnimationPositions] = useState({
    homeTeam: [...homeTeam],
    awayTeam: [...awayTeam],
    ball: { ...ball }
  });
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempNumber, setTempNumber] = useState('');
  const [showPlayerDrawer, setShowPlayerDrawer] = useState(false);
  const [editingPlayerColor, setEditingPlayerColor] = useState(null);
  const [colorPickerState, setColorPickerState] = useState({ h: 220, s: 70, v: 90 });
  const [applyToWholeTeam, setApplyToWholeTeam] = useState(false);
  const [resetHoldTimeout, setResetHoldTimeout] = useState(null);
  const [showResetOptions, setShowResetOptions] = useState({ home: false, away: false });
  const [savedTeams, setSavedTeams] = useState([]);
  const [showSaveTeamDialog, setShowSaveTeamDialog] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [currentTeamName, setCurrentTeamName] = useState('');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [pendingTeamSave, setPendingTeamSave] = useState(null);

  const presetColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
    '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  const courtWidth = 800;
  const courtHeight = 960;

  // Load saved teams from memory on component mount
   useEffect(() => {
    // Start with empty teams array - users will create their own
    setSavedTeams([]);
  }, []);

  const loadTeam = (team) => {
    setHomeTeam([...team.homeTeam]);
    setAwayTeam([...team.awayTeam]);
    setCurrentTeamName(team.name);
    setShowTeamDropdown(false);
  };

  const deleteTeam = (teamId) => {
    const teamToDelete = savedTeams.find(team => team.id === teamId);
    setSavedTeams(prev => prev.filter(team => team.id !== teamId));
    
    // If we're deleting the currently loaded team, clear the current team name
    if (teamToDelete && teamToDelete.name === currentTeamName) {
      setCurrentTeamName('');
    }
  };

  const saveCurrentTeam = () => {
    if (!teamName.trim()) return;
    
    const trimmedName = teamName.trim();
    const existingTeam = savedTeams.find(team => team.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (existingTeam) {
      // If team with this name exists, show override dialog
      setPendingTeamSave({
        name: trimmedName,
        homeTeam: [...homeTeam],
        awayTeam: [...awayTeam]
      });
      setShowOverrideDialog(true);
      return;
    }
    
    // Save new team or update existing
    const team = {
      id: Date.now(),
      name: trimmedName,
      homeTeam: [...homeTeam],
      awayTeam: [...awayTeam],
      createdAt: new Date().toLocaleString()
    };
    
    setSavedTeams(prev => [...prev, team]);
    setCurrentTeamName(trimmedName);
    setTeamName('');
    setShowSaveTeamDialog(false);
  };

  const handleOverrideTeam = () => {
    if (!pendingTeamSave) return;
    
    // Remove existing team with same name and add new one
    setSavedTeams(prev => {
      const filtered = prev.filter(team => team.name.toLowerCase() !== pendingTeamSave.name.toLowerCase());
      return [...filtered, {
        id: Date.now(),
        name: pendingTeamSave.name,
        homeTeam: [...pendingTeamSave.homeTeam],
        awayTeam: [...pendingTeamSave.awayTeam],
        createdAt: new Date().toLocaleString()
      }];
    });
    
    setCurrentTeamName(pendingTeamSave.name);
    setTeamName('');
    setShowSaveTeamDialog(false);
    setShowOverrideDialog(false);
    setPendingTeamSave(null);
  };

  const cancelOverride = () => {
    setShowOverrideDialog(false);
    setPendingTeamSave(null);
  };

  const startEditingPlayer = (player, team) => {
    setEditingPlayer({ ...player, team });
    setTempName(player.name);
    setTempNumber(player.position);
  };

  const savePlayerData = () => {
    if (!editingPlayer || !tempName.trim() || !tempNumber.trim()) return;
    
    const trimmedNumber = tempNumber.trim();
    if (trimmedNumber.length > 3) return;
    
    if (editingPlayer.team === 'home') {
      setHomeTeam(prev => prev.map(player => 
        player.id === editingPlayer.id ? { 
          ...player, 
          name: tempName.trim(), 
          position: trimmedNumber 
        } : player
      ));
    } else {
      setAwayTeam(prev => prev.map(player => 
        player.id === editingPlayer.id ? { 
          ...player, 
          name: tempName.trim(), 
          position: trimmedNumber 
        } : player
      ));
    }
    
    setEditingPlayer(null);
    setTempName('');
    setTempNumber('');
  };

  const cancelEditingPlayer = () => {
    setEditingPlayer(null);
    setTempName('');
    setTempNumber('');
  };

  const startEditingPlayerColor = (player, team) => {
    setEditingPlayerColor({ ...player, team });
    const hsv = hexToHsv(player.color);
    setColorPickerState(hsv);
  };

  const hexToHsv = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;

    if (diff !== 0) {
      switch (max) {
        case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / diff + 2) / 6; break;
        case b: h = ((r - g) / diff + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
  };

  const hsvToHex = (h, s, v) => {
    h = h / 360;
    s = s / 100;
    v = v / 100;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const updatePlayerColor = (newColor) => {
    if (!editingPlayerColor) return;
    
    if (applyToWholeTeam) {
      // Apply to entire team
      if (editingPlayerColor.team === 'home') {
        setHomeTeam(prev => prev.map(player => ({ ...player, color: newColor })));
      } else {
        setAwayTeam(prev => prev.map(player => ({ ...player, color: newColor })));
      }
    } else {
      // Apply to single player
      if (editingPlayerColor.team === 'home') {
        setHomeTeam(prev => prev.map(player => 
          player.id === editingPlayerColor.id ? { ...player, color: newColor } : player
        ));
      } else {
        setAwayTeam(prev => prev.map(player => 
          player.id === editingPlayerColor.id ? { ...player, color: newColor } : player
        ));
      }
    }
    
    setEditingPlayerColor(prev => ({ ...prev, color: newColor }));
  };

  const cancelEditingPlayerColor = () => {
    setEditingPlayerColor(null);
    setApplyToWholeTeam(false);
  };

  const resetTeamColors = (team) => {
    const defaultColor = team === 'home' ? '#3B82F6' : '#EF4444';
    
    if (team === 'home') {
      setHomeTeam(prev => prev.map(player => ({ ...player, color: defaultColor })));
    } else {
      setAwayTeam(prev => prev.map(player => ({ ...player, color: defaultColor })));
    }
  };

  const resetTeamNames = (team) => {
    if (team === 'home') {
      setHomeTeam(prev => prev.map((player, index) => ({ ...player, name: `Player ${index + 1}` })));
    } else {
      setAwayTeam(prev => prev.map((player, index) => ({ ...player, name: `Player ${index + 1}` })));
    }
  };

  const resetTeamNumbers = (team) => {
    if (team === 'home') {
      setHomeTeam(prev => prev.map((player, index) => ({ ...player, position: (index + 1).toString() })));
    } else {
      setAwayTeam(prev => prev.map((player, index) => ({ ...player, position: (index + 1).toString() })));
    }
  };

  const resetTeamBoth = (team) => {
    resetTeamColors(team);
    resetTeamNumbers(team);
    resetTeamNames(team);
  };

  const handleResetMouseDown = (team) => {
    const timeout = setTimeout(() => {
      setShowResetOptions(prev => ({ ...prev, [team]: true }));
    }, 800); // Hold for 800ms to show options
    setResetHoldTimeout(timeout);
  };

  const handleResetMouseUp = (team) => {
    if (resetHoldTimeout) {
      clearTimeout(resetHoldTimeout);
      setResetHoldTimeout(null);
      
      // If options aren't showing, do the default reset (both)
      if (!showResetOptions[team]) {
        resetTeamBoth(team);
      }
    }
  };

  const handleResetMouseLeave = (team) => {
    if (resetHoldTimeout) {
      clearTimeout(resetHoldTimeout);
      setResetHoldTimeout(null);
    }
  };

  const handleResetTouchStart = (team) => {
    const timeout = setTimeout(() => {
      setShowResetOptions(prev => ({ ...prev, [team]: true }));
    }, 800);
    setResetHoldTimeout(timeout);
  };

  const handleResetTouchEnd = (team) => {
    if (resetHoldTimeout) {
      clearTimeout(resetHoldTimeout);
      setResetHoldTimeout(null);
      
      if (!showResetOptions[team]) {
        resetTeamBoth(team);
      }
    }
  };

  const handleResetOptionSelect = (team, option) => {
    if (option === 'colors') {
      resetTeamColors(team);
    } else if (option === 'numbers') {
      resetTeamNumbers(team);
    } else if (option === 'names') {
      resetTeamNames(team);
    }
    setShowResetOptions(prev => ({ ...prev, [team]: false }));
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
        position: item.position,
        screenX: clientX - rect.left,
        screenY: clientY - rect.top
      });
    } else {
      // For dragging, calculate screen-space offset (before scaling)
      const scaleX = courtWidth / rect.width;
      const scaleY = courtHeight / rect.height;
      
      // Convert item position to screen coordinates
      const itemScreenX = item.x / scaleX;
      const itemScreenY = item.y / scaleY;
      
      // Calculate screen-space offset
      const screenOffsetX = (clientX - rect.left) - itemScreenX;
      const screenOffsetY = (clientY - rect.top) - itemScreenY;
      
      setDraggedItem({ 
        ...item, 
        type,
        screenOffsetX,
        screenOffsetY
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
    
    const scaleX = courtWidth / rect.width;
    const scaleY = courtHeight / rect.height;
    
    if (isRecording && isCreatingArrow && arrowStart) {
      const svgX = (clientX - rect.left) * scaleX;
      const svgY = (clientY - rect.top) * scaleY;
      
      let constrainedX = Math.max(30, Math.min(courtWidth - 30, svgX));
      let constrainedY = Math.max(30, Math.min(courtHeight - 30, svgY));
      
      // Apply team-specific constraints for arrows
      if (arrowStart.type === 'home') {
        constrainedY = Math.max(courtHeight/2 + 20, constrainedY);
      } else if (arrowStart.type === 'away') {
        constrainedY = Math.min(courtHeight/2 - 20, constrainedY);
      }
      
      setCurrentArrow({
        ...arrowStart,
        endX: constrainedX,
        endY: constrainedY
      });
    } else if (!isRecording && draggedItem) {
      // Calculate new position using screen-space offset
      const adjustedScreenX = (clientX - rect.left) - draggedItem.screenOffsetX;
      const adjustedScreenY = (clientY - rect.top) - draggedItem.screenOffsetY;
      
      // Convert back to SVG coordinates
      const newX = adjustedScreenX * scaleX;
      const newY = adjustedScreenY * scaleY;
      
      // Apply constraints
      let constrainedX = Math.max(30, Math.min(courtWidth - 30, newX));
      let constrainedY = Math.max(30, Math.min(courtHeight - 30, newY));
      
      // Apply team-specific constraints for dragging
      if (draggedItem.type === 'home') {
        constrainedY = Math.max(courtHeight/2 + 20, constrainedY);
      } else if (draggedItem.type === 'away') {
        constrainedY = Math.min(courtHeight/2 - 20, constrainedY);
      }

      if (draggedItem.type === 'home') {
        setHomeTeam(prev => prev.map(player => 
          player.id === draggedItem.id ? { ...player, x: constrainedX, y: constrainedY } : player
        ));
        setAnimationPositions(prev => ({
          ...prev,
          homeTeam: prev.homeTeam.map(player => 
            player.id === draggedItem.id ? { ...player, x: constrainedX, y: constrainedY } : player
          )
        }));
      } else if (draggedItem.type === 'away') {
        setAwayTeam(prev => prev.map(player => 
          player.id === draggedItem.id ? { ...player, x: constrainedX, y: constrainedY } : player
        ));
        setAnimationPositions(prev => ({
          ...prev,
          awayTeam: prev.awayTeam.map(player => 
            player.id === draggedItem.id ? { ...player, x: constrainedX, y: constrainedY } : player
          )
        }));
      } else if (draggedItem.type === 'ball') {
        setBall(prev => ({ ...prev, x: constrainedX, y: constrainedY }));
        setAnimationPositions(prev => ({
          ...prev,
          ball: { ...prev.ball, x: constrainedX, y: constrainedY }
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

  const undoLastStep = () => {
    if (recordedSteps.length === 0) return;
    
    // Get the last step and its start positions
    const lastStep = recordedSteps[recordedSteps.length - 1];
    
    // Restore positions to the start of the last step
    setHomeTeam([...lastStep.startPositions.homeTeam]);
    setAwayTeam([...lastStep.startPositions.awayTeam]);
    setBall({ ...lastStep.startPositions.ball });
    
    // Clear any current movement arrows/previews
    setMovementArrows([]);
    setCurrentArrow(null);
    setIsCreatingArrow(false);
    setArrowStart(null);
    
    // Remove the last step
    setRecordedSteps(prev => prev.slice(0, -1));
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

  const toggleBall = () => {
    setBall(prev => ({ ...prev, visible: !prev.visible }));
  };

  const resetPlay = () => {
    setIsRecording(false);
    setIsReplaying(false);
    setRecordedSteps([]);
    setMovementArrows([]);
    setCurrentPlay(null);
    // Don't reset currentTeamName - keep team context
    setBall({ x: 400, y: 480, visible: true });
    
    // Reset only positions, preserve names, colors, and numbers
    const resetHomePositions = [
      { x: 680, y: 750 },
      { x: 680, y: 540 },
      { x: 400, y: 540 },
      { x: 120, y: 540 },
      { x: 120, y: 750 },
      { x: 400, y: 750 }
    ];
    
    const resetAwayPositions = [
      { x: 120, y: 210 },
      { x: 120, y: 420 },
      { x: 400, y: 420 },
      { x: 680, y: 420 },
      { x: 680, y: 210 },
      { x: 400, y: 210 }
    ];
    
    // Update teams with reset positions but keep existing player data
    const updatedHomeTeam = homeTeam.map((player, index) => ({
      ...player,
      x: resetHomePositions[index].x,
      y: resetHomePositions[index].y
    }));
    
    const updatedAwayTeam = awayTeam.map((player, index) => ({
      ...player,
      x: resetAwayPositions[index].x,
      y: resetAwayPositions[index].y
    }));
    
    setHomeTeam(updatedHomeTeam);
    setAwayTeam(updatedAwayTeam);
    setAnimationPositions({
      homeTeam: updatedHomeTeam,
      awayTeam: updatedAwayTeam,
      ball: { x: 400, y: 480, visible: true }
    });
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
            <span>Record</span>
          </button>
        )}
        
        {isRecording && (
          <>
            <button
              onClick={saveStep}
              disabled={movementArrows.length === 0}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:transform-none transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Save size={14} className="sm:w-4 sm:h-4" />
              <span>Save Step ({movementArrows.length})</span>
            </button>
            
            <button
              onClick={clearArrows}
              disabled={movementArrows.length === 0}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-amber-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:transform-none transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
              <span>Clear</span>
            </button>

            {recordedSteps.length > 0 && (
              <>
                <button
                  onClick={undoLastStep}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                  title="Undo last step"
                >
                  <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                  <span>Undo</span>
                </button>

                <button
                  onClick={replayPlay}
                  disabled={isReplaying}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:transform-none transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                  title="Preview recorded steps"
                >
                  <Play size={14} className="sm:w-4 sm:h-4" />
                  <span>Preview ({recordedSteps.length})</span>
                </button>
              </>
            )}
            
            <button
              onClick={stopRecording}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Save size={12} className="sm:w-3 sm:h-3" />
              <span>Save Play</span>
            </button>
          </>
        )}
        
        {!isRecording && !isReplaying && recordedSteps.length > 0 && (
          <button
            onClick={replayPlay}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <Play size={14} className="sm:w-4 sm:h-4" />
            <span>{currentPlay ? `Replay "${currentPlay.name}"` : `Replay (${recordedSteps.length})`}</span>
          </button>
        )}
        
        {!isRecording && !isReplaying && (
          <>
            <button
              onClick={toggleBall}
              className={`px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r ${
                ball.visible 
                  ? 'from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500' 
                  : 'from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
              } text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base`}
            >
              <span>{ball.visible ? 'Hide Ball' : 'Show Ball'}</span>
            </button>

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
              <span>{savedPlays.length > 0 ? `Plays (${savedPlays.length})` : 'Plays'}</span>
            </button>
          </>
        )}
        
        <button
          onClick={resetPlay}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-slate-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          <RotateCcw size={14} className="sm:w-4 sm:h-4" />
          <span>Reset</span>
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

      {/* Save Play Dialog */}
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
                Cancel
              </button>
              <button
                onClick={savePlay}
                disabled={!playName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-semibold disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
              >
                Save
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
          {/* Team Management Section at Top */}
          <div className="mb-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
            <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide">Team Management</h4>
            
            {/* Save Current Team Button */}
            <button
              onClick={() => {
                setTeamName(currentTeamName); // Pre-fill with current team name
                setShowSaveTeamDialog(true);
              }}
              className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Current Team
            </button>
            
            {/* Team Selection Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white hover:bg-slate-700/70 transition-colors flex items-center justify-between"
                disabled={savedTeams.length === 0}
              >
                <span className={savedTeams.length === 0 ? 'text-gray-400' : 'text-white'}>
                  {savedTeams.length === 0 ? 'No saved teams' : 'Load Saved Team'}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showTeamDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTeamDropdown && savedTeams.length > 0 && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowTeamDropdown(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {savedTeams.map(team => (
                      <div key={team.id} className="flex items-center hover:bg-slate-700/50 transition-colors">
                        <button
                          onClick={() => loadTeam(team)}
                          className="flex-1 px-4 py-3 text-left text-white hover:text-blue-300 transition-colors"
                        >
                          <div className="font-medium">{team.name}</div>
                          <div className="text-xs text-gray-400">{team.createdAt}</div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTeam(team.id);
                          }}
                          className="px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
                          title="Delete team"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Home Team */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Home Team</h4>
              <div className="relative">
                <button
                  onMouseDown={() => handleResetMouseDown('home')}
                  onMouseUp={() => handleResetMouseUp('home')}
                  onMouseLeave={() => handleResetMouseLeave('home')}
                  onTouchStart={() => handleResetTouchStart('home')}
                  onTouchEnd={() => handleResetTouchEnd('home')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded border border-blue-400/30 hover:border-blue-300/50"
                >
                  Reset Team
                </button>
                {showResetOptions.home && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowResetOptions(prev => ({ ...prev, home: false }))}
                    />
                    <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 min-w-[140px]">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResetOptionSelect('home', 'colors');
                        }}
                        className="w-full px-3 py-2 text-xs text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all text-left rounded-t-lg border-b border-slate-600/50"
                      >
                        Reset Colors Only
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResetOptionSelect('home', 'numbers');
                        }}
                        className="w-full px-3 py-2 text-xs text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all text-left border-b border-slate-600/50"
                      >
                        Reset Numbers Only
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResetOptionSelect('home', 'names');
                        }}
                        className="w-full px-3 py-2 text-xs text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all text-left rounded-b-lg"
                      >
                        Reset Names Only
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {homeTeam.map(player => (
              <div key={player.id} className="flex items-center gap-3 mb-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-white"
                  style={{ backgroundColor: player.color }}
                >
                  <span className="text-base font-bold text-white">{player.position}</span>
                </div>
                
                {editingPlayer?.id === player.id ? (
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Player Number (max 3 chars)</label>
                      <input
                        type="text"
                        value={tempNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 3) {
                            setTempNumber(value);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none backdrop-blur-sm"
                        placeholder="1-3 chars"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Player Name</label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none backdrop-blur-sm"
                        placeholder="Enter player name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePlayerData();
                          if (e.key === 'Escape') cancelEditingPlayer();
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={savePlayerData}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-green-400 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-sm"
                        disabled={!tempName.trim() || !tempNumber.trim()}
                      >
                        <Check size={14} />
                        Save
                      </button>
                      <button
                        onClick={cancelEditingPlayer}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-400 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-sm"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-base truncate">{player.name}</div>
                      <div className="text-xs text-gray-400">Click edit to modify</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEditingPlayerColor(player, 'home')}
                        className="p-2 text-purple-400 hover:text-white hover:bg-purple-600/30 rounded-lg transition-colors"
                        title="Change color"
                      >
                        <Palette size={16} />
                      </button>
                      <button
                        onClick={() => startEditingPlayer(player, 'home')}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors"
                        title="Edit name & number"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Away Team */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wide">Away Team</h4>
              <div className="relative">
                <button
                  onMouseDown={() => handleResetMouseDown('away')}
                  onMouseUp={() => handleResetMouseUp('away')}
                  onMouseLeave={() => handleResetMouseLeave('away')}
                  onTouchStart={() => handleResetTouchStart('away')}
                  onTouchEnd={() => handleResetTouchEnd('away')}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded border border-red-400/30 hover:border-red-300/50"
                >
                  Reset Team
                </button>
                {showResetOptions.away && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowResetOptions(prev => ({ ...prev, away: false }))}
                    />
                    <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 min-w-[140px]">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResetOptionSelect('away', 'colors');
                        }}
                        className="w-full px-3 py-2 text-xs text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all text-left rounded-t-lg border-b border-slate-600/50"
                      >
                        Reset Colors Only
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResetOptionSelect('away', 'numbers');
                        }}
                        className="w-full px-3 py-2 text-xs text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all text-left border-b border-slate-600/50"
                      >
                        Reset Numbers Only
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResetOptionSelect('away', 'names');
                        }}
                        className="w-full px-3 py-2 text-xs text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all text-left rounded-b-lg"
                      >
                        Reset Names Only
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {awayTeam.map(player => (
              <div key={player.id} className="flex items-center gap-3 mb-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-white"
                  style={{ backgroundColor: player.color }}
                >
                  <span className="text-base font-bold text-white">{player.position}</span>
                </div>
                
                {editingPlayer?.id === player.id ? (
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Player Number (max 3 chars)</label>
                      <input
                        type="text"
                        value={tempNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 3) {
                            setTempNumber(value);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none backdrop-blur-sm"
                        placeholder="1-3 chars"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Player Name</label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none backdrop-blur-sm"
                        placeholder="Enter player name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePlayerData();
                          if (e.key === 'Escape') cancelEditingPlayer();
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={savePlayerData}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-green-400 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-sm"
                        disabled={!tempName.trim() || !tempNumber.trim()}
                      >
                        <Check size={14} />
                        Save
                      </button>
                      <button
                        onClick={cancelEditingPlayer}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-400 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-sm"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-base truncate">{player.name}</div>
                      <div className="text-xs text-gray-400">Click edit to modify</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEditingPlayerColor(player, 'away')}
                        className="p-2 text-purple-400 hover:text-white hover:bg-purple-600/30 rounded-lg transition-colors"
                        title="Change color"
                      >
                        <Palette size={16} />
                      </button>
                      <button
                        onClick={() => startEditingPlayer(player, 'away')}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors"
                        title="Edit name & number"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-600">
            <button
              onClick={() => {
                const resetHome = homeTeam.map((player, index) => ({ 
                  ...player, 
                  name: `Player ${index + 1}`,
                  position: (index + 1).toString(),
                  color: '#3B82F6'
                }));
                const resetAway = awayTeam.map((player, index) => ({ 
                  ...player, 
                  name: `Player ${index + 1}`,
                  position: (index + 1).toString(),
                  color: '#EF4444'
                }));
                setHomeTeam(resetHome);
                setAwayTeam(resetAway);
                setCurrentTeamName(''); // Clear current team when doing full reset
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-colors font-semibold shadow-lg hover:shadow-red-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Reset All Teams
            </button>
          </div>
        </div>
      </div>

      {/* Save Team Dialog */}
      {showSaveTeamDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl border border-slate-700 shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Save Team Setup</h3>
            <p className="text-gray-300 text-sm mb-4 text-center">
              {currentTeamName 
                ? `You can update "${currentTeamName}" or save as a new team with a different name`
                : 'Save your current player configuration to reuse with different opponents'
              }
            </p>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name (e.g., 'Eagles Varsity', 'JV Squad')"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && teamName.trim()) saveCurrentTeam();
                if (e.key === 'Escape') setShowSaveTeamDialog(false);
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTeamName('');
                  setShowSaveTeamDialog(false);
                }}
                className="flex-1 px-4 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentTeam}
                disabled={!teamName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
              >
                Save Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Team Dialog */}
      {showOverrideDialog && pendingTeamSave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl border border-slate-700 shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Team Name Already Exists</h3>
            <p className="text-gray-300 text-sm mb-6 text-center">
              A team named "<span className="font-semibold text-white">{pendingTeamSave.name}</span>" already exists. 
              Do you want to override it with your current team configuration?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelOverride}
                className="flex-1 px-4 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideTeam}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all"
              >
                Override Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {editingPlayerColor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl border border-slate-700 shadow-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Choose Color for {editingPlayerColor.name} (#{editingPlayerColor.position})
            </h3>
            
            {/* Apply to whole team checkbox */}
            <div className="mb-4 flex items-center justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToWholeTeam}
                  onChange={(e) => setApplyToWholeTeam(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300">
                  Apply color to entire {editingPlayerColor.team === 'home' ? 'Home' : 'Away'} team
                </span>
              </label>
            </div>
            
            <div className="mb-6">
              <div className="relative mb-4">
                <div 
                  className="w-full h-48 rounded-lg cursor-crosshair border border-slate-600 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(to right, white, hsl(${colorPickerState.h}, 100%, 50%)), 
                                linear-gradient(to top, black, transparent)`
                  }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const handleMouseMove = (e) => {
                      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                      const s = (x / rect.width) * 100;
                      const v = 100 - (y / rect.height) * 100;
                      setColorPickerState(prev => ({ ...prev, s, v }));
                      updatePlayerColor(hsvToHex(colorPickerState.h, s, v));
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                    handleMouseMove(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const handleTouchMove = (e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
                      const y = Math.max(0, Math.min(rect.height, touch.clientY - rect.top));
                      const s = (x / rect.width) * 100;
                      const v = 100 - (y / rect.height) * 100;
                      setColorPickerState(prev => ({ ...prev, s, v }));
                      updatePlayerColor(hsvToHex(colorPickerState.h, s, v));
                    };
                    
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };
                    
                    document.addEventListener('touchmove', handleTouchMove, { passive: false });
                    document.addEventListener('touchend', handleTouchEnd);
                    handleTouchMove(e);
                  }}
                >
                  <div 
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg transform -translate-x-2 -translate-y-2 pointer-events-none"
                    style={{
                      left: `${colorPickerState.s}%`,
                      top: `${100 - colorPickerState.v}%`,
                      boxShadow: '0 0 0 1px black'
                    }}
                  />
                </div>
                
                <div className="relative">
                  <div 
                    className="w-full h-6 rounded cursor-pointer border border-slate-600"
                    style={{
                      background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                    }}
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const handleMouseMove = (e) => {
                        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                        const h = (x / rect.width) * 360;
                        setColorPickerState(prev => ({ ...prev, h }));
                        updatePlayerColor(hsvToHex(h, colorPickerState.s, colorPickerState.v));
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                      handleMouseMove(e);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const handleTouchMove = (e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
                        const h = (x / rect.width) * 360;
                        setColorPickerState(prev => ({ ...prev, h }));
                        updatePlayerColor(hsvToHex(h, colorPickerState.s, colorPickerState.v));
                      };
                      
                      const handleTouchEnd = () => {
                        document.removeEventListener('touchmove', handleTouchMove);
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      
                      document.addEventListener('touchmove', handleTouchMove, { passive: false });
                      document.addEventListener('touchend', handleTouchEnd);
                      handleTouchMove(e);
                    }}
                  >
                    <div 
                      className="absolute w-3 h-8 bg-white border border-black rounded transform -translate-x-1.5 -translate-y-1 pointer-events-none shadow-lg"
                      style={{
                        left: `${(colorPickerState.h / 360) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-white shadow-lg"
                  style={{ backgroundColor: editingPlayerColor.color }}
                />
                <div>
                  <p className="text-sm text-gray-300 mb-1">
                    {applyToWholeTeam ? `${editingPlayerColor.team === 'home' ? 'Home' : 'Away'} Team Color` : 'Current Color'}
                  </p>
                  <p className="text-white font-mono text-lg">{editingPlayerColor.color.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-300 mb-3">Quick Colors:</p>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      updatePlayerColor(color);
                      const hsv = hexToHsv(color);
                      setColorPickerState(hsv);
                    }}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      editingPlayerColor.color.toUpperCase() === color.toUpperCase()
                        ? 'border-white ring-2 ring-blue-400' 
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Hex Color
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingPlayerColor.color}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                      updatePlayerColor(newColor);
                      const hsv = hexToHsv(newColor);
                      setColorPickerState(hsv);
                    } else if (newColor.length <= 7) {
                      setEditingPlayerColor(prev => ({ ...prev, color: newColor }));
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono"
                  placeholder="#3B82F6"
                  maxLength={7}
                />
                <input
                  type="color"
                  value={editingPlayerColor.color}
                  onChange={(e) => {
                    updatePlayerColor(e.target.value);
                    const hsv = hexToHsv(e.target.value);
                    setColorPickerState(hsv);
                  }}
                  className="w-12 h-10 rounded border border-slate-600 bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelEditingPlayerColor}
                className="flex-1 px-4 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={cancelEditingPlayerColor}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all"
              >
                {applyToWholeTeam ? 'Apply to Team' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Plays Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-gradient-to-br from-slate-800/95 to-gray-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        showPlaysDrawer ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h3 className="font-bold text-xl text-white">Saved Plays</h3>
          <button
            onClick={() => setShowPlaysDrawer(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
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
                      Load Play
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
            setShowTeamDropdown(false);
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
              className={`border-2 sm:border-4 border-slate-600 rounded-xl sm:rounded-2xl shadow-2xl bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-600 ${isRecording ? 'cursor-crosshair' : 'cursor-default'} max-h-screen`}
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
                msUserSelect: 'none',
                overflow: 'visible' // Ensure SVG content isn't clipped
              }}
            >
              <defs>
                <linearGradient id="modernNetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a"/>
                  <stop offset="50%" stopColor="#1e293b"/>
                  <stop offset="100%" stopColor="#0f172a"/>
                </linearGradient>

                <g id="modernVolleyball">
                  <circle cx="0" cy="0" r="22" fill="white" stroke="#000000" strokeWidth="3"/>
                </g>

                <radialGradient id="ballGradient" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#fbbf24"/>
                  <stop offset="100%" stopColor="#f59e0b"/>
                </radialGradient>

                {/* Dynamic gradients for each player */}
                {[...displayPositions.homeTeam, ...displayPositions.awayTeam].map(player => (
                  <radialGradient key={`gradient-${player.id}`} id={`playerGradient-${player.id}`} cx="25%" cy="25%">
                    <stop offset="0%" stopColor={player.color} stopOpacity="0.8"/>
                    <stop offset="70%" stopColor={player.color}/>
                    <stop offset="100%" stopColor={player.color} stopOpacity="0.9"/>
                  </radialGradient>
                ))}
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

              {/* Movement Lines and Shadow Previews */}
              {movementArrows.map(arrow => (
                <g key={arrow.uniqueId}>
                  {/* Movement line */}
                  <line
                    x1={arrow.startX}
                    y1={arrow.startY}
                    x2={arrow.endX}
                    y2={arrow.endY}
                    stroke={arrow.type === 'ball' ? '#6b7280' : arrow.type === 'home' ? '#3b82f6' : '#ef4444'}
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    opacity="0.7"
                  />
                  
                  {/* Shadow preview at destination */}
                  {arrow.type === 'ball' ? (
                    <circle
                      cx={arrow.endX}
                      cy={arrow.endY}
                      r="22"
                      fill="white"
                      stroke="#000000"
                      strokeWidth="3"
                      opacity="0.4"
                    />
                  ) : (
                    <g opacity="0.4">
                      <circle
                        cx={arrow.endX}
                        cy={arrow.endY}
                        r="32"
                        fill={arrow.type === 'home' ? '#3b82f6' : '#ef4444'}
                        stroke="white"
                        strokeWidth="4"
                      />
                      <text
                        x={arrow.endX}
                        y={arrow.endY + 4}
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="bold"
                        fill="white"
                        pointerEvents="none"
                      >
                        {arrow.position}
                      </text>
                    </g>
                  )}
                </g>
              ))}

              {/* Current Movement Preview */}
              {currentArrow && (
                <g>
                  {/* Movement line */}
                  <line
                    x1={currentArrow.startX}
                    y1={currentArrow.startY}
                    x2={currentArrow.endX}
                    y2={currentArrow.endY}
                    stroke={currentArrow.type === 'ball' ? '#6b7280' : currentArrow.type === 'home' ? '#3b82f6' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    opacity="0.8"
                  />
                  
                  {/* Shadow preview at destination */}
                  {currentArrow.type === 'ball' ? (
                    <circle
                      cx={currentArrow.endX}
                      cy={currentArrow.endY}
                      r="22"
                      fill="white"
                      stroke="#000000"
                      strokeWidth="3"
                      opacity="0.5"
                    />
                  ) : (
                    <g opacity="0.5">
                      <circle
                        cx={currentArrow.endX}
                        cy={currentArrow.endY}
                        r="32"
                        fill={currentArrow.type === 'home' ? '#3b82f6' : '#ef4444'}
                        stroke="white"
                        strokeWidth="4"
                      />
                      <text
                        x={currentArrow.endX}
                        y={currentArrow.endY + 4}
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="bold"
                        fill="white"
                        pointerEvents="none"
                      >
                        {currentArrow.position}
                      </text>
                    </g>
                  )}
                </g>
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
                    r="40"
                    fill="transparent"
                    className="sm:hidden"
                  />
                  <circle
                    cx={player.x}
                    cy={player.y}
                    r="32"
                    fill={`url(#playerGradient-${player.id})`}
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
                    r="40"
                    fill="transparent"
                    className="sm:hidden"
                  />
                  <circle
                    cx={player.x}
                    cy={player.y}
                    r="32"
                    fill={`url(#playerGradient-${player.id})`}
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
                    r="35"
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
        <h3 className="font-bold text-lg sm:text-xl text-white mb-3 sm:mb-4 text-center">How to Customize Your Team</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2 sm:mb-3 text-sm sm:text-base">Player Management</h4>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
              <li><strong className="text-white">Edit Players:</strong> Click the edit icon in the Players drawer to modify both name and number</li>
              <li><strong className="text-white">Player Numbers:</strong> Set custom jersey numbers up to 3 characters (e.g., "10", "A", "L1")</li>
              <li><strong className="text-white">Change Colors:</strong> Click the palette icon to choose custom colors for each player</li>
              <li><strong className="text-white">Position Players:</strong> Drag players on the court to set their starting positions</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-2 sm:mb-3 text-sm sm:text-base">Team Management</h4>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300" start="5">
              <li><strong className="text-white">Save Teams:</strong> Save your current roster and player setup for future use</li>
              <li><strong className="text-white">Load Teams:</strong> Use the dropdown to quickly switch between saved team configurations</li>
              <li><strong className="text-white">Quick Reset:</strong> Use "Reset Numbers" and "Reset Colors" for easy team-wide changes</li>
              <li><strong className="text-white">Visual Organization:</strong> Color-code players by position for clearer play visualization</li>
            </ol>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-600">
          <p className="text-xs text-slate-400 text-center">
            <strong className="text-slate-300">Pro Tip:</strong> <span className="hidden sm:inline">Use the team management section at the top of the Players drawer to save your roster configurations. This lets you quickly switch between different teams or game scenarios while preserving your custom player names, numbers, and colors.</span><span className="sm:hidden">Save team configurations at the top of Players drawer to quickly switch between rosters.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolleyballPlayRecorder;
