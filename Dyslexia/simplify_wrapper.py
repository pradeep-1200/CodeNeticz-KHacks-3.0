#!/usr/bin/env python
import sys
import os
import io

# Add the Dyslexia directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Suppress all print statements from the imported module
original_stdout = sys.stdout
original_stderr = sys.stderr

if __name__ == "__main__":
    # Read from stdin
    input_text = sys.stdin.read().strip()
    
    if input_text:
        # Redirect stdout to suppress statistics
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()
        
        try:
            from text_simplification_advanced import AccurateTextSimplifier
            simplifier = AccurateTextSimplifier()
            result = simplifier.simplify(input_text)
            
            # Restore stdout and print only the result
            sys.stdout = original_stdout
            sys.stderr = original_stderr
            print(result)
        except Exception as e:
            sys.stdout = original_stdout
            sys.stderr = original_stderr
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)
    else:
        print("Error: No input text provided", file=sys.stderr)
        sys.exit(1)
