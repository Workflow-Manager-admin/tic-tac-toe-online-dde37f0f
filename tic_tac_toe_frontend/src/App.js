import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color palette & config
 */
const COLOR_PRIMARY = "#1976d2";   // blue
const COLOR_SECONDARY = "#424242"; // gray
const COLOR_ACCENT = "#ff9800";    // orange

const PLAYER_X = "X";
const PLAYER_O = "O";
const GAME_MODES = {
  PVP: "Player vs Player",
  PVC: "Player vs Computer",
};

/**
 * Utility to calculate the winner of a 3x3 board
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diags
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

function isBoardFull(squares) {
  return squares.every((x) => x);
}

/**
 * Simple AI move (easy - picks first available)
 */
function getAIMove(squares) {
  // Find the first empty spot (could be improved for higher difficulty)
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) return i;
  }
  return null;
}

// PUBLIC_INTERFACE
function App() {
  // Theme
  const [theme] = useState("light"); // Stick to light as specified

  // Game state
  const [mode, setMode] = useState(GAME_MODES.PVP);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [current, setCurrent] = useState(PLAYER_X);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [history, setHistory] = useState([]); // [{mode, result: 'X'|'O'|'Draw'}]
  const [score, setScore] = useState({ X: 0, O: 0, Draw: 0 });

  // When user changes mode, start new game
  useEffect(() => {
    handleNewGame();
    // eslint-disable-next-line
  }, [mode]);

  // Watch board for win/draw state, and update score/history
  useEffect(() => {
    const win = calculateWinner(board);
    if (win) {
      setWinner(win);
      setScore((sc) => ({ ...sc, [win]: sc[win] + 1 }));
      setHistory((h) => [
        { mode, result: win, timestamp: Date.now() },
        ...h,
      ]);
    } else if (isBoardFull(board)) {
      setIsDraw(true);
      setScore((sc) => ({ ...sc, Draw: sc.Draw + 1 }));
      setHistory((h) => [
        { mode, result: "Draw", timestamp: Date.now() },
        ...h,
      ]);
    }
    // eslint-disable-next-line
  }, [board]);

  // AI move if needed
  useEffect(() => {
    if (
      mode === GAME_MODES.PVC &&
      !winner &&
      !isDraw &&
      current === PLAYER_O
    ) {
      const timeout = setTimeout(() => {
        const aiIdx = getAIMove(board);
        if (aiIdx !== null) {
          handleSquareClick(aiIdx);
        }
      }, 400); // Small delay for realism
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [board, current, winner, isDraw, mode]);

  // PUBLIC_INTERFACE
  const handleSquareClick = (idx) => {
    if (board[idx] || winner || isDraw) return;
    setBoard((prev) => {
      const next = prev.slice();
      next[idx] = current;
      return next;
    });
    setCurrent((cur) => (cur === PLAYER_X ? PLAYER_O : PLAYER_X));
  };

  // PUBLIC_INTERFACE
  function handleNewGame() {
    setBoard(Array(9).fill(null));
    setCurrent(PLAYER_X);
    setWinner(null);
    setIsDraw(false);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    setMode(e.target.value);
  }

  // PUBLIC_INTERFACE
  function boardStatusText() {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw!";
    return (mode === GAME_MODES.PVC && current === PLAYER_O ? "Computer's" : `${current}'s`) + " turn";
  }

  // PUBLIC_INTERFACE
  function renderSquare(idx) {
    return (
      <button
        className="ttt-square"
        style={{
          color:
            board[idx] === PLAYER_X
              ? COLOR_PRIMARY
              : board[idx] === PLAYER_O
              ? COLOR_ACCENT
              : COLOR_SECONDARY,
        }}
        onClick={() => {
          if (mode === GAME_MODES.PVC && current === PLAYER_O) return;
          handleSquareClick(idx);
        }}
        disabled={!!board[idx] || !!winner || isDraw}
        aria-label={`Cell ${idx % 3 + 1},${Math.floor(idx / 3) + 1}`}
      >
        {board[idx] ?? ""}
      </button>
    );
  }

  // PUBLIC_INTERFACE
  function renderScoreSidebar() {
    return (
      <aside className="ttt-sidebar">
        <h3>Score</h3>
        <div className="ttt-scores">
          <span>
            <b>X</b>: {score.X}
          </span>
          <span>
            <b>O</b>: {score.O}
          </span>
          <span>
            <b>Draw</b>: {score.Draw}
          </span>
        </div>
        <h4>History</h4>
        <ul className="ttt-history">
          {history.length === 0 && (
            <li className="ttt-history-empty">No games played yet.</li>
          )}
          {history.slice(0, 10).map((item, i) => (
            <li key={item.timestamp + i}>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              —{" "}
              {item.result === "Draw"
                ? "Draw"
                : `Winner: ${item.result}`}{" "}
              <span className="ttt-history-mode">
                ({item.mode === GAME_MODES.PVC ? "vs Computer" : "2P"})
              </span>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  // PUBLIC_INTERFACE
  function renderControls() {
    return (
      <div className="ttt-controls">
        <button
          className="ttt-btn ttt-btn-accent"
          onClick={handleNewGame}
          disabled={board.every((x) => !x)}
        >
          New Game
        </button>
        <select value={mode} onChange={handleModeChange} className="ttt-select">
          <option value={GAME_MODES.PVP}>Player vs Player</option>
          <option value={GAME_MODES.PVC}>Player vs Computer</option>
        </select>
      </div>
    );
  }

  // Theme colors (force light)
  useEffect(() => {
    document.body.style.background = "#f6f8fc";
  }, []);

  return (
    <div className="ttt-app-container" data-theme={theme}>
      <h1 className="ttt-title">Tic Tac Toe</h1>
      {renderControls()}
      <div className="ttt-main">
        <div className="ttt-board-container">
          <div className="ttt-status">{boardStatusText()}</div>
          <div className="ttt-board-grid">
            {[0, 1, 2].map((row) => (
              <div className="ttt-board-row" key={row}>
                {[0, 1, 2].map((col) => renderSquare(row * 3 + col))}
              </div>
            ))}
          </div>
        </div>
        {renderScoreSidebar()}
      </div>
      <footer className="ttt-footer">
        <span>
          &copy; {new Date().getFullYear()} Tic Tac Toe. UI by Kavia Codegen.
        </span>
      </footer>
    </div>
  );
}

export default App;
