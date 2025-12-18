// Markdown to HTML converter with enhanced styling
export function markdownToHtml(markdown) {
    if (!markdown) return ''

    let html = markdown

    // Code blocks (must be processed first)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
    })

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

    // Bold
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')

    // Italic
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

    // Unordered lists
    html = html.replace(/^\- (.*$)/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>')

    // Line breaks to paragraphs
    html = html.split('\n\n').map(para => {
        if (para.trim() && !para.startsWith('<')) {
            return `<p>${para.trim()}</p>`
        }
        return para
    }).join('\n')

    // Single line breaks
    html = html.replace(/\n/g, '<br>')

    return html
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
}
