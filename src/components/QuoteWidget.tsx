import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Lightbulb, X } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

const quotes = [
  { text: "Science is magic that works.", author: "Kurt Vonnegut" },
  { text: "The important thing is to never stop questioning.", author: "Albert Einstein" },
  { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  { text: "Research is what I'm doing when I don't know what I'm doing.", author: "Wernher von Braun" },
  { text: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan" },
  { text: "The good thing about science is that it's true whether or not you believe in it.", author: "Neil deGrasse Tyson" },
  { text: "Equipped with his five senses, man explores the universe around him and calls the adventure Science.", author: "Edwin Powell Hubble" },
  { text: "Science knows no country, because knowledge belongs to humanity.", author: "Louis Pasteur" },
  { text: "What you learn from a life in science is the vastness of our ignorance.", author: "David Eagleman" },
  { text: "The art and science of asking questions is the source of all knowledge.", author: "Thomas Berger" },
  { text: "If we knew what it was we were doing, it would not be called research, would it?", author: "Albert Einstein" },
  { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan" },
  { text: "We are just an advanced breed of monkeys on a minor planet of a very average star. But we can understand the Universe. That makes us something very special.", author: "Stephen Hawking" },
  { text: "The saddest aspect of life right now is that science gathers knowledge faster than society gathers wisdom.", author: "Isaac Asimov" },
  { text: "In science the credit goes to the man who convinces the world, not to the man to whom the idea first occurs.", author: "Francis Darwin" }
];

export function QuoteWidget() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set initial random quote
    setQuoteIndex(Math.floor(Math.random() * quotes.length));

    // Change quote every 60 minutes (60 * 60 * 1000 ms)
    const interval = setInterval(() => {
      setQuoteIndex(Math.floor(Math.random() * quotes.length));
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const quote = quotes[quoteIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-sm border-primary/10 bg-muted/30">
          <CardContent className="p-4 relative">
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-3 h-3" />
            </Button>
            <div className="flex gap-3">
              <div className="mt-1 shrink-0">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="space-y-1.5 pr-4">
                <p className="text-sm italic text-foreground/90 leading-relaxed">
                  "{quote.text}"
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  — {quote.author}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
