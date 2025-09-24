import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TypingEffect() {
  const codeLines = [
    "public class HelloCoder {",
    "  public static void main(String[] args) {",
    '    System.out.println("Hello Coders!");',
    "  }",
    "}"
  ];
  
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [displayLines, setDisplayLines] = useState<string[]>([]);

  useEffect(() => {
    if (currentLine < codeLines.length) {
      if (currentChar < codeLines[currentLine].length) {
        const timeout = setTimeout(() => {
          setDisplayLines(prev => {
            const newLines = [...prev];
            if (!newLines[currentLine]) newLines[currentLine] = "";
            newLines[currentLine] += codeLines[currentLine][currentChar];
            return newLines;
          });
          setCurrentChar(prev => prev + 1);
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentLine(prev => prev + 1);
          setCurrentChar(0);
        }, 300);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentLine, currentChar, codeLines]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative p-6 rounded-lg border border-green-500/20 bg-background/80 backdrop-blur-sm"
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">HelloCoder.java</span>
        </div>
        <pre className="text-sm font-mono text-green-600 dark:text-green-400 leading-relaxed">
          {displayLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {line}
              {i === currentLine && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-green-600 dark:text-green-400"
                >
                  |
                </motion.span>
              )}
            </motion.div>
          ))}
        </pre>
      </div>
    </motion.div>
  );
}