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

  // The prefix is matched greedily (\d+) so that e.g. "/123" is reported as
  // invalid instead of being silently truncated to a bare host address.
  const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d+)?\b/g
  const candidates = textBlock.match(ipPattern) || []

  const validNetworks = []
  const invalidStrings = []

  for (const ipStr of candidates) {
    const parsed = parseIpOrCidr(ipStr)
    if (parsed) {
      validNetworks.push({ original: ipStr, ...parsed })
    } else {
      invalidStrings.push(ipStr)
    }
  }

  validNetworks.sort(compareNetworks)

  const overlappingPairs = []
  for (let i = 0; i < validNetworks.length; i++) {
    for (let j = i + 1; j < validNetworks.length; j++) {
      if (networksOverlap(validNetworks[i], validNetworks[j])) {
        overlappingPairs.push([validNetworks[i].original, validNetworks[j].original])
      }
    }
  }

  return { validNetworks, invalidStrings, overlappingPairs }
}

/**
 * Parse an IPv4 address or CIDR string.
 * Mirrors Python's ipaddress.ip_network(s, strict=False): host bits are
 * masked off, and octets with leading zeros are rejected (ipaddr.js would
 * otherwise read them as octal, e.g. 010.0.0.1 -> 8.0.0.1).
 * @returns {Object|null} { address, prefixLength, isCidr, cidr }
 */
function parseIpOrCidr(ipStr) {
  try {
    const [addr, prefix, ...rest] = ipStr.split('/')
    if (rest.length > 0) return null
    if (!ipaddr.IPv4.isValidFourPartDecimal(addr)) return null

    const isCidr = prefix !== undefined
    let prefixLength = 32
    if (isCidr) {
      if (!/^\d+$/.test(prefix)) return null
      prefixLength = parseInt(prefix, 10)
      if (prefixLength > 32) return null
    }

    // Network address (host bits cleared)
    const address = ipaddr.IPv4.networkAddressFromCIDR(`${addr}/${prefixLength}`)

    return {
      address,
      prefixLength,
      isCidr,
      cidr: `${address.toString()}/${prefixLength}`
    }
  } catch (e) {
    return null
  }
}

/**
 * Order networks by address, then by prefix length
 */
function compareNetworks(a, b) {
  const aBytes = a.address.toByteArray()
  const bBytes = b.address.toByteArray()
  for (let i = 0; i < aBytes.length; i++) {
    if (aBytes[i] !== bBytes[i]) return aBytes[i] - bBytes[i]
  }
  return a.prefixLength - b.prefixLength
}

/**
 * Check if two networks overlap
 */
function networksOverlap(net1, net2) {
  const commonPrefix = Math.min(net1.prefixLength, net2.prefixLength)
  return addressMatchInPrefix(
    net1.address.toByteArray(),
    net2.address.toByteArray(),
    commonPrefix
  )
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
 * Compare two IP network sets.
 * Networks are compared by their normalized CIDR, so "10.0.0.1" equals
 * "10.0.0.1/32" and "192.168.1.5/24" equals "192.168.1.0/24".
 */
export function compareIpSets(networks1, networks2) {
  const map1 = new Map(networks1.map(n => [n.cidr, n]))
  const map2 = new Map(networks2.map(n => [n.cidr, n]))

  const pick = (source, predicate) =>
    [...source.values()]
      .filter(n => predicate(n.cidr))
      .sort(compareNetworks)
      .map(n => n.cidr)

  const common = pick(map1, cidr => map2.has(cidr))
  const onlyInFirst = pick(map1, cidr => !map2.has(cidr))
  const onlyInSecond = pick(map2, cidr => !map1.has(cidr))

  return {
    identical: map1.size > 0 && onlyInFirst.length === 0 && onlyInSecond.length === 0,
    common,
    onlyInFirst,
    onlyInSecond,
    totalFirst: networks1.length,
    totalSecond: networks2.length
  }
}
