import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Generate Markdown documentation
 */
export const generateMarkdown = (title, items, depth = 1) => {
  let md = '';
  const hashes = '#'.repeat(depth);
  const subHashes = '#'.repeat(depth + 1);
  const apiHashes = '#'.repeat(depth); // API names use the same level as folder title or H1

  if (depth === 1) {
    md += `${hashes} TÀI LIỆU API: ${title.toUpperCase()}\n`;
    md += `*Hệ thống: OmniTest Pro - Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}*\n\n---\n\n`;
  } else {
    md += `${hashes} THƯ MỤC: ${title}\n\n`;
  }

  items.forEach((item, index) => {
    if (item.type === 'folder') {
      md += generateMarkdown(item.name, item.children, depth + 1);
    } else {
      const req = item;
      md += `${apiHashes} ${index + 1}. ${req.name}${req.description ? `: ${req.description}` : ''}\n\n`;
      
      md += `## 📝 Thông tin chung\n`;
      md += `- **Endpoint**: \`${req.url || '/'}\`\n`;
      md += `- **Phương thức**: \`${req.method}\`\n`;
      const authEnabled = req.authConfig?.enabled;
      md += `- **Xác thực**: \`${authEnabled ? 'Bearer Token (Yêu cầu)' : 'Không'}\`\n\n`;

      // Params
      if (req.params && req.params.length > 0) {
        md += `## 📥 Tham số Request (Query Parameters)\n`;
        md += `| Tham số | Kiểu | Bắt buộc | Mô tả |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        req.params.forEach(p => {
          md += `| \`${p.key}\` | \`string\` | ${p.enabled ? 'Có' : 'Không'} | ${p.description || '-'} |\n`;
        });
        md += `\n`;
      }

      // Headers
      if (req.headers && req.headers.length > 0) {
        md += `## 📑 Headers\n`;
        md += `| Key | Value | Mô tả |\n`;
        md += `| :--- | :--- | :--- |\n`;
        req.headers.forEach(h => {
          md += `| \`${h.key}\` | \`${h.value}\` | ${h.description || '-'} |\n`;
        });
        md += `\n`;
      }

      // Body
      if (req.body && req.method !== 'GET') {
        md += `## 📦 Request Body (JSON)\n`;
        md += `\`\`\`json\n${req.body}\n\`\`\`\n\n`;
      }

      // Responses (Examples/Snapshots)
      if (req.examples && req.examples.length > 0) {
        md += `## 📤 Phản hồi (Response - chuẩn JSend)\n\n`;
        
        const success = req.examples.filter(ex => ex.response_status >= 200 && ex.response_status < 300);
        const fail = req.examples.filter(ex => ex.response_status >= 400 && ex.response_status < 500);
        const error = req.examples.filter(ex => ex.response_status >= 500);

        if (success.length > 0) {
          md += `### ✅ Thành công (2xx OK)\n`;
          success.forEach(ex => {
            const bodyStr = typeof ex.response_body === 'string' ? ex.response_body : JSON.stringify(ex.response_body, null, 2);
            md += `#### ${ex.name} (${ex.response_status})\n`;
            md += `\`\`\`json\n${bodyStr || '{}'}\n\`\`\`\n\n`;
          });
        }

        if (fail.length > 0) {
          md += `### ❌ Thất bại (4xx Client Error)\n`;
          fail.forEach(ex => {
            const bodyStr = typeof ex.response_body === 'string' ? ex.response_body : JSON.stringify(ex.response_body, null, 2);
            md += `#### ${ex.name} (${ex.response_status})\n`;
            md += `\`\`\`json\n${bodyStr || '{}'}\n\`\`\`\n\n`;
          });
        }

        if (error.length > 0) {
          md += `### ⚠️ Lỗi hệ thống (5xx Server Error)\n`;
          error.forEach(ex => {
            const bodyStr = typeof ex.response_body === 'string' ? ex.response_body : JSON.stringify(ex.response_body, null, 2);
            md += `#### ${ex.name} (${ex.response_status})\n`;
            md += `\`\`\`json\n${bodyStr || '{}'}\n\`\`\`\n\n`;
          });
        }
      }
      md += `\n---\n\n`;
    }
  });

  return md;
};

/**
 * Generate Word documentation (Basic implementation)
 * In a real-world scenario, this would use docx more extensively for styling
 */
export const exportToWord = async (title, markdown) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: `TÀI LIỆU API: ${title.toUpperCase()}`,
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`,
              italics: true,
            }),
          ],
        }),
        ...markdown.split('\n').map(line => {
          if (line.startsWith('# ')) return new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1, spacing: { before: 400 } });
          if (line.startsWith('## ')) return new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2, spacing: { before: 300 } });
          if (line.startsWith('### ')) return new Paragraph({ text: line.replace('### ', ''), heading: HeadingLevel.HEADING_3, spacing: { before: 200 } });
          
          if (line.startsWith('|')) return null; // Table handling is complex, skipping for basic version
          if (line.startsWith('```')) return null; // Code block handling is complex
          
          return new Paragraph({
            children: [new TextRun(line)],
            spacing: { before: 100 }
          });
        }).filter(p => p !== null)
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, '_')}_Docs.docx`);
};

export const downloadMarkdown = (title, content) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${title.replace(/\s+/g, '_')}_Docs.md`);
};
