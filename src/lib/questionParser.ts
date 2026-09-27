export interface ParsedOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ParsedQuestion {
  id: string;
  order: number;
  content: string;
  options: ParsedOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  points: number;
  rawText?: string;
  error?: string;
}

export interface ParseResult {
  titleCandidate?: string;
  questions: ParsedQuestion[];
  totalQuestions: number;
  validQuestions: number;
  errors: string[];
}

/**
 * Intelligent Parser for Teacher's pasted content:
 * Handles:
 * - "Câu 1:", "Bài 1:", "1.", "1/", "1)", "Câu 1."
 * - Inline options: A. ... B. ... C. ... D. ... on one line or multi lines
 * - Lowercase or uppercase keys: a. / b. / c. / d.
 * - Answers: "Đáp án: A", "ĐA: B", "Đáp án đúng: C", "Key: D", "Chọn: A", or answer key table at the bottom (1.A, 2.B, 3.C)
 * - Explanations: "Giải thích: ...", "Lời giải: ...", "Gợi ý: ...", "Hướng dẫn giải: ..."
 * - Cleans extra asterisks (*), markdown formatting, bold/italics
 */
export function parseAssignmentContent(text: string): ParseResult {
  if (!text || !text.trim()) {
    return { questions: [], totalQuestions: 0, validQuestions: 0, errors: ['Chưa có nội dung văn bản để phân tích.'] };
  }

  // Normalize line endings and characters
  let cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove common Word/Google Docs smart quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Replace tabs with spaces
    .replace(/\t/g, ' ');

  const rawLines = cleanText.split('\n');
  const lines: string[] = [];

  // Look for title candidate on very top lines if any
  let titleCandidate = '';
  for (let i = 0; i < Math.min(5, rawLines.length); i++) {
    const l = rawLines[i].trim();
    if (
      l.length > 5 &&
      (l.toUpperCase().includes('BÀI TẬP') ||
        l.toUpperCase().includes('PHIẾU') ||
        l.toUpperCase().includes('LUYỆN TẬP') ||
        l.toUpperCase().includes('TRẮC NGHIỆM') ||
        l.toUpperCase().includes('CỦNG CỐ') ||
        l.toUpperCase().includes('BÀI 1') ||
        l.toUpperCase().includes('BÀI 2') ||
        l.toUpperCase().includes('BÀI 3') ||
        l.toUpperCase().includes('BÀI 4') ||
        l.toUpperCase().includes('BÀI 5') ||
        l.toUpperCase().includes('BÀI 6') ||
        l.toUpperCase().includes('BÀI 7') ||
        l.toUpperCase().includes('BÀI 8') ||
        l.toUpperCase().includes('BÀI 9') ||
        l.toUpperCase().includes('BÀI 10'))
    ) {
      titleCandidate = l.replace(/^[*#\-\s]+|[*#\-\s]+$/g, '');
      break;
    }
  }

  // Check if there is an Answer Sheet / Key Table at the bottom (e.g., "1-A, 2-B" or "1.A 2.B" or "BẢNG ĐÁP ÁN")
  const bottomAnswers: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
  const answerTableRegex = /(?:BẢNG ĐÁP ÁN|ĐÁP ÁN|KEY)[\s\S]*$/i;
  const matchTable = cleanText.match(answerTableRegex);
  if (matchTable) {
    const tableText = matchTable[0];
    const pairRegex = /(?:câu\s*)?(\d+)[\s.:\-_]+([A-D])\b/gi;
    let pMatch;
    while ((pMatch = pairRegex.exec(tableText)) !== null) {
      const qNum = parseInt(pMatch[1], 10);
      const ans = pMatch[2].toUpperCase() as 'A' | 'B' | 'C' | 'D';
      bottomAnswers[qNum] = ans;
    }
  }

  // Pre-process: split lines that contain inline choices
  // E.g.: "A. Đạo đức    B. Kỷ luật    C. Trách nhiệm    D. Tự chủ"
  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim();
    if (!line) continue;

    // Check if line contains multiple options like "A. ... B. ... "
    // Use positive lookahead to split if inline options detected
    const inlineOptionPattern = /(?:^|\s+)([A-D])[\.:\)]\s+/g;
    const matches = [...line.matchAll(inlineOptionPattern)];
    if (matches.length >= 2) {
      // Split into multiple lines
      let lastIdx = 0;
      for (let m = 0; m < matches.length; m++) {
        const match = matches[m];
        const start = match.index!;
        if (m === 0 && start > 0) {
          const pre = line.substring(0, start).trim();
          if (pre) lines.push(pre);
        } else if (m > 0) {
          const segment = line.substring(lastIdx, start).trim();
          if (segment) lines.push(segment);
        }
        lastIdx = start;
      }
      const lastSegment = line.substring(lastIdx).trim();
      if (lastSegment) lines.push(lastSegment);
    } else {
      lines.push(line);
    }
  }

  // Group lines into Question Blocks
  interface RawBlock {
    qNumber: number;
    lines: string[];
  }

  const blocks: RawBlock[] = [];
  let currentBlock: RawBlock | null = null;
  let qCounter = 0;

  // Question header patterns:
  // "Câu 1:", "Câu 1.", "Câu 1)", "Bài 1:", "Bài 1.", "1.", "1/", "1)", "Câu 1 -"
  const qHeaderRegex = /^(?:câu|bài)?\s*(\d+)[\.:\)\-\/]\s*(.*)$/i;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // Check if line starts a new question
    const qMatch = line.match(qHeaderRegex);
    const isExplicitCau = /^(câu|bài)\s*\d+/i.test(line);
    const isNumbered = /^\d+[\.:\)\-\/]/.test(line);

    // Filter out if this is just an answer line like "1. A" or "1: A" in an answer key block
    const isAnswerKeyLine = /^\d+[\.:\)\-\/]\s*[A-D]$/i.test(line);

    if ((isExplicitCau || (isNumbered && !isAnswerKeyLine)) && !line.toLowerCase().startsWith('đáp án')) {
      qCounter++;
      const numFromText = qMatch ? parseInt(qMatch[1], 10) : qCounter;
      currentBlock = {
        qNumber: numFromText,
        lines: [line],
      };
      blocks.push(currentBlock);
    } else {
      if (currentBlock) {
        currentBlock.lines.push(line);
      }
    }
  }

  // Parse each block into a structured ParsedQuestion
  const parsedQuestions: ParsedQuestion[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    const qOrder = index + 1;
    let content = '';
    const optionsMap: Record<string, string> = {};
    let correctOption: 'A' | 'B' | 'C' | 'D' = bottomAnswers[block.qNumber] || 'A';
    let explanation = '';
    let currentKey: 'A' | 'B' | 'C' | 'D' | null = null;
    let readingExplanation = false;

    // First line has the question content
    const firstLine = block.lines[0];
    const strippedFirstLine = firstLine.replace(/^(?:câu|bài)?\s*\d+[\.:\)\-\/]\s*/i, '').trim();
    content = strippedFirstLine;

    for (let l = 1; l < block.lines.length; l++) {
      const line = block.lines[l].trim();
      if (!line) continue;

      // Check for answer line: "Đáp án: B", "ĐA: C", "Key: D", "Đáp án đúng: A", "-> B", "=> C"
      const ansMatch = line.match(/^(?:đáp án(?: đúng)?|đa|key|chọn|đ\/a|hướng dẫn chọn|đáp số)[\s.:\-_=>]+([A-D])\b/i);
      if (ansMatch) {
        correctOption = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        currentKey = null;
        readingExplanation = false;
        continue;
      }

      // Check for arrow answer e.g. "=> Đáp án B" or "-> B"
      const arrowMatch = line.match(/^[-=]>\s*(?:đáp án\s*)?([A-D])\b/i);
      if (arrowMatch) {
        correctOption = arrowMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        currentKey = null;
        readingExplanation = false;
        continue;
      }

      // Check for explanation line: "Giải thích:", "Lời giải:", "Gợi ý:", "Hướng dẫn giải:"
      const explMatch = line.match(/^(?:giải thích|lời giải|gợi ý|hướng dẫn giải|ghi chú|vì sao)[\s.:\-_]+(.*)$/i);
      if (explMatch) {
        explanation = explMatch[1].trim();
        readingExplanation = true;
        currentKey = null;
        continue;
      }

      // Check for option line: "A. ...", "B: ...", "C) ...", "D - ..."
      const optMatch = line.match(/^([A-D])[\.:\)\-]\s*(.*)$/i);
      if (optMatch) {
        const key = optMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        let optText = optMatch[2].trim();

        // Check if the option itself has an indicator for being correct, e.g.:
        // "A. Công bằng (Đúng)" or "B*. Trách nhiệm" or "*C. Chí công vô tư"
        if (line.includes('*') || /\(đúng\)/i.test(line) || /\(chính xác\)/i.test(line)) {
          correctOption = key;
          optText = optText.replace(/\*+/g, '').replace(/\((?:đúng|chính xác)\)/gi, '').trim();
        }

        optionsMap[key] = optText;
        currentKey = key;
        readingExplanation = false;
        continue;
      }

      // If we are reading explanation, append
      if (readingExplanation) {
        explanation += (explanation ? ' ' : '') + line;
        continue;
      }

      // If we have an active option, append continuation lines (e.g. multi-line option text)
      if (currentKey && optionsMap[currentKey] !== undefined) {
        optionsMap[currentKey] += ' ' + line;
        continue;
      }

      // Otherwise, it belongs to the question content
      if (Object.keys(optionsMap).length === 0) {
        content += ' ' + line;
      }
    }

    // Build standard 4 options A, B, C, D
    const options: ParsedOption[] = ['A', 'B', 'C', 'D'].map((key) => ({
      key: key as 'A' | 'B' | 'C' | 'D',
      text: optionsMap[key] || (key === 'A' ? 'Ý A' : key === 'B' ? 'Ý B' : key === 'C' ? 'Ý C' : 'Ý D'),
    }));

    // Validation
    const hasEnoughOptions = Object.keys(optionsMap).length >= 2;
    let error: string | undefined;

    if (!content.trim()) {
      error = `Câu ${qOrder}: Chưa nhận diện được nội dung câu hỏi.`;
      errors.push(error);
    } else if (!hasEnoughOptions) {
      error = `Câu ${qOrder}: Chỉ nhận diện được ${Object.keys(optionsMap).length} lựa chọn (cần ít nhất 2 đáp án A, B).`;
      errors.push(error);
    }

    parsedQuestions.push({
      id: `temp-q-${qOrder}-${Date.now()}`,
      order: qOrder,
      content: content.trim(),
      options,
      correctOption,
      explanation: explanation.trim(),
      points: 1, // Default 1 point per question, recalculates dynamically based on total
      error,
    });
  });

  // Calculate points dynamically so total = 10.0 points
  if (parsedQuestions.length > 0) {
    const rawPoint = 10 / parsedQuestions.length;
    const roundedPoint = Math.round(rawPoint * 100) / 100;
    parsedQuestions.forEach((q) => {
      q.points = roundedPoint;
    });
  }

  return {
    titleCandidate: titleCandidate || undefined,
    questions: parsedQuestions,
    totalQuestions: parsedQuestions.length,
    validQuestions: parsedQuestions.filter((q) => !q.error).length,
    errors,
  };
}
