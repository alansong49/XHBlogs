"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type HistoryItem = {
  equation: string;
  result: string;
  timestamp: number;
};

export default function CalculatorTool() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [memory, setMemory] = useState(0);

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }

    if (val === 'DEL') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
      return;
    }

    if (val === '📜') {
      setShowHistory(!showHistory);
      return;
    }

    if (val === 'M+') {
      setMemory(memory + parseFloat(display));
      return;
    }
    if (val === 'M-') {
      setMemory(memory - parseFloat(display));
      return;
    }
    if (val === 'MR') {
      setDisplay(String(memory));
      return;
    }
    if (val === 'MC') {
      setMemory(0);
      return;
    }

    if (val === '√') {
      const num = parseFloat(display);
      if (num >= 0) {
        const result = Math.sqrt(num);
        setHistory([...history, { equation: `√${num}`, result: String(result), timestamp: Date.now() }]);
        setDisplay(String(parseFloat(Number(result).toFixed(6))));
      } else {
        setDisplay('Error');
      }
      return;
    }

    if (val === 'x²') {
      const num = parseFloat(display);
      const result = num * num;
      setHistory([...history, { equation: `${num}²`, result: String(result), timestamp: Date.now() }]);
      setDisplay(String(parseFloat(Number(result).toFixed(6))));
      return;
    }

    if (val === '%') {
      const num = parseFloat(display);
      const result = num / 100;
      setHistory([...history, { equation: `${num}%`, result: String(result), timestamp: Date.now() }]);
      setDisplay(String(result));
      return;
    }

    if (val === '1/x') {
      const num = parseFloat(display);
      if (num !== 0) {
        const result = 1 / num;
        setHistory([...history, { equation: `1/${num}`, result: String(result), timestamp: Date.now() }]);
        setDisplay(String(parseFloat(Number(result).toFixed(6))));
      } else {
        setDisplay('Error');
      }
      return;
    }

    if (display === 'Error') {
      if (['+', '-', '*', '/'].includes(val) || val === '=') {
        setDisplay('0');
        setEquation('');
        return;
      } else {
        setDisplay(val === '.' ? '0.' : val);
        setEquation('');
        return;
      }
    }

    if (val === '=') {
      try {
        const fullEq = equation + display;
        const safeEq = fullEq.replace(/[^-()\d/*+.]/g, '');
        const result = new Function('return ' + safeEq)();
        const resultStr = String(parseFloat(Number(result).toFixed(6)));
        setHistory([...history, { equation: fullEq, result: resultStr, timestamp: Date.now() }]);
        setDisplay(resultStr);
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
    }
    else if (['+', '-', '*', '/'].includes(val)) {
      if (display === '0' && equation && ['+', '-', '*', '/'].includes(equation.slice(-1))) {
        setEquation(equation.slice(0, -1) + val);
      } else {
        setEquation(equation + display + val);
        setDisplay('0');
      }
    }
    else {
      if (val === '.' && display.includes('.')) return;
      setDisplay(display === '0' && val !== '.' ? val : display + val);
    }
  };

  const calcButtons = [
    'M+', 'M-', 'MR', 'MC',
    '📜', '√', 'x²', '%',
    'C', '(', ')', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    'DEL', '0', '.', '=',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-3"
    >
      {/* 内存显示 */}
      {memory !== 0 && (
        <div className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full text-center">
          M: {memory}
        </div>
      )}

      {/* 显示屏 */}
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-end justify-center h-24 shadow-inner border border-slate-200 dark:border-slate-700">
        <span className="text-sm text-slate-400 dark:text-slate-500 tracking-wider h-5 mb-1 whitespace-nowrap overflow-hidden">{equation}</span>
        <span className="text-4xl font-black text-slate-800 dark:text-white truncate w-full text-right">{display}</span>
      </div>

      {/* 历史记录面板 */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">📜 计算历史</span>
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  清空
                </button>
              )}
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {history.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-2">暂无计算记录</div>
              ) : (
                history.slice().reverse().map((item, idx) => (
                  <motion.div
                    key={item.timestamp}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center bg-white/50 dark:bg-slate-700/30 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => {
                      setDisplay(item.result);
                    }}
                  >
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.equation}</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">= {item.result}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 键盘 */}
      <div className="grid grid-cols-4 gap-2 mt-1">
        {calcButtons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleCalcClick(btn)}
            className={`h-10 rounded-xl text-sm font-bold flex items-center justify-center shadow-sm active:scale-95 transition-all
              ${btn === '=' ? 'col-span-2 bg-indigo-500 text-white hover:bg-indigo-600' 
              : btn === '📜' ? (showHistory ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30')
              : ['C', 'DEL', '(', ')', '/', '*', '-', '+'].includes(btn) ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
              : ['√', 'x²', '%', '1/x', 'M+', 'M-', 'MR', 'MC'].includes(btn) ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
              : 'bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600'}
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
