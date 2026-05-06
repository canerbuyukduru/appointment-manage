import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Calendar } from 'lucide-react'
import type { Business } from '@/types'

interface Props {
  business: Business
}

export function BusinessCard({ business }: Props) {
  return (
    <Link
      href={`/isletme/${business.slug}`}
      className="group block rounded-2xl border border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/80 transition-all overflow-hidden"
    >
      <div className="relative h-44 bg-gray-800">
        {business.coverImage ? (
          <Image src={business.coverImage} alt={business.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Calendar className="h-12 w-12 text-gray-700" />
          </div>
        )}
        {/* Kategori badge */}
        {business.category && (
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-700 px-2.5 py-1 text-xs font-medium text-gray-300">
              {business.category.name}
            </span>
          </div>
        )}
        {/* Rating badge */}
        {business.ratingCount > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-700 px-2.5 py-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-white">{business.ratingAverage.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({business.ratingCount})</span>
          </div>
        )}
        {/* Logo */}
        {business.logo && (
          <div className="absolute bottom-3 left-3 h-10 w-10 rounded-xl border-2 border-gray-700 overflow-hidden bg-gray-800">
            <Image src={business.logo} alt={business.name} fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-100 group-hover:text-white transition-colors line-clamp-1">
          {business.name}
        </h3>
        {business.city && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {business.city}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-gray-800">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-400 group-hover:bg-blue-600/20 transition-all">
            <Calendar className="h-3.5 w-3.5" />
            Randevu Al
          </span>
        </div>
      </div>
    </Link>
  )
}
