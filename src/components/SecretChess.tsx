import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Settings, User, Bot, Trophy, ChevronLeft, Play, Undo2, Redo2, Crown, Sword, Sparkles } from 'lucide-react';

const PIECES = {
  EMPTY: 0,
  W_PAWN: 1, W_KNIGHT: 2, W_BISHOP: 3, W_ROOK: 4, W_QUEEN: 5, W_KING: 6,
  B_PAWN: 7, B_KNIGHT: 8, B_BISHOP: 9, B_ROOK: 10, B_QUEEN: 11, B_KING: 12
};

const PIECE_VALUES: Record<number, number> = {
  [PIECES.W_PAWN]: 100, [PIECES.W_KNIGHT]: 320, [PIECES.W_BISHOP]: 330, [PIECES.W_ROOK]: 500, [PIECES.W_QUEEN]: 900, [PIECES.W_KING]: 20000,
  [PIECES.B_PAWN]: -100, [PIECES.B_KNIGHT]: -320, [PIECES.B_BISHOP]: -330, [PIECES.B_ROOK]: -500, [PIECES.B_QUEEN]: -900, [PIECES.B_KING]: -20000,
  [PIECES.EMPTY]: 0
};

// Position-based evaluation tables for better positional play
const PST: Record<number, number[]> = {
  [PIECES.W_PAWN]: [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
  ],
  [PIECES.W_KNIGHT]: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ],
  [PIECES.W_BISHOP]: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ],
  [PIECES.W_ROOK]: [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
  ],
  [PIECES.W_QUEEN]: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ],
  [PIECES.W_KING]: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
  ]
};

// Mirror PST for black pieces
const getPSTValue = (piece: number, index: number): number => {
  const pieceType = piece <= 6 ? piece : piece - 6;
  const isWhite = piece <= 6;
  const table = PST[pieceType]; // Tables are defined for 1-6 (pawn to king)
  if (!table) return 0;
  
  // For black, we flip the row index
  const finalIdx = isWhite ? index : (7 - Math.floor(index / 8)) * 8 + (index % 8);
  return table[finalIdx] * (isWhite ? 1 : -1);
};

type Board = number[]; // 64 elements
type Move = { from: number; to: number; promotion?: number; castling?: boolean; enPassant?: boolean };

interface GameState {
  board: Board;
  turn: 'white' | 'black';
  history: Move[];
  castlingRights: { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean };
  enPassantTarget: number | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  status: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  winner: 'white' | 'black' | 'draw' | null;
  check: boolean;
}

// --- Helper Functions ---
const createInitialBoard = (): Board => {
  const board = new Array(64).fill(PIECES.EMPTY);
  const backRank = [PIECES.W_ROOK, PIECES.W_KNIGHT, PIECES.W_BISHOP, PIECES.W_QUEEN, PIECES.W_KING, PIECES.W_BISHOP, PIECES.W_KNIGHT, PIECES.W_ROOK];
  
  // Black pieces
  for (let i = 0; i < 8; i++) {
    board[i] = backRank[i] + 6;
    board[i + 8] = PIECES.B_PAWN;
  }
  
  // White pieces
  for (let i = 0; i < 8; i++) {
    board[i + 48] = PIECES.W_PAWN;
    board[i + 56] = backRank[i];
  }
  
  return board;
};

const getPieceColor = (piece: number): 'white' | 'black' | null => {
  if (piece === PIECES.EMPTY) return null;
  return piece <= 6 ? 'white' : 'black';
};

const getXY = (index: number) => ({ x: index % 8, y: Math.floor(index / 8) });
const getIndex = (x: number, y: number) => y * 8 + x;

const isKingAttackedAt = (board: Board, index: number, color: 'white' | 'black'): boolean => {
  const tempBoard = [...board];
  const kingPiece = color === 'white' ? PIECES.W_KING : PIECES.B_KING;
  // Temporarily place king
  tempBoard[index] = kingPiece;
  return isKingInCheck(tempBoard, color);
};

// --- Move Generation ---
const getLegalMoves = (state: GameState, fromIndex: number): Move[] => {
  const piece = state.board[fromIndex];
  if (piece === PIECES.EMPTY) return [];
  
  const color = getPieceColor(piece);
  if (color !== state.turn) return [];

  const moves: Move[] = [];
  const { x, y } = getXY(fromIndex);

  const addMove = (toX: number, toY: number) => {
    if (toX < 0 || toX > 7 || toY < 0 || toY > 7) return false;
    const toIndex = getIndex(toX, toY);
    const targetPiece = state.board[toIndex];
    const targetColor = getPieceColor(targetPiece);

    if (targetColor === color) return false;
    
    if (!isMoveLeavingKingInCheck(state, fromIndex, toIndex)) {
      moves.push({ from: fromIndex, to: toIndex });
    }
    
    return targetPiece === PIECES.EMPTY;
  };

  const pieceType = piece <= 6 ? piece : piece - 6;

  switch (pieceType) {
    case PIECES.W_PAWN: {
      const dir = color === 'white' ? -1 : 1;
      if (y + dir >= 0 && y + dir <= 7 && state.board[getIndex(x, y + dir)] === PIECES.EMPTY) {
        if (!isMoveLeavingKingInCheck(state, fromIndex, getIndex(x, y + dir))) {
          moves.push({ from: fromIndex, to: getIndex(x, y + dir) });
        }
        if (((color === 'white' && y === 6) || (color === 'black' && y === 1)) && state.board[getIndex(x, y + 2 * dir)] === PIECES.EMPTY) {
          if (!isMoveLeavingKingInCheck(state, fromIndex, getIndex(x, y + 2 * dir))) {
            moves.push({ from: fromIndex, to: getIndex(x, y + 2 * dir) });
          }
        }
      }
      [-1, 1].forEach(dx => {
        const nx = x + dx;
        const ny = y + dir;
        if (nx >= 0 && nx <= 7 && ny >= 0 && ny <= 7) {
          const targetIdx = getIndex(nx, ny);
          const target = state.board[targetIdx];
          if (target !== PIECES.EMPTY && getPieceColor(target) !== color) {
            if (!isMoveLeavingKingInCheck(state, fromIndex, targetIdx)) moves.push({ from: fromIndex, to: targetIdx });
          }
          if (targetIdx === state.enPassantTarget && !isMoveLeavingKingInCheck(state, fromIndex, targetIdx)) {
            moves.push({ from: fromIndex, to: targetIdx, enPassant: true });
          }
        }
      });
      break;
    }
    case PIECES.W_KNIGHT: {
      const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      jumps.forEach(([dx, dy]) => addMove(x + dx, y + dy));
      break;
    }
    case PIECES.W_BISHOP: {
      const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
      dirs.forEach(([dx, dy]) => { for (let i = 1; i < 8; i++) if (!addMove(x + dx * i, y + dy * i)) break; });
      break;
    }
    case PIECES.W_ROOK: {
      const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
      dirs.forEach(([dx, dy]) => { for (let i = 1; i < 8; i++) if (!addMove(x + dx * i, y + dy * i)) break; });
      break;
    }
    case PIECES.W_QUEEN: {
      const dirs = [[-1,-1],[-1,1],[1,-1],[1,1],[0,-1],[0,1],[-1,0],[1,0]];
      dirs.forEach(([dx, dy]) => { for (let i = 1; i < 8; i++) if (!addMove(x + dx * i, y + dy * i)) break; });
      break;
    }
    case PIECES.W_KING: {
      const dirs = [[-1,-1],[-1,1],[1,-1],[1,1],[0,-1],[0,1],[-1,0],[1,0]];
      dirs.forEach(([dx, dy]) => addMove(x + dx, y + dy));
      
      // Castling
      if (!state.check) {
        if (state.turn === 'white' && fromIndex === 60) {
          if (state.castlingRights.wK && state.board[61] === PIECES.EMPTY && state.board[62] === PIECES.EMPTY) {
            if (!isKingAttackedAt(state.board, 61, 'white') && !isKingAttackedAt(state.board, 62, 'white')) moves.push({ from: 60, to: 62, castling: true });
          }
          if (state.castlingRights.wQ && state.board[59] === PIECES.EMPTY && state.board[58] === PIECES.EMPTY && state.board[57] === PIECES.EMPTY) {
            if (!isKingAttackedAt(state.board, 59, 'white') && !isKingAttackedAt(state.board, 58, 'white')) moves.push({ from: 60, to: 58, castling: true });
          }
        } else if (state.turn === 'black' && fromIndex === 4) {
          if (state.castlingRights.bK && state.board[5] === PIECES.EMPTY && state.board[6] === PIECES.EMPTY) {
            if (!isKingAttackedAt(state.board, 5, 'black') && !isKingAttackedAt(state.board, 6, 'black')) moves.push({ from: 4, to: 6, castling: true });
          }
          if (state.castlingRights.bQ && state.board[3] === PIECES.EMPTY && state.board[2] === PIECES.EMPTY && state.board[1] === PIECES.EMPTY) {
            if (!isKingAttackedAt(state.board, 3, 'black') && !isKingAttackedAt(state.board, 2, 'black')) moves.push({ from: 4, to: 2, castling: true });
          }
        }
      }
      break;
    }
  }
  return moves;
};

