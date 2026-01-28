/**
 * Password Generator Utilities
 * Uses crypto.getRandomValues() for cryptographically secure random numbers
 */

// Character sets (ambiguous characters removed)
const LOWERCASE = 'abcdefghjkmnpqrstuvwxyz'  // removed: i, l, o
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'  // removed: I, O
const DIGITS = '23456789'  // removed: 0, 1
const SPECIAL = '!@#$%&*'

/**
 * Secure random character selection using crypto API
 */
function secureRandomChoice(chars) {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return chars[array[0] % chars.length]
}

/**
 * Fisher-Yates shuffle with secure random
 */
function secureShuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const randomArray = new Uint32Array(1)
    crypto.getRandomValues(randomArray)
    const j = randomArray[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Validate password meets requirements
 */
function validatePassword(password, { useSpecial, minSpecial }) {
  const hasLower = [...password].some(c => LOWERCASE.includes(c))
  const hasUpper = [...password].some(c => UPPERCASE.includes(c))
  const hasDigit = [...password].some(c => DIGITS.includes(c))
  const specialCount = [...password].filter(c => SPECIAL.includes(c)).length

  if (useSpecial) {
    return hasLower && hasUpper && hasDigit && specialCount >= minSpecial
  } else {
    return hasLower && hasUpper && hasDigit && specialCount === 0
  }
}

/**
 * Generate a single password
 * @param {Object} options - { length, minSpecial, useSpecial }
 * @returns {string} Generated password
 */
export function generatePassword(options = {}) {
  const {
    length = 18,
    minSpecial = 2,
    useSpecial = true
  } = options

  if (length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  if (length > 256) {
    throw new Error('Password cannot exceed 256 characters')
  }

  const actualMinSpecial = useSpecial ? minSpecial : 0
  if (useSpecial && actualMinSpecial > length - 3) {
    throw new Error('Too many special characters required')
  }

  const allChars = useSpecial 
    ? LOWERCASE + UPPERCASE + DIGITS + SPECIAL
    : LOWERCASE + UPPERCASE + DIGITS

  for (let attempt = 0; attempt < 100; attempt++) {
    const password = []

    if (useSpecial) {
      for (let i = 0; i < actualMinSpecial; i++) {
        password.push(secureRandomChoice(SPECIAL))
      }
    }

    password.push(secureRandomChoice(LOWERCASE))
    password.push(secureRandomChoice(UPPERCASE))
    password.push(secureRandomChoice(DIGITS))

    const remainingLength = length - password.length
    for (let i = 0; i < remainingLength; i++) {
      password.push(secureRandomChoice(allChars))
    }

    const shuffled = secureShuffleArray(password)
    const passwordStr = shuffled.join('')

    if (validatePassword(passwordStr, { useSpecial, minSpecial: actualMinSpecial })) {
      return passwordStr
    }
  }

  throw new Error('Failed to generate password meeting requirements')
}

/**
 * Generate multiple passwords
 */
export function generateBatch(count, options = {}) {
  const passwords = []
  for (let i = 0; i < count; i++) {
    passwords.push(generatePassword(options))
  }
  return passwords
}

/**
 * Download passwords as CSV file
 */
export function downloadAsCsv(passwords, filename = 'passwords.csv') {
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ')
  
  let csvContent = 'No.,Password,Generated Time\n'
  passwords.forEach((pwd, idx) => {
    csvContent += `${idx + 1},"${pwd}",${timestamp}\n`
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

/**
 * Calculate password strength score
 */
export function calculateStrength(password) {
  const length = password.length
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%&*]/.test(password)
  
  let score = 0
  if (length >= 8) score += 1
  if (length >= 12) score += 1
  if (length >= 16) score += 1
  if (hasLower) score += 1
  if (hasUpper) score += 1
  if (hasDigit) score += 1
  if (hasSpecial) score += 1

  let level = 'weak'
  let color = 'error'
  if (score >= 6) {
    level = 'strong'
    color = 'success'
  } else if (score >= 4) {
    level = 'medium'
    color = 'warning'
  }

  return { score, level, color, maxScore: 7 }
}
