/*
 * letters.js — client-side letter template engine for the Data Rights Request Generator.
 *
 * Pure functions only. No network, no backend. Given a jurisdiction, a right, a
 * company, and the person's merge fields, this returns a plain-English,
 * statute-cited request letter that the person can copy or mail themselves (GR-01).
 *
 * Statute citations are the load-bearing part. They were cross-checked at build
 * time against the CCPA/CPRA (California Civil Code) and the GDPR. This is a
 * template, not legal advice — the page says so once, quietly.
 *
 * Reconcile note: citations here are kept in one place (CITATIONS) so a single
 * verified fact-pass updates every letter.
 */

export const RIGHTS = {
  access: {
    id: 'access',
    label: 'Request my data',
    short: 'Access',
    blurb: 'Get a copy of the personal information a company holds about you (a DSAR).',
  },
  delete: {
    id: 'delete',
    label: 'Delete my data',
    short: 'Deletion',
    blurb: 'Ask a company to erase the personal information it holds about you.',
  },
  port: {
    id: 'port',
    label: 'Port my data',
    short: 'Portability',
    blurb: 'Get your data in a portable, machine-readable format you can take elsewhere.',
  },
  correct: {
    id: 'correct',
    label: 'Correct my data',
    short: 'Correction',
    blurb: 'Fix inaccurate personal information. (Coming in a later release.)',
    stub: true,
  },
};

export const JURISDICTIONS = {
  ca: {
    id: 'ca',
    label: 'California (CCPA / CPRA)',
    short: 'California',
    law: 'the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA)',
    deadline: '45 calendar days (extendable once by a further 45 days with written notice), per California Civil Code § 1798.130(a)(2)',
  },
  eu: {
    id: 'eu',
    label: 'EU / UK (GDPR)',
    short: 'EU / UK',
    law: 'the EU General Data Protection Regulation (GDPR) (and, for UK controllers, the UK GDPR and Data Protection Act 2018)',
    deadline: 'one month of receipt, per Article 12(3) GDPR (extendable by two further months where the request is complex, with notice)',
  },
  other: {
    id: 'other',
    label: 'Other US state',
    short: 'Other US state',
    law: "your state's comprehensive consumer privacy law (where one applies), and otherwise the commitments in the company's own published privacy policy",
    deadline: 'the timeframe required by the applicable state privacy law (commonly within 45 days)',
  },
};

// Load-bearing citations. Keyed [jurisdiction][right] -> the statutory hook string.
const CITATIONS = {
  ca: {
    access:
      'my right to know and to access the personal information you have collected about me under California Civil Code §§ 1798.100, 1798.110 and 1798.115 (CCPA, as amended by the CPRA)',
    delete:
      'my right to deletion of my personal information under California Civil Code § 1798.105 (CCPA, as amended by the CPRA)',
    port:
      'my right to data portability — to receive the personal information you hold about me in a portable and, to the extent technically feasible, readily usable format that allows me to transmit it to another entity without hindrance — under California Civil Code § 1798.130(a)(2) and (a)(3)(B) (CCPA, as amended by the CPRA)',
  },
  eu: {
    access: 'my right of access under Article 15 of the GDPR',
    delete:
      "my right to erasure (the 'right to be forgotten') under Article 17 of the GDPR",
    port: 'my right to data portability under Article 20 of the GDPR',
  },
  other: {
    access:
      "my right to know and access the personal information you hold about me under my state's applicable consumer privacy law and your published privacy policy",
    delete:
      "my right to request deletion of the personal information you hold about me under my state's applicable consumer privacy law and your published privacy policy",
    port:
      "my right to receive a portable copy of the personal information you hold about me under my state's applicable consumer privacy law and your published privacy policy",
  },
};

// Right-specific "what I'm asking for" clauses.
const ASK = {
  access: (j) =>
    `Please provide me with:\n  1. The specific pieces of personal information you have collected about me;\n  2. The categories of personal information collected, and the categories of sources;\n  3. The business or commercial purpose for collecting${j === 'ca' ? ', selling, or sharing' : ' or processing'} it;\n  4. The categories of third parties to whom it was disclosed${j === 'ca' ? ', sold, or shared' : ' or transferred'}.`,
  delete: () =>
    `Please delete all personal information you have collected from or about me, and direct any service providers, contractors, or third parties with whom you have shared it to do the same. Please confirm in writing once the deletion is complete and describe the categories of information deleted.`,
  port: (j) =>
    `Please provide the personal information you hold about me in a structured, commonly used, machine-readable format (for example CSV or JSON)${j === 'eu' ? ', so that I may transmit it to another controller' : ', so that I may move it to another service'}. Where technically feasible, please transmit it directly to me by secure electronic means.`,
};