const isMoveLeavingKingInCheck = (state: GameState, from: number, to: number): boolean => {
  const newBoard = [...state.board];
  newBoard[to] = newBoard[from];
  newBoard[from] = PIECES.EMPTY;
  return isKingInCheck(newBoard, state.turn);
};

const isKingInCheck = (board: Board, color: 'white' | 'black'): boolean => {
  const kingPiece = color === 'white' ? PIECES.W_KING : PIECES.B_KING;
  const kingPos = board.indexOf(kingPiece);
  if (kingPos === -1) return false;

  const { x, y } = getXY(kingPos);
  const opponentColor = color === 'white' ? 'black' : 'white';

  // Check for attacks from opponent pieces
  // This is a simplified check for the demo
  // In a real implementation, we'd check all possible attack vectors (sliding, jumping, pawn)
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece !== PIECES.EMPTY && getPieceColor(piece) === opponentColor) {
      // If any opponent piece can move to kingPos, it's check
      // We use a simplified version here to avoid recursion
      if (canPieceAttack(board, i, kingPos)) return true;
    }
  }
  return false;
};

const canPieceAttack = (board: Board, from: number, to: number): boolean => {
  const piece = board[from];
  const { x: fx, y: fy } = getXY(from);
  const { x: tx, y: ty } = getXY(to);
  const dx = tx - fx;
  const dy = ty - fy;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  const pieceType = piece <= 6 ? piece : piece - 6;
  const color = getPieceColor(piece);

  switch (pieceType) {
    case PIECES.W_PAWN:
      const pDir = color === 'white' ? -1 : 1;
      return adx === 1 && dy === pDir;
    case PIECES.W_KNIGHT:
      return (adx === 1 && ady === 2) || (adx === 2 && ady === 1);
    case PIECES.W_BISHOP:
      if (adx !== ady) return false;
      return isPathClear(board, from, to);
    case PIECES.W_ROOK:
      if (adx !== 0 && ady !== 0) return false;
      return isPathClear(board, from, to);
    case PIECES.W_QUEEN:
      if (adx !== ady && adx !== 0 && ady !== 0) return false;
      return isPathClear(board, from, to);
    case PIECES.W_KING:
      return adx <= 1 && ady <= 1;
  }
  return false;
};

const isPathClear = (board: Board, from: number, to: number): boolean => {
  const { x: fx, y: fy } = getXY(from);
  const { x: tx, y: ty } = getXY(to);
  const dx = Math.sign(tx - fx);
  const dy = Math.sign(ty - fy);
  let cx = fx + dx;
  let cy = fy + dy;
  while (cx !== tx || cy !== ty) {
    if (board[getIndex(cx, cy)] !== PIECES.EMPTY) return false;
    cx += dx;
    cy += dy;
  }
  return true;
};

// --- AI (Minimax) ---
const evaluateBoard = (board: Board): number => {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece === PIECES.EMPTY) continue;
    
    // Material Value
    score += PIECE_VALUES[piece];
    
    // Positional Value (PST)
    score += getPSTValue(piece, i);
    
    // Mobility & Activity (Basic)
    const color = getPieceColor(piece);
    const isWhite = color === 'white';
    const multiplier = isWhite ? 1 : -1;
    
    // Give a small bonus for piece presence near center
    const { x, y } = getXY(i);
    const distToCenter = Math.abs(x - 3.5) + Math.abs(y - 3.5);
    score += (4 - distToCenter) * 2 * multiplier;
  }
  return score;
};

const minimax = (state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): { score: number; move?: Move } => {
  if (depth === 0) return { score: evaluateBoard(state.board) };

  const allMoves: Move[] = [];
  for (let i = 0; i < 64; i++) {
    if (getPieceColor(state.board[i]) === state.turn) {
      allMoves.push(...getLegalMoves(state, i));
    }
  }

  if (allMoves.length === 0) {
    if (isKingInCheck(state.board, state.turn)) return { score: isMaximizing ? -100000 : 100000 };
    return { score: 0 };
  }

  let bestMove: Move | undefined = undefined;
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of allMoves) {
      const nextState = applyMove(state, move);
      const { score } = minimax(nextState, depth - 1, alpha, beta, false);
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of allMoves) {
      const nextState = applyMove(state, move);
      const { score } = minimax(nextState, depth - 1, alpha, beta, true);
      if (score < minScore) {
        minScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: bestMove };
  }
};

