/**
 * IP Address Utilities
 */
import ipaddr from 'ipaddr.js'

/**
 * Extract and validate IP/CIDR from text
 * @returns {Object} { validNetworks, invalidStrings, overlappingPairs }
 */
export function extractAndCheckIps(textBlock) {
  if (!textBlock || !textBlock.trim()) {
    return { validNetworks: [], invalidStrings: [], overlappingPairs: [] }
  }

  const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,2})?\b/g
  const candidates = textBlock.match(ipPattern) || []

  const validNetworks = []
  const invalidStrings = []

  for (const ipStr of candidates) {
    try {
      const parsed = parseIpOrCidr(ipStr)
      if (parsed) {
        validNetworks.push({
          original: ipStr,
          ...parsed
        })
      } else {
        invalidStrings.push(ipStr)
      }
    } catch (e) {
      invalidStrings.push(ipStr)
    }
  }

  validNetworks.sort((a, b) => {
    const aBytes = a.address.toByteArray()
    const bBytes = b.address.toByteArray()
    for (let i = 0; i < aBytes.length; i++) {
      if (aBytes[i] !== bBytes[i]) return aBytes[i] - bBytes[i]
    }
    return a.prefixLength - b.prefixLength
  })

  const overlappingPairs = []
  if (validNetworks.length >= 2) {
    for (let i = 0; i < validNetworks.length; i++) {
      for (let j = i + 1; j < validNetworks.length; j++) {
        if (networksOverlap(validNetworks[i], validNetworks[j])) {
          overlappingPairs.push([validNetworks[i].original, validNetworks[j].original])
        }
      }
    }
  }

  return { validNetworks, invalidStrings, overlappingPairs }
}

/**
 * Parse IP or CIDR string
 */
function parseIpOrCidr(ipStr) {
  try {
    if (ipStr.includes('/')) {
      const [addr, prefix] = ipStr.split('/')
      const parsedAddr = ipaddr.parse(addr)
      const prefixLength = parseInt(prefix, 10)
      
      if (parsedAddr.kind() === 'ipv4' && (prefixLength < 0 || prefixLength > 32)) {
        return null
      }
      if (parsedAddr.kind() === 'ipv6' && (prefixLength < 0 || prefixLength > 128)) {
        return null
      }

      return {
        address: parsedAddr,
        prefixLength: prefixLength,
        isCidr: true
      }
    } else {
      const parsedAddr = ipaddr.parse(ipStr)
      return {
        address: parsedAddr,
        prefixLength: parsedAddr.kind() === 'ipv4' ? 32 : 128,
        isCidr: false
      }
    }
  } catch (e) {
    return null
  }
}

/**
 * Check if two networks overlap
 */
function networksOverlap(net1, net2) {
  try {
    const net1Range = ipaddr.parseCIDR(`${net1.address.toString()}/${net1.prefixLength}`)
    const net2Range = ipaddr.parseCIDR(`${net2.address.toString()}/${net2.prefixLength}`)

    const net1Addr = net1.address.toByteArray()
    const net2Addr = net2.address.toByteArray()
    const commonPrefix = Math.min(net1.prefixLength, net2.prefixLength)

    return addressMatchInPrefix(net1Addr, net2Addr, commonPrefix)
  } catch (e) {
    return false
  }
}

/**
 * Check if addresses match within prefix length
 */
function addressMatchInPrefix(addr1, addr2, prefixLength) {
  const fullBytes = Math.floor(prefixLength / 8)
  const remainingBits = prefixLength % 8

  for (let i = 0; i < fullBytes; i++) {
    if (addr1[i] !== addr2[i]) return false
  }

  if (remainingBits > 0 && fullBytes < addr1.length) {
    const mask = (0xff << (8 - remainingBits)) & 0xff
    if ((addr1[fullBytes] & mask) !== (addr2[fullBytes] & mask)) {
      return false
    }
  }

  return true
}

/**
 * Compare two IP network sets
 */
export function compareIpSets(networks1, networks2) {
  const set1Strs = new Set(networks1.map(n => n.original))
  const set2Strs = new Set(networks2.map(n => n.original))

  const common = [...set1Strs].filter(x => set2Strs.has(x))
  const onlyInFirst = [...set1Strs].filter(x => !set2Strs.has(x))
  const onlyInSecond = [...set2Strs].filter(x => !set1Strs.has(x))

  return {
    identical: set1Strs.size === set2Strs.size && common.length === set1Strs.size,
    common: common.sort(),
    onlyInFirst: onlyInFirst.sort(),
    onlyInSecond: onlyInSecond.sort(),
    totalFirst: networks1.length,
    totalSecond: networks2.length
  }
}
