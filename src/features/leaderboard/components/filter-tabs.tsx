import { Button } from "@/components/ui/button"
import { CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"


export type FilterTabsProps = {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function FilterTabs({ selectedCategory, onSelectCategory }: FilterTabsProps) {
  return (
    <section className="flex flex-wrap justify-center gap-2">
      {CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.value)}
          className={cn("rounded-full")}
        >
          {category.label}
        </Button>
      ))}
    </section>
  )
}