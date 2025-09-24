import { Button } from "@/components/ui/button";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
}

export default function VirtualKeyboard({ onKeyPress }: VirtualKeyboardProps) {
  const qwertyRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <div className="space-y-3" data-testid="virtual-keyboard">
      {qwertyRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {row.map((key) => (
            <Button
              key={key}
              onClick={() => onKeyPress(key)}
              className="w-10 h-10 p-0 bg-muted text-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-bold"
              data-testid={`key-${key.toLowerCase()}`}
            >
              {key}
            </Button>
          ))}
        </div>
      ))}
      
      {/* Action Row */}
      <div className="flex justify-center gap-3 mt-6">
        <Button 
          onClick={() => onKeyPress('BACKSPACE')}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4"
          data-testid="key-backspace"
        >
          <i className="fas fa-backspace"></i>
        </Button>
        
        <Button 
          onClick={() => onKeyPress('SUBMIT')}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 font-bold"
          data-testid="key-submit"
        >
          <i className="fas fa-check mr-2"></i>Submit
        </Button>
        
        <Button 
          onClick={() => onKeyPress('HINT')}
          className="bg-accent text-accent-foreground hover:bg-accent/90 px-4"
          data-testid="key-hint"
        >
          <i className="fas fa-lightbulb"></i>
        </Button>
      </div>
    </div>
  );
}
