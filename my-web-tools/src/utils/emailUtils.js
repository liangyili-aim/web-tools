/**
 * Email Utilities
 */

/**
 * Extract emails from text (simple method)
 */
export function extractEmails(text) {
  if (!text || !text.trim()) {
    return new Set()
  }

  const parts = text
    .replace(/,/g, ' ')
    .replace(/;/g, ' ')
    .split(/\s+/)

  const emails = new Set()
  
  for (const part of parts) {
    const cleaned = part.trim().toLowerCase()
    if (cleaned && cleaned.includes('@')) {
      const atIndex = cleaned.indexOf('@')
      if (atIndex > 0 && atIndex < cleaned.length - 1) {
        emails.add(cleaned)
      }
    }
  }

  return emails
}

/**
 * Extract emails using regex (more accurate)
 */
export function extractEmailsRegex(text) {
  if (!text || !text.trim()) {
    return new Set()
  }

  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(emailPattern) || []

  return new Set(matches.map(email => email.toLowerCase()))
}

/**
 * Sort emails by domain first, then by username
 */
export function sortEmailsByDomain(emails) {
  return [...emails].sort((a, b) => {
    const [userA, domainA] = a.split('@')
    const [userB, domainB] = b.split('@')
    
    // Sort by domain first
    const domainCompare = domainA.localeCompare(domainB)
    if (domainCompare !== 0) return domainCompare
    
    // Then sort by username
    return userA.localeCompare(userB)
  })
}

/**
 * Compare two email lists
 * @returns {Object} { duplicates, newEmails, notInList2, list1Count, list2Count }
 */
export function compareEmailLists(list1, list2) {
  const duplicates = new Set([...list2].filter(x => list1.has(x)))
  const newEmails = new Set([...list2].filter(x => !list1.has(x)))
  const notInList2 = new Set([...list1].filter(x => !list2.has(x)))

  return {
    duplicates: sortEmailsByDomain(duplicates),
    newEmails: sortEmailsByDomain(newEmails),
    notInList2: sortEmailsByDomain(notInList2),
    list1Count: list1.size,
    list2Count: list2.size
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailPattern.test(email)
}

/**
 * Download emails as CSV file
 */
export function downloadEmailsAsCsv(emails, filename = 'emails.csv') {
  let csvContent = 'No.,Email\n'
  emails.forEach((email, idx) => {
    csvContent += `${idx + 1},${email}\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
