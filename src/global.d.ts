declare namespace JSX {
    interface IntrinsicElements {
      // Add definitions for HTML elements you use in JSX
      // For example:
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      // Add more elements as needed
    }
  }