import React, { useState, useEffect } from 'react';
import { RotateCcw, Edit3, Check, X, Palette, Save, Trash2, Play, Square, ChevronDown, Home, Pen, ArrowRight, Type, Eraser, Circle, HelpCircle } from 'lucide-react';

const VolleyballPlayRecorder = () => {
  const [homeTeam, setHomeTeam] = useState([
    { id: 1, x: 680, y: 750, position: '1', name: 'Player 1', color: '#3B82F6' },
    { id: 2, x: 680, y: 560, position: '2', name: 'Player 2', color: '#3B82F6' },
    { id: 3, x: 400, y: 560, position: '3', name: 'Player 3', color: '#3B82F6' },
    { id: 4, x: 120, y: 560, position: '4', name: 'Player 4', color: '#3B82F6' },
    { id: 5, x: 120, y: 750, position: '5', name: 'Player 5', color: '#3B82F6' },
    { id: 6, x: 400, y: 750, position: '6', name: 'Player 6', color: '#3B82F6' }
  ]);

  const [awayTeam, setAwayTeam] = useState([
    { id: 7, x: 120, y: 210, position: '1', name: 'Player 1', color: '#EF4444' },
    { id: 8, x: 120, y: 400, position: '2', name: 'Player 2', color: '#EF4444' },
    { id: 9, x: 400, y: 400, position: '3', name: 'Player 3', color: '#EF4444' },
    { id: 10, x: 680, y: 400, position: '4', name: 'Player 4', color: '#EF4444' },
    { id: 11, x: 680, y: 210, position: '5', name: 'Player 5', color: '#EF4444' },
    { id: 12, x: 400, y: 210, position: '6', name: 'Player 6', color: '#EF4444' }
  ]);

  const [ball, setBall] = useState({ x: 770, y: 480 });
  const [movementArrows, setMovementArrows] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState([]);
  const [savedPlays, setSavedPlays] = useState([]);
  const [currentPlay, setCurrentPlay] = useState(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayPosition, setReplayPosition] = useState(0); // 0 to 1 representing full play progress
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
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
    ball: { x: 770, y: 480 }
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

  // Drawing/annotation states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingTool, setDrawingTool] = useState('pen'); // pen, arrow, circle, text, eraser
  const [drawingColor, setDrawingColor] = useState('#FF0000');
  const [drawings, setDrawings] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStartPoint, setDrawingStartPoint] = useState(null);
  const [showPlayerHelp, setShowPlayerHelp] = useState(false);

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

  const applyVolleyballConstraints = (draggedPlayer, newX, newY, team) => {
    const currentTeam = team === 'home' ? homeTeam : awayTeam;
    const playerPos = draggedPlayer.position;
    
    let constrainedX = newX;
    let constrainedY = newY;
    
    // Define position relationships based on actual court positions
    const frontRow = ['2', '3', '4']; // positions 2, 3, 4 are front row
    const backRow = ['1', '5', '6'];  // positions 1, 5, 6 are back row
    
    // Get players sorted by their actual X positions
    const frontRowPlayers = currentTeam.filter(p => frontRow.includes(p.position)).sort((a, b) => a.x - b.x);
    const backRowPlayers = currentTeam.filter(p => backRow.includes(p.position)).sort((a, b) => a.x - b.x);
    
    // Front-to-back constraints (y-coordinate)
    if (backRow.includes(playerPos)) {
      // Find corresponding front row player by X position
      const playerIndex = backRowPlayers.findIndex(p => p.position === playerPos);
      const correspondingFrontPlayer = frontRowPlayers[playerIndex];
      
      if (correspondingFrontPlayer) {
        if (team === 'away') {
          // For away team, back row cannot move past front row toward net (larger Y)
          constrainedY = Math.min(constrainedY, correspondingFrontPlayer.y);
        } else {
          // For home team, back row cannot move past front row toward net (smaller Y)
          constrainedY = Math.max(constrainedY, correspondingFrontPlayer.y);
        }
      }
    } else if (frontRow.includes(playerPos)) {
      // Find corresponding back row player by X position
      const playerIndex = frontRowPlayers.findIndex(p => p.position === playerPos);
      const correspondingBackPlayer = backRowPlayers[playerIndex];
      
      if (correspondingBackPlayer) {
        if (team === 'away') {
          // For away team, front row cannot move past back row away from net (smaller Y)
          constrainedY = Math.max(constrainedY, correspondingBackPlayer.y);
        } else {
          // For home team, front row cannot move past back row away from net (larger Y)
          constrainedY = Math.min(constrainedY, correspondingBackPlayer.y);
        }
      }
    }
    
    // Left-to-right constraints (x-coordinate) - based on current positions
    const minPlayerDistance = 20; // Minimum distance between players
    
    if (frontRow.includes(playerPos)) {
      // Get other front row players (excluding the one being dragged)
      const otherFrontPlayers = currentTeam.filter(p => 
        frontRow.includes(p.position) && p.position !== playerPos
      ).sort((a, b) => a.x - b.x);
      
      // Find players to the left and right of the dragged player's current position
      const leftPlayers = otherFrontPlayers.filter(p => p.x < draggedPlayer.x);
      const rightPlayers = otherFrontPlayers.filter(p => p.x > draggedPlayer.x);
      
      // Cannot move past the rightmost left player (with buffer)
      if (leftPlayers.length > 0) {
        const rightmostLeftPlayer = leftPlayers[leftPlayers.length - 1];
        constrainedX = Math.max(constrainedX, rightmostLeftPlayer.x + minPlayerDistance);
      }
      
      // Cannot move past the leftmost right player (with buffer)
      if (rightPlayers.length > 0) {
        const leftmostRightPlayer = rightPlayers[0];
        constrainedX = Math.min(constrainedX, leftmostRightPlayer.x - minPlayerDistance);
      }
      
      // Also check if we're too close to any other front row player
      otherFrontPlayers.forEach(player => {
        const distance = Math.abs(constrainedX - player.x);
        if (distance < minPlayerDistance) {
          if (constrainedX < player.x) {
            constrainedX = player.x - minPlayerDistance;
          } else {
            constrainedX = player.x + minPlayerDistance;
          }
        }
      });
    } else if (backRow.includes(playerPos)) {
      // Get other back row players (excluding the one being dragged)
      const otherBackPlayers = currentTeam.filter(p => 
        backRow.includes(p.position) && p.position !== playerPos
      ).sort((a, b) => a.x - b.x);
      
      // Find players to the left and right of the dragged player's current position
      const leftPlayers = otherBackPlayers.filter(p => p.x < draggedPlayer.x);
      const rightPlayers = otherBackPlayers.filter(p => p.x > draggedPlayer.x);
      
      // Cannot move past the rightmost left player (with buffer)
      if (leftPlayers.length > 0) {
        const rightmostLeftPlayer = leftPlayers[leftPlayers.length - 1];
        constrainedX = Math.max(constrainedX, rightmostLeftPlayer.x + minPlayerDistance);
      }
      
      // Cannot move past the leftmost right player (with buffer)
      if (rightPlayers.length > 0) {
        const leftmostRightPlayer = rightPlayers[0];
        constrainedX = Math.min(constrainedX, leftmostRightPlayer.x - minPlayerDistance);
      }
      
      // Also check if we're too close to any other back row player
      otherBackPlayers.forEach(player => {
        const distance = Math.abs(constrainedX - player.x);
        if (distance < minPlayerDistance) {
          if (constrainedX < player.x) {
            constrainedX = player.x - minPlayerDistance;
          } else {
            constrainedX = player.x + minPlayerDistance;
          }
        }
      });
    }
    
    return { x: constrainedX, y: constrainedY };
  };

  const handleDrawingStart = (e) => {
    if (!isDrawingMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const svg = e.currentTarget.closest('svg') || e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = courtWidth / rect.width;
    const scaleY = courtHeight / rect.height;
    
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    setDrawingStartPoint({ x: svgX, y: svgY });
    
    if (drawingTool === 'pen') {
      setCurrentDrawing({
        id: Date.now(),
        type: 'pen',
        color: drawingColor,
        path: `M ${svgX} ${svgY}`,
        strokeWidth: 3
      });
    } else if (drawingTool === 'eraser') {
      // Find drawings at this point and remove them
      const clickRadius = 25;
      setDrawings(prev => prev.filter(drawing => {
        if (drawing.type === 'pen') {
          // For pen drawings, parse the path and check multiple points along it
          const pathCommands = drawing.path.split(/[ML]/).filter(cmd => cmd.trim());
          let foundNearPoint = false;
          
          for (const cmd of pathCommands) {
            const coords = cmd.trim().split(/\s+/);
            if (coords.length >= 2) {
              const pathX = parseFloat(coords[0]);
              const pathY = parseFloat(coords[1]);
              if (!isNaN(pathX) && !isNaN(pathY)) {
                const distance = Math.sqrt(
                  Math.pow(pathX - svgX, 2) + Math.pow(pathY - svgY, 2)
                );
                if (distance <= clickRadius) {
                  foundNearPoint = true;
                  break;
                }
              }
            }
          }
          return !foundNearPoint; // Return false to delete if we found a near point
        } else if (drawing.type === 'arrow') {
          // Check if click is near the arrow line
          const distanceToStart = Math.sqrt(
            Math.pow(drawing.startX - svgX, 2) + Math.pow(drawing.startY - svgY, 2)
          );
          const distanceToEnd = Math.sqrt(
            Math.pow(drawing.endX - svgX, 2) + Math.pow(drawing.endY - svgY, 2)
          );
          // Also check distance to line (simplified)
          const lineLength = Math.sqrt(
            Math.pow(drawing.endX - drawing.startX, 2) + Math.pow(drawing.endY - drawing.startY, 2)
          );
          let distanceToLine = clickRadius + 1; // Default to not delete
          if (lineLength > 0) {
            const t = Math.max(0, Math.min(1, 
              ((svgX - drawing.startX) * (drawing.endX - drawing.startX) + 
               (svgY - drawing.startY) * (drawing.endY - drawing.startY)) / (lineLength * lineLength)
            ));
            const projX = drawing.startX + t * (drawing.endX - drawing.startX);
            const projY = drawing.startY + t * (drawing.endY - drawing.startY);
            distanceToLine = Math.sqrt(Math.pow(projX - svgX, 2) + Math.pow(projY - svgY, 2));
          }
          return Math.min(distanceToStart, distanceToEnd, distanceToLine) > clickRadius;
        } else if (drawing.type === 'circle') {
          // Check if click is inside or near the circle/ellipse
          const centerX = (drawing.startX + drawing.endX) / 2;
          const centerY = (drawing.startY + drawing.endY) / 2;
          const radiusX = Math.abs(drawing.endX - drawing.startX) / 2;
          const radiusY = Math.abs(drawing.endY - drawing.startY) / 2;
          
          // Check if point is inside ellipse or near its border
          const normalizedX = (svgX - centerX) / (radiusX || 1);
          const normalizedY = (svgY - centerY) / (radiusY || 1);
          const distanceFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
          
          // Delete if click is near the ellipse (inside or close to border)
          return distanceFromCenter > 1.2; // 1.2 gives some tolerance around the border
        }
        return true;
      }));
    }
  };

  const handleDrawingMove = (e) => {
    if (!isDrawing || !isDrawingMode) return;
    
    e.preventDefault();
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = courtWidth / rect.width;
    const scaleY = courtHeight / rect.height;
    
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;
    
    if (drawingTool === 'pen' && currentDrawing) {
      setCurrentDrawing(prev => ({
        ...prev,
        path: prev.path + ` L ${svgX} ${svgY}`
      }));
    } else if ((drawingTool === 'arrow' || drawingTool === 'circle') && drawingStartPoint) {
      setCurrentDrawing({
        id: Date.now(),
        type: drawingTool,
        color: drawingColor,
        startX: drawingStartPoint.x,
        startY: drawingStartPoint.y,
        endX: svgX,
        endY: svgY,
        strokeWidth: 3
      });
    }
  };

  const handleDrawingEnd = () => {
    if (!isDrawing || !isDrawingMode) return;
    
    if (currentDrawing && (currentDrawing.path || (currentDrawing.startX !== currentDrawing.endX || currentDrawing.startY !== currentDrawing.endY))) {
      setDrawings(prev => [...prev, { ...currentDrawing, id: Date.now() + Math.random() }]);
    }
    
    setIsDrawing(false);
    setCurrentDrawing(null);
    setDrawingStartPoint(null);
  };

  const clearDrawings = () => {
    setDrawings([]);
    setCurrentDrawing(null);
  };

  const handleSVGMouseDown = (e) => {
    if (isReplaying && isDrawingMode) {
      handleDrawingStart(e);
    }
  };

  const handleMouseDown = (e, item, type) => {
    if (isReplaying && isDrawingMode) {
      // Handle drawing
      handleDrawingStart(e);
      return;
    }
    
    if (isReplaying || isPreviewing) return;
    
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
    if (isReplaying && isDrawingMode && isDrawing) {
      handleDrawingMove(e);
      return;
    }
    
    if (isReplaying || isPreviewing) return;
    
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
        // Apply volleyball overlap constraints
        const constrainedPos = applyVolleyballConstraints(draggedItem, constrainedX, constrainedY, 'home');
        constrainedX = constrainedPos.x;
        constrainedY = constrainedPos.y;
        
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
        // Apply volleyball overlap constraints
        const constrainedPos = applyVolleyballConstraints(draggedItem, constrainedX, constrainedY, 'away');
        constrainedX = constrainedPos.x;
        constrainedY = constrainedPos.y;
        
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
    if (isReplaying && isDrawingMode && isDrawing) {
      handleDrawingEnd();
      return;
    }
    
    if (isReplaying || isPreviewing) return;
    
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
    console.log('Loading play:', play.name, 'with', play.steps.length, 'steps');
    setCurrentPlay(play);
    setRecordedSteps([...play.steps]);
    
    if (play.steps.length > 0) {
      const firstStep = play.steps[0];
      setHomeTeam([...firstStep.startPositions.homeTeam]);
      setAwayTeam([...firstStep.startPositions.awayTeam]);
      setBall({ ...firstStep.startPositions.ball });
      setAnimationPositions(firstStep.startPositions);
    }
    
    // Go straight to replay mode
    setIsReplaying(true);
    setIsPlaying(false); // Start ready to play
    setReplayProgress(0);
    setReplayPosition(0);
    console.log('Play loaded, entering replay mode');
  };

  const deletePlay = (playId) => {
    setSavedPlays(prev => prev.filter(play => play.id !== playId));
    if (currentPlay && currentPlay.id === playId) {
      setCurrentPlay(null);
    }
  };

  const startPreview = async () => {
    if (recordedSteps.length === 0) return;
    
    setIsPreviewing(true);
    
    // Set initial positions
    const firstStep = recordedSteps[0];
    setAnimationPositions(firstStep.startPositions);
    
    // Small delay before starting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Go through each step
    for (let i = 0; i < recordedSteps.length; i++) {
      const step = recordedSteps[i];
      
      // Animate this step smoothly
      await new Promise(resolve => {
        const startTime = Date.now();
        const duration = 1500; // Duration for each step
        let animationFrameId;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Smooth easing function
          const easeInOut = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          // Calculate interpolated positions
          const currentPositions = {
            homeTeam: step.startPositions.homeTeam.map(player => {
              const endPlayer = step.endPositions.homeTeam.find(p => p.id === player.id);
              if (!endPlayer) return player;
              return {
                ...player,
                x: player.x + (endPlayer.x - player.x) * easeInOut,
                y: player.y + (endPlayer.y - player.y) * easeInOut
              };
            }),
            awayTeam: step.startPositions.awayTeam.map(player => {
              const endPlayer = step.endPositions.awayTeam.find(p => p.id === player.id);
              if (!endPlayer) return player;
              return {
                ...player,
                x: player.x + (endPlayer.x - player.x) * easeInOut,
                y: player.y + (endPlayer.y - player.y) * easeInOut
              };
            }),
            ball: {
              ...step.startPositions.ball,
              x: step.startPositions.ball.x + (step.endPositions.ball.x - step.startPositions.ball.x) * easeInOut,
              y: step.startPositions.ball.y + (step.endPositions.ball.y - step.startPositions.ball.y) * easeInOut
            }
          };
          
          setAnimationPositions(currentPositions);
          
          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
          } else {
            // Set final positions for this step
            setAnimationPositions(step.endPositions);
            resolve();
          }
        };
        
        animationFrameId = requestAnimationFrame(animate);
        
        // Cleanup function in case preview is cancelled
        return () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        };
      });
      
      // Brief pause between steps (if not the last step)
      if (i < recordedSteps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    // Preview complete - small delay then reset
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Reset to actual current positions (what the user sees in recording mode)
    setAnimationPositions({
      homeTeam: [...homeTeam],
      awayTeam: [...awayTeam],
      ball: { ...ball }
    });
    
    setIsPreviewing(false);
  };

  const startReplay = async () => {
    console.log('startReplay called - recordedSteps length:', recordedSteps.length);
    
    if (recordedSteps.length === 0) {
      console.log('No recorded steps, returning early');
      return;
    }
    
    console.log('Starting replay from position:', replayPosition);
    setIsPlaying(true);
    
    // Calculate starting step from current scrub position
    const totalSteps = recordedSteps.length;
    const stepFloat = replayPosition * totalSteps;
    const startStepIndex = Math.floor(stepFloat);
    
    // Go through each step starting from current position
    for (let i = startStepIndex; i < recordedSteps.length; i++) {
      console.log('Processing step', i + 1, 'of', recordedSteps.length);
      
      if (!isReplaying) break;
      
      setReplayProgress(i);
      const step = recordedSteps[i];
      
      // Animate this step smoothly
      await new Promise(resolve => {
        const startTime = Date.now();
        const duration = 2000;
        
        const animate = () => {
          if (!isReplaying) {
            resolve();
            return;
          }
          
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easeInOut = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          const currentPositions = {
            homeTeam: step.startPositions.homeTeam.map(player => {
              const endPlayer = step.endPositions.homeTeam.find(p => p.id === player.id);
              return {
                ...player,
                x: player.x + (endPlayer.x - player.x) * easeInOut,
                y: player.y + (endPlayer.y - player.y) * easeInOut
              };
            }),
            awayTeam: step.startPositions.awayTeam.map(player => {
              const endPlayer = step.endPositions.awayTeam.find(p => p.id === player.id);
              return {
                ...player,
                x: player.x + (endPlayer.x - player.x) * easeInOut,
                y: player.y + (endPlayer.y - player.y) * easeInOut
              };
            }),
            ball: {
              ...step.startPositions.ball,
              x: step.startPositions.ball.x + (step.endPositions.ball.x - step.startPositions.ball.x) * easeInOut,
              y: step.startPositions.ball.y + (step.endPositions.ball.y - step.startPositions.ball.y) * easeInOut
            }
          };
          
          setAnimationPositions(currentPositions);
          
          // Update scrub bar (only if not being dragged)
          if (!isDraggingScrubber && recordedSteps.length > 0) {
            const totalProgress = (i + progress) / recordedSteps.length;
            setReplayPosition(totalProgress);
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setAnimationPositions(step.endPositions);
            resolve();
          }
        };
        
        animate();
      });
      
      if (!isReplaying) break;
      
      // Brief pause between steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Replay completed - resetting to beginning');
    setReplayPosition(0);
    setReplayProgress(0);
    
    // Reset to initial positions
    if (recordedSteps.length > 0) {
      const firstStep = recordedSteps[0];
      setAnimationPositions(firstStep.startPositions);
    }
    
    setIsPlaying(false);
  };

  const goHome = () => {
    setIsReplaying(false);
    setIsPlaying(false);
    setReplayProgress(0);
    setReplayPosition(0);
    setCurrentPlay(null);
    setRecordedSteps([]);
    setMovementArrows([]);
    
    // Clear drawings when leaving replay mode
    setIsDrawingMode(false);
    setDrawings([]);
    setCurrentDrawing(null);
    
    // Reset to default positions but keep team customizations
    const resetHomePositions = [
      { x: 680, y: 750 },
      { x: 680, y: 560 },
      { x: 400, y: 560 },
      { x: 120, y: 560 },
      { x: 120, y: 750 },
      { x: 400, y: 750 }
    ];
    
    const resetAwayPositions = [
      { x: 120, y: 210 },
      { x: 120, y: 400 },
      { x: 400, y: 400 },
      { x: 680, y: 400 },
      { x: 680, y: 210 },
      { x: 400, y: 210 }
    ];
    
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
    setBall({ x: 770, y: 480 });
    setAnimationPositions({
      homeTeam: updatedHomeTeam,
      awayTeam: updatedAwayTeam,
      ball: { x: 770, y: 480 }
    });
  };

  const jumpToPosition = (position) => {
    if (recordedSteps.length === 0) return;
    
    // Stop playing when manually scrubbing
    setIsPlaying(false);
    
    // Clamp position between 0 and 1
    const clampedPosition = Math.max(0, Math.min(1, position));
    
    // Calculate which step this position corresponds to
    const totalSteps = recordedSteps.length;
    const stepFloat = clampedPosition * totalSteps;
    const stepIndex = Math.floor(stepFloat);
    const stepProgress = stepFloat - stepIndex;
    
    setReplayPosition(clampedPosition);
    
    if (stepIndex >= totalSteps) {
      // At the very end - show final positions
      const lastStep = recordedSteps[totalSteps - 1];
      setAnimationPositions(lastStep.endPositions);
      setReplayProgress(totalSteps - 1);
    } else if (stepIndex < 0) {
      // At the very beginning - show initial positions
      const firstStep = recordedSteps[0];
      setAnimationPositions(firstStep.startPositions);
      setReplayProgress(0);
    } else {
      // Interpolate within a step
      const currentStep = recordedSteps[stepIndex];
      setReplayProgress(stepIndex);
      
      if (stepProgress === 0) {
        // Exactly at step start
        setAnimationPositions(currentStep.startPositions);
      } else {
        // Interpolate between start and end of current step
        const interpolatedPositions = {
          homeTeam: currentStep.startPositions.homeTeam.map(player => {
            const endPlayer = currentStep.endPositions.homeTeam.find(p => p.id === player.id);
            return {
              ...player,
              x: player.x + (endPlayer.x - player.x) * stepProgress,
              y: player.y + (endPlayer.y - player.y) * stepProgress
            };
          }),
          awayTeam: currentStep.startPositions.awayTeam.map(player => {
            const endPlayer = currentStep.endPositions.awayTeam.find(p => p.id === player.id);
            return {
              ...player,
              x: player.x + (endPlayer.x - player.x) * stepProgress,
              y: player.y + (endPlayer.y - player.y) * stepProgress
            };
          }),
          ball: {
            ...currentStep.startPositions.ball,
            x: currentStep.startPositions.ball.x + (currentStep.endPositions.ball.x - currentStep.startPositions.ball.x) * stepProgress,
            y: currentStep.startPositions.ball.y + (currentStep.endPositions.ball.y - currentStep.startPositions.ball.y) * stepProgress
          }
        };
        
        setAnimationPositions(interpolatedPositions);
      }
    }
  };

  const handleScrubberMouseDown = (e) => {
    if (!recordedSteps.length) return;
    setIsDraggingScrubber(true);
    updateScrubberPosition(e);
  };

  const updateScrubberPosition = (e) => {
    if (!recordedSteps.length) return;
    const scrubBar = e.currentTarget.closest('.scrub-bar') || e.currentTarget;
    const rect = scrubBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const position = x / rect.width;
    jumpToPosition(position);
  };

  const resetPlay = () => {
    setIsRecording(false);
    setIsReplaying(false);
    setIsPlaying(false);
    setReplayPosition(0);
    setIsDraggingScrubber(false);
    setRecordedSteps([]);
    setMovementArrows([]);
    setCurrentPlay(null);
    
    // Clear drawings when resetting
    setIsDrawingMode(false);
    setDrawings([]);
    setCurrentDrawing(null);
    
    // Don't reset currentTeamName - keep team context
    setBall({ x: 770, y: 480 });
    
    // Reset only positions, preserve names, colors, and numbers
    const resetHomePositions = [
      { x: 680, y: 750 },
      { x: 680, y: 560 },
      { x: 400, y: 560 },
      { x: 120, y: 560 },
      { x: 120, y: 750 },
      { x: 400, y: 750 }
    ];
    
    const resetAwayPositions = [
      { x: 120, y: 210 },
      { x: 120, y: 400 },
      { x: 400, y: 400 },
      { x: 680, y: 400 },
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

  const displayPositions = (isReplaying || isPreviewing) ? animationPositions : {
    homeTeam,
    awayTeam,
    ball
  };

  useEffect(() => {
    if (!isReplaying && !isPreviewing) {
      setAnimationPositions({
        homeTeam: [...homeTeam],
        awayTeam: [...awayTeam],
        ball: { ...ball }
      });
    }
  }, [homeTeam, awayTeam, ball, isReplaying, isPreviewing]);

  // Add global mouse event listeners for scrubber
  useEffect(() => {
    if (!isDraggingScrubber) return;

    const handleMouseMove = (e) => {
      if (!recordedSteps.length) return;
      const scrubBar = document.querySelector('.scrub-bar');
      if (!scrubBar) return;
      
      const rect = scrubBar.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const position = x / rect.width;
      jumpToPosition(position);
    };
    
    const handleMouseUp = () => {
      setIsDraggingScrubber(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingScrubber, recordedSteps.length]);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 rounded-xl sm:rounded-2xl shadow-2xl">
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-1 sm:mb-2">
          Volleyball Play Designer
        </h1>
        <p className="text-gray-300 text-sm sm:text-base lg:text-lg">Professional Play Recording & Analysis Tool</p>
      </div>

      {/* Scrub Bar - Only show when replaying or when there are recorded steps (but not during preview) */}
      {(isReplaying || (!isRecording && !isPreviewing && recordedSteps.length > 0)) && (
        <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6 px-4">
          <span className="text-sm text-gray-400 min-w-[60px]">
            Step {Math.min(replayProgress + 1, recordedSteps.length)} / {recordedSteps.length}
          </span>
          
          <div className="flex-1 max-w-md">
            <div 
              className="scrub-bar relative h-2 bg-slate-600 rounded-full cursor-pointer"
              onMouseDown={handleScrubberMouseDown}
            >
              {/* Progress track */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-200"
                style={{ width: `${replayPosition * 100}%` }}
              />
              
              {/* Step markers */}
              {recordedSteps.map((_, index) => (
                <div
                  key={index}
                  className="absolute top-1/2 w-1 h-4 bg-white rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-lg"
                  style={{ left: `${((index + 1) / recordedSteps.length) * 100}%` }}
                />
              ))}
              
              {/* Scrubber handle */}
              <div 
                className="absolute top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-lg border-2 border-blue-500 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                style={{ left: `${replayPosition * 100}%` }}
              />
            </div>
          </div>
          
          <span className="text-sm text-gray-400 min-w-[80px] text-right">
            {isReplaying ? (isPlaying ? 'Playing' : 'Ready') : 'Ready'}
          </span>
        </div>
      )}
      
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
                  onClick={startPreview}
                  disabled={isPreviewing}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:transform-none transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                  title="Preview recorded steps"
                >
                  <Play size={14} className="sm:w-4 sm:h-4" />
                  <span>{isPreviewing ? 'Previewing...' : `Preview (${recordedSteps.length})`}</span>
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
            onClick={() => {
              setIsReplaying(true);
              setIsPlaying(false); // Start ready to play
              setReplayProgress(0);
              setReplayPosition(0);
              const initialStep = recordedSteps[0];
              setAnimationPositions(initialStep.startPositions);
            }}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <Play size={14} className="sm:w-4 sm:h-4" />
            <span>{currentPlay ? `Replay "${currentPlay.name}"` : `Replay (${recordedSteps.length})`}</span>
          </button>
        )}

        {isReplaying && (
          <>
            {/* Play Button - Always visible, greyed out when playing */}
            <button
              onClick={() => {
                console.log('Play button clicked, isPlaying:', isPlaying);
                if (!isPlaying) {
                  startReplay();
                }
              }}
              disabled={isPlaying}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 ${
                isPlaying 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105'
              } text-white rounded-lg sm:rounded-xl font-semibold shadow-lg transition-all duration-200 text-sm sm:text-base`}
            >
              <Play size={14} className="sm:w-4 sm:h-4" />
              <span>Play</span>
            </button>
            
            {/* Home Button */}
            <button
              onClick={goHome}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-slate-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Home size={14} className="sm:w-4 sm:h-4" />
              <span>Home</span>
            </button>
          </>
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
              <span>{savedPlays.length > 0 ? `Plays (${savedPlays.length})` : 'Plays'}</span>
            </button>
          </>
        )}
        
        {!isReplaying && (
          <button
            onClick={resetPlay}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-slate-500/25 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <RotateCcw size={14} className="sm:w-4 sm:h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Drawing Tools - Show when in replay mode (not preview) */}
      {isReplaying && !isPreviewing && (
        <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap px-2">
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 ${
              isDrawingMode
                ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
            } text-white rounded-lg sm:rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base`}
          >
            <Pen size={14} className="sm:w-4 sm:h-4" />
            <span>{isDrawingMode ? 'Exit Drawing' : 'Draw'}</span>
          </button>

          {isDrawingMode && (
            <>
              {/* Drawing Tools */}
              <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
                <button
                  onClick={() => setDrawingTool('pen')}
                  className={`p-2 rounded ${drawingTool === 'pen' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'}`}
                  title="Pen"
                >
                  <Pen size={16} />
                </button>
                <button
                  onClick={() => setDrawingTool('arrow')}
                  className={`p-2 rounded ${drawingTool === 'arrow' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'}`}
                  title="Arrow"
                >
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setDrawingTool('circle')}
                  className={`p-2 rounded ${drawingTool === 'circle' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'}`}
                  title="Circle"
                >
                  <Circle size={16} />
                </button>
                <button
                  onClick={() => setDrawingTool('eraser')}
                  className={`p-2 rounded ${drawingTool === 'eraser' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'}`}
                  title="Eraser"
                >
                  <Eraser size={16} />
                </button>
              </div>

              {/* Color Picker */}
              <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-1">
                <span className="text-xs text-gray-300">Color:</span>
                <input
                  type="color"
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-600 bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Clear Drawings */}
              <button
                onClick={clearDrawings}
                className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      )}

      <div className="text-center mb-4 sm:mb-6 px-2">
        {!isRecording && !isReplaying && !isPreviewing && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800/80 text-slate-200 rounded-lg border border-slate-700/50 backdrop-blur-sm text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">⚙️</span>
            <span className="font-medium">SETUP MODE</span>
            <span className="text-slate-400 hidden sm:inline">- Drag players and ball to position them</span>
          </div>
        )}
        {isRecording && !isPreviewing && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-900/30 text-red-200 rounded-lg border border-red-800/50 backdrop-blur-sm animate-pulse text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">🔴</span>
            <span className="font-bold">RECORDING</span>
            <span className="text-red-300 hidden lg:inline">- Drag from players/ball to create movement arrows ({movementArrows.length} movements ready)</span>
            <span className="text-red-300 lg:hidden">({movementArrows.length} movements)</span>
          </div>
        )}
        {isPreviewing && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-900/30 text-blue-200 rounded-lg border border-blue-800/50 backdrop-blur-sm text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">👁️</span>
            <span className="font-bold">PREVIEWING PLAY</span>
            <span className="text-blue-300">- {recordedSteps.length} steps</span>
          </div>
        )}
        {isReplaying && !isPreviewing && (
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-900/30 text-purple-200 rounded-lg border border-purple-800/50 backdrop-blur-sm text-sm sm:text-base">
            <span className="text-lg sm:text-2xl">{isDrawingMode ? '✏️' : '🎬'}</span>
            <span className="font-bold">{isDrawingMode ? 'DRAWING MODE' : 'REPLAY MODE'}</span>
            {currentPlay && <span className="text-purple-300 hidden sm:inline">- "{currentPlay.name}"</span>}
            <span className="text-purple-300">- Step {Math.min(replayProgress + 1, recordedSteps.length)} of {recordedSteps.length}</span>
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
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xl text-white">Player Management</h3>
            <button
              onClick={() => setShowPlayerHelp(!showPlayerHelp)}
              className="p-1 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded transition-colors"
              title="Help"
            >
              <HelpCircle size={18} />
            </button>
          </div>
          <button
            onClick={() => setShowPlayerDrawer(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/30 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto h-full pb-24">
          {/* Help Section */}
          {showPlayerHelp && (
            <div className="mb-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
              <h4 className="font-bold text-lg text-white mb-3 text-center">How to Customize Your Team</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h5 className="font-semibold text-blue-400 mb-2 text-sm">Player Management</h5>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-300">
                    <li><strong className="text-white">Edit Players:</strong> Click the edit icon to modify both name and number</li>
                    <li><strong className="text-white">Player Numbers:</strong> Set custom jersey numbers up to 3 characters (e.g., "10", "A", "L1")</li>
                    <li><strong className="text-white">Change Colors:</strong> Click the palette icon to choose custom colors for each player</li>
                    <li><strong className="text-white">Position Players:</strong> Drag players on the court to set their starting positions</li>
                  </ol>
                </div>
                <div>
                  <h5 className="font-semibold text-green-400 mb-2 text-sm">Team Management</h5>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-300" start="5">
                    <li><strong className="text-white">Save Teams:</strong> Save your current roster and player setup for future use</li>
                    <li><strong className="text-white">Load Teams:</strong> Use the dropdown to quickly switch between saved team configurations</li>
                    <li><strong className="text-white">Quick Reset:</strong> Use "Reset Numbers" and "Reset Colors" for easy team-wide changes</li>
                    <li><strong className="text-white">Visual Organization:</strong> Color-code players by position for clearer play visualization</li>
                  </ol>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-600">
                <p className="text-xs text-slate-400 text-center">
                  <strong className="text-slate-300">Pro Tip:</strong> Use the team management section to save your roster configurations. This lets you quickly switch between different teams or game scenarios while preserving your custom player names, numbers, and colors.
                </p>
              </div>
            </div>
          )}

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
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setApplyToWholeTeam(isChecked);
                    
                    // If checking the box, apply current color to whole team
                    if (isChecked && editingPlayerColor) {
                      if (editingPlayerColor.team === 'home') {
                        setHomeTeam(prev => prev.map(player => ({ ...player, color: editingPlayerColor.color })));
                      } else {
                        setAwayTeam(prev => prev.map(player => ({ ...player, color: editingPlayerColor.color })));
                      }
                    }
                  }}
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
              className={`border-2 sm:border-4 border-slate-600 rounded-xl sm:rounded-2xl shadow-2xl bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-600 ${
                isRecording ? 'cursor-crosshair' : isDrawingMode ? 'cursor-crosshair' : 'cursor-default'
              } max-h-screen`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              onTouchCancel={handleMouseUp}
              onMouseDown={handleSVGMouseDown}
              onTouchStart={handleSVGMouseDown}
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
                   onMouseDown={(e) => !isReplaying && !isPreviewing && handleMouseDown(e, player, 'away')}
                   onTouchStart={(e) => !isReplaying && !isPreviewing && handleMouseDown(e, player, 'away')}
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
                   onMouseDown={(e) => !isReplaying && !isPreviewing && handleMouseDown(e, player, 'home')}
                   onTouchStart={(e) => !isReplaying && !isPreviewing && handleMouseDown(e, player, 'home')}
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
              <g className="cursor-grab hover:brightness-110 transition-all duration-200"
                 onMouseDown={(e) => !isReplaying && !isPreviewing && handleMouseDown(e, displayPositions.ball, 'ball')}
                 onTouchStart={(e) => !isReplaying && !isPreviewing && handleMouseDown(e, displayPositions.ball, 'ball')}
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

              {/* Render Drawings */}
              {drawings.map(drawing => (
                <g key={drawing.id}>
                  {drawing.type === 'pen' && (
                    <path
                      d={drawing.path}
                      stroke={drawing.color}
                      strokeWidth={drawing.strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {drawing.type === 'arrow' && (
                    <>
                      <line
                        x1={drawing.startX}
                        y1={drawing.startY}
                        x2={drawing.endX}
                        y2={drawing.endY}
                        stroke={drawing.color}
                        strokeWidth={drawing.strokeWidth}
                        strokeLinecap="round"
                      />
                      {/* Arrowhead */}
                      <polygon
                        points={`${drawing.endX},${drawing.endY} ${drawing.endX - 15},${drawing.endY - 8} ${drawing.endX - 15},${drawing.endY + 8}`}
                        fill={drawing.color}
                        transform={`rotate(${Math.atan2(drawing.endY - drawing.startY, drawing.endX - drawing.startX) * 180 / Math.PI} ${drawing.endX} ${drawing.endY})`}
                      />
                    </>
                  )}
                  {drawing.type === 'circle' && (
                    <ellipse
                      cx={(drawing.startX + drawing.endX) / 2}
                      cy={(drawing.startY + drawing.endY) / 2}
                      rx={Math.abs(drawing.endX - drawing.startX) / 2}
                      ry={Math.abs(drawing.endY - drawing.startY) / 2}
                      stroke={drawing.color}
                      strokeWidth={drawing.strokeWidth}
                      fill="none"
                    />
                  )}
                </g>
              ))}

              {/* Render Current Drawing Preview */}
              {currentDrawing && (
                <g>
                  {currentDrawing.type === 'pen' && (
                    <path
                      d={currentDrawing.path}
                      stroke={currentDrawing.color}
                      strokeWidth={currentDrawing.strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />
                  )}
                  {currentDrawing.type === 'arrow' && (
                    <>
                      <line
                        x1={currentDrawing.startX}
                        y1={currentDrawing.startY}
                        x2={currentDrawing.endX}
                        y2={currentDrawing.endY}
                        stroke={currentDrawing.color}
                        strokeWidth={currentDrawing.strokeWidth}
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                      <polygon
                        points={`${currentDrawing.endX},${currentDrawing.endY} ${currentDrawing.endX - 15},${currentDrawing.endY - 8} ${currentDrawing.endX - 15},${currentDrawing.endY + 8}`}
                        fill={currentDrawing.color}
                        transform={`rotate(${Math.atan2(currentDrawing.endY - currentDrawing.startY, currentDrawing.endX - currentDrawing.startX) * 180 / Math.PI} ${currentDrawing.endX} ${currentDrawing.endY})`}
                        opacity="0.8"
                      />
                    </>
                  )}
                  {currentDrawing.type === 'circle' && (
                    <ellipse
                      cx={(currentDrawing.startX + currentDrawing.endX) / 2}
                      cy={(currentDrawing.startY + currentDrawing.endY) / 2}
                      rx={Math.abs(currentDrawing.endX - currentDrawing.startX) / 2}
                      ry={Math.abs(currentDrawing.endY - currentDrawing.startY) / 2}
                      stroke={currentDrawing.color}
                      strokeWidth={currentDrawing.strokeWidth}
                      fill="none"
                      opacity="0.8"
                    />
                  )}
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolleyballPlayRecorder;
