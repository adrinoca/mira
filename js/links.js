// Carries an ad's campaign token from the landing URL onto every App Store
// link, so App Analytics can say which creative brought the install.
export function withCampaign(href, pageSearch, providerToken) {
  const ct = new URLSearchParams(pageSearch).get('ct')
  if (!ct || !providerToken) return href
  const url = new URL(href)
  url.searchParams.set('pt', providerToken)
  url.searchParams.set('ct', ct.slice(0, 40)) // Apple caps campaign tokens at 40 characters
  return url.toString()
}

export function applyCampaign(doc = document, search = location.search) {
  const pt = doc.documentElement.dataset.pt
  for (const a of doc.querySelectorAll('a[data-app-store]')) a.href = withCampaign(a.href, search, pt)
}