const applyMove = (state: GameState, move: Move): GameState => {
  const newBoard = [...state.board];
  const piece = newBoard[move.from];
  
  // Handle promotion
  if ((piece === PIECES.W_PAWN && Math.floor(move.to / 8) === 0) || (piece === PIECES.B_PAWN && Math.floor(move.to / 8) === 7)) {
    newBoard[move.to] = state.turn === 'white' ? PIECES.W_QUEEN : PIECES.B_QUEEN;
  } else {
    newBoard[move.to] = piece;
  }
  
  newBoard[move.from] = PIECES.EMPTY;

  // Handle En Passant capture
  if (move.enPassant) {
    const captureIdx = getIndex(move.to % 8, Math.floor(move.from / 8));
    newBoard[captureIdx] = PIECES.EMPTY;
  }

  // Handle Castling
  if (move.castling) {
    if (move.to === 62) { newBoard[61] = PIECES.W_ROOK; newBoard[63] = PIECES.EMPTY; }
    else if (move.to === 58) { newBoard[59] = PIECES.W_ROOK; newBoard[56] = PIECES.EMPTY; }
    else if (move.to === 6) { newBoard[5] = PIECES.B_ROOK; newBoard[7] = PIECES.EMPTY; }
    else if (move.to === 2) { newBoard[3] = PIECES.B_ROOK; newBoard[0] = PIECES.EMPTY; }
  }

  // Update castling rights
  const newCastlingRights = { ...state.castlingRights };
  if (piece === PIECES.W_KING) { newCastlingRights.wK = false; newCastlingRights.wQ = false; }
  if (piece === PIECES.B_KING) { newCastlingRights.bK = false; newCastlingRights.bQ = false; }
  if (move.from === 56 || move.to === 56) newCastlingRights.wQ = false;
  if (move.from === 63 || move.to === 63) newCastlingRights.wK = false;
  if (move.from === 0 || move.to === 0) newCastlingRights.bQ = false;
  if (move.from === 7 || move.to === 7) newCastlingRights.bK = false;

  const nextTurn = state.turn === 'white' ? 'black' : 'white';
  const isCheck = isKingInCheck(newBoard, nextTurn);
  
  return {
    ...state,
    board: newBoard,
    turn: nextTurn,
    history: [...state.history, move],
    castlingRights: newCastlingRights,
    check: isCheck,
    enPassantTarget: (piece === PIECES.W_PAWN || piece === PIECES.B_PAWN) && Math.abs(move.from - move.to) === 16 
      ? (move.from + move.to) / 2 
      : null
  };
};

// --- Themes & Styles ---
type PieceStyle = 'classic' | 'modern' | 'neo' | 'standard' | 'kingdom';
type BoardTheme = 'slate' | 'wood' | 'ocean' | 'emerald' | 'crimson' | 'marble' | 'cyber';

interface ThemeColors {
  name: string;
  dark: string;
  light: string;
  accent: string;
  pieceWhite: string;
  pieceBlack: string;
  pieceStrokeWhite: string;
  pieceStrokeBlack: string;
  pattern?: string;
}

const THEMES: Record<BoardTheme, ThemeColors> = {
  slate: {
    name: 'Slate Tech',
    dark: '#1e293b',
    light: '#94a3b8',
    accent: '#1A9E5C',
    pieceWhite: '#FFFFFF',
    pieceBlack: '#0f172a',
    pieceStrokeWhite: '#0f172a',
    pieceStrokeBlack: '#FFFFFF',
    pattern: 'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.05) 1px, transparent 0)'
  },
  wood: {
    name: 'Mahogany',
    dark: '#451a03',
    light: '#d97706',
    accent: '#f59e0b',
    pieceWhite: '#fff7ed',
    pieceBlack: '#2d1406',
    pieceStrokeWhite: '#2d1406',
    pieceStrokeBlack: '#fff7ed',
    pattern: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)'
  },
  ocean: {
    name: 'Deep Sea',
    dark: '#1e3a8a',
    light: '#60a5fa',
    accent: '#38bdf8',
    pieceWhite: '#f0f9ff',
    pieceBlack: '#172554',
    pieceStrokeWhite: '#172554',
    pieceStrokeBlack: '#f0f9ff',
    pattern: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
  },
  emerald: {
    name: 'Jade Palace',
    dark: '#064e3b',
    light: '#34d399',
    accent: '#10b981',
    pieceWhite: '#ecfdf5',
    pieceBlack: '#064e3b',
    pieceStrokeWhite: '#064e3b',
    pieceStrokeBlack: '#ecfdf5'
  },
  crimson: {
    name: 'Royal Ruby',
    dark: '#7f1d1d',
    light: '#f87171',
    accent: '#dc2626',
    pieceWhite: '#fef2f2',
    pieceBlack: '#450a0a',
    pieceStrokeWhite: '#450a0a',
    pieceStrokeBlack: '#fef2f2',
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)'
  },
  marble: {
    name: 'Lux Marble',
    dark: '#262626',
    light: '#e5e5e5',
    accent: '#737373',
    pieceWhite: '#ffffff',
    pieceBlack: '#171717',
    pieceStrokeWhite: '#404040',
    pieceStrokeBlack: '#f5f5f5',
    pattern: 'url("https://www.transparenttextures.com/patterns/white-diamond.png")'
  },
  cyber: {
    name: 'Neon Grid',
    dark: '#000000',
    light: '#1e1b4b',
    accent: '#818cf8',
    pieceWhite: '#e0e7ff',
    pieceBlack: '#000000',
    pieceStrokeWhite: '#4338ca',
    pieceStrokeBlack: '#818cf8',
    pattern: 'linear-gradient(to right, #4338ca 1px, transparent 1px), linear-gradient(to bottom, #4338ca 1px, transparent 1px)'
  }
};

// --- Piece Icons ---
interface PieceIconProps {
  piece: number;
  style: PieceStyle;
  theme: BoardTheme;
}