function pieces(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${String(v).trim()}`);
}

/**
 * Build a request letter.
 * @param {object} o
 * @param {'access'|'delete'|'port'} o.right
 * @param {'ca'|'eu'|'other'} o.jurisdiction
 * @param {string} o.companyName
 * @param {string} [o.fullName]
 * @param {string} [o.email]
 * @param {string} [o.address]      postal / mailing address (optional)
 * @param {string} [o.account]      account identifier / username on the service (optional)
 * @param {string} [o.stateName]    US state name, when jurisdiction === 'other'
 * @returns {{subject: string, body: string}}
 */
export function buildLetter(o) {
  const right = RIGHTS[o.right];
  const jur = JURISDICTIONS[o.jurisdiction];
  if (!right || !jur || right.stub) {
    throw new Error('Unsupported right/jurisdiction combination');
  }

  const company = (o.companyName || '[Company]').trim();
  const name = (o.fullName || '[Your full name]').trim();
  const email = (o.email || '[your@email]').trim();
  const citation = CITATIONS[o.jurisdiction][o.right];
  const askFn = ASK[o.right];
  const ask = askFn(o.jurisdiction);

  const subjectMap = {
    access: `Data access request (${jur.short})`,
    delete: `Data deletion request (${jur.short})`,
    port: `Data portability request (${jur.short})`,
  };
  const subject = `${subjectMap[o.right]} — ${name}`;

  // Identity block the person can present to verify themselves.
  const identity = pieces({
    Name: name,
    Email: email,
    'Account / username': o.account,
    'Mailing address': o.address,
    'State of residence':
      o.jurisdiction === 'other' && o.stateName ? o.stateName : undefined,
  })
    .map((l) => `  ${l}`)
    .join('\n');

  const lawLine =
    o.jurisdiction === 'other' && o.stateName
      ? jur.law.replace("my state's", `${o.stateName}'s`)
      : jur.law;

  const lines = [];
  lines.push(`To: ${company} — Privacy / Data Protection Team`);
  lines.push(`Subject: ${subject}`);
  lines.push('');
  lines.push(`Dear ${company} Privacy Team,`);
  lines.push('');
  lines.push(
    `I am a user of ${company}. Under ${lawLine}, I am exercising ${citation}.`
  );
  lines.push('');
  lines.push(ask);
  lines.push('');

  if (o.jurisdiction === 'ca' && o.right === 'delete') {
    lines.push(
      `If ${company} is a data broker registered with the California Privacy Protection Agency, note that I may also be submitting a deletion request through the state's Delete Requests and Opt-out Platform (DROP) under the Delete Act (SB 362, California Civil Code §§ 1798.99.80–1798.99.89; accessible deletion mechanism at § 1798.99.86), which applies to all registered brokers.`
    );
    lines.push('');
  }

  lines.push(
    `Please treat this as a formal request. I understand you may need to verify my identity; the details below should suffice, and I am happy to provide reasonable additional verification. Please respond within ${jur.deadline}.`
  );
  lines.push('');
  lines.push('My details for verification and for your reply:');
  lines.push(identity || '  [Please add your name and email above]');
  lines.push('');
  lines.push(
    'Please send your response, and any secure download link, to the email address above. Thank you for your attention to this request.'
  );
  lines.push('');
  lines.push('Sincerely,');
  lines.push(name);

  return { subject, body: lines.join('\n') };
}

/**
 * Canonical JSON for a logged request — the exact bytes we hash for the receipt.
 * Order matters: keep it stable so the same request always hashes the same.
 */
export function canonicalRequest({ company, right, jurisdiction, date, subject, body }) {
  return JSON.stringify({
    company: company || '',
    right: right || '',
    jurisdiction: jurisdiction || '',
    date: date || '',
    subject: subject || '',
    body: body || '',
  });
}
