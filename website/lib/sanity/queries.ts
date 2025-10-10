// Centralized GROQ queries

export const QUERY_FEATURED_APARTMENTS = `*[_type == "apartment" && active == true && featured == true]{
  _id,
  name,
  location,
  "slug": slug.current,
  "imageUrl": coalesce(
    images[isMain == true][0].image.asset->url,
    images[0].image.asset->url,
    ""
  ),
  "currentPrice": select(
    defined(pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].price) => pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].price,
    defined(pricePeriods[0].price) => pricePeriods[0].price,
    null
  ),
  "currentCurrency": select(
    defined(pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].currency) => pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].currency,
    defined(pricePeriods[0].currency) => pricePeriods[0].currency,
    null
  )
}[0...8]`;

export const QUERY_ALL_APARTMENTS = `*[_type == "apartment" && active == true]{
  _id,
  name,
  location,
  "slug": slug.current,
  "imageUrl": coalesce(
    images[isMain == true][0].image.asset->url,
    images[0].image.asset->url,
    ""
  ),
  "currentPrice": select(
    defined(pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].price) => pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].price,
    defined(pricePeriods[0].price) => pricePeriods[0].price,
    null
  ),
  "currentCurrency": select(
    defined(pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].currency) => pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].currency,
    defined(pricePeriods[0].currency) => pricePeriods[0].currency,
    null
  ),
  capacity,
} | order(_createdAt desc)`;

// Filtered by optional city (string match) OR experience category (string match), capacity (min guests needed), amenities (string[] names)
export const QUERY_ALL_APARTMENTS_FILTERED = `*[_type == "apartment" && active == true
  && (
    ((!defined($city) || $city == "") && (!defined($experienceCategory) || $experienceCategory == "")) ||
    ((defined($city) && $city != "") && (!defined($experienceCategory) || $experienceCategory == "") && location.city match $city) ||
    ((!defined($city) || $city == "") && (defined($experienceCategory) && $experienceCategory != "") && experienceCategory->name match $experienceCategory) ||
    ((defined($city) && $city != "") && (defined($experienceCategory) && $experienceCategory != "") && (location.city match $city || experienceCategory->name match $experienceCategory))
  )
  && (!defined($capacity) || ($capacity >= coalesce(capacity.minGuests, 0) && $capacity <= coalesce(capacity.maxGuests, 999)))
  && (
    (!defined($checkin) || !defined($checkout)) ||
    count(pricePeriods[
      @.startDate <= $checkout && (
        (defined(@.endDate) && @.endDate >= $checkin) ||
        (!defined(@.endDate) && @.startDate >= $checkin)
      )
    ]) > 0
  )
]{
  _id,
  name,
  location,
  "slug": slug.current,
  "imageUrl": coalesce(
    images[isMain == true][0].image.asset->url,
    images[0].image.asset->url,
    ""
  ),
  pricePeriods,
  "currentPrice": select(
    defined(pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].price) => pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].price,
    defined(pricePeriods[0].price) => pricePeriods[0].price,
    null
  ),
  "currentCurrency": select(
    defined(pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].currency) => pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].currency,
    defined(pricePeriods[0].currency) => pricePeriods[0].currency,
    null
  ),
  capacity,
} | order(_createdAt desc)`;

export const QUERY_APARTMENT_DETAILS = `*[_type == "apartment" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  location,
  "imageUrl": coalesce(
    images[isMain == true][0].image.asset->url,
    images[0].image.asset->url,
    ""
  ),
  "images": images[]{
    "url": image.asset->url,
    alt,
    caption,
    isMain
  },
  "currentPrice": select(
    defined(pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].price) => pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].price,
    defined(pricePeriods[0].price) => pricePeriods[0].price,
    null
  ),
  "currentCurrency": select(
    defined(pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].currency) => pricePeriods[@.startDate <= now() && @.endDate >= now() ][0].currency,
    defined(pricePeriods[0].currency) => pricePeriods[0].currency,
    null
  ),
  capacity,
  "category": experienceCategory->name,
  "amenities": amenities[]->{ _id, name, icon },
  description
}`;

export const QUERY_EXPERIENCE_CATEGORIES = `*[_type == "experienceCategory"]{
  _id,
  name,
  "slug": slug.current,
  description
} | order(name asc)`;

export const QUERY_CITIES = `*[_type == "city" && active == true]{
  _id,
  name,
  "slug": slug.current,
  region,
  country,
  description
} | order(name asc)`;