function PieceIcon({ piece, style, theme }: PieceIconProps) {
  const pieceType = piece <= 6 ? piece : piece - 6;
  const color = getPieceColor(piece);
  if (!color) return null;

  const isWhite = color === 'white';
  const t = THEMES[theme];
  const fill = isWhite ? t.pieceWhite : t.pieceBlack;
  const stroke = isWhite ? t.pieceStrokeWhite : t.pieceStrokeBlack;

  if (style === 'kingdom') {
    switch (pieceType) {
      case PIECES.W_KING:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-lg">
            <path d="M5 22h14v-2H5v2zM5 10l3.5 3 3.5-5 3.5 5 3.5-3v10H5V10z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <circle cx="12" cy="4" r="1.5" fill="#EAB308" stroke={stroke} strokeWidth="0.5" />
            <circle cx="5" cy="9" r="1" fill="#EAB308" />
            <circle cx="19" cy="9" r="1" fill="#EAB308" />
          </svg>
        );
      case PIECES.W_QUEEN:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-lg">
            <path d="M6 22h12v-2H6v2zM7 20l1-12 4-3 4 3 1 12H7z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M12 5v15" stroke={stroke} strokeWidth="1" opacity="0.3" />
            <path d="M9 10h6" stroke={stroke} strokeWidth="1" opacity="0.3" />
            <circle cx="12" cy="3" r="2" fill="#F472B6" stroke={stroke} strokeWidth="0.5" />
          </svg>
        );
      case PIECES.W_ROOK:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <path d="M5 22h14l-1-3H6l-1 3z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M6 19v-11h12v11H6z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M5 5h3v3h2V5h4v3h2V5h3v5H5V5z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <rect x="10" y="11" width="4" height="5" fill="black" fillOpacity="0.2" rx="1" />
          </svg>
        );
      case PIECES.W_BISHOP:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <path d="M8 22h8l-1-2H9l-1 2z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M12 3c-3 0-5 3-5 7s2 10 5 10 5-6 5-10-2-7-5-7z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M12 3v17" stroke={stroke} strokeWidth="1" opacity="0.2" />
            <path d="M9.5 7l5 5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case PIECES.W_KNIGHT:
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-lg">
            {/* Standard Robust Knight Shape */}
            <path d="M12 56h40v-4H12v4z" fill={fill} stroke={stroke} strokeWidth="2" />
            <path 
              d="M18 52c0-12 2-25 15-32 3-2 8-4 12-4s10 4 10 10c0 10-15 15-15 26H18z" 
              fill={fill} stroke={stroke} strokeWidth="2.5" 
            />
            {/* Mane */}
            <path d="M43 16l3-8 4 6" fill={fill} stroke={stroke} strokeWidth="2" />
            <path d="M50 24c2 4 4 12 2 18" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            {/* Eye */}
            <circle cx="38" cy="24" r="2.5" fill={stroke} />
            {/* Mouth */}
            <path d="M30 35c2 2 6 2 8 0" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.3" />
          </svg>
        );
      case PIECES.W_PAWN:
        return (
          <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-sm">
            <path d="M12 3L6 8v7c0 4 6 6 6 6s6-2 6-6V8l-6-5z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M12 7l-2 3M12 7l2 3" stroke={stroke} strokeWidth="1" opacity="0.5" />
            <circle cx="12" cy="13" r="2" fill={stroke} opacity="0.2" />
          </svg>
        );
    }
  }

  if (style === 'standard') {
    const getEmoji = () => {
      // Use standard Unicode chess symbols with \uFE0E to prevent emoji rendering
      if (isWhite) {
        switch (pieceType) {
          case PIECES.W_KING: return '♔\uFE0E';
          case PIECES.W_QUEEN: return '♕\uFE0E';
          case PIECES.W_ROOK: return '♖\uFE0E';
          case PIECES.W_BISHOP: return '♗\uFE0E';
          case PIECES.W_KNIGHT: return '♘\uFE0E';
          case PIECES.W_PAWN: return '♙\uFE0E';
          default: return '';
        }
      } else {
        switch (pieceType) {
          case PIECES.W_KING: return '♚\uFE0E';
          case PIECES.W_QUEEN: return '♛\uFE0E';
          case PIECES.W_ROOK: return '♜\uFE0E';
          case PIECES.W_BISHOP: return '♝\uFE0E';
          case PIECES.W_KNIGHT: return '♞\uFE0E';
          case PIECES.W_PAWN: return '♟\uFE0E';
          default: return '';
        }
      }
    };

    return (
      <div 
        className="w-full h-full flex items-center justify-center text-4xl select-none"
        style={{ color: fill }}
      >
        {getEmoji()}
      </div>
    );
  }

  if (style === 'neo') {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className={`
          ${pieceType === PIECES.W_KING ? 'w-7 h-7 rounded-full border-4 rotate-45' : ''}
          ${pieceType === PIECES.W_QUEEN ? 'w-6 h-6 rounded-lg rotate-45' : ''}
          ${pieceType === PIECES.W_ROOK ? 'w-6 h-6 rounded-sm' : ''}
          ${pieceType === PIECES.W_BISHOP ? 'w-5 h-7 rounded-[40%] skew-x-12' : ''}
          ${pieceType === PIECES.W_KNIGHT ? 'w-6 h-6 rounded-tr-3xl rounded-bl-xl skew-y-6' : ''}
          ${pieceType === PIECES.W_PAWN ? 'w-4 h-4 rounded-full' : ''}
        `}
        style={{ 
          backgroundColor: fill, 
          borderColor: stroke,
          borderWidth: pieceType === PIECES.W_KING ? '4px' : '2px'
        }}
        />
      </div>
    );
  }

  if (style === 'modern') {
    switch (pieceType) {
      case PIECES.W_KING:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <rect x="7" y="16" width="10" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M12 4v12M9 7l3-3 3 3M8 10h8" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="12" cy="4" r="1.5" fill={fill} stroke={stroke} />
          </svg>
        );
      case PIECES.W_QUEEN:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <rect x="7" y="16" width="10" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M8 6l2 10h4l2-10-4 2-4-2z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <circle cx="12" cy="4" r="2" fill={fill} stroke={stroke} />
          </svg>
        );
      case PIECES.W_ROOK:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <path d="M7 20h10v-3H7v3zM8 17l1-9h6l1 9H8zM7 5h2v3h2V5h2v3h2V5h2v3H7V5z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </svg>
        );
      case PIECES.W_BISHOP:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <rect x="8" y="18" width="8" height="3" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M12 4c-3 0-4 3-4 7 0 3 1 7 1 7h6s1-4 1-7c0-4-1-7-4-7z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M11 6l2 2" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case PIECES.W_KNIGHT:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <rect x="8" y="18" width="8" height="3" rx="1" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M8 18l1-13c3-1 7 1 7 5 0 3-2 5-2 5h-6z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M13 8h1" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case PIECES.W_PAWN:
        return (
          <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md">
            <path d="M9 20h6v-2H9v2zM12 6a3 3 0 100 6 3 3 0 000-6z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M10 18l.5-6h3l.5 6h-4z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </svg>
        );
    }
  }

  // Classic Style Default
  switch (pieceType) {
    case PIECES.W_KING:
      return (
        <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
          <path d="M5 21h14v-2H5v2zM12 4L9 8H6v2l3 2v4h6v-4l3-2V8h-3l-3-4z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M12 2v2M10 3h4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case PIECES.W_QUEEN:
      return (
        <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
          <path d="M5 21h14v-2H5v2zM12 4l-4 4-2-1 1 5v4h10v-4l1-5-2 1-4-4z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <circle cx="12" cy="3" r="1" fill={fill} stroke={stroke} />
        </svg>
      );
    case PIECES.W_ROOK:
      return (
        <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
          <path d="M5 21h14v-2H5v2zM7 19v-4h10v4M6 15v-7h2v2h2v-2h4v2h2v-2h2v7H6z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case PIECES.W_BISHOP:
      return (
        <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
          <path d="M5 21h14v-2H5v2zM12 3c-2.5 0-4 2-4 5 0 2 1 4 1 8h6s1-6 1-8c0-3-1.5-5-4-5z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M10 5l4 4M12 3v2" stroke={stroke} strokeWidth="1" />
        </svg>
      );
    case PIECES.W_KNIGHT:
      return (
        <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
          <path d="M5 21h14v-2H5v2zM15 6s-4-2-7 1c0 0-2 2-2 6 0 2 2 4 2 4h7v-4s-3-1-1-7z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <circle cx="9" cy="9" r="0.5" fill={stroke} />
        </svg>
      );
    case PIECES.W_PAWN:
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md">
          <path d="M6 21h12v-2H6v2zM12 4c-2 0-3 1.5-3 3s1 4 1 8h4s1-6.5 1-8-1-3-3-3z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

function PieceStyleButton({ s, pieceStyle, setPieceStyle, boardTheme }: { s: PieceStyle, pieceStyle: PieceStyle, setPieceStyle: (s: PieceStyle) => void, boardTheme: BoardTheme, key?: any }) {
  return (
    <button
      onClick={() => setPieceStyle(s)}
      className={`py-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all ${pieceStyle === s ? 'bg-[#1A9E5C]/10 border-[#1A9E5C] text-[#1A9E5C]' : 'bg-white/5 border-white/5 text-gray-400'}`}
    >
      <div className="scale-75 origin-center capitalize">
        <PieceIcon piece={PIECES.W_QUEEN} style={s} theme={boardTheme} />
      </div>
      <span className="text-[10px] font-bold">
        {s === 'classic' ? 'Klasik' : s === 'modern' ? 'Modern' : s === 'neo' ? 'Futuristik' : s === 'standard' ? 'Standar' : 'Kingdom'}
      </span>
    </button>
  );
}

function AnimatedBackground({ theme }: { theme: BoardTheme }) {
  const t = THEMES[theme];
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base Background Color */}
      <div className="absolute inset-0" style={{ backgroundColor: theme === 'cyber' ? '#020617' : theme === 'ocean' ? '#081b33' : theme === 'crimson' ? '#1a0505' : theme === 'emerald' ? '#022c22' : theme === 'marble' ? '#0a0a0a' : theme === 'wood' ? '#1c1917' : '#0f172a' }} />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: t.pattern, backgroundSize: '40px 40px' }} />

      {theme === 'cyber' && (
        <>
          {/* Neon Waves */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                x: ['-100%', '100%'],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: 5 + i * 2, 
                repeat: Infinity, 
                delay: i * 2,
                ease: "linear" 
              }}
              className="absolute h-[2px] w-[200%] rotate-[-45deg] bg-indigo-500 shadow-[0_0_15px_#6366f1]"
              style={{ top: `${20 + i * 25}%` }}
            />
          ))}
          <motion.div 
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]"
          />
        </>
      )}

      {theme === 'ocean' && (
        <>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)]"
          />
          {/* Bubbles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '110%', x: `${Math.random() * 100}%` }}
              animate={{ y: '-10%' }}
              transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 20, ease: "linear" }}
              className="absolute w-1 h-1 rounded-full bg-blue-300/20 blur-[1px]"
            />
          ))}
          {/* Whale Silhouette */}
          <motion.div
            initial={{ x: '120%', y: '40%', opacity: 0 }}
            animate={{ 
              x: '-20%', 
              y: [ '40%', '45%', '40%'],
              opacity: [0, 0.08, 0.08, 0]
            }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute"
          >
            <div className="w-96 h-24 bg-blue-900 rounded-full blur-3xl relative">
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-20 h-10 bg-blue-900 rounded-lg blur-2xl" />
            </div>
          </motion.div>
        </>
      )}

      {theme === 'crimson' && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-red-950/40 to-transparent" />
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '110%', x: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ y: '-10%', opacity: [0, 1, 1, 0], x: `${(Math.random() - 0.5) * 50 + i * 3}%` }}
              transition={{ duration: 8 + Math.random() * 12, repeat: Infinity, delay: Math.random() * 15, ease: "easeOut" }}
              className="absolute w-1 h-1 bg-red-400 rounded-full shadow-[0_0_10px_#f87171]"
            />
          ))}
        </>
      )}

      {theme === 'emerald' && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '-10%', x: `${Math.random() * 100}%`, rotate: 0 }}
              animate={{ y: '110%', rotate: 360, x: `${Math.random() * 100}%` }}
              transition={{ duration: 25 + Math.random() * 15, repeat: Infinity, delay: Math.random() * 20, ease: "linear" }}
              className="absolute p-px"
            >
              <div className="w-2 h-3 bg-emerald-400/10 rounded-full blur-[1px] rotate-45" />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(16,185,129,0.1)_0%,transparent_50%)]" />
        </>
      )}

      {theme === 'marble' && (
        <>
          <div className="absolute inset-0 opacity-10 grayscale invert" style={{ backgroundImage: t.pattern, backgroundSize: '200px 200px' }} />
          <motion.div 
            animate={{ opacity: [0.1, 0.2, 0.1], x: [-200, 200] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-1/2 bg-[conic-gradient(from_0deg_at_50%_0%,transparent_48%,rgba(255,255,255,0.06)_50%,transparent_52%)]"
          />
        </>
      )}

      {(theme === 'slate' || theme === 'wood') && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.3, 0],
                y: [0, -200],
                x: [0, (Math.random() - 0.5) * 100]
              }}
              transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 20 }}
              className={`absolute w-0.5 h-0.5 rounded-full ${theme === 'wood' ? 'bg-amber-100/20' : 'bg-blue-100/10'}`}
              style={{ top: `${40 + Math.random() * 60}%`, left: `${Math.random() * 100}%` }}
            />
          ))}
        </>
      )}
    </div>
  );
}

