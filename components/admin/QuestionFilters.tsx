'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Topic {
  id: string
  name: string
}

interface QuestionFiltersProps {
  topics: Topic[]
}

export function QuestionFilters({ topics }: QuestionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentSearch = searchParams.get('q') || ''
  const currentTopic = searchParams.get('topic') || 'all'
  const currentStatus = searchParams.get('status') || 'all'
  
  const [searchValue, setSearchValue] = useState(currentSearch)
  
  useEffect(() => {
    setSearchValue(currentSearch)
  }, [currentSearch])
  
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      
      params.delete('page')
      
      const queryString = params.toString()
      router.push(queryString ? `/admin/questions?${queryString}` : '/admin/questions')
    },
    [router, searchParams]
  )
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateParams({ q: searchValue })
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchValue, currentSearch, updateParams])
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }
  
  const handleClearSearch = () => {
    setSearchValue('')
  }
  
  const handleTopicChange = (value: string) => {
    updateParams({ topic: value })
  }
  
  const handleStatusChange = (value: string) => {
    updateParams({ status: value })
  }
  
  const handleClearFilters = () => {
    setSearchValue('')
    router.push('/admin/questions')
  }
  
  const hasActiveFilters = currentSearch || currentTopic !== 'all' || currentStatus !== 'all'
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Select value={currentTopic} onValueChange={handleTopicChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics?.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
