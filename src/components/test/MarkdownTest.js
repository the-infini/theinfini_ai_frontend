import React from 'react';
import MarkdownRenderer from '../common/MarkdownRenderer';

const MarkdownTest = () => {
  const testContent = `# Markdown and LaTeX Test

## Text Formatting
This is **bold text** and this is *italic text*.

Here's some \`inline code\` and a [link](https://example.com).

## Code Block
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

## Math Expressions

### Inline Math
The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

### Block Math
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
E = mc^2
$$

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Blockquote
> This is a blockquote with some important information.
> It can span multiple lines.

## Table
| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |
| Bob  | 35  | Chicago |

## More Complex Math
The Schrödinger equation:
$$
i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)
$$

Matrix representation:
$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$
`;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Markdown Renderer Test</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <MarkdownRenderer content={testContent} />
      </div>
    </div>
  );
};

export default MarkdownTest;