// --- Components ---

interface SecretChessProps {
  onClose: () => void;
  darkMode: boolean;
}

export default function SecretChess({ onClose, darkMode }: SecretChessProps) {
  const [screen, setScreen] = useState<'menu' | 'settings' | 'game'>('menu');
  const [mode, setMode] = useState<'ai' | 'pvp'>('ai');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'very-hard'>('medium');
  const [timeLimit, setTimeLimit] = useState<number | null>(null); // minutes
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'random'>('white');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('slate');
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>('standard');
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [historyStates, setHistoryStates] = useState<GameState[]>([]);
  const [redoStates, setRedoStates] = useState<GameState[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [actualPlayerColor, setActualPlayerColor] = useState<'white' | 'black'>('white');
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [timers, setTimers] = useState<{ white: number; black: number }>({ white: 0, black: 0 });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [dismissedStatus, setDismissedStatus] = useState(false);
  const [showThemePreview, setShowThemePreview] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    const initialBoard = createInitialBoard();
    const actualColor = playerColor === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : playerColor;
    setActualPlayerColor(actualColor as 'white' | 'black');
    
    setGameState({
      board: initialBoard,
      turn: 'white',
      history: [],
      castlingRights: { wK: true, wQ: true, bK: true, bQ: true },
      enPassantTarget: null,
      halfmoveClock: 0,
      fullmoveNumber: 1,
      status: 'playing',
      winner: null,
      check: false
    });
    setHistoryStates([]);
    setRedoStates([]);
    
    if (timeLimit) {
      setTimers({ white: timeLimit * 60, black: timeLimit * 60 });
    }
    
    setScreen('game');
    setDismissedStatus(false);
  };

  useEffect(() => {
    if (gameState?.status === 'playing' && timeLimit) {
      timerRef.current = setInterval(() => {
        setTimers(prev => ({
          ...prev,
          [gameState.turn]: Math.max(0, prev[gameState.turn] - 1)
        }));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState?.turn, gameState?.status]);

  // AI Turn
  useEffect(() => {
    if (mode === 'ai' && gameState?.turn !== actualPlayerColor && gameState?.status === 'playing') {
      const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : difficulty === 'hard' ? 4 : 5;
      
      setIsAiThinking(true);
      
      // Calculate delay based on difficulty for realism
      const minDelay = difficulty === 'very-hard' ? 1000 : 1500;
      const extraDelay = Math.random() * 2000;
      const totalDelay = minDelay + extraDelay;

      const timer = setTimeout(() => {
        const { move } = minimax(gameState, depth, -Infinity, Infinity, gameState.turn === 'white');
        if (move) {
          handleMove(move);
        } else {
          // Checkmate or Stalemate
          const isCheck = isKingInCheck(gameState.board, gameState.turn);
          setGameState(prev => ({
            ...prev!,
            status: isCheck ? 'checkmate' : 'stalemate',
            winner: isCheck ? (gameState.turn === 'white' ? 'black' : 'white') : null
          }));
        }
        setIsAiThinking(false);
      }, totalDelay);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.turn, actualPlayerColor, difficulty]);

  const handleSquareClick = (index: number) => {
    if (!gameState || gameState.status !== 'playing') return;
    if (mode === 'ai' && (gameState.turn !== actualPlayerColor || isAiThinking)) return;

    const piece = gameState.board[index];
    const color = getPieceColor(piece);

    // If a move is selected
    const move = validMoves.find(m => m.to === index);
    if (move) {
      handleMove(move);
      return;
    }

    // Select piece
    if (color === gameState.turn) {
      setSelectedSquare(index);
      setValidMoves(getLegalMoves(gameState, index));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const handleMove = (move: Move) => {
    setHistoryStates(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
    setRedoStates([]); // Clear redo history on new move
    const nextState = applyMove(gameState!, move);
    
    // Check for game end
    const opponentMoves: Move[] = [];
    for (let i = 0; i < 64; i++) {
      if (getPieceColor(nextState.board[i]) === nextState.turn) {
        opponentMoves.push(...getLegalMoves(nextState, i));
      }
    }

    if (opponentMoves.length === 0) {
      const isCheck = isKingInCheck(nextState.board, nextState.turn);
      nextState.status = isCheck ? 'checkmate' : 'stalemate';
      nextState.winner = isCheck ? (nextState.turn === 'white' ? 'black' : 'white') : null;
    }

    setGameState(nextState);
    setSelectedSquare(null);
    setValidMoves([]);
  };

  const undoMove = () => {
    if (historyStates.length === 0) return;
    
    const newHistory = [...historyStates];
    const newRedo = [...redoStates];
    
    let prevState = newHistory.pop();
    if (prevState) newRedo.push(JSON.parse(JSON.stringify(gameState)));
    
    // In AI mode, if it's player's turn, we need to undo both AI move and player move
    if (mode === 'ai' && gameState?.turn === actualPlayerColor && newHistory.length > 0) {
      const aiState = prevState;
      prevState = newHistory.pop();
      if (prevState && aiState) newRedo.push(JSON.parse(JSON.stringify(aiState)));
    }
    
    if (prevState) {
      setGameState(prevState);
      setHistoryStates(newHistory);
      setRedoStates(newRedo);
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const redoMove = () => {
    if (redoStates.length === 0) return;
    
    const newRedo = [...redoStates];
    const newHistory = [...historyStates];
    
    let nextState = newRedo.pop();
    if (nextState) newHistory.push(JSON.parse(JSON.stringify(gameState)));
    
    // In AI mode, redo both player move and AI move
    if (mode === 'ai' && nextState?.turn !== actualPlayerColor && newRedo.length > 0) {
      const playerState = nextState;
      nextState = newRedo.pop();
      if (nextState && playerState) newHistory.push(JSON.parse(JSON.stringify(playerState)));
    }
    
    if (nextState) {
      setGameState(nextState);
      setHistoryStates(newHistory);
      setRedoStates(newRedo);
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden font-sans">
      <AnimatedBackground theme={boardTheme} />
      
      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-md p-8 space-y-8 text-center"
          >
            <div className="space-y-4">
              <div className="relative inline-block mx-auto">
                <div className="w-28 h-28 bg-[#1A9E5C] rounded-[40px] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent transition-transform group-hover:scale-110"></div>
                  <Sword size={56} className="relative z-10" />
                  <Crown size={24} className="absolute top-3 right-3 text-yellow-400 rotate-12 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center text-[#1A9E5C] shadow-2xl border-2 border-white/10">
                  <Trophy size={18} />
                </div>
              </div>
              <div className="pt-2">
                <h1 className="text-4xl font-black text-white tracking-tighter">SECRET CHESS</h1>
                <p className="text-gray-400 text-sm mt-1">Permainan catur tersembunyi untuk para master.</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setMode('ai'); startGame(); }}
                className="w-full py-5 bg-[#1A9E5C] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#1A9E5C]/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Bot size={24} />
                PLAY VS AI
              </button>
              <button
                onClick={() => { setMode('pvp'); startGame(); }}
                className="w-full py-5 bg-white/5 backdrop-blur-xl text-white rounded-2xl font-bold text-lg border border-white/10 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <User size={24} />
                PLAY 1 VS 1
              </button>
              <button
                onClick={() => setScreen('settings')}
                className="w-full py-4 text-gray-400 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Settings size={18} />
                SETTINGS
              </button>
            </div>

            <button onClick={onClose} className="text-gray-600 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
              EXIT GAME
            </button>
          </motion.div>
        )}

        {screen === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 w-full max-w-md p-6 flex flex-col h-[90vh]"
          >
            {/* THEME PREVIEW OVERLAY */}
            <AnimatePresence>
              {showThemePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-6 sm:p-12 pointer-events-auto"
                >
                  <div className="absolute inset-0 z-0">
                    <AnimatedBackground theme={boardTheme} />
                  </div>
                  
                  <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-10">
                    <div className="flex flex-col items-center gap-2">
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[#1A9E5C] text-xs font-black tracking-[0.3em] uppercase"
                      >
                        Visual Experience
                      </motion.p>
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white text-4xl font-black italic uppercase tracking-tighter"
                      >
                        {THEMES[boardTheme].name}
                      </motion.h2>
                    </div>

                    <motion.div 
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full aspect-square bg-[#1E293B] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border-8 border-[#1E293B] overflow-hidden"
                    >
                      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                        {Array.from({ length: 64 }).map((_, i) => {
                          const x = i % 8;
                          const y = Math.floor(i / 8);
                          const isDark = (x + y) % 2 === 1;
                          const themeColors = THEMES[boardTheme];
                          
                          let piece = 0;
                          if (y === 0) piece = [10, 8, 9, 12, 11, 9, 8, 10][x];
                          if (y === 1) piece = 7;
                          if (y === 6) piece = 1;
                          if (y === 7) piece = [4, 2, 3, 6, 5, 3, 2, 4][x];

                          return (
                            <div
                              key={i}
                              className="flex items-center justify-center relative"
                              style={{ 
                                backgroundColor: isDark ? themeColors.dark : themeColors.light,
                                backgroundImage: isDark ? themeColors.pattern : 'none',
                                backgroundSize: '15px 15px',
                                backgroundBlendMode: 'overlay'
                              }}
                            >
                              <div className="scale-90 opacity-90 transition-transform duration-500 hover:scale-110">
                                <PieceIcon piece={piece} style={pieceStyle} theme={boardTheme} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowThemePreview(false); }}
                      className="px-10 py-4 bg-white text-black text-sm font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-[#1A9E5C] hover:text-white transition-all active:scale-95"
                    >
                      KEMBALI KE PENGATURAN
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 mb-6 flex-shrink-0">
              <button onClick={() => setScreen('menu')} className="p-2 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-xl text-white">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8 no-scrollbar pb-10">
              {/* THEME PREVIEW BUTTON */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview Visual Full</label>
                <button 
                  onClick={() => setShowThemePreview(true)}
                  className="w-full group relative h-28 rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl transition-all hover:border-[#1A9E5C] active:scale-95"
                >
                  <div className="absolute inset-0 z-0">
                    <AnimatedBackground theme={boardTheme} />
                  </div>
                  <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[1px] transition-all group-hover:bg-black/30 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                      <Play size={24} className="fill-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Lihat Preview Fullscreen</span>
                  </div>
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Per Pemain</label>
                <div className="grid grid-cols-2 gap-2">
                  {[null, 1, 3, 5, 10].map(t => (
                    <button
                      key={t === null ? 'none' : t}
                      onClick={() => setTimeLimit(t)}
                      className={`py-3 rounded-xl text-[10px] font-bold transition-all ${timeLimit === t ? 'bg-[#1A9E5C] text-white shadow-lg shadow-[#1A9E5C]/20' : 'bg-white/[0.03] backdrop-blur-md text-gray-400 border border-white/10'}`}
                    >
                      {t === null ? 'Tanpa Waktu' : `${t} Menit`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Level AI</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['easy', 'medium', 'hard', 'very-hard'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setDifficulty(l)}
                      className={`group relative overflow-hidden py-4 rounded-xl text-xs font-bold capitalize transition-all ${difficulty === l ? 'bg-[#1A9E5C] text-white shadow-lg shadow-[#1A9E5C]/20' : 'bg-white/[0.03] backdrop-blur-md text-gray-400 border border-white/10'}`}
                    >
                      {l === 'very-hard' && <Sparkles size={12} className="absolute top-1 right-1 text-yellow-400 animate-pulse" />}
                      <span className="relative z-10">
                        {l === 'easy' ? 'Easy (Pemula)' : l === 'medium' ? 'Standard (Lumayan)' : l === 'hard' ? 'Hard (Master)' : 'Very Hard (Dewa)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tema Papan</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {(Object.keys(THEMES) as BoardTheme[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setBoardTheme(t)}
                      className={`flex-shrink-0 p-1.5 rounded-2xl border-4 transition-all ${boardTheme === t ? 'border-[#1A9E5C]' : 'border-transparent'}`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden grid grid-cols-2 grid-rows-2">
                        <div style={{ backgroundColor: THEMES[t].light }} className="w-full h-full" />
                        <div style={{ backgroundColor: THEMES[t].dark }} className="w-full h-full" />
                        <div style={{ backgroundColor: THEMES[t].dark }} className="w-full h-full" />
                        <div style={{ backgroundColor: THEMES[t].light }} className="w-full h-full" />
                      </div>
                      <p className={`text-[9px] font-bold mt-1 ${boardTheme === t ? 'text-[#1A9E5C]' : 'text-gray-500'}`}>{THEMES[t].name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gaya Bidak</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['standard', 'classic', 'modern', 'kingdom', 'neo'] as PieceStyle[]).map(s => (
                    <PieceStyleButton key={s} s={s} pieceStyle={pieceStyle} setPieceStyle={setPieceStyle} boardTheme={boardTheme} />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Warna Bidak Anda</label>
                <div className="grid grid-cols-3 gap-2">
                  {['white', 'black', 'random'].map(c => (
                    <button
                      key={c}
                      onClick={() => setPlayerColor(c as any)}
                      className={`py-3 rounded-xl text-xs font-bold capitalize transition-all ${playerColor === c ? 'bg-[#1A9E5C] text-white' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                    >
                      {c === 'white' ? 'Putih' : c === 'black' ? 'Hitam' : 'Acak'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex-shrink-0">
              <button
                onClick={() => setScreen('menu')}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold shadow-xl shadow-white/5 active:scale-95 transition-all"
              >
                SIMPAN & KEMBALI
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'game' && gameState && (() => {
          const isFlipped = (mode === 'pvp' && gameState.turn === 'black') || (mode === 'ai' && actualPlayerColor === 'black');
          return (
            <motion.div
              key="game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-between p-6"
          >
            {/* Top Info */}
            <div className="w-full flex items-center justify-between">
              {(() => {
                const showBlack = !isFlipped;
                const turnColor = showBlack ? 'black' : 'white';
                const isActive = gameState.turn === turnColor;
                return (
                  <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive ? 'bg-white/[0.08] backdrop-blur-xl ring-2 ring-[#1A9E5C]' : 'opacity-50'}`}>
                    <div className={`w-10 h-10 ${showBlack ? 'bg-black' : 'bg-white'} rounded-xl border border-white/10 flex items-center justify-center ${showBlack ? 'text-white' : 'text-black'} text-xl`}>
                      {showBlack ? (mode === 'ai' && actualPlayerColor === 'white' ? <Bot size={20} /> : <User size={20} />) : (mode === 'ai' && actualPlayerColor === 'black' ? <Bot size={20} /> : <User size={20} />)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">{showBlack ? 'HITAM' : 'PUTIH'}</p>
                      <p className="text-sm font-bold text-white">{timeLimit ? formatTime(timers[turnColor]) : '∞'}</p>
                    </div>
                  </div>
                );
              })()}
              
              <button onClick={() => setScreen('menu')} className="p-3 bg-white/5 text-gray-400 rounded-2xl">
                <X size={24} />
              </button>
            </div>

            {/* Board */}
            <div 
              className="relative aspect-square w-full max-w-[400px] bg-[#1E293B] rounded-xl overflow-hidden shadow-2xl border-8 border-[#1E293B] transition-transform duration-700"
              style={{ transform: (mode === 'pvp' && gameState.turn === 'black') || (mode === 'ai' && actualPlayerColor === 'black') ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {gameState.board.map((piece, i) => {
                  const { x, y } = getXY(i);
                  const isDark = (x + y) % 2 === 1;
                  const isSelected = selectedSquare === i;
                  const isValidMove = validMoves.some(m => m.to === i);
                  const themeColors = THEMES[boardTheme];
                  const isCheck = piece === (gameState.turn === 'white' ? PIECES.W_KING : PIECES.B_KING) && gameState.check;
                  const isWinnerKing = gameState.status === 'checkmate' && piece === (gameState.winner === 'white' ? PIECES.W_KING : PIECES.B_KING);
                  const isLoserKing = gameState.status === 'checkmate' && piece === (gameState.winner === 'white' ? PIECES.B_KING : PIECES.W_KING);

                  return (
                    <div
                      key={i}
                      onClick={() => handleSquareClick(i)}
                      className={`relative flex items-center justify-center cursor-pointer transition-colors`}
                      style={{ 
                        backgroundColor: isSelected 
                          ? 'rgba(250, 204, 21, 0.5)' 
                          : isCheck ? 'rgba(239, 68, 68, 0.5)'
                          : isLoserKing ? 'rgba(185, 28, 28, 0.8)'
                          : isDark ? themeColors.dark : themeColors.light,
                        backgroundImage: isDark ? themeColors.pattern : 'none',
                        backgroundSize: '20px 20px',
                        backgroundBlendMode: 'overlay'
                      }}
                    >
                      {isValidMove && (
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: piece === PIECES.EMPTY ? 'rgba(0,0,0,0.2)' : 'rgba(239, 68, 68, 0.4)' }} />
                      )}
                      <span 
                        className="select-none transition-transform"
                        style={{ transform: (mode === 'pvp' && gameState.turn === 'black') || (mode === 'ai' && actualPlayerColor === 'black') ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <PieceIcon piece={piece} style={pieceStyle} theme={boardTheme} />
                      </span>
                      
                      {/* Win/Loss Indicators */}
                      {isWinnerKing && (
                        <div className="absolute top-0 right-0 p-0.5">
                          <Crown size={14} className="text-green-400 fill-green-400 drop-shadow-sm" />
                        </div>
                      )}
                      {isLoserKing && (
                        <div className="absolute top-0 right-0 p-0.5">
                          <Crown size={14} className="text-red-500 fill-red-500 drop-shadow-sm rotate-[-110deg] translate-y-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Overlay */}
              <AnimatePresence>
                {gameState.status !== 'playing' && !dismissedStatus && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
                  >
                    <div className={`bg-black border border-white/10 w-full max-w-xs rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-[#1A9E5C]"></div>
                      
                      <div className="space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 12 }}
                        >
                          <Trophy size={48} className="text-yellow-400 mx-auto drop-shadow-lg" />
                        </motion.div>
                        <div className="space-y-1">
                          <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#1A1A2E]'} uppercase tracking-tight`}>
                            {gameState.status === 'checkmate' ? 'CHECKMATE!' : 'DRAW!'}
                          </h2>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            {gameState.winner ? `PEMAIN ${gameState.winner === 'white' ? 'PUTIH' : 'HITAM'} MENANG!` : 'PERMAINAN BERAKHIR SERI'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 w-full">
                        <button
                          onClick={startGame}
                          className="w-full py-4 bg-[#1A9E5C] text-white rounded-2xl font-black text-sm shadow-lg shadow-[#1A9E5C]/20 active:scale-95 transition-all"
                        >
                          MAIN LAGI
                        </button>
                        <button
                          onClick={() => setDismissedStatus(true)}
                          className={`w-full py-3 rounded-2xl font-bold text-xs transition-colors ${
                            darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          LIHAT PAPAN (REVIEW)
                        </button>
                        <button
                          onClick={() => setScreen('menu')}
                          className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2"
                        >
                          KE MENU UTAMA
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Info */}
            <div className="w-full flex items-center justify-between">
              {(() => {
                const showWhite = !isFlipped;
                const turnColor = showWhite ? 'white' : 'black';
                const isActive = gameState.turn === turnColor;
                return (
                  <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive ? 'bg-white/10 ring-2 ring-[#1A9E5C]' : 'opacity-50'}`}>
                    <div className={`w-10 h-10 ${showWhite ? 'bg-white' : 'bg-black'} rounded-xl border border-white/10 flex items-center justify-center ${showWhite ? (darkMode ? 'text-[#0F172A]' : 'text-[#0F172A]') : 'text-white'} text-xl relative`}>
                      {showWhite ? (mode === 'ai' && actualPlayerColor === 'black' ? <Bot size={20} /> : <User size={20} />) : (mode === 'ai' && actualPlayerColor === 'white' ? <Bot size={20} /> : <User size={20} />)}
                      {isAiThinking && isActive && (
                        <div className="absolute -top-1 -right-1 flex gap-0.5">
                          <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                          <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">{showWhite ? 'PUTIH' : 'HITAM'}</p>
                      <p className="text-sm font-bold text-white">{timeLimit ? formatTime(timers[turnColor]) : '∞'}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2">
                <button 
                  onClick={undoMove}
                  disabled={historyStates.length === 0 || (gameState.status === 'playing' && isAiThinking)}
                  className={`p-3 rounded-2xl border transition-all ${
                    historyStates.length === 0 || (gameState.status === 'playing' && isAiThinking)
                      ? 'bg-white/5 text-gray-600 border-white/5'
                      : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                  }`}
                >
                  <Undo2 size={24} />
                </button>
                <button 
                  onClick={redoMove}
                  disabled={redoStates.length === 0 || (gameState.status === 'playing' && isAiThinking)}
                  className={`p-3 rounded-2xl border transition-all ${
                    redoStates.length === 0 || (gameState.status === 'playing' && isAiThinking)
                      ? 'bg-white/5 text-gray-600 border-white/5'
                      : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                  }`}
                >
                  <Redo2 size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        ); })()}
      </AnimatePresence>
    </div>
  );
}
